import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly logger = new Logger(RabbitmqService.name);

  async onModuleInit() {
    try {
      this.connection = await amqp.connect(
        'amqp://bjnuffmq:gj-YQIiEXyfxQxjsZtiYDKeXIT8ppUq7@jaragua-01.lmq.cloudamqp.com/bjnuffmq',
      );
      this.channel = await this.connection.createChannel();
      this.logger.log('Conectado ao RabbitMQ com sucesso!');
    } catch (error) {
      this.logger.error('Erro ao conectar ao RabbitMQ:', error.message);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('Conexão com RabbitMQ fechada');
    } catch (error) {
      this.logger.error('Erro ao fechar conexão com RabbitMQ:', error.message);
    }
  }

  async publishMessage(queue: string, message: any) {
    if (!this.channel) {
      this.logger.error(
        'Canal RabbitMQ não disponível. Mensagem não publicada.',
      );
      return;
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
      this.logger.log(
        `Mensagem publicada na fila ${queue}: ${JSON.stringify(message)}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro ao publicar mensagem na fila ${queue}:`,
        error.message,
      );
    }
  }

  async consumeMessages(queue: string, callback: (msg: any) => void) {
    if (!this.channel) {
      this.logger.error(
        'Canal RabbitMQ não disponível. Consumidor não iniciado.',
      );
      return;
    }
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.consume(queue, (msg) => {
        if (msg !== null) {
          this.logger.log(`Mensagem recebida da fila ${queue}`);
          callback(JSON.parse(msg.content.toString()));
          this.channel.ack(msg);
        }
      });
      this.logger.log(`Consumidor iniciado para a fila ${queue}`);
    } catch (error) {
      this.logger.error(
        `Erro ao consumir mensagens da fila ${queue}:`,
        error.message,
      );
    }
  }
}
