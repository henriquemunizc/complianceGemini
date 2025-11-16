/**
 * BreadcrumbComponent
 *
 * Breadcrumb de navegação customizado
 *
 * @example
 * <app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
 *
 * breadcrumbItems: BreadcrumbItem[] = [
 *   { label: 'Compliance', route: '/compliance' },
 *   { label: 'Obrigações', route: '/compliance/obrigacoes' },
 *   { label: 'Detalhes' }
 * ];
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
  queryParams?: any;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <!-- Home -->
        <li class="breadcrumb-item">
          <a [routerLink]="['/']" class="breadcrumb-link" aria-label="Início">
            <i class="pi pi-home"></i>
          </a>
        </li>

        <!-- Separator -->
        <li class="breadcrumb-separator" aria-hidden="true">
          <i [class]="'pi ' + separatorIcon"></i>
        </li>

        <!-- Items -->
        <ng-container *ngFor="let item of items; let last = last; let i = index">
          <li class="breadcrumb-item" [class.active]="last">
            <!-- Link para itens não-finais -->
            <a
              *ngIf="!last && item.route"
              [routerLink]="item.route"
              [queryParams]="item.queryParams"
              class="breadcrumb-link">
              <i *ngIf="item.icon" [class]="'pi ' + item.icon"></i>
              {{ item.label }}
            </a>

            <!-- Texto para item final ou sem rota -->
            <span
              *ngIf="last || !item.route"
              class="breadcrumb-current"
              [attr.aria-current]="last ? 'page' : null">
              <i *ngIf="item.icon" [class]="'pi ' + item.icon"></i>
              {{ item.label }}
            </span>
          </li>

          <!-- Separator entre itens -->
          <li *ngIf="!last" class="breadcrumb-separator" aria-hidden="true">
            <i [class]="'pi ' + separatorIcon"></i>
          </li>
        </ng-container>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
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
      font-size: var(--font-size-sm);

      &.active {
        .breadcrumb-current {
          color: var(--color-text-primary);
          font-weight: var(--font-weight-medium);
        }
      }
    }

    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      color: var(--color-text-secondary);
      text-decoration: none;
      border-radius: var(--radius-xs);
      transition: all var(--transition-fast);

      i {
        font-size: 0.875rem;
      }

      &:hover {
        color: var(--color-primary);
        background: var(--color-background-light);
      }

      &:focus {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }

    .breadcrumb-separator {
      display: flex;
      align-items: center;
      color: var(--color-neutral-400);
      font-size: 0.75rem;
      user-select: none;
    }

    .breadcrumb-current {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-sm);
      color: var(--color-text-secondary);

      i {
        font-size: 0.875rem;
      }
    }

    /* Responsive - hide labels on small screens, keep only icons */
    @media (max-width: 576px) {
      .breadcrumb-link,
      .breadcrumb-current {
        padding: var(--spacing-xs);
      }
    }
  `]
})
export class BreadcrumbComponent {
  /** Array de itens do breadcrumb */
  @Input() items: BreadcrumbItem[] = [];

  /** Ícone do separador (padrão: angle-right) */
  @Input() separatorIcon: string = 'pi-angle-right';
}
