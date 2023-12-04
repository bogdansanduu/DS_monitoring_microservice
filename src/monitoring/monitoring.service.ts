import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';

import { EnergyReading } from './entities/energyReading.entity';
import { HourlyConsumption } from './entities/hourlyConsumption.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(EnergyReading)
    private monitoringRepo: Repository<EnergyReading>,
    @InjectRepository(HourlyConsumption)
    private hourlyConsumptionRepo: Repository<HourlyConsumption>,
    @Inject('Device_MICROSERVICE')
    private readonly clientDevice: ClientProxy,
    @Inject('Device_MICROSERVICE_RMQ')
    private readonly deviceMicroserviceRMQ: ClientProxy,
  ) {}

  async monitorDevice({
    timestamp,
    device_id,
    measurement_value,
  }: {
    timestamp: number;
    device_id: number;
    measurement_value: string;
  }) {
    const deviceExists = await firstValueFrom(
      this.clientDevice.send(
        {
          cmd: 'check_device_exists',
        },
        { deviceId: device_id },
      ),
    );

    if (!deviceExists) {
      throw new NotFoundException(`Device with ID ${device_id} not found`);
    }

    console.log(
      'Monitoring message received:',
      timestamp,
      device_id,
      measurement_value,
    );

    const receivedDate = new Date(timestamp);

    // Save the individual energy reading
    const energyReading = this.monitoringRepo.create({
      timestamp: receivedDate,
      deviceId: device_id,
      measurementValue: measurement_value,
    });

    await this.monitoringRepo.save(energyReading);

    // Update the hourly consumption
    const hourStart = new Date(timestamp);
    hourStart.setMinutes(0, 0, 0); // Set minutes and seconds to 0

    const hourlyRecord = await this.hourlyConsumptionRepo.findOne({
      where: { deviceId: device_id, hourStart: hourStart },
    });

    if (hourlyRecord) {
      const updatedHourlyConsumption =
        parseFloat(hourlyRecord.totalConsumption) +
        parseFloat(measurement_value);

      hourlyRecord.totalConsumption = updatedHourlyConsumption.toString();

      await this.hourlyConsumptionRepo.save(hourlyRecord);

      //Send hourly consumption to device service
      this.deviceMicroserviceRMQ.emit(
        { cmd: 'hourly_consumption' },
        {
          deviceId: device_id,
          totalConsumption: updatedHourlyConsumption,
        },
      );
    } else {
      const newHourlyRecord = this.hourlyConsumptionRepo.create({
        deviceId: device_id,
        hourStart,
        totalConsumption: measurement_value,
      });

      await this.hourlyConsumptionRepo.save(newHourlyRecord);

      //Send hourly consumption to device service
      this.deviceMicroserviceRMQ.emit(
        { cmd: 'hourly_consumption' },
        {
          deviceId: device_id,
          totalConsumption: measurement_value,
        },
      );
    }
  }

  async getConsumptionByIdAndDate(
    deviceId: number[],
    date: string,
  ): Promise<HourlyConsumption[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.hourlyConsumptionRepo.find({
      where: {
        deviceId: In(deviceId),
        hourStart: Between(startOfDay, endOfDay),
      },
    });
  }
}
