import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import 'dotenv/config';

import { EnergyReading } from './entities/energyReading.entity';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { HourlyConsumption } from './entities/hourlyConsumption.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EnergyReading, HourlyConsumption]),
    ClientsModule.register([
      {
        name: 'Device_MICROSERVICE_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbit:rabbit@rabbitmq:5672'],
          queue: 'device',
          queueOptions: {
            durable: false,
          },
        },
      },
      {
        name: 'Device_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          host: 'host.docker.internal',
          port: parseInt(process.env.DEVICE_MICROSERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
