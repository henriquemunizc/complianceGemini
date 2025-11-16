import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';
import { AuditService } from '../services/audit.service';
import { AuditLog } from '../models/audit-log.model';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

/**
 * Componente de visualização de logs de auditoria.
 * Exibe timeline com histórico completo de mudanças.
 * Apenas ADMIN pode acessar.
 */
@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TimelineModule,
    ButtonModule,
    TagModule,
    PanelModule,
    TimeAgoPipe,
  ],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="audit-log-header">
          <h3><i class="pi pi-history"></i> Histórico de Auditoria</h3>
          <button
            pButton
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            class="p-button-sm p-button-outlined"
            (click)="exportarPDF()"
          ></button>
        </div>
      </ng-template>

      <div class="audit-log-content">
        <div *ngIf="loading" class="loading-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
          <p>Carregando histórico...</p>
        </div>

        <div *ngIf="!loading && auditLogs.length === 0" class="empty-state">
          <i class="pi pi-history" style="font-size: 3rem; color: #999;"></i>
          <p>Nenhum registro de auditoria encontrado</p>
        </div>

        <p-timeline *ngIf="!loading && auditLogs.length > 0" [value]="auditLogs" align="left">
          <ng-template pTemplate="marker" let-log>
            <div class="timeline-marker" [ngClass]="getMarkerClass(log.acao)">
              <i [class]="getIconClass(log.acao)"></i>
            </div>
          </ng-template>

          <ng-template pTemplate="content" let-log>
            <div class="audit-log-item">
              <div class="audit-header">
                <p-tag
                  [value]="log.acao"
                  [severity]="getSeverity(log.acao)"
                  [rounded]="true"
                ></p-tag>
                <span class="audit-time">{{ log.timestamp | timeAgo }}</span>
              </div>

              <div class="audit-info">
                <div class="audit-user">
                  <i class="pi pi-user"></i>
                  <strong>{{ log.usuario }}</strong>
                </div>
                <div class="audit-entity">
                  {{ log.entidade }} #{{ log.entidadeId }}
                </div>
              </div>

              <!-- Diff view: Valor anterior → Valor novo -->
              <div class="audit-diff" *ngIf="log.valorAnterior || log.valorNovo">
                <p-panel header="Detalhes da Mudança" [toggleable]="true" [collapsed]="true">
                  <div class="diff-container">
                    <div class="diff-before" *ngIf="log.valorAnterior">
                      <h4>Antes:</h4>
                      <pre>{{ formatJSON(log.valorAnterior) }}</pre>
                    </div>

                    <div class="diff-arrow" *ngIf="log.valorAnterior && log.valorNovo">
                      <i class="pi pi-arrow-right"></i>
                    </div>

                    <div class="diff-after" *ngIf="log.valorNovo">
                      <h4>Depois:</h4>
                      <pre>{{ formatJSON(log.valorNovo) }}</pre>
                    </div>
                  </div>
                </p-panel>
              </div>

              <div class="audit-metadata" *ngIf="log.ipAddress || log.userAgent">
                <small>
                  <i class="pi pi-info-circle"></i>
                  IP: {{ log.ipAddress || 'N/A' }} | User-Agent:
                  {{ log.userAgent || 'N/A' }}
                </small>
              </div>
            </div>
          </ng-template>
        </p-timeline>
      </div>
    </p-card>
  `,
  styles: [
    `
      .audit-log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
      }

      .audit-log-header h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .audit-log-content {
        padding: 1rem;
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #999;
      }

      .timeline-marker {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
      }

      .timeline-marker.create {
        background-color: #4caf50;
      }

      .timeline-marker.update {
        background-color: #2196f3;
      }

      .timeline-marker.delete {
        background-color: #f44336;
      }

      .timeline-marker.custom {
        background-color: #ff9800;
      }

      .audit-log-item {
        margin-bottom: 1.5rem;
      }

      .audit-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .audit-time {
        font-size: 0.9rem;
        color: #666;
      }

      .audit-info {
        margin-bottom: 1rem;
      }

      .audit-user {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .audit-entity {
        color: #666;
        font-size: 0.9rem;
      }

      .audit-diff {
        margin: 1rem 0;
      }

      .diff-container {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }

      .diff-before,
      .diff-after {
        flex: 1;
      }

      .diff-before h4 {
        color: #f44336;
        margin: 0 0 0.5rem 0;
      }

      .diff-after h4 {
        color: #4caf50;
        margin: 0 0 0.5rem 0;
      }

      .diff-before pre,
      .diff-after pre {
        background-color: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.85rem;
        margin: 0;
      }

      .diff-before pre {
        border-left: 3px solid #f44336;
      }

      .diff-after pre {
        border-left: 3px solid #4caf50;
      }

      .diff-arrow {
        display: flex;
        align-items: center;
        font-size: 1.5rem;
        color: #999;
      }

      .audit-metadata {
        margin-top: 0.5rem;
        color: #999;
      }
    `,
  ],
})
export class AuditLogComponent implements OnInit {
  @Input() entidade!: string;
  @Input() entidadeId!: number;

  private auditService = inject(AuditService);
  private messageService = inject(MessageService);

  auditLogs: AuditLog[] = [];
  loading = false;

  ngOnInit(): void {
    this.carregarAuditLogs();
  }

  carregarAuditLogs(): void {
    this.loading = true;
    this.auditService.buscarPorEntidade(this.entidade, this.entidadeId).subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar audit logs:', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar histórico de auditoria',
        });
      },
    });
  }

  getMarkerClass(acao: string): string {
    if (acao === 'CREATE') return 'create';
    if (acao === 'UPDATE') return 'update';
    if (acao === 'DELETE') return 'delete';
    return 'custom';
  }

  getIconClass(acao: string): string {
    const iconMap: Record<string, string> = {
      CREATE: 'pi pi-plus',
      UPDATE: 'pi pi-pencil',
      DELETE: 'pi pi-trash',
      APROVAR: 'pi pi-check',
      REJEITAR: 'pi pi-times',
      SUBMETER: 'pi pi-send',
    };
    return iconMap[acao] || 'pi pi-cog';
  }

  getSeverity(acao: string): 'success' | 'info' | 'warning' | 'danger' {
    if (acao === 'CREATE' || acao === 'APROVAR') return 'success';
    if (acao === 'DELETE' || acao === 'REJEITAR') return 'danger';
    if (acao === 'UPDATE') return 'info';
    return 'warning';
  }

  formatJSON(jsonStr: string): string {
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  }

  exportarPDF(): void {
    // TODO: Implementar exportação para PDF
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: 'Funcionalidade de exportação em desenvolvimento',
    });
  }
}
