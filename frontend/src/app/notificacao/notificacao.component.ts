import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngFor e *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { NotificacaoService } from './notificacao.service';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, interval, lastValueFrom } from 'rxjs';

interface NotificacaoExibicao {
  mensagemId: string;
  conteudoMensagem: string;
  status: string;
}

@Component({
  selector: 'app-notificacao',
  standalone: true,
  imports: [
    CommonModule, // <-- Importa o *ngFor e *ngIf
    FormsModule, // <-- Importa o [(ngModel)]
  ],
  templateUrl: './notificacao.component.html',
  styleUrls: ['./notificacao.component.scss'],
})
export class NotificacaoComponent implements OnInit, OnDestroy {
  // --- Propriedades que o HTML precisa ---
  conteudoMensagem: string = '';
  notificacoes: NotificacaoExibicao[] = [];
  private pollingSubscription: Subscription | undefined;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  sendNotification(): void {
    if (!this.conteudoMensagem.trim()) {
      alert('A mensagem não pode ser vazia.');
      return;
    }

    const mensagemId = uuidv4();
    const payload = { mensagemId, conteudoMensagem: this.conteudoMensagem };

    this.notificacoes.unshift({
      mensagemId: mensagemId,
      conteudoMensagem: this.conteudoMensagem,
      status: 'AGUARDANDO_PROCESSAMENTO',
    });

    this.notificacaoService.sendNotification(payload).subscribe({
      next: (response) => {
        console.log('Requisição de notificação aceita pelo backend:', response);
      },
      error: (error) => {
        console.error('Erro ao enviar notificação:', error);
        const index = this.notificacoes.findIndex(
          (n) => n.mensagemId === mensagemId
        );
        if (index !== -1) {
          this.notificacoes[index].status = 'ERRO_ENVIO';
        }
        alert('Erro ao enviar notificação. Verifique o console.');
      },
    });

    this.conteudoMensagem = '';
  }

  private startPolling(): void {
    this.pollingSubscription = interval(3000).subscribe(async () => {
      const pendingNotifications = this.notificacoes.filter(
        (n) => n.status === 'AGUARDANDO_PROCESSAMENTO'
      );

      for (const notif of pendingNotifications) {
        try {
          const statusResponse = await lastValueFrom(
            this.notificacaoService.getNotificationStatus(notif.mensagemId)
          );
          if (statusResponse && statusResponse.status !== notif.status) {
            notif.status = statusResponse.status;
          }
        } catch (error) {
          console.error(
            `Erro ao buscar status para ${notif.mensagemId}`,
            error
          );
        }
      }
    });
  }
}
