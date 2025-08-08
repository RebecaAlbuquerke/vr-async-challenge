import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notificationStatus = new Map<string, string>();

  private readonly INPUT_QUEUE = 'fila.notificacao.entrada.rebeca';
  private readonly STATUS_QUEUE = 'fila.notificacao.status.rebeca';

  constructor(private readonly rabbitMQService: RabbitmqService) {}

  onModuleInit() {
    this.rabbitMQService.consumeMessages(
      this.INPUT_QUEUE,
      this.processNotification.bind(this),
    );
  }

  async processNotification(message: {
    mensagemId: string;
    conteudoMensagem: string;
  }) {
    const { mensagemId, conteudoMensagem } = message;
    this.logger.log(
      `Processando notificação ${mensagemId}: ${conteudoMensagem}`,
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    const randomNum = Math.floor(Math.random() * 10) + 1;
    let status: string;

    if (randomNum <= 2) {
      status = 'FALHA_PROCESSAMENTO';
      this.logger.warn(`Falha no processamento da notificação ${mensagemId}`);
    } else {
      status = 'PROCESSADO_SUCESSO';
      this.logger.log(`Sucesso no processamento da notificação ${mensagemId}`);
    }

    this.notificationStatus.set(mensagemId, status);

    await this.rabbitMQService.publishMessage(this.STATUS_QUEUE, {
      mensagemId,
      status,
    });
  }

  async sendNotification(payload: {
    mensagemId: string;
    conteudoMensagem: string;
  }): Promise<void> {
    this.setNotificationStatus(payload.mensagemId, 'AGUARDANDO_PROCESSAMENTO');
    await this.rabbitMQService.publishMessage(this.INPUT_QUEUE, payload);
  }

  getNotificationStatus(mensagemId: string): string | undefined {
    return this.notificationStatus.get(mensagemId);
  }

  setNotificationStatus(mensagemId: string, status: string): void {
    this.notificationStatus.set(mensagemId, status);
  }
}
