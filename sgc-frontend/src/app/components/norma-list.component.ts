import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { ChipModule } from 'primeng/chip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { NormaService } from '../services/norma.service';
import { AuthService } from '../services/auth.service';
import { NormaResponse } from '../models/norma.model';
import { PerfilUsuario } from '../models/auth.model';
import { AdvancedFilterComponent, FilterConfig } from '../shared/components/advanced-filter.component';
import { ExportButtonComponent } from '../shared/components/export-button.component';
import { FilterService } from '../services/filter.service';
import { ColumnConfig } from '../services/export.service';

@Component({
  selector: 'app-norma-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
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
        <h2>Normas Jurídicas</h2>
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
            [data]="normas"
            [filename]="'normas'"
            [title]="'Normas Jurídicas'"
            [columns]="exportColumns"
          ></app-export-button>
          <p-button
            *ngIf="canCreate"
            label="Nova Norma"
            icon="pi pi-plus"
            (onClick)="novaNorma()"
          ></p-button>
        </div>
      </div>

      <!-- Filtros Ativos -->
      <div *ngIf="activeFiltersCount > 0" class="mb-3">
        <div class="flex align-items-center gap-2 flex-wrap">
          <span class="text-sm font-semibold">Filtros ativos:</span>
          <p-chip
            *ngIf="filters.tipo"
            [label]="'Tipo: ' + filters.tipo"
            [removable]="true"
            (onRemove)="removeFilter('tipo')"
          ></p-chip>
          <p-chip
            *ngIf="filters.ano"
            [label]="'Ano: ' + filters.ano"
            [removable]="true"
            (onRemove)="removeFilter('ano')"
          ></p-chip>
          <p-chip
            *ngIf="filters.vigente !== null"
            [label]="'Status: ' + (filters.vigente ? 'Vigente' : 'Revogada')"
            [removable]="true"
            (onRemove)="removeFilter('vigente')"
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
          Exibindo {{ normas.length }} de {{ totalRecords }} normas
        </p>
      </div>

      <p-table
        [value]="normas"
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
            <th style="width: 80px">ID</th>
            <th style="width: 150px">Tipo</th>
            <th style="width: 120px">Número</th>
            <th style="width: 100px">Ano</th>
            <th>Ementa</th>
            <th style="width: 150px">Data Publicação</th>
            <th style="width: 120px">Status</th>
            <th style="width: 150px">Ações</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-norma>
          <tr>
            <td>{{ norma.normaId }}</td>
            <td>{{ norma.tipo }}</td>
            <td>{{ norma.numero }}</td>
            <td>{{ norma.ano }}</td>
            <td>{{ truncateText(norma.ementa, 80) }}</td>
            <td>{{ norma.dataPublicacao | date:'dd/MM/yyyy' }}</td>
            <td>
              <p-tag
                [value]="norma.dataRevogacao ? 'Revogada' : 'Vigente'"
                [severity]="norma.dataRevogacao ? 'danger' : 'success'"
              ></p-tag>
            </td>
            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-eye"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  pTooltip="Visualizar"
                  aria-label="Visualizar norma"
                  (onClick)="visualizar(norma)"
                ></p-button>

                <p-button
                  *ngIf="canEdit"
                  icon="pi pi-pencil"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="warning"
                  pTooltip="Editar"
                  aria-label="Editar norma"
                  (onClick)="editar(norma)"
                ></p-button>

                <p-button
                  *ngIf="canDelete"
                  icon="pi pi-trash"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  pTooltip="Excluir"
                  aria-label="Excluir norma"
                  (onClick)="excluir(norma)"
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
      [entityType]="'normas'"
      [filters]="filters"
      (onApply)="applyFilters($event)"
      (onClear)="clearAllFilters()"
    ></app-advanced-filter>
  `
})
export class NormaListComponent implements OnInit {
  private normaService = inject(NormaService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private filterService = inject(FilterService);

  normas: NormaResponse[] = [];
  totalRecords = 0;
  loading = false;
  showFilters = false;

  filtroTipo?: string;
  filtroAno?: number;
  filtroVigente?: boolean;

  // Filtros avançados
  filters: any = {
    tipo: null,
    ano: null,
    vigente: null,
    anoInicio: null,
    anoFim: null
  };

  filterConfigs: FilterConfig[] = [
    {
      type: 'dropdown',
      key: 'tipo',
      label: 'Tipo de Norma',
      placeholder: 'Selecione o tipo',
      options: [
        { label: 'Lei', value: 'Lei' },
        { label: 'Decreto', value: 'Decreto' },
        { label: 'Portaria', value: 'Portaria' },
        { label: 'Resolução', value: 'Resolução' },
        { label: 'Instrução Normativa', value: 'Instrução Normativa' },
        { label: 'Medida Provisória', value: 'Medida Provisória' }
      ]
    },
    {
      type: 'dropdown',
      key: 'vigente',
      label: 'Status',
      placeholder: 'Selecione o status',
      options: [
        { label: 'Vigente', value: true },
        { label: 'Revogada', value: false }
      ]
    },
    {
      type: 'text',
      key: 'ano',
      label: 'Ano',
      placeholder: 'Digite o ano (ex: 2024)'
    },
    {
      type: 'text',
      key: 'anoInicio',
      label: 'Ano Início',
      placeholder: 'Ano inicial do período'
    },
    {
      type: 'text',
      key: 'anoFim',
      label: 'Ano Fim',
      placeholder: 'Ano final do período'
    }
  ];

  exportColumns: ColumnConfig[] = [
    { field: 'normaId', header: 'ID', width: 10 },
    { field: 'tipo', header: 'Tipo', width: 20 },
    { field: 'numero', header: 'Número', width: 15 },
    { field: 'ano', header: 'Ano', width: 10 },
    { field: 'ementa', header: 'Ementa', width: 50 },
    {
      field: 'dataPublicacao',
      header: 'Data Publicação',
      width: 20,
      format: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : ''
    },
    {
      field: 'dataRevogacao',
      header: 'Status',
      width: 15,
      format: (value) => value ? 'Revogada' : 'Vigente'
    }
  ];

  tipoOptions = [
    { label: 'Lei', value: 'Lei' },
    { label: 'Decreto', value: 'Decreto' },
    { label: 'Portaria', value: 'Portaria' },
    { label: 'Resolução', value: 'Resolução' },
    { label: 'Instrução Normativa', value: 'Instrução Normativa' },
    { label: 'Medida Provisória', value: 'Medida Provisória' }
  ];

  vigenteOptions = [
    { label: 'Vigente', value: true },
    { label: 'Revogada', value: false }
  ];

  get activeFiltersCount(): number {
    return this.filterService.countActiveFilters(this.filters);
  }

  get canCreate(): boolean {
    return this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  get canEdit(): boolean {
    return this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  get canDelete(): boolean {
    return this.authService.hasRole(PerfilUsuario.ROLE_ADMIN);
  }

  ngOnInit(): void {
    this.loadNormas();
  }

  loadNormas(page: number = 0): void {
    this.loading = true;
    this.cdr.markForCheck();

    const filters: any = {};
    if (this.filtroTipo) filters.tipo = this.filtroTipo;
    if (this.filtroAno) filters.ano = this.filtroAno;
    if (this.filtroVigente !== undefined) filters.vigente = this.filtroVigente;

    this.normaService.listar(
      Object.keys(filters).length > 0 ? filters : undefined,
      page,
      50
    ).subscribe({
      next: (response) => {
        this.normas = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar normas'
        });
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: any): void {
    this.loadNormas(event.first / event.rows);
  }

  visualizar(norma: NormaResponse): void {
    this.router.navigate(['/normas', norma.normaId]);
  }

  editar(norma: NormaResponse): void {
    this.router.navigate(['/normas', norma.normaId, 'editar']);
  }

  excluir(norma: NormaResponse): void {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir a norma ${norma.tipo} ${norma.numero}/${norma.ano}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.normaService.excluir(norma.normaId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Norma excluída com sucesso'
            });
            this.loadNormas();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir norma'
            });
          }
        });
      }
    });
  }

  novaNorma(): void {
    this.router.navigate(['/normas/nova']);
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  trackByNormaId(index: number, item: NormaResponse): number {
    return item.normaId;
  }

  applyFilters(filters: any): void {
    this.filters = filters;
    this.filtroTipo = filters.tipo;
    this.filtroAno = filters.ano ? parseInt(filters.ano) : undefined;
    this.filtroVigente = filters.vigente;
    this.loadNormas();
    this.cdr.markForCheck();
  }

  removeFilter(filterKey: string): void {
    this.filters[filterKey] = null;
    if (filterKey === 'tipo') this.filtroTipo = undefined;
    if (filterKey === 'ano') this.filtroAno = undefined;
    if (filterKey === 'vigente') this.filtroVigente = undefined;
    this.loadNormas();
    this.cdr.markForCheck();
  }

  clearAllFilters(): void {
    this.filters = this.filterService.clearFilters(this.filters);
    this.filtroTipo = undefined;
    this.filtroAno = undefined;
    this.filtroVigente = undefined;
    this.loadNormas();
    this.cdr.markForCheck();
  }
}
