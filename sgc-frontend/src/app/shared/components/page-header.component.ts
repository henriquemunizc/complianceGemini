/**
 * PageHeaderComponent
 *
 * Cabeçalho de página com título, subtitle, breadcrumbs e área de ações
 *
 * @example
 * <app-page-header
 *   title="Gestão de Obrigações"
 *   subtitle="Gerencie todas as obrigações fiscais da empresa"
 *   [breadcrumbs]="breadcrumbs">
 *   <div actions>
 *     <button pButton label="Exportar" icon="pi-download" class="p-button-outlined"></button>
 *     <button pButton label="Nova Obrigação" icon="pi-plus"></button>
 *   </div>
 * </app-page-header>
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Breadcrumb {
  label: string;
  route?: string;
  icon?: string;
}

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs" *ngIf="breadcrumbs && breadcrumbs.length > 0" aria-label="breadcrumb">
        <ol class="breadcrumb-list">
          <li class="breadcrumb-item">
            <a [routerLink]="['/']" class="breadcrumb-link">
              <i class="pi pi-home"></i>
            </a>
          </li>
          <li class="breadcrumb-separator" aria-hidden="true">
            <i class="pi pi-angle-right"></i>
          </li>
          <li
            *ngFor="let item of breadcrumbs; let last = last"
            class="breadcrumb-item"
            [class.active]="last">
            <ng-container *ngIf="!last && item.route">
              <a [routerLink]="item.route" class="breadcrumb-link">
                <i *ngIf="item.icon" [class]="'pi ' + item.icon"></i>
                {{ item.label }}
              </a>
              <span class="breadcrumb-separator" aria-hidden="true">
                <i class="pi pi-angle-right"></i>
              </span>
            </ng-container>
            <span *ngIf="last" class="breadcrumb-current" aria-current="page">
              <i *ngIf="item.icon" [class]="'pi ' + item.icon"></i>
              {{ item.label }}
            </span>
          </li>
        </ol>
      </nav>

      <!-- Header Content -->
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">{{ title }}</h1>
          <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: var(--spacing-2xl);
    }

    /* Breadcrumbs */
    .breadcrumbs {
      margin-bottom: var(--spacing-lg);
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      padding: 0;
      margin: 0;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
    }

    .breadcrumb-link {
      color: var(--color-text-secondary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-xs);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--color-primary);
        background: var(--color-background-light);
      }

      i {
        font-size: 0.875rem;
      }
    }

    .breadcrumb-separator {
      color: var(--color-neutral-400);
      display: flex;
      align-items: center;
      font-size: 0.75rem;
    }

    .breadcrumb-current {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    /* Header Content */
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-xl);
      flex-wrap: wrap;
    }

    .header-text {
      flex: 1;
      min-width: 0;
    }

    .page-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs) 0;
      line-height: var(--line-height-tight);
    }

    .page-subtitle {
      font-size: var(--font-size-base);
      color: var(--color-text-secondary);
      margin: 0;
      line-height: var(--line-height-normal);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-start;
      }

      .page-title {
        font-size: var(--font-size-xl);
      }
    }
  `]
})
export class PageHeaderComponent {
  /** Título da página */
  @Input() title!: string;

  /** Subtítulo da página (opcional) */
  @Input() subtitle?: string;

  /** Breadcrumbs para navegação (opcional) */
  @Input() breadcrumbs?: Breadcrumb[];
}
