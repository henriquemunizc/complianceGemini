import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ObrigacaoService } from '../services/obrigacao.service';
import { AuthService } from '../services/auth.service';
import { ObrigacaoResponse, StatusObrigacao } from '../models/obrigacao.model';
import { PerfilUsuario } from '../models/auth.model';

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
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Obrigações de Compliance</h2>
        <p-button
          *ngIf="canCreate"
          label="Nova Obrigação"
          icon="pi pi-plus"
          (onClick)="novaObrigacao()"
        ></p-button>
      </div>

      <div class="mb-3 flex gap-2">
        <p-dropdown
          [options]="statusOptions"
          [(ngModel)]="selectedStatus"
          placeholder="Filtrar por status"
          [showClear]="true"
          (onChange)="loadObrigacoes()"
        ></p-dropdown>

        <p-button
          label="Atrasadas"
          icon="pi pi-exclamation-triangle"
          severity="warning"
          (onClick)="loadAtrasadas()"
        ></p-button>
      </div>

      <p-table
        [value]="obrigacoes"
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
                  (onClick)="visualizar(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canSubmit(obrigacao)"
                  icon="pi pi-send"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  (onClick)="submeter(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canApprove(obrigacao)"
                  icon="pi pi-check"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="success"
                  (onClick)="aprovar(obrigacao)"
                ></p-button>

                <p-button
                  *ngIf="canApprove(obrigacao)"
                  icon="pi pi-times"
                  size="small"
                  [rounded]="true"
                  [text]="true"
                  severity="danger"
                  (onClick)="rejeitar(obrigacao)"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class ObrigacaoListComponent implements OnInit {
  private obrigacaoService = inject(ObrigacaoService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  obrigacoes: ObrigacaoResponse[] = [];
  totalRecords = 0;
  loading = false;
  selectedStatus?: StatusObrigacao;

  statusOptions = [
    { label: 'Pendente', value: StatusObrigacao.PENDENTE },
    { label: 'Submetida', value: StatusObrigacao.SUBMETIDA },
    { label: 'Aprovada', value: StatusObrigacao.APROVADA },
    { label: 'Rejeitada', value: StatusObrigacao.REJEITADA }
  ];

  get canCreate(): boolean {
    return this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  ngOnInit(): void {
    this.loadObrigacoes();
  }

  loadObrigacoes(page: number = 0): void {
    this.loading = true;
    this.obrigacaoService.listar(
      this.selectedStatus ? { status: this.selectedStatus } : undefined,
      page,
      20
    ).subscribe({
      next: (response) => {
        this.obrigacoes = response.content;
        this.totalRecords = response.totalElements;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações'
        });
        this.loading = false;
      }
    });
  }

  loadAtrasadas(): void {
    this.loading = true;
    this.obrigacaoService.buscarAtrasadas().subscribe({
      next: (obrigacoes) => {
        this.obrigacoes = obrigacoes;
        this.totalRecords = obrigacoes.length;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigações atrasadas'
        });
        this.loading = false;
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
}
