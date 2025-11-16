/**
 * DesignSystemShowcaseComponent
 *
 * Componente de demonstração do Design System
 * Use este componente como referência para implementar suas páginas
 *
 * Para acessar: crie uma rota /design-system
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { EmptyStateComponent } from './empty-state.component';
import { PageHeaderComponent, Breadcrumb } from './page-header.component';
import { StatsCardComponent } from './stats-card.component';
import { StatusBadgeComponent } from './status-badge.component';
import { SearchBarComponent } from './search-bar.component';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';
import { SkeletonLoaderDirective } from '../directives/skeleton-loader.directive';

@Component({
  selector: 'app-design-system-showcase',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    EmptyStateComponent,
    PageHeaderComponent,
    StatsCardComponent,
    StatusBadgeComponent,
    SearchBarComponent,
    BreadcrumbComponent,
    SkeletonLoaderDirective
  ],
  template: `
    <div class="design-system-showcase">
      <!-- Page Header -->
      <app-page-header
        title="Design System"
        subtitle="Componentes reutilizáveis e profissionais do SGC"
        [breadcrumbs]="breadcrumbs">
        <div actions>
          <button pButton label="Documentação" icon="pi-book" class="p-button-outlined"></button>
          <button pButton label="GitHub" icon="pi-github" class="p-button-outlined"></button>
        </div>
      </app-page-header>

      <!-- Stats Cards -->
      <section class="showcase-section">
        <h2 class="section-title">Stats Cards</h2>
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-3">
            <app-stats-card
              label="Total de Obrigações"
              [value]="142"
              icon="pi-file-check"
              color="primary"
              [trend]="{ value: 12, direction: 'up' }">
            </app-stats-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <app-stats-card
              label="Concluídas"
              [value]="98"
              icon="pi-check-circle"
              color="success"
              [trend]="{ value: 8, direction: 'up' }">
            </app-stats-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <app-stats-card
              label="Pendentes"
              [value]="32"
              icon="pi-clock"
              color="warning">
            </app-stats-card>
          </div>

          <div class="col-12 md:col-6 lg:col-3">
            <app-stats-card
              label="Atrasadas"
              [value]="12"
              icon="pi-exclamation-triangle"
              color="danger"
              [trend]="{ value: 5, direction: 'down' }">
            </app-stats-card>
          </div>
        </div>
      </section>

      <!-- Status Badges -->
      <section class="showcase-section">
        <h2 class="section-title">Status Badges</h2>
        <p-card>
          <div class="badge-grid">
            <div class="badge-item">
              <span class="badge-label">Pendente:</span>
              <app-status-badge status="PENDENTE" size="small"></app-status-badge>
              <app-status-badge status="PENDENTE" size="medium"></app-status-badge>
              <app-status-badge status="PENDENTE" size="large"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Em Andamento:</span>
              <app-status-badge status="EM_ANDAMENTO"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Concluído:</span>
              <app-status-badge status="CONCLUIDO"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Atrasado:</span>
              <app-status-badge status="ATRASADO"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Cancelado:</span>
              <app-status-badge status="CANCELADO"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Aprovado:</span>
              <app-status-badge status="APROVADO"></app-status-badge>
            </div>

            <div class="badge-item">
              <span class="badge-label">Alta Prioridade:</span>
              <app-status-badge status="ALTA"></app-status-badge>
            </div>
          </div>
        </p-card>
      </section>

      <!-- Search Bar -->
      <section class="showcase-section">
        <h2 class="section-title">Search Bar</h2>
        <p-card>
          <app-search-bar
            placeholder="Buscar obrigações, empresas, normas..."
            [suggestions]="searchSuggestions"
            (onSearch)="onSearch($event)">
          </app-search-bar>

          <div *ngIf="searchResult" class="search-result">
            Você buscou por: <strong>{{ searchResult }}</strong>
          </div>
        </p-card>
      </section>

      <!-- Breadcrumb -->
      <section class="showcase-section">
        <h2 class="section-title">Breadcrumb</h2>
        <p-card>
          <app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
        </p-card>
      </section>

      <!-- Skeleton Loader -->
      <section class="showcase-section">
        <h2 class="section-title">Skeleton Loader</h2>
        <div class="grid">
          <div class="col-12 md:col-6">
            <p-card>
              <h3>Carregando: {{ isLoading }}</h3>
              <button
                pButton
                [label]="isLoading ? 'Parar Loading' : 'Iniciar Loading'"
                (click)="toggleLoading()"
                class="mb-3">
              </button>

              <div [appSkeletonLoader]="isLoading" skeletonType="text" [skeletonLines]="3">
                <h2>Título do Card</h2>
                <p>Este é um exemplo de conteúdo que será substituído por skeleton loading.</p>
                <p>Múltiplas linhas de texto podem ser exibidas.</p>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6">
            <p-card>
              <div class="flex align-items-center gap-3">
                <div [appSkeletonLoader]="isLoading" skeletonType="circle">
                  <div class="avatar">JD</div>
                </div>
                <div class="flex-1" [appSkeletonLoader]="isLoading" skeletonType="text" [skeletonLines]="2">
                  <h4>João da Silva</h4>
                  <p>joao.silva@example.com</p>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <section class="showcase-section">
        <h2 class="section-title">Empty State</h2>
        <p-card>
          <app-empty-state
            icon="pi-inbox"
            title="Nenhuma obrigação encontrada"
            message="Não há obrigações cadastradas no sistema. Comece criando sua primeira obrigação fiscal."
            actionLabel="Nova Obrigação"
            actionIcon="pi-plus"
            (onAction)="onEmptyAction()">
          </app-empty-state>
        </p-card>
      </section>

      <!-- Design Tokens -->
      <section class="showcase-section">
        <h2 class="section-title">Design Tokens - Cores</h2>
        <div class="grid">
          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <h4>Primary</h4>
              <div class="color-palette">
                <div class="color-swatch" style="background: var(--color-primary-dark)">Dark</div>
                <div class="color-swatch" style="background: var(--color-primary)">Primary</div>
                <div class="color-swatch" style="background: var(--color-primary-light)">Light</div>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <h4>Success</h4>
              <div class="color-palette">
                <div class="color-swatch" style="background: var(--color-success-dark)">Dark</div>
                <div class="color-swatch" style="background: var(--color-success)">Success</div>
                <div class="color-swatch" style="background: var(--color-success-light)">Light</div>
              </div>
            </p-card>
          </div>

          <div class="col-12 md:col-6 lg:col-4">
            <p-card>
              <h4>Danger</h4>
              <div class="color-palette">
                <div class="color-swatch" style="background: var(--color-danger-dark)">Dark</div>
                <div class="color-swatch" style="background: var(--color-danger)">Danger</div>
                <div class="color-swatch" style="background: var(--color-danger-light)">Light</div>
              </div>
            </p-card>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="showcase-section">
        <h2 class="section-title">Buttons</h2>
        <p-card>
          <div class="button-showcase">
            <button pButton label="Primary" class="p-button-primary"></button>
            <button pButton label="Success" class="p-button-success"></button>
            <button pButton label="Warning" class="p-button-warning"></button>
            <button pButton label="Danger" class="p-button-danger"></button>
            <button pButton label="Secondary" class="p-button-secondary"></button>
          </div>

          <div class="button-showcase mt-3">
            <button pButton label="Outlined" class="p-button-outlined"></button>
            <button pButton label="Text" class="p-button-text"></button>
            <button pButton icon="pi-check" class="p-button-icon-only"></button>
            <button pButton label="With Icon" icon="pi-plus"></button>
          </div>

          <div class="button-showcase mt-3">
            <button pButton label="Small" class="p-button-sm"></button>
            <button pButton label="Normal"></button>
            <button pButton label="Large" class="p-button-lg"></button>
          </div>
        </p-card>
      </section>
    </div>
  `,
  styles: [`
    .design-system-showcase {
      padding: var(--spacing-2xl);
      max-width: 1400px;
      margin: 0 auto;
    }

    .showcase-section {
      margin-bottom: var(--spacing-3xl);
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 2px solid var(--color-border-light);
    }

    .badge-grid {
      display: grid;
      gap: var(--spacing-lg);
    }

    .badge-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .badge-label {
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      min-width: 150px;
    }

    .search-result {
      margin-top: var(--spacing-lg);
      padding: var(--spacing-md);
      background: var(--color-primary-lightest);
      border-radius: var(--radius-sm);
      color: var(--color-primary-dark);
    }

    .color-palette {
      display: flex;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-md);
    }

    .color-swatch {
      flex: 1;
      padding: var(--spacing-lg);
      color: white;
      text-align: center;
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
    }

    .button-showcase {
      display: flex;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-lg);
    }

    :host ::ng-deep {
      .p-card {
        box-shadow: var(--shadow-sm);
        border: 1px solid var(--color-border-light);
      }
    }
  `]
})
export class DesignSystemShowcaseComponent {
  breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', route: '/admin' },
    { label: 'Design System' }
  ];

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Compliance', route: '/compliance', icon: 'pi-shield' },
    { label: 'Obrigações', route: '/compliance/obrigacoes' },
    { label: 'SPED Fiscal' }
  ];

  searchSuggestions = [
    'SPED Fiscal',
    'DCTF',
    'EFD-Contribuições',
    'DIRF',
    'eSocial',
    'EFD-REINF'
  ];

  searchResult = '';
  isLoading = false;

  onSearch(query: string): void {
    this.searchResult = query;
    console.log('Buscando por:', query);
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  onEmptyAction(): void {
    console.log('Criar nova obrigação');
  }
}
