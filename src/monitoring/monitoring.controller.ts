import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { MonitoringService } from './monitoring.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../role/role.guard';
import { Roles } from '../role/role.decorator';
import { Role } from '../constants/role';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
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
