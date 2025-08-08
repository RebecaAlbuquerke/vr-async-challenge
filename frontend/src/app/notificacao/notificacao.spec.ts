import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoComponent } from './notificacao.component';

describe('NotificacaoComponent', () => {
  let component: NotificacaoComponent;
  let fixture: ComponentFixture<NotificacaoComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, NotificacaoComponent],
      providers: [NotificacaoService],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificacaoComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send notification when message is not empty', () => {
    const testMessage = 'Hello World';
    component.conteudoMensagem = testMessage;

    component.sendNotification();

    expect(component.notificacoes.length).toBe(1);
    expect(component.notificacoes[0].conteudoMensagem).toBe(testMessage);

    const req = httpMock.expectOne('http://localhost:3000/api/notificar');
    expect(req.request.method).toBe('POST');
    req.flush({
      mensagemId: component.notificacoes[0].mensagemId,
      status: 'ACCEPTED',
    });

    httpMock.verify();
  });

  it('should not send notification if message is empty', () => {
    spyOn(window, 'alert');
    component.conteudoMensagem = '   ';

    component.sendNotification();

    expect(component.notificacoes.length).toBe(0);
    expect(window.alert).toHaveBeenCalledWith('A mensagem não pode ser vazia.');
    httpMock.expectNone('http://localhost:3000/api/notificar');
  });
});
