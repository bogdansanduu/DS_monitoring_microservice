import { Controller, Get, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('getConsumptionByIdAndDate/:deviceId/:date')
  getConsumptionByIdAndDate(
    @Param('deviceId') deviceId: number,
    @Param('date') date: string,
  ) {
    return this.monitoringService.getConsumptionByIdAndDate([deviceId], date);
  }

  @MessagePattern({ cmd: 'monitoring' })
  async monitoring({
    timestamp,
    device_id,
    measurement_value,
  }: {
    timestamp: number;
    device_id: number;
    measurement_value: string;
  }) {
    await this.monitoringService.monitorDevice({
      timestamp,
      device_id,
      measurement_value,
    });
  }

  @MessagePattern({ cmd: 'consumption_per_devices' })
  async consumptionPerUser({
    deviceIds,
    date,
  }: {
    deviceIds: number[];
    date: string;
  }) {
    return await this.monitoringService.getConsumptionByIdAndDate(
      deviceIds,
      date,
    );
  }
}
