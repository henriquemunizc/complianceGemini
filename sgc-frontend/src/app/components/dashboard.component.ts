import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { DashboardService, DashboardMetrics } from '../services/dashboard.service';
import { ChartData, ObrigacaoAtrasada, Atividade, PeriodoFiltro } from '../models/dashboard.model';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Importar configuração do Chart.js
import '../config/chart.config';

interface DashboardCard {
  title: string;
  value: number;
  icon: string;
  severity: 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  iconClass: string;
}

interface PeriodoOption {
  label: string;
  value: PeriodoFiltro;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    SkeletonModule,
    ToastModule,
    ButtonModule,
    DropdownModule,
    TableModule,
    TagModule,
    TimelineModule,
    AvatarModule,
    TooltipModule,
    BaseChartDirective
  ],
  providers: [MessageService],
  template: `
    <div class="dashboard-container">
      <!-- Header com título e controles -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Dashboard</h1>
        <div class="dashboard-controls">
          <p-dropdown
            [options]="periodoOptions"
            [(ngModel)]="periodoSelecionado"
            (onChange)="onPeriodoChange()"
            placeholder="Selecione o período"
            [style]="{'min-width': '200px'}"
          ></p-dropdown>
          <p-button
            icon="pi pi-refresh"
            (onClick)="refresh()"
            [loading]="loading"
            severity="secondary"
            [outlined]="true"
            label="Atualizar"
          ></p-button>
        </div>
      </div>

      <!-- Cards de Métricas -->
      <div class="metrics-grid" *ngIf="!loading; else loadingCards">
        <div *ngFor="let card of cards" class="metric-card">
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

      <ng-template #loadingCards>
        <div class="metrics-grid">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="metric-card">
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

      <!-- Gráficos -->
      <div class="charts-grid" *ngIf="!loading; else loadingCharts">
        <!-- Gráfico de Pizza - Status -->
        <div class="chart-card">
          <p-card>
            <ng-template pTemplate="header">
              <div class="chart-header">
                <h3>Obrigações por Status</h3>
              </div>
            </ng-template>
            <div class="chart-container" *ngIf="pieChartData.labels.length > 0; else emptyState">
              <canvas
                baseChart
                [data]="pieChartData"
                [type]="pieChartType"
                [options]="pieChartOptions"
              ></canvas>
            </div>
          </p-card>
        </div>

        <!-- Gráfico de Barras - Responsáveis -->
        <div class="chart-card">
          <p-card>
            <ng-template pTemplate="header">
              <div class="chart-header">
                <h3>Top 10 Responsáveis</h3>
              </div>
            </ng-template>
            <div class="chart-container" *ngIf="barChartData.labels.length > 0; else emptyState">
              <canvas
                baseChart
                [data]="barChartData"
                [type]="barChartType"
                [options]="barChartOptions"
              ></canvas>
            </div>
          </p-card>
        </div>

        <!-- Gráfico de Linha - Tendência -->
        <div class="chart-card chart-card-wide">
          <p-card>
            <ng-template pTemplate="header">
              <div class="chart-header">
                <h3>Tendência dos Últimos 30 Dias</h3>
              </div>
            </ng-template>
            <div class="chart-container" *ngIf="lineChartData.labels.length > 0; else emptyState">
              <canvas
                baseChart
                [data]="lineChartData"
                [type]="lineChartType"
                [options]="lineChartOptions"
              ></canvas>
            </div>
          </p-card>
        </div>
      </div>

      <ng-template #loadingCharts>
        <div class="charts-grid">
          <div class="chart-card">
            <p-card>
              <p-skeleton width="100%" height="300px"></p-skeleton>
            </p-card>
          </div>
          <div class="chart-card">
            <p-card>
              <p-skeleton width="100%" height="300px"></p-skeleton>
            </p-card>
          </div>
          <div class="chart-card chart-card-wide">
            <p-card>
              <p-skeleton width="100%" height="300px"></p-skeleton>
            </p-card>
          </div>
        </div>
      </ng-template>

      <ng-template #emptyState>
        <div class="empty-state">
          <i class="pi pi-chart-line"></i>
          <p>Nenhum dado disponível</p>
        </div>
      </ng-template>

      <!-- Tabela de Obrigações Atrasadas -->
      <div class="table-section" *ngIf="!loading">
        <p-card>
          <ng-template pTemplate="header">
            <div class="chart-header">
              <h3>Obrigações Atrasadas</h3>
            </div>
          </ng-template>
          <p-table
            [value]="obrigacoesAtrasadas"
            [paginator]="false"
            [responsive]="true"
            styleClass="p-datatable-sm"
            *ngIf="obrigacoesAtrasadas.length > 0; else emptyTable"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="obrigacaoId">ID <p-sortIcon field="obrigacaoId"></p-sortIcon></th>
                <th pSortableColumn="titulo">Título <p-sortIcon field="titulo"></p-sortIcon></th>
                <th pSortableColumn="responsavelNome">Responsável <p-sortIcon field="responsavelNome"></p-sortIcon></th>
                <th pSortableColumn="prazoExecucao">Prazo <p-sortIcon field="prazoExecucao"></p-sortIcon></th>
                <th pSortableColumn="diasAtraso">Dias em Atraso <p-sortIcon field="diasAtraso"></p-sortIcon></th>
                <th>Ações</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-obrigacao>
              <tr>
                <td>{{ obrigacao.obrigacaoId }}</td>
                <td>{{ obrigacao.titulo }}</td>
                <td>{{ obrigacao.responsavelNome }}</td>
                <td>{{ obrigacao.prazoExecucao | date: 'dd/MM/yyyy' }}</td>
                <td>
                  <p-tag severity="danger" [value]="obrigacao.diasAtraso + ' dias'"></p-tag>
                </td>
                <td>
                  <p-button
                    icon="pi pi-eye"
                    [text]="true"
                    severity="info"
                    (onClick)="verDetalhes(obrigacao.obrigacaoId)"
                    pTooltip="Ver detalhes"
                  ></p-button>
                </td>
              </tr>
            </ng-template>
          </p-table>
          <ng-template #emptyTable>
            <div class="empty-state">
              <i class="pi pi-check-circle"></i>
              <p>Nenhuma obrigação atrasada</p>
            </div>
          </ng-template>
        </p-card>
      </div>

      <!-- Timeline de Atividades Recentes -->
      <div class="timeline-section" *ngIf="!loading">
        <p-card>
          <ng-template pTemplate="header">
            <div class="chart-header">
              <h3>Atividades Recentes</h3>
            </div>
          </ng-template>
          <p-timeline
            [value]="atividadesRecentes"
            *ngIf="atividadesRecentes.length > 0; else emptyTimeline"
            styleClass="customized-timeline"
          >
            <ng-template pTemplate="marker" let-atividade>
              <span class="custom-marker" [ngClass]="getAtividadeClass(atividade.tipo)">
                <i [class]="getAtividadeIcon(atividade.tipo)"></i>
              </span>
            </ng-template>
            <ng-template pTemplate="content" let-atividade>
              <div class="timeline-content">
                <div class="timeline-header">
                  <p-avatar
                    [label]="getInitials(atividade.usuarioNome)"
                    shape="circle"
                    size="normal"
                    styleClass="mr-2"
                  ></p-avatar>
                  <div class="timeline-info">
                    <strong>{{ atividade.usuarioNome }}</strong>
                    <span class="timeline-time">{{ getRelativeTime(atividade.timestamp) }}</span>
                  </div>
                </div>
                <p class="timeline-description">{{ atividade.descricao }}</p>
                <a
                  *ngIf="atividade.obrigacaoId"
                  class="timeline-link"
                  (click)="verDetalhes(atividade.obrigacaoId)"
                >
                  Ver obrigação #{{ atividade.obrigacaoId }}
                </a>
              </div>
            </ng-template>
          </p-timeline>
          <ng-template #emptyTimeline>
            <div class="empty-state">
              <i class="pi pi-history"></i>
              <p>Nenhuma atividade recente</p>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dashboard-title {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .dashboard-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .metric-card {
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

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 768px) {
      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1200px) {
      .charts-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .chart-card {
      min-height: 350px;
    }

    .chart-card-wide {
      grid-column: 1 / -1;
    }

    .chart-header {
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .chart-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .chart-container {
      padding: 2rem;
      position: relative;
      height: 300px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #6c757d;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state p {
      margin: 0;
      font-size: 1rem;
    }

    .table-section {
      margin-bottom: 2rem;
    }

    .timeline-section {
      margin-bottom: 2rem;
    }

    .timeline-content {
      padding: 0.5rem 0;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .timeline-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .timeline-time {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .timeline-description {
      margin: 0.5rem 0;
      color: #495057;
    }

    .timeline-link {
      color: #007bff;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .timeline-link:hover {
      text-decoration: underline;
    }

    .custom-marker {
      display: flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      color: white;
      border-radius: 50%;
      z-index: 1;
    }

    .custom-marker.criacao {
      background-color: #6c757d;
    }

    .custom-marker.submissao {
      background-color: #17a2b8;
    }

    .custom-marker.aprovacao {
      background-color: #28a745;
    }

    .custom-marker.rejeicao {
      background-color: #dc3545;
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
      padding: 0;
    }

    ::ng-deep .p-card .p-card-content {
      padding: 1.25rem;
    }

    ::ng-deep .p-timeline .p-timeline-event-content {
      flex: 1;
    }

    ::ng-deep .p-dropdown {
      min-width: 200px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .dashboard-controls {
        width: 100%;
        flex-direction: column;
      }

      .dashboard-controls p-dropdown,
      .dashboard-controls p-button {
        width: 100%;
      }

      .charts-grid {
        grid-template-columns: 1fr !important;
      }

      .chart-card-wide {
        grid-column: 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loading = true;
  metrics?: DashboardMetrics;
  cards: DashboardCard[] = [];
  obrigacoesAtrasadas: ObrigacaoAtrasada[] = [];
  atividadesRecentes: Atividade[] = [];

  periodoSelecionado: PeriodoFiltro = 'ULTIMOS_30_DIAS';
  periodoOptions: PeriodoOption[] = [
    { label: 'Hoje', value: 'HOJE' },
    { label: 'Últimos 7 dias', value: 'ULTIMOS_7_DIAS' },
    { label: 'Últimos 30 dias', value: 'ULTIMOS_30_DIAS' },
    { label: 'Este mês', value: 'ESTE_MES' }
  ];

  // Pie Chart - Status
  pieChartData: ChartData = { labels: [], datasets: [] };
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: any) => a + (b as number), 0) as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Bar Chart - Responsáveis
  barChartData: ChartData = { labels: [], datasets: [] };
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11 },
          padding: 10
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        stacked: true,
        ticks: { font: { size: 11 } }
      },
      y: {
        stacked: true,
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Line Chart - Tendência
  lineChartData: ChartData = { labels: [], datasets: [] };
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: { font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 },
          precision: 0
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadAllData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadAllData(): Promise<void> {
    try {
      this.loading = true;

      // Carregar todas as métricas em paralelo
      const [metrics, statusData, responsavelData, tendenciaData, atrasadas, atividades] = await Promise.all([
        this.dashboardService.getMetrics(this.periodoSelecionado).toPromise(),
        this.dashboardService.getObrigacoesPorStatus().toPromise(),
        this.dashboardService.getObrigacoesPorResponsavel(10).toPromise(),
        this.dashboardService.getObrigacoesTendencia(30).toPromise(),
        this.dashboardService.getObrigacoesAtrasadasDetalhadas(10).toPromise(),
        this.dashboardService.getAtividadesRecentes(20).toPromise()
      ]);

      if (metrics) {
        this.metrics = metrics;
        this.buildCards(metrics);
      }

      if (statusData) this.pieChartData = statusData;
      if (responsavelData) this.barChartData = responsavelData;
      if (tendenciaData) this.lineChartData = tendenciaData;
      if (atrasadas) this.obrigacoesAtrasadas = atrasadas;
      if (atividades) this.atividadesRecentes = atividades;

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os dados do dashboard'
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
        title: 'Submetidas',
        value: metrics.obrigacoesSubmetidas,
        icon: 'pi-send',
        severity: 'info',
        iconClass: 'info'
      },
      {
        title: 'Normas Vigentes',
        value: metrics.normasVigentes,
        icon: 'pi-book',
        severity: 'success',
        iconClass: 'success'
      }
    ];
  }

  onPeriodoChange(): void {
    this.loadAllData();
  }

  refresh(): void {
    this.loadAllData();
  }

  private startAutoRefresh(): void {
    // Auto-refresh a cada 5 minutos
    interval(5 * 60 * 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAllData();
      });
  }

  verDetalhes(obrigacaoId: number): void {
    this.router.navigate(['/obrigacoes', obrigacaoId]);
  }

  getAtividadeIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'CRIACAO': 'pi pi-plus',
      'SUBMISSAO': 'pi pi-send',
      'APROVACAO': 'pi pi-check',
      'REJEICAO': 'pi pi-times'
    };
    return icons[tipo] || 'pi pi-info-circle';
  }

  getAtividadeClass(tipo: string): string {
    const classes: { [key: string]: string } = {
      'CRIACAO': 'criacao',
      'SUBMISSAO': 'submissao',
      'APROVACAO': 'aprovacao',
      'REJEICAO': 'rejeicao'
    };
    return classes[tipo] || 'criacao';
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Há ${Math.floor(diffInSeconds / 86400)} dias`;

    return time.toLocaleDateString('pt-BR');
  }
}
