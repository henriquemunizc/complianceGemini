import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DividerModule } from 'primeng/divider';
import { NotificationService } from '../services/notification.service';
import { Notificacao } from '../models/notificacao.model';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

/**
 * Componente de sino de notificações com badge e overlay.
 * Exibe contador de não lidas e lista com as últimas notificações.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    ButtonModule,
    OverlayPanelModule,
    ScrollPanelModule,
    DividerModule,
    TimeAgoPipe,
  ],
  template: `
    <div class="notification-bell-container">
      <button
        pButton
        type="button"
        icon="pi pi-bell"
        class="p-button-rounded p-button-text p-button-lg"
        [badge]="countNaoLidas > 0 ? countNaoLidas.toString() : ''"
        badgeSeverity="danger"
        (click)="op.toggle($event)"
        [disabled]="loading"
      ></button>

      <p-overlayPanel #op [style]="{ width: '400px' }">
        <ng-template pTemplate="content">
          <div class="notification-panel">
            <div class="notification-header">
              <h3>Notificações</h3>
              <button
                pButton
                type="button"
                label="Marcar todas como lidas"
                class="p-button-sm p-button-text"
                (click)="marcarTodasLidas()"
                [disabled]="countNaoLidas === 0"
              ></button>
            </div>

            <p-divider></p-divider>

            <p-scrollPanel [style]="{ width: '100%', height: '400px' }">
              <div *ngIf="notificacoes.length === 0" class="empty-state">
                <i class="pi pi-bell-slash" style="font-size: 3rem; color: #999;"></i>
                <p>Nenhuma notificação</p>
              </div>

              <div
                *ngFor="let notif of notificacoes"
                class="notification-item"
                [class.unread]="!notif.lida"
                (click)="handleNotificationClick(notif)"
              >
                <div class="notification-icon">
                  <i [class]="getIconClass(notif.tipo)"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notif.titulo }}</div>
                  <div class="notification-message">{{ notif.mensagem }}</div>
                  <div class="notification-time">{{ notif.criadoEm | timeAgo }}</div>
                </div>
                <div *ngIf="!notif.lida" class="notification-badge">
                  <span class="unread-dot"></span>
                </div>
              </div>
            </p-scrollPanel>

            <p-divider></p-divider>

            <div class="notification-footer">
              <button
                pButton
                type="button"
                label="Ver todas"
                class="p-button-sm p-button-text"
                (click)="verTodasNotificacoes()"
              ></button>
            </div>
          </div>
        </ng-template>
      </p-overlayPanel>
    </div>
  `,
  styles: [
    `
      .notification-bell-container {
        position: relative;
      }

      .notification-panel {
        padding: 0;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
      }

      .notification-header h3 {
        margin: 0;
        font-size: 1.25rem;
      }

      .notification-footer {
        padding: 1rem;
        text-align: center;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #999;
      }

      .notification-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid #e0e0e0;
      }

      .notification-item:hover {
        background-color: #f5f5f5;
      }

      .notification-item.unread {
        background-color: #e3f2fd;
      }

      .notification-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #2196f3;
        color: white;
      }

      .notification-content {
        flex: 1;
      }

      .notification-title {
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .notification-message {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.25rem;
      }

      .notification-time {
        font-size: 0.8rem;
        color: #999;
      }

      .notification-badge {
        flex-shrink: 0;
      }

      .unread-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #f44336;
      }
    `,
  ],
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notificacoes: Notificacao[] = [];
  countNaoLidas = 0;
  loading = false;
  private subscription?: Subscription;

  ngOnInit(): void {
    // Inicia polling a cada 30 segundos
    this.subscription = this.notificationService.startPolling(30000).subscribe({
      next: (notifs) => {
        this.notificacoes = notifs.slice(0, 10); // Últimas 10
        this.countNaoLidas = notifs.filter((n) => !n.lida).length;
      },
      error: (err) => console.error('Erro ao buscar notificações:', err),
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  marcarTodasLidas(): void {
    this.notificationService.marcarTodasLidas().subscribe({
      next: () => {
        this.notificacoes.forEach((n) => (n.lida = true));
        this.countNaoLidas = 0;
      },
      error: (err) => console.error('Erro ao marcar todas como lidas:', err),
    });
  }

  handleNotificationClick(notif: Notificacao): void {
    // Marcar como lida
    if (!notif.lida) {
      this.notificationService.marcarComoLida(notif.notificacaoId).subscribe({
        next: () => {
          notif.lida = true;
          this.countNaoLidas--;
        },
      });
    }

    // Navegar para o link se existir
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  verTodasNotificacoes(): void {
    this.router.navigate(['/notificacoes']);
  }

  getIconClass(tipo: string): string {
    const iconMap: Record<string, string> = {
      OBRIGACAO_ATRASADA: 'pi pi-exclamation-triangle',
      OBRIGACAO_SUBMETIDA: 'pi pi-send',
      OBRIGACAO_APROVADA: 'pi pi-check-circle',
      OBRIGACAO_REJEITADA: 'pi pi-times-circle',
      NOVA_EVIDENCIA: 'pi pi-paperclip',
      COMENTARIO_MENCIONOU: 'pi pi-at',
      PRAZO_PROXIMO: 'pi pi-clock',
    };
    return iconMap[tipo] || 'pi pi-info-circle';
  }
}
