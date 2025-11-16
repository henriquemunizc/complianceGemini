import { Component, OnInit, inject } from '@angular/core';
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
import { MessageService, ConfirmationService } from 'primeng/api';
import { NormaService } from '../services/norma.service';
import { AuthService } from '../services/auth.service';
import { NormaResponse } from '../models/norma.model';
import { PerfilUsuario } from '../models/auth.model';

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
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Normas Jurídicas</h2>
        <p-button
          *ngIf="canCreate"
          label="Nova Norma"
          icon="pi pi-plus"
          (onClick)="novaNorma()"
        ></p-button>
      </div>

      <div class="mb-3 flex gap-2">
        <p-dropdown
          [options]="tipoOptions"
          [(ngModel)]="filtroTipo"
          placeholder="Filtrar por tipo"
          [showClear]="true"
          (onChange)="loadNormas()"
        ></p-dropdown>

        <p-inputNumber
          [(ngModel)]="filtroAno"
          placeholder="Ano"
          [useGrouping]="false"
          [showButtons]="false"
          (onInput)="loadNormas()"
        ></p-inputNumber>

        <p-dropdown
          [options]="vigenteOptions"
          [(ngModel)]="filtroVigente"
          placeholder="Status"
          [showClear]="true"
          (onChange)="loadNormas()"
        ></p-dropdown>
      </div>

      <p-table
        [value]="normas"
        [paginator]="true"
        [rows]="20"
        [totalRecords]="totalRecords"
        [loading]="loading"
        [lazy]="true"
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
                  (onClick)="excluir(norma)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class NormaListComponent implements OnInit {
  private normaService = inject(NormaService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  normas: NormaResponse[] = [];
  totalRecords = 0;
  loading = false;

  filtroTipo?: string;
  filtroAno?: number;
  filtroVigente?: boolean;

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

    const filters: any = {};
    if (this.filtroTipo) filters.tipo = this.filtroTipo;
    if (this.filtroAno) filters.ano = this.filtroAno;
    if (this.filtroVigente !== undefined) filters.vigente = this.filtroVigente;

    this.normaService.listar(
      Object.keys(filters).length > 0 ? filters : undefined,
      page,
      20
    ).subscribe({
      next: (response) => {
        this.normas = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar normas'
        });
        this.loading = false;
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
}
