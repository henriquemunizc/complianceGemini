import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { HistoricoService } from '../services/historico.service';
import { HistoricoResponse } from '../models/historico.model';
import { StatusObrigacao } from '../models/obrigacao.model';

interface TimelineEvent {
  status: string;
  date: string;
  usuario?: string;
  observacoes?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-obrigacao-timeline',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule, TagModule],
  template: `
    <p-card header="Histórico de Mudanças">
      <p-timeline [value]="events" align="alternate" styleClass="customized-timeline">
        <ng-template pTemplate="marker" let-event>
          <span
            class="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1"
            [style.backgroundColor]="event.color"
          >
            <i [class]="event.icon"></i>
          </span>
        </ng-template>

        <ng-template pTemplate="content" let-event>
          <p-card [header]="event.status" [subheader]="event.date">
            <div *ngIf="event.usuario" class="mb-2">
              <strong>Usuário:</strong> {{ event.usuario }}
            </div>
            <div *ngIf="event.observacoes">
              <strong>Observações:</strong>
              <p class="mt-2 mb-0">{{ event.observacoes }}</p>
            </div>
          </p-card>
        </ng-template>
      </p-timeline>
    </p-card>
  `,
  styles: [`
    :host ::ng-deep .customized-timeline {
      .p-timeline-event-content,
      .p-timeline-event-opposite {
        line-height: 1;
      }
    }
  `]
})
export class ObrigacaoTimelineComponent implements OnInit {
  @Input({ required: true }) obrigacaoId!: number;

  private historicoService = inject(HistoricoService);

  events: TimelineEvent[] = [];

  ngOnInit(): void {
    this.loadHistorico();
  }

  private loadHistorico(): void {
    this.historicoService.listarPorObrigacao(this.obrigacaoId).subscribe({
      next: (historico) => {
        this.events = historico.map(h => this.toTimelineEvent(h));
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
      }
    });
  }

  private toTimelineEvent(historico: HistoricoResponse): TimelineEvent {
    const statusInfo = this.getStatusInfo(historico.statusNovo);

    return {
      status: this.formatStatus(historico.statusNovo),
      date: new Date(historico.dataMudanca).toLocaleString('pt-BR'),
      usuario: historico.usuarioNome,
      observacoes: historico.observacoes,
      icon: statusInfo.icon,
      color: statusInfo.color
    };
  }

  private getStatusInfo(status: StatusObrigacao): { icon: string; color: string } {
    const statusMap: Record<StatusObrigacao, { icon: string; color: string }> = {
      [StatusObrigacao.PENDENTE]: { icon: 'pi pi-clock', color: '#ffc107' },
      [StatusObrigacao.SUBMETIDA]: { icon: 'pi pi-send', color: '#2196f3' },
      [StatusObrigacao.APROVADA]: { icon: 'pi pi-check-circle', color: '#4caf50' },
      [StatusObrigacao.REJEITADA]: { icon: 'pi pi-times-circle', color: '#f44336' }
    };
    return statusMap[status] || { icon: 'pi pi-circle', color: '#9e9e9e' };
  }

  private formatStatus(status: StatusObrigacao): string {
    const statusMap: Record<StatusObrigacao, string> = {
      [StatusObrigacao.PENDENTE]: 'Pendente',
      [StatusObrigacao.SUBMETIDA]: 'Submetida para Aprovação',
      [StatusObrigacao.APROVADA]: 'Aprovada',
      [StatusObrigacao.REJEITADA]: 'Rejeitada'
    };
    return statusMap[status] || status;
  }
}
