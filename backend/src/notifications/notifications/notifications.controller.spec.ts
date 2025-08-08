import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BadRequestException } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  let service: NotificationsService;

  const mockNotificationsService = {
    sendNotification: jest.fn(),
    getNotificationStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should call sendNotification on service and return ACCEPTED status', async () => {
      const payload = {
        mensagemId: 'uuid-123',
        conteudoMensagem: 'Hello Test',
      };
      const result = await controller.sendNotification(payload);

      expect(service.sendNotification).toHaveBeenCalledWith(payload);
      expect(result).toEqual({ mensagemId: 'uuid-123', status: 'ACCEPTED' });
    });

    it('should throw BadRequestException if payload is invalid', async () => {
      const payload = { mensagemId: '', conteudoMensagem: ' ' };
      await expect(controller.sendNotification(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getNotificationStatus', () => {
    it('should get a status from the service', () => {
      const status = 'PROCESSADO_SUCESSO';
      mockNotificationsService.getNotificationStatus.mockReturnValue(status);

      const result = controller.getNotificationStatus('uuid-123');

      expect(service.getNotificationStatus).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual({ mensagemId: 'uuid-123', status });
    });

    it('should throw BadRequestException if status is not found', () => {
      mockNotificationsService.getNotificationStatus.mockReturnValue(undefined);

      expect(() => {
        controller.getNotificationStatus('uuid-not-found');
      }).toThrow(BadRequestException);
    });
  });
});
