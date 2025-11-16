/**
 * ConfirmDialogComponent
 *
 * Dialog de confirmação customizado com design profissional
 * Substitui o p-confirmDialog padrão do PrimeNG
 *
 * @example
 * // No componente:
 * constructor(private confirmDialogService: ConfirmDialogService) {}
 *
 * confirmarExclusao(): void {
 *   this.confirmDialogService.confirm({
 *     severity: 'danger',
 *     icon: 'pi-trash',
 *     title: 'Confirmar Exclusão',
 *     message: 'Tem certeza que deseja excluir esta obrigação? Esta ação não pode ser desfeita.',
 *     acceptLabel: 'Sim, excluir',
 *     rejectLabel: 'Cancelar',
 *     accept: () => {
 *       this.excluirObrigacao();
 *     }
 *   });
 * }
 */

import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogConfig {
  severity?: 'info' | 'warning' | 'danger' | 'success';
  icon?: string;
  title: string;
  message: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private configSubject = new BehaviorSubject<ConfirmDialogConfig | null>(null);
  config$ = this.configSubject.asObservable();

  confirm(config: ConfirmDialogConfig): void {
    this.configSubject.next({
      severity: 'warning',
      icon: 'pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      ...config
    });
  }

  close(): void {
    this.configSubject.next(null);
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [closeOnEscape]="true"
      [dismissableMask]="true"
      [style]="{ width: '450px' }"
      (onHide)="onHide()">

      <ng-template pTemplate="header">
        <div class="dialog-header">
          <div class="dialog-icon" [class]="'dialog-icon--' + config.severity">
            <i [class]="'pi ' + config.icon"></i>
          </div>
          <h2 class="dialog-title">{{ config.title }}</h2>
        </div>
      </ng-template>

      <div class="dialog-content">
        <p class="dialog-message">{{ config.message }}</p>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-actions">
          <button
            pButton
            [label]="config.rejectLabel"
            class="p-button-outlined p-button-secondary"
            (click)="onReject()">
          </button>
          <button
            pButton
            [label]="config.acceptLabel"
            [class]="getAcceptButtonClass()"
            (click)="onAccept()"
            autofocus>
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dialog {
        .p-dialog-header {
          padding: 0;
          border: none;
        }

        .p-dialog-content {
          padding: 0 var(--spacing-xl) var(--spacing-xl);
        }

        .p-dialog-footer {
          padding: var(--spacing-xl);
          padding-top: 0;
          border: none;
        }
      }
    }

    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: var(--spacing-2xl) var(--spacing-xl) var(--spacing-xl);
    }

    .dialog-icon {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-lg);

      i {
        font-size: 2.5rem;
      }

      &--info {
        background: var(--color-info-lightest);
        color: var(--color-info);
      }

      &--warning {
        background: var(--color-warning-lightest);
        color: var(--color-warning-dark);
      }

      &--danger {
        background: var(--color-danger-lightest);
        color: var(--color-danger);
      }

      &--success {
        background: var(--color-success-lightest);
        color: var(--color-success);
      }
    }

    .dialog-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .dialog-content {
      text-align: center;
    }

    .dialog-message {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0;
    }

    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-md);
    }

    /* Animação de entrada */
    :host ::ng-deep {
      .p-dialog-enter-active {
        animation: dialog-enter 0.25s ease-out;
      }

      .p-dialog-leave-active {
        animation: dialog-leave 0.2s ease-in;
      }
    }

    @keyframes dialog-enter {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes dialog-leave {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
    }
  `]
})
export class ConfirmDialogComponent {
  visible = false;
  config: ConfirmDialogConfig = {
    severity: 'warning',
    icon: 'pi-exclamation-triangle',
    title: '',
    message: '',
    acceptLabel: 'Confirmar',
    rejectLabel: 'Cancelar'
  };

  constructor(private confirmDialogService: ConfirmDialogService) {
    this.confirmDialogService.config$.subscribe(config => {
      if (config) {
        this.config = config;
        this.visible = true;
      } else {
        this.visible = false;
      }
    });
  }

  onAccept(): void {
    if (this.config.accept) {
      this.config.accept();
    }
    this.confirmDialogService.close();
  }

  onReject(): void {
    if (this.config.reject) {
      this.config.reject();
    }
    this.confirmDialogService.close();
  }

  onHide(): void {
    this.confirmDialogService.close();
  }

  getAcceptButtonClass(): string {
    const severityMap: Record<string, string> = {
      'info': 'p-button-info',
      'warning': 'p-button-warning',
      'danger': 'p-button-danger',
      'success': 'p-button-success'
    };
    return severityMap[this.config.severity || 'warning'] || 'p-button-primary';
  }
}
