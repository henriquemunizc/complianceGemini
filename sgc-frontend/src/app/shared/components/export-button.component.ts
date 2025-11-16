import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { ExportService, ColumnConfig } from '../../services/export.service';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule
  ],
  template: `
    <div class="export-button-wrapper">
      <button
        pButton
        type="button"
        icon="pi pi-download"
        [label]="label"
        class="p-button-outlined"
        (click)="menu.toggle($event)"
        [disabled]="!data || data.length === 0">
      </button>
      <p-menu #menu [model]="exportMenuItems" [popup]="true"></p-menu>
    </div>
  `,
  styles: [`
    .export-button-wrapper {
      display: inline-block;
    }
  `]
})
export class ExportButtonComponent {
  @Input() data: any[] = [];
  @Input() filename = 'exportacao';
  @Input() title = 'Exportação de Dados';
  @Input() columns?: ColumnConfig[];
  @Input() label = 'Exportar';
  @Input() icon = 'pi-download';

  exportMenuItems: MenuItem[] = [];

  constructor(
    private exportService: ExportService,
    private messageService: MessageService
  ) {
    this.initializeMenuItems();
  }

  private initializeMenuItems(): void {
    this.exportMenuItems = [
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.exportExcel()
      },
      {
        label: 'CSV',
        icon: 'pi pi-file',
        command: () => this.exportCsv()
      },
      {
        label: 'PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.exportPdf()
      }
    ];
  }

  exportExcel(): void {
    try {
      if (!this.data || this.data.length === 0) {
        this.showError('Nenhum dado disponível para exportação');
        return;
      }

      this.exportService.exportToExcel(this.data, this.filename, this.columns);
      this.showSuccess('Dados exportados para Excel com sucesso!');
    } catch (error) {
      this.showError('Erro ao exportar para Excel');
      console.error(error);
    }
  }

  exportCsv(): void {
    try {
      if (!this.data || this.data.length === 0) {
        this.showError('Nenhum dado disponível para exportação');
        return;
      }

      this.exportService.exportToCsv(this.data, this.filename, this.columns);
      this.showSuccess('Dados exportados para CSV com sucesso!');
    } catch (error) {
      this.showError('Erro ao exportar para CSV');
      console.error(error);
    }
  }

  exportPdf(): void {
    try {
      if (!this.data || this.data.length === 0) {
        this.showError('Nenhum dado disponível para exportação');
        return;
      }

      if (!this.columns || this.columns.length === 0) {
        this.showError('Configuração de colunas necessária para exportar PDF');
        return;
      }

      this.exportService.exportToPdf(this.data, this.title, this.columns, this.filename);
      this.showSuccess('Dados exportados para PDF com sucesso!');
    } catch (error) {
      this.showError('Erro ao exportar para PDF');
      console.error(error);
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
      life: 3000
    });
  }
}
