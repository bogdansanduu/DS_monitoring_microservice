import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import 'dotenv/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const monitoringCommunicationMicroservice =
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.TCP,
      options: {
        port: parseInt(process.env.MONITORING_COMMUNICATION_MICROSERVICE_PORT),
      },
    });

  const monitoringCommunicationMicroserviceRabbitMQ =
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'monitoring',
        queueOptions: {
          durable: false,
        },
      },
    });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.APP_PORT));
}
bootstrap();
