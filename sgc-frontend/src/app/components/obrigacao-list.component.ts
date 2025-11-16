import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ChipModule } from 'primeng/chip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ObrigacaoService } from '../services/obrigacao.service';
import { AuthService } from '../services/auth.service';
import { ObrigacaoResponse, StatusObrigacao } from '../models/obrigacao.model';
import { PerfilUsuario } from '../models/auth.model';
import { AdvancedFilterComponent, FilterConfig } from '../shared/components/advanced-filter.component';
import { ExportButtonComponent } from '../shared/components/export-button.component';
import { FilterService } from '../services/filter.service';
import { ColumnConfig } from '../services/export.service';

@Component({
  selector: 'app-obrigacao-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    VirtualScrollerModule,
    ChipModule,
    AdvancedFilterComponent,
    ExportButtonComponent
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Obrigações de Compliance</h2>
        <div class="flex gap-2">
          <p-button
            label="Filtros Avançados"
            icon="pi pi-filter"
            [badge]="activeFiltersCount > 0 ? activeFiltersCount.toString() : ''"
            badgeClass="p-badge-info"
            severity="secondary"
            [outlined]="true"
            (onClick)="showFilters = true"
          ></p-button>
          <app-export-button
            [data]="obrigacoes"
            [filename]="'obrigacoes'"
            [title]="'Obrigações de Compliance'"
            [columns]="exportColumns"
          ></app-export-button>
          <p-button
            *ngIf="canCreate"
            label="Nova Obrigação"
            icon="pi pi-plus"
            (onClick)="novaObrigacao()"
          ></p-button>
        </div>
      </div>

      <!-- Filtros Ativos -->
      <div *ngIf="activeFiltersCount > 0" class="mb-3">
        <div class="flex align-items-center gap-2 flex-wrap">
          <span class="text-sm font-semibold">Filtros ativos:</span>
          <p-chip
            *ngIf="filters.status"
            [label]="'Status: ' + getStatusLabel(filters.status)"
            [removable]="true"
            (onRemove)="removeFilter('status')"
          ></p-chip>
          <p-chip
            *ngIf="filters.responsavel"
            [label]="'Responsável: ' + filters.responsavel"
            [removable]="true"
            (onRemove)="removeFilter('responsavel')"
          ></p-chip>
          <p-chip
            *ngIf="filters.prazoInicio || filters.prazoFim"
            [label]="'Prazo: ' + formatDateRange(filters.prazoInicio, filters.prazoFim)"
            [removable]="true"
            (onRemove)="removeFilter('prazo')"
          ></p-chip>
          <p-button
            label="Limpar todos"
            icon="pi pi-times"
            [text]="true"
            size="small"
            (onClick)="clearAllFilters()"
          ></p-button>
        </div>
      </div>

      <div class="mb-3">
        <p class="text-color-secondary">
          <i class="pi pi-info-circle"></i>
          Exibindo {{ obrigacoes.length }} de {{ totalRecords }} obrigações
        </p>
      </div>

      <p-table
        [value]="obrigacoes"
        [paginator]="true"
        [rows]="50"
        [totalRecords]="totalRecords"
        [loading]="loading"
        [lazy]="true"
        [virtualScroll]="true"
        [scrollHeight]="'600px'"
        (onLazyLoad)="onPageChange($event)"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Status</th>
            <th>Responsável</th>
            <th>Prazo</th>
            <th>Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-obrigacao>
          <tr>
            <td>{{ obrigacao.obrigacaoId }}</td>
            <td>{{ obrigacao.titulo }}</td>
            <td>
              <p-tag [value]="obrigacao.status" [severity]="getStatusSeverity(obrigacao.status)"></p-tag>
            </td>
            <td>{{ obrigacao.responsavelNome }}</td>
            <td>{{ obrigacao.prazoExecucao | date:'dd/MM/yyyy' }}</td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-eye"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  aria-label="Visualizar obrigação"
                  (onClick)="visualizar(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canSubmit(obrigacao)"
                  icon="pi pi-send"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  aria-label="Submeter obrigação"
                  (onClick)="submeter(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canApprove(obrigacao)"
                  icon="pi pi-check"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  aria-label="Aprovar obrigação"
                  (onClick)="aprovar(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canApprove(obrigacao)"
                  icon="pi pi-times"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  aria-label="Rejeitar obrigação"
                  (onClick)="rejeitar(obrigacao)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Advanced Filters Sidebar -->
    <app-advanced-filter
      [(visible)]="showFilters"
      [filterConfigs]="filterConfigs"
      [entityType]="'obrigacoes'"
      [filters]="filters"
      (onApply)="applyFilters($event)"
      (onClear)="clearAllFilters()"
    ></app-advanced-filter>
  `
})
export class ObrigacaoListComponent implements OnInit {
  private obrigacaoService = inject(ObrigacaoService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private filterService = inject(FilterService);

  obrigacoes: ObrigacaoResponse[] = [];
  totalRecords = 0;
  loading = false;
  selectedStatus?: StatusObrigacao;
  showFilters = false;

  // Filtros avançados
  filters: any = {
    status: null,
    responsavel: null,
    prazoInicio: null,
    prazoFim: null,
    criadoInicio: null,
    criadoFim: null
  };

  filterConfigs: FilterConfig[] = [
    {
      type: 'dropdown',
      key: 'status',
      label: 'Status',
      placeholder: 'Selecione o status',
      options: [
        { label: 'Pendente', value: 'PENDENTE' },
        { label: 'Submetida', value: 'SUBMETIDA' },
        { label: 'Aprovada', value: 'APROVADA' },
        { label: 'Rejeitada', value: 'REJEITADA' }
      ]
    },
    {
      type: 'text',
      key: 'responsavel',
      label: 'Responsável',
      placeholder: 'Nome do responsável'
    },
    {
      type: 'date',
      key: 'prazoInicio',
      label: 'Prazo - Data Início',
      placeholder: 'Selecione a data'
    },
    {
      type: 'date',
      key: 'prazoFim',
      label: 'Prazo - Data Fim',
      placeholder: 'Selecione a data'
    },
    {
      type: 'dateRange',
      key: 'criadoRange',
      label: 'Período de Criação',
      placeholder: 'Selecione o período'
    }
  ];

  exportColumns: ColumnConfig[] = [
    { field: 'obrigacaoId', header: 'ID', width: 10 },
    { field: 'titulo', header: 'Título', width: 40 },
    { field: 'status', header: 'Status', width: 15 },
    { field: 'responsavelNome', header: 'Responsável', width: 30 },
    {
      field: 'prazoExecucao',
      header: 'Prazo',
      width: 20,
      format: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : ''
    }
  ];

  statusOptions = [
    { label: 'Pendente', value: StatusObrigacao.PENDENTE },
    { label: 'Submetida', value: StatusObrigacao.SUBMETIDA },
    { label: 'Aprovada', value: StatusObrigacao.APROVADA },
    { label: 'Rejeitada', value: StatusObrigacao.REJEITADA }
  ];

  get activeFiltersCount(): number {
    return this.filterService.countActiveFilters(this.filters);
  }

  get canCreate(): boolean {
    return this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  ngOnInit(): void {
    this.loadObrigacoes();
  }

  loadObrigacoes(page: number = 0): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.obrigacaoService.listar(
      this.selectedStatus ? { status: this.selectedStatus } : undefined,
      page,
      50
    ).subscribe({
      next: (response) => {
        this.obrigacoes = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações'
        });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadAtrasadas(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.obrigacaoService.buscarAtrasadas().subscribe({
      next: (obrigacoes) => {
        this.obrigacoes = obrigacoes;
        this.totalRecords = obrigacoes.length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações atrasadas'
        });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: any): void {
    this.loadObrigacoes(event.first / event.rows);
  }

  visualizar(obrigacao: ObrigacaoResponse): void {
    this.router.navigate(['/obrigacoes', obrigacao.obrigacaoId]);
  }

  submeter(obrigacao: ObrigacaoResponse): void {
    this.confirmationService.confirm({
      message: 'Deseja submeter esta obrigação para aprovação?',
      accept: () => {
        this.obrigacaoService.submeter(obrigacao.obrigacaoId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Obrigação submetida para aprovação'
            });
            this.loadObrigacoes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao submeter obrigação'
            });
          }
        });
      }
    });
  }

  aprovar(obrigacao: ObrigacaoResponse): void {
    const motivo = prompt('Motivo da aprovação (opcional):');
    this.obrigacaoService.aprovar(obrigacao.obrigacaoId, { motivoAprovacao: motivo || undefined }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação aprovada'
        });
        this.loadObrigacoes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao aprovar obrigação'
        });
      }
    });
  }

  rejeitar(obrigacao: ObrigacaoResponse): void {
    const motivo = prompt('Motivo da rejeição (obrigatório):');
    if (!motivo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Motivo da rejeição é obrigatório'
      });
      return;
    }

    this.obrigacaoService.rejeitar(obrigacao.obrigacaoId, { motivoRejeicao: motivo }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação rejeitada'
        });
        this.loadObrigacoes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao rejeitar obrigação'
        });
      }
    });
  }

  novaObrigacao(): void {
    this.router.navigate(['/obrigacoes/nova']);
  }

  canSubmit(obrigacao: ObrigacaoResponse): boolean {
    return obrigacao.status === StatusObrigacao.PENDENTE;
  }

  canApprove(obrigacao: ObrigacaoResponse): boolean {
    return obrigacao.status === StatusObrigacao.SUBMETIDA &&
      this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  getStatusSeverity(status: StatusObrigacao): string {
    const severityMap: Record<StatusObrigacao, string> = {
      [StatusObrigacao.PENDENTE]: 'warning',
      [StatusObrigacao.SUBMETIDA]: 'info',
      [StatusObrigacao.APROVADA]: 'success',
      [StatusObrigacao.REJEITADA]: 'danger'
    };
    return severityMap[status];
  }

  trackByObrigacaoId(index: number, item: ObrigacaoResponse): number {
    return item.obrigacaoId;
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.loadObrigacoes();
    this.cdr.markForCheck();
  }

  removeFilter(filterKey: string): void {
    if (filterKey === 'prazo') {
      this.filters.prazoInicio = null;
      this.filters.prazoFim = null;
    } else {
      this.filters[filterKey] = null;
    }
    this.loadObrigacoes();
    this.cdr.markForCheck();
  }

  clearAllFilters(): void {
    this.filters = this.filterService.clearFilters(this.filters);
    this.selectedStatus = undefined;
    this.loadObrigacoes();
    this.cdr.markForCheck();
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option?.label || status;
  }

  formatDateRange(inicio: Date | null, fim: Date | null): string {
    if (!inicio && !fim) return '';
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');
    if (inicio && fim) return `${formatDate(inicio)} - ${formatDate(fim)}`;
    if (inicio) return `A partir de ${formatDate(inicio)}`;
    if (fim) return `Até ${formatDate(fim)}`;
    return '';
  }
}
