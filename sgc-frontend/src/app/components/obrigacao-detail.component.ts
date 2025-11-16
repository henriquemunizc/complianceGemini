import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ObrigacaoService } from '../services/obrigacao.service';
import { EvidenciaService } from '../services/evidencia.service';
import { AuthService } from '../services/auth.service';
import { ObrigacaoResponse, StatusObrigacao } from '../models/obrigacao.model';
import { EvidenciaResponse, TipoEvidencia } from '../models/evidencia.model';
import { PerfilUsuario } from '../models/auth.model';
import { ObrigacaoTimelineComponent } from './obrigacao-timeline.component';
import { EvidenciaUploadComponent } from './evidencia-upload.component';

@Component({
  selector: 'app-obrigacao-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    TabViewModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ObrigacaoTimelineComponent,
    EvidenciaUploadComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="card" *ngIf="obrigacao">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>{{ obrigacao.titulo }}</h2>
        <div class="flex gap-2">
          <p-button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            (onClick)="voltar()"
          ></p-button>

          <p-button
            *ngIf="canSubmit"
            label="Submeter"
            icon="pi pi-send"
            severity="success"
            (onClick)="submeter()"
          ></p-button>

          <p-button
            *ngIf="canApprove"
            label="Aprovar"
            icon="pi pi-check"
            severity="success"
            (onClick)="aprovar()"
          ></p-button>

          <p-button
            *ngIf="canApprove"
            label="Rejeitar"
            icon="pi pi-times"
            severity="danger"
            (onClick)="rejeitar()"
          ></p-button>
        </div>
      </div>

      <p-tabView>
        <!-- Aba Detalhes -->
        <p-tabViewPanel header="Detalhes" leftIcon="pi pi-info-circle">
          <div class="grid">
            <div class="col-12 mb-3">
              <p-tag
                [value]="obrigacao.status"
                [severity]="getStatusSeverity(obrigacao.status)"
                styleClass="text-xl"
              ></p-tag>
            </div>

            <div class="col-12 md:col-6">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">ID</label>
                <div class="text-900">#{{ obrigacao.obrigacaoId }}</div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Prazo de Execução</label>
                <div class="text-900">
                  <i class="pi pi-calendar mr-2"></i>
                  {{ obrigacao.prazoExecucao | date:'dd/MM/yyyy' }}
                </div>
              </div>
            </div>

            <div class="col-12" *ngIf="obrigacao.descricao">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Descrição</label>
                <div class="text-900 line-height-3">{{ obrigacao.descricao }}</div>
              </div>
            </div>

            <div class="col-12 md:col-6">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Responsável</label>
                <div class="text-900">
                  <i class="pi pi-user mr-2"></i>
                  {{ obrigacao.responsavelNome }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6" *ngIf="obrigacao.aprovadorNome">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Aprovador</label>
                <div class="text-900">
                  <i class="pi pi-user mr-2"></i>
                  {{ obrigacao.aprovadorNome }}
                </div>
              </div>
            </div>

            <div class="col-12 md:col-6" *ngIf="obrigacao.dataSubmissao">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Data de Submissão</label>
                <div class="text-900">{{ obrigacao.dataSubmissao | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>

            <div class="col-12 md:col-6" *ngIf="obrigacao.dataAprovacao">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Data de Aprovação</label>
                <div class="text-900">{{ obrigacao.dataAprovacao | date:'dd/MM/yyyy HH:mm' }}</div>
              </div>
            </div>

            <div class="col-12" *ngIf="obrigacao.motivoAprovacao">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Motivo da Aprovação</label>
                <div class="text-900">{{ obrigacao.motivoAprovacao }}</div>
              </div>
            </div>

            <div class="col-12" *ngIf="obrigacao.motivoRejeicao">
              <div class="mb-3">
                <label class="block text-600 font-semibold mb-2">Motivo da Rejeição</label>
                <div class="text-900 text-red-600">{{ obrigacao.motivoRejeicao }}</div>
              </div>
            </div>
          </div>
        </p-tabViewPanel>

        <!-- Aba Evidências -->
        <p-tabViewPanel header="Evidências" leftIcon="pi pi-file">
          <div class="flex justify-content-end mb-3">
            <p-button
              label="Adicionar Evidência"
              icon="pi pi-plus"
              (onClick)="mostrarDialogEvidencia = true"
            ></p-button>
          </div>

          <p-table
            [value]="evidencias"
            [loading]="loadingEvidencias"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Arquivo/Link</th>
                <th>Data Submissão</th>
                <th style="width: 100px">Ações</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-evidencia>
              <tr>
                <td>
                  <p-tag [value]="evidencia.tipo" [severity]="getTipoEvidenciaSeverity(evidencia.tipo)"></p-tag>
                </td>
                <td>{{ evidencia.descricao || '-' }}</td>
                <td>
                  <span *ngIf="evidencia.tipo === 'ARQUIVO'">{{ evidencia.nomeArquivoOriginal }}</span>
                  <a *ngIf="evidencia.tipo === 'LINK'" [href]="evidencia.urlExterna" target="_blank" class="text-primary">
                    {{ evidencia.urlExterna }}
                  </a>
                  <span *ngIf="evidencia.tipo === 'TEXTO'">{{ truncateText(evidencia.conteudoTexto, 50) }}</span>
                </td>
                <td>{{ evidencia.dataSubmissao | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <div class="flex gap-2">
                    <p-button
                      *ngIf="evidencia.tipo === 'ARQUIVO'"
                      icon="pi pi-download"
                      size="small"
                      [rounded]="true"
                      [text]="true"
                      pTooltip="Download"
                      (onClick)="downloadEvidencia(evidencia)"
                    ></p-button>

                    <p-button
                      icon="pi pi-trash"
                      size="small"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      pTooltip="Excluir"
                      (onClick)="excluirEvidencia(evidencia)"
                    ></p-button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center">Nenhuma evidência encontrada</td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabViewPanel>

        <!-- Aba Histórico -->
        <p-tabViewPanel header="Histórico" leftIcon="pi pi-history">
          <app-obrigacao-timeline [obrigacaoId]="obrigacao.obrigacaoId"></app-obrigacao-timeline>
        </p-tabViewPanel>
      </p-tabView>
    </div>

    <!-- Componente de Upload de Evidência -->
    <app-evidencia-upload
      *ngIf="obrigacao"
      [obrigacaoId]="obrigacao.obrigacaoId"
      [(visible)]="mostrarDialogEvidencia"
      (onUploadSuccess)="recarregarEvidencias()"
    ></app-evidencia-upload>

    <!-- Loading State -->
    <div class="card" *ngIf="loading">
      <div class="flex justify-content-center align-items-center" style="min-height: 400px;">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
      </div>
    </div>
  `
})
export class ObrigacaoDetailComponent implements OnInit {
  private obrigacaoService = inject(ObrigacaoService);
  private evidenciaService = inject(EvidenciaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  obrigacao?: ObrigacaoResponse;
  evidencias: EvidenciaResponse[] = [];
  loading = false;
  loadingEvidencias = false;
  mostrarDialogEvidencia = false;

  get canSubmit(): boolean {
    return this.obrigacao?.status === StatusObrigacao.PENDENTE;
  }

  get canApprove(): boolean {
    return this.obrigacao?.status === StatusObrigacao.SUBMETIDA &&
      this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadObrigacao(+id);
      this.loadEvidencias(+id);
    } else {
      this.voltar();
    }
  }

  loadObrigacao(id: number): void {
    this.loading = true;
    this.obrigacaoService.buscarPorId(id).subscribe({
      next: (obrigacao) => {
        this.obrigacao = obrigacao;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigação'
        });
        this.loading = false;
        this.voltar();
      }
    });
  }

  loadEvidencias(obrigacaoId: number): void {
    this.loadingEvidencias = true;
    this.evidenciaService.listarPorObrigacao(obrigacaoId).subscribe({
      next: (evidencias) => {
        this.evidencias = evidencias;
        this.loadingEvidencias = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar evidências'
        });
        this.loadingEvidencias = false;
      }
    });
  }

  submeter(): void {
    if (!this.obrigacao) return;

    this.confirmationService.confirm({
      message: 'Deseja submeter esta obrigação para aprovação?',
      header: 'Confirmar Submissão',
      icon: 'pi pi-send',
      accept: () => {
        this.obrigacaoService.submeter(this.obrigacao!.obrigacaoId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Obrigação submetida para aprovação'
            });
            this.loadObrigacao(this.obrigacao!.obrigacaoId);
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

  aprovar(): void {
    if (!this.obrigacao) return;

    const motivo = prompt('Motivo da aprovação (opcional):');
    this.obrigacaoService.aprovar(this.obrigacao.obrigacaoId, {
      motivoAprovacao: motivo || undefined
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação aprovada'
        });
        this.loadObrigacao(this.obrigacao!.obrigacaoId);
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

  rejeitar(): void {
    if (!this.obrigacao) return;

    const motivo = prompt('Motivo da rejeição (obrigatório):');
    if (!motivo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Motivo da rejeição é obrigatório'
      });
      return;
    }

    this.obrigacaoService.rejeitar(this.obrigacao.obrigacaoId, {
      motivoRejeicao: motivo
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Obrigação rejeitada'
        });
        this.loadObrigacao(this.obrigacao!.obrigacaoId);
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

  downloadEvidencia(evidencia: EvidenciaResponse): void {
    this.evidenciaService.downloadArquivo(evidencia.evidenciaId).subscribe({
      next: (blob) => {
        this.evidenciaService.salvarArquivo(blob, evidencia.nomeArquivoOriginal || 'arquivo');
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao fazer download da evidência'
        });
      }
    });
  }

  excluirEvidencia(evidencia: EvidenciaResponse): void {
    this.confirmationService.confirm({
      message: 'Deseja realmente excluir esta evidência?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.evidenciaService.excluir(evidencia.evidenciaId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Evidência excluída com sucesso'
            });
            if (this.obrigacao) {
              this.loadEvidencias(this.obrigacao.obrigacaoId);
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir evidência'
            });
          }
        });
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/obrigacoes']);
  }

  recarregarEvidencias(): void {
    if (this.obrigacao) {
      this.loadEvidencias(this.obrigacao.obrigacaoId);
    }
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

  getTipoEvidenciaSeverity(tipo: TipoEvidencia): string {
    const severityMap: Record<TipoEvidencia, string> = {
      [TipoEvidencia.ARQUIVO]: 'info',
      [TipoEvidencia.LINK]: 'success',
      [TipoEvidencia.TEXTO]: 'warning'
    };
    return severityMap[tipo];
  }

  truncateText(text: string | undefined, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
}
