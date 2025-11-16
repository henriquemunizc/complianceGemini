/**
 * StatsCardComponent
 *
 * Card para exibir estatísticas e métricas com ícone, valor e trend
 *
 * @example
 * <app-stats-card
 *   label="Total de Obrigações"
 *   [value]="142"
 *   icon="pi-file-check"
 *   color="primary"
 *   [trend]="{ value: 12, direction: 'up' }">
 * </app-stats-card>
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatsTrend {
  value: number;
  direction: 'up' | 'down';
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-card" [class]="'stats-card--' + color">
      <div class="stats-card-content">
        <div class="stats-icon" [class]="'stats-icon--' + color">
          <i [class]="'pi ' + icon"></i>
        </div>
        <div class="stats-info">
          <div class="stats-value">{{ formattedValue }}</div>
          <div class="stats-label">{{ label }}</div>
          <div *ngIf="trend" class="stats-trend" [class.trend-up]="trend.direction === 'up'" [class.trend-down]="trend.direction === 'down'">
            <i [class]="trend.direction === 'up' ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
            <span>{{ trend.value }}%</span>
            <span class="trend-period">vs. mês anterior</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-card {
      background: white;
      border-radius: var(--radius-md);
      padding: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border-light);
      transition: all var(--transition-base);
      height: 100%;

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
    }

    .stats-card-content {
      display: flex;
      gap: var(--spacing-lg);
      align-items: flex-start;
    }

    .stats-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-base);

      i {
        font-size: 1.75rem;
      }

      &--primary {
        background: var(--color-primary-lightest);
        color: var(--color-primary);
      }

      &--success {
        background: var(--color-success-lightest);
        color: var(--color-success);
      }

      &--warning {
        background: var(--color-warning-lightest);
        color: var(--color-warning-dark);
      }

      &--danger {
        background: var(--color-danger-lightest);
        color: var(--color-danger);
      }

      &--info {
        background: var(--color-info-lightest);
        color: var(--color-info);
      }

      &--secondary {
        background: var(--color-secondary-lightest);
        color: var(--color-secondary);
      }
    }

    .stats-card:hover .stats-icon {
      transform: scale(1.05);
    }

    .stats-info {
      flex: 1;
      min-width: 0;
    }

    .stats-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      line-height: var(--line-height-tight);
      margin-bottom: var(--spacing-xs);
    }

    .stats-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-sm);
    }

    .stats-trend {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);

      i {
        font-size: 0.75rem;
      }

      &.trend-up {
        color: var(--color-success);
      }

      &.trend-down {
        color: var(--color-danger);
      }

      .trend-period {
        color: var(--color-text-tertiary);
        font-weight: var(--font-weight-normal);
        margin-left: var(--spacing-xs);
      }
    }

    /* Variações de cores do card */
    .stats-card--primary {
      border-left: 4px solid var(--color-primary);
    }

    .stats-card--success {
      border-left: 4px solid var(--color-success);
    }

    .stats-card--warning {
      border-left: 4px solid var(--color-warning);
    }

    .stats-card--danger {
      border-left: 4px solid var(--color-danger);
    }

    .stats-card--info {
      border-left: 4px solid var(--color-info);
    }

    .stats-card--secondary {
      border-left: 4px solid var(--color-secondary);
    }

    /* Responsive */
    @media (max-width: 576px) {
      .stats-card-content {
        flex-direction: column;
        text-align: center;
      }

      .stats-icon {
        margin: 0 auto;
      }
    }
  `]
})
export class StatsCardComponent {
  /** Label/descrição da estatística */
  @Input() label!: string;

  /** Valor a ser exibido (número ou string) */
  @Input() value!: number | string;

  /** Ícone PrimeIcons */
  @Input() icon!: string;

  /** Cor do tema do card */
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' = 'primary';

  /** Indicador de tendência (opcional) */
  @Input() trend?: StatsTrend;

  get formattedValue(): string {
    if (typeof this.value === 'number') {
      return this.value.toLocaleString('pt-BR');
    }
    return this.value;
  }
}
