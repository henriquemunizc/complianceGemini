/**
 * EmptyStateComponent
 *
 * Componente para exibir estados vazios em listas, tabelas, etc.
 *
 * @example
 * <app-empty-state
 *   icon="pi-inbox"
 *   title="Nenhuma obrigação cadastrada"
 *   message="Comece criando sua primeira obrigação clicando no botão abaixo"
 *   actionLabel="Nova Obrigação"
 *   (onAction)="criarObrigacao()">
 * </app-empty-state>
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state-icon">
        <i [class]="'pi ' + icon"></i>
      </div>
      <h3 class="empty-state-title">{{ title }}</h3>
      <p class="empty-state-message">{{ message }}</p>
      <button
        *ngIf="actionLabel"
        pButton
        [label]="actionLabel"
        [icon]="actionIcon"
        class="p-button-primary"
        (click)="handleAction()">
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-4xl) var(--spacing-2xl);
      text-align: center;
      min-height: 300px;
    }

    .empty-state-icon {
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background-medium);
      border-radius: var(--radius-full);
      margin-bottom: var(--spacing-xl);
    }

    .empty-state-icon i {
      font-size: 4rem;
      color: var(--color-neutral-400);
    }

    .empty-state-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
      margin: 0 0 var(--spacing-md) 0;
    }

    .empty-state-message {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      max-width: 500px;
      margin-bottom: var(--spacing-xl);
      line-height: var(--line-height-relaxed);
    }
  `]
})
export class EmptyStateComponent {
  /** Ícone PrimeIcons (ex: 'pi-inbox', 'pi-search', 'pi-filter') */
  @Input() icon: string = 'pi-inbox';

  /** Título principal do estado vazio */
  @Input() title: string = 'Nenhum item encontrado';

  /** Mensagem descritiva */
  @Input() message: string = 'Não há itens para exibir no momento.';

  /** Label do botão de ação (se não fornecido, botão não aparece) */
  @Input() actionLabel?: string;

  /** Ícone do botão de ação */
  @Input() actionIcon: string = 'pi-plus';

  /** Evento disparado quando o botão de ação é clicado */
  @Output() onAction = new EventEmitter<void>();

  handleAction(): void {
    this.onAction.emit();
  }
}
