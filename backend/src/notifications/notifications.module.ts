import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq/rabbitmq.service';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';

@Module({
  providers: [RabbitmqService, NotificationsService],
  controllers: [NotificationsController]
})
export class NotificationsModule {}
