/**
 * StatusBadgeComponent
 *
 * Badge de status com cores mapeadas automaticamente
 *
 * @example
 * <app-status-badge status="PENDENTE" size="medium"></app-status-badge>
 * <app-status-badge status="EM_ANDAMENTO" size="small"></app-status-badge>
 * <app-status-badge status="CONCLUIDO" size="large"></app-status-badge>
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatusColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusConfig {
  color: StatusColor;
  label: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'status-badge--' + statusConfig.color" [class.status-badge--small]="size === 'small'" [class.status-badge--large]="size === 'large'">
      <span class="status-dot"></span>
      <span class="status-label">{{ statusConfig.label }}</span>
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      line-height: 1;
      white-space: nowrap;
      transition: all var(--transition-fast);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }

    .status-label {
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Sizes */
    .status-badge--small {
      font-size: 0.625rem;
      padding: 0.125rem var(--spacing-sm);
      gap: var(--spacing-xs);

      .status-dot {
        width: 4px;
        height: 4px;
      }
    }

    .status-badge--large {
      font-size: var(--font-size-sm);
      padding: var(--spacing-sm) var(--spacing-lg);
      gap: var(--spacing-md);

      .status-dot {
        width: 8px;
        height: 8px;
      }
    }

    /* Colors */
    .status-badge--primary {
      background: var(--color-primary-lightest);
      color: var(--color-primary-dark);

      .status-dot {
        background: var(--color-primary);
      }
    }

    .status-badge--success {
      background: var(--color-success-lightest);
      color: var(--color-success-dark);

      .status-dot {
        background: var(--color-success);
      }
    }

    .status-badge--warning {
      background: var(--color-warning-lightest);
      color: var(--color-warning-dark);

      .status-dot {
        background: var(--color-warning);
      }
    }

    .status-badge--danger {
      background: var(--color-danger-lightest);
      color: var(--color-danger-dark);

      .status-dot {
        background: var(--color-danger);
      }
    }

    .status-badge--info {
      background: var(--color-info-lightest);
      color: var(--color-info-dark);

      .status-dot {
        background: var(--color-info);
      }
    }

    .status-badge--neutral {
      background: var(--color-neutral-100);
      color: var(--color-neutral-700);

      .status-dot {
        background: var(--color-neutral-500);
      }
    }

    /* Hover effect */
    .status-badge:hover {
      transform: scale(1.02);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class StatusBadgeComponent {
  /** Status da obrigação ou valor customizado */
  @Input() status!: string;

  /** Tamanho do badge */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  /** Mapeamento de status para cores e labels */
  private readonly statusMap: Record<string, StatusConfig> = {
    // Status de Obrigações
    'PENDENTE': { color: 'warning', label: 'Pendente' },
    'EM_ANDAMENTO': { color: 'info', label: 'Em Andamento' },
    'CONCLUIDO': { color: 'success', label: 'Concluído' },
    'ATRASADO': { color: 'danger', label: 'Atrasado' },
    'CANCELADO': { color: 'neutral', label: 'Cancelado' },

    // Status Genéricos
    'ATIVO': { color: 'success', label: 'Ativo' },
    'INATIVO': { color: 'neutral', label: 'Inativo' },
    'APROVADO': { color: 'success', label: 'Aprovado' },
    'REPROVADO': { color: 'danger', label: 'Reprovado' },
    'EM_ANALISE': { color: 'info', label: 'Em Análise' },
    'AGUARDANDO': { color: 'warning', label: 'Aguardando' },

    // Status de Documentos
    'ENVIADO': { color: 'success', label: 'Enviado' },
    'PROCESSANDO': { color: 'info', label: 'Processando' },
    'ERRO': { color: 'danger', label: 'Erro' },
    'REJEITADO': { color: 'danger', label: 'Rejeitado' },

    // Status de Prioridade
    'BAIXA': { color: 'neutral', label: 'Baixa' },
    'MEDIA': { color: 'warning', label: 'Média' },
    'ALTA': { color: 'danger', label: 'Alta' },
    'CRITICA': { color: 'danger', label: 'Crítica' },

    // Criticidade
    'INFORMATIVO': { color: 'info', label: 'Informativo' },
    'MODERADO': { color: 'warning', label: 'Moderado' },
    'SEVERO': { color: 'danger', label: 'Severo' },
  };

  get statusConfig(): StatusConfig {
    const normalized = this.status?.toUpperCase().trim();
    return this.statusMap[normalized] || {
      color: 'neutral',
      label: this.status || 'N/A'
    };
  }
}
