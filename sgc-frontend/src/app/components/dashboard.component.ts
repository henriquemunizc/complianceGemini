import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DashboardService, DashboardMetrics } from '../services/dashboard.service';

interface DashboardCard {
  title: string;
  value: number;
  icon: string;
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  iconClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Dashboard</h1>

      <div class="dashboard-grid" *ngIf="!loading; else loadingTemplate">
        <div *ngFor="let card of cards" class="dashboard-card">
          <p-card>
            <div class="card-content">
              <div class="card-icon" [ngClass]="card.iconClass">
                <i [class]="'pi ' + card.icon"></i>
              </div>
              <div class="card-info">
                <div class="card-value">{{ card.value }}</div>
                <div class="card-label">{{ card.title }}</div>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="dashboard-grid">
          <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="dashboard-card">
            <p-card>
              <div class="card-content">
                <p-skeleton shape="circle" size="4rem"></p-skeleton>
                <div class="card-info">
                  <p-skeleton width="5rem" height="2rem"></p-skeleton>
                  <p-skeleton width="8rem" height="1rem"></p-skeleton>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      </ng-template>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
    }

    .dashboard-title {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #333;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .dashboard-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1200px) {
      .dashboard-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .dashboard-card {
      height: 100%;
    }

    .card-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.5rem;
    }

    .card-icon {
      width: 4rem;
      height: 4rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      flex-shrink: 0;
    }

    .card-icon.success {
      background-color: #d4edda;
      color: #155724;
    }

    .card-icon.info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .card-icon.warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .card-icon.danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .card-icon.secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .card-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .card-label {
      font-size: 0.95rem;
      color: #6c757d;
      font-weight: 500;
    }

    ::ng-deep .p-card {
      height: 100%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s;
    }

    ::ng-deep .p-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    ::ng-deep .p-card .p-card-body {
      padding: 1.25rem;
    }

    ::ng-deep .p-card .p-card-content {
      padding: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);

  loading = true;
  metrics?: DashboardMetrics;
  cards: DashboardCard[] = [];

  ngOnInit(): void {
    this.loadMetrics();
  }

  private async loadMetrics(): Promise<void> {
    try {
      this.loading = true;
      this.metrics = await this.dashboardService.getMetrics().toPromise();

      if (this.metrics) {
        this.buildCards(this.metrics);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar as métricas do dashboard'
      });
    } finally {
      this.loading = false;
    }
  }

  private buildCards(metrics: DashboardMetrics): void {
    this.cards = [
      {
        title: 'Total de Obrigações',
        value: metrics.totalObrigacoes,
        icon: 'pi-file',
        severity: 'secondary',
        iconClass: 'secondary'
      },
      {
        title: 'Pendentes',
        value: metrics.obrigacoesPendentes,
        icon: 'pi-clock',
        severity: 'warning',
        iconClass: 'warning'
      },
      {
        title: 'Atrasadas',
        value: metrics.obrigacoesAtrasadas,
        icon: 'pi-exclamation-triangle',
        severity: 'danger',
        iconClass: 'danger'
      },
      {
        title: 'Aprovadas',
        value: metrics.obrigacoesAprovadas,
        icon: 'pi-check-circle',
        severity: 'success',
        iconClass: 'success'
      },
      {
        title: 'Total de Normas',
        value: metrics.totalNormas,
        icon: 'pi-book',
        severity: 'secondary',
        iconClass: 'secondary'
      },
      {
        title: 'Normas Vigentes',
        value: metrics.normasVigentes,
        icon: 'pi-book',
        severity: 'success',
        iconClass: 'success'
      },
      {
        title: 'Usuários Ativos',
        value: metrics.totalUsuariosAtivos,
        icon: 'pi-users',
        severity: 'info',
        iconClass: 'info'
      },
      {
        title: 'Submetidas',
        value: metrics.obrigacoesSubmetidas,
        icon: 'pi-send',
        severity: 'info',
        iconClass: 'info'
      }
    ];
  }
}
