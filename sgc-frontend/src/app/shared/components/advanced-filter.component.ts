import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FilterService, SavedFilter } from '../../services/filter.service';

export interface FilterConfig {
  type: 'text' | 'date' | 'dateRange' | 'multiSelect' | 'dropdown';
  key: string;
  label: string;
  options?: { label: string; value: any }[];
  placeholder?: string;
}

@Component({
  selector: 'app-advanced-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    MultiSelectModule,
    DropdownModule,
    ChipModule,
    DividerModule,
    MessageModule,
    InputTextareaModule
  ],
  template: `
    <p-sidebar
      [(visible)]="visible"
      position="right"
      [style]="{ width: '450px' }"
      (onHide)="onHide.emit()">
      <ng-template pTemplate="header">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-filter" style="font-size: 1.5rem"></i>
          <span class="font-bold">Filtros Avançados</span>
        </div>
      </ng-template>

      <div class="filter-content">
        <!-- Filtros Dinâmicos -->
        <div class="filter-section">
          <div *ngFor="let config of filterConfigs" class="field">
            <label [for]="config.key">{{ config.label }}</label>

            <!-- Text Input -->
            <input
              *ngIf="config.type === 'text'"
              pInputText
              [id]="config.key"
              [(ngModel)]="filters[config.key]"
              [placeholder]="config.placeholder || ''"
              class="w-full" />

            <!-- Date Picker -->
            <p-calendar
              *ngIf="config.type === 'date'"
              [id]="config.key"
              [(ngModel)]="filters[config.key]"
              [placeholder]="config.placeholder || 'Selecione uma data'"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              class="w-full">
            </p-calendar>

            <!-- Date Range Picker -->
            <p-calendar
              *ngIf="config.type === 'dateRange'"
              [id]="config.key"
              [(ngModel)]="filters[config.key]"
              selectionMode="range"
              [placeholder]="config.placeholder || 'Selecione o período'"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              class="w-full">
            </p-calendar>

            <!-- MultiSelect -->
            <p-multiSelect
              *ngIf="config.type === 'multiSelect'"
              [id]="config.key"
              [(ngModel)]="filters[config.key]"
              [options]="config.options || []"
              [placeholder]="config.placeholder || 'Selecione'"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full">
            </p-multiSelect>

            <!-- Dropdown -->
            <p-dropdown
              *ngIf="config.type === 'dropdown'"
              [id]="config.key"
              [(ngModel)]="filters[config.key]"
              [options]="config.options || []"
              [placeholder]="config.placeholder || 'Selecione'"
              optionLabel="label"
              optionValue="value"
              [showClear]="true"
              class="w-full">
            </p-dropdown>
          </div>
        </div>

        <p-divider></p-divider>

        <!-- Filtros Salvos -->
        <div class="saved-filters-section">
          <div class="flex align-items-center justify-content-between mb-3">
            <h4 class="m-0">Filtros Salvos</h4>
            <button
              pButton
              type="button"
              icon="pi pi-save"
              label="Salvar Filtro"
              class="p-button-sm p-button-outlined"
              [disabled]="!hasActiveFilters()"
              (click)="showSaveDialog = true">
            </button>
          </div>

          <!-- Lista de filtros salvos -->
          <div *ngIf="savedFilters.length === 0" class="text-center p-3">
            <i class="pi pi-inbox" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
            <p class="text-sm text-color-secondary">Nenhum filtro salvo ainda</p>
          </div>

          <div *ngIf="savedFilters.length > 0" class="saved-filters-list">
            <div
              *ngFor="let saved of savedFilters"
              class="saved-filter-item"
              (click)="loadSavedFilter(saved)">
              <div class="saved-filter-info">
                <i class="pi pi-bookmark"></i>
                <div>
                  <div class="font-semibold">{{ saved.name }}</div>
                  <div class="text-sm text-color-secondary">
                    {{ formatDate(saved.createdAt) }}
                  </div>
                </div>
              </div>
              <button
                pButton
                type="button"
                icon="pi pi-trash"
                class="p-button-text p-button-sm p-button-danger"
                (click)="deleteSavedFilter($event, saved.id)">
              </button>
            </div>
          </div>
        </div>

        <!-- Dialog para salvar filtro -->
        <div *ngIf="showSaveDialog" class="save-filter-dialog">
          <div class="dialog-overlay" (click)="showSaveDialog = false"></div>
          <div class="dialog-content">
            <h3>Salvar Filtro</h3>
            <div class="field">
              <label for="filterName">Nome do filtro</label>
              <input
                pInputText
                id="filterName"
                [(ngModel)]="saveFilterName"
                placeholder="Digite um nome para o filtro"
                class="w-full"
                (keyup.enter)="saveCurrentFilter()" />
            </div>
            <div class="flex gap-2 justify-content-end">
              <button
                pButton
                type="button"
                label="Cancelar"
                class="p-button-text"
                (click)="showSaveDialog = false">
              </button>
              <button
                pButton
                type="button"
                label="Salvar"
                icon="pi pi-save"
                [disabled]="!saveFilterName.trim()"
                (click)="saveCurrentFilter()">
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-content-between">
          <button
            pButton
            type="button"
            label="Limpar"
            icon="pi pi-times"
            class="p-button-outlined"
            [disabled]="!hasActiveFilters()"
            (click)="clearFilters()">
          </button>
          <div class="flex gap-2">
            <button
              pButton
              type="button"
              label="Cancelar"
              class="p-button-text"
              (click)="visible = false">
            </button>
            <button
              pButton
              type="button"
              label="Aplicar"
              icon="pi pi-check"
              (click)="applyFilters()">
            </button>
          </div>
        </div>
      </ng-template>
    </p-sidebar>
  `,
  styles: [`
    .filter-content {
      padding: 1rem 0;
    }

    .filter-section {
      margin-bottom: 1rem;
    }

    .field {
      margin-bottom: 1.5rem;
    }

    .field label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .saved-filters-section h4 {
      font-size: 1rem;
      color: var(--text-color);
    }

    .saved-filters-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .saved-filter-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .saved-filter-item:hover {
      background: var(--surface-50);
      border-color: var(--primary-color);
    }

    .saved-filter-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .saved-filter-info i {
      font-size: 1.25rem;
      color: var(--primary-color);
    }

    .save-filter-dialog {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
    }

    .dialog-content {
      position: relative;
      background: var(--surface-card);
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      min-width: 400px;
      max-width: 90vw;
    }

    .dialog-content h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: var(--text-color);
    }

    :host ::ng-deep .p-sidebar-header {
      background: var(--primary-color);
      color: white;
    }

    :host ::ng-deep .p-sidebar-header .pi {
      color: white;
    }
  `]
})
export class AdvancedFilterComponent implements OnInit {
  @Input() visible = false;
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() entityType = '';
  @Input() filters: any = {};

