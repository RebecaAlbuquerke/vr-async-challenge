import { Component } from '@angular/core';
import { NotificacaoComponent } from './notificacao/notificacao.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotificacaoComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'frontend';
}
