import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

interface NotificationPayload {
  mensagemId: string;
  conteudoMensagem: string;
}

@Controller('api/notificar')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async sendNotification(@Body() payload: NotificationPayload) {
    const { mensagemId, conteudoMensagem } = payload;
    if (
      !mensagemId ||
      !conteudoMensagem ||
      conteudoMensagem.trim().length === 0
    ) {
      throw new BadRequestException(
        'mensagemId e conteudoMensagem são obrigatórios e não podem ser vazios.',
      );
    }

    this.logger.log(`Requisição POST recebida para notificação ${mensagemId}`);
    await this.notificationsService.sendNotification(payload);

    return { mensagemId, status: 'ACCEPTED' };
  }

  @Get('status/:mensagemId')
  getNotificationStatus(@Param('mensagemId') mensagemId: string) {
    const status = this.notificationsService.getNotificationStatus(mensagemId);
    if (!status) {
      throw new BadRequestException(
        'MensagemId não encontrado ou ainda não processado.',
      );
    }
    return { mensagemId, status };
  }
}