  @Output() onApply = new EventEmitter<any>();
  @Output() onClear = new EventEmitter<void>();
  @Output() onHide = new EventEmitter<void>();

  savedFilters: SavedFilter[] = [];
  showSaveDialog = false;
  saveFilterName = '';

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    this.loadSavedFilters();
  }

  applyFilters(): void {
    this.onApply.emit(this.filters);
    this.visible = false;
  }

  clearFilters(): void {
    this.filters = this.filterService.clearFilters(this.filters);
    this.onClear.emit();
  }

  hasActiveFilters(): boolean {
    return this.filterService.hasActiveFilters(this.filters);
  }

  loadSavedFilters(): void {
    this.savedFilters = this.filterService.loadFilters(this.entityType);
  }

  loadSavedFilter(saved: SavedFilter): void {
    this.filters = { ...saved.filters };
    this.applyFilters();
  }

  saveCurrentFilter(): void {
    if (!this.saveFilterName.trim()) return;

    this.filterService.saveFilter(
      this.saveFilterName,
      this.entityType,
      this.filters
    );

    this.saveFilterName = '';
    this.showSaveDialog = false;
    this.loadSavedFilters();
  }

  deleteSavedFilter(event: Event, id: string): void {
    event.stopPropagation();
    this.filterService.deleteFilter(id);
    this.loadSavedFilters();
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
