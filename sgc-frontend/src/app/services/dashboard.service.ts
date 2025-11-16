import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ChartData,
  ObrigacaoAtrasada,
  Atividade,
  ResponsavelCount,
  TendenciaData,
  PeriodoFiltro
} from '../models/dashboard.model';

export interface DashboardMetrics {
  totalObrigacoes: number;
  obrigacoesPendentes: number;
  obrigacoesSubmetidas: number;
  obrigacoesAprovadas: number;
  obrigacoesRejeitadas: number;
  obrigacoesAtrasadas: number;
  totalNormas: number;
  normasVigentes: number;
  totalUsuariosAtivos: number;
  obrigacoesPorStatus: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = '/api/v1/dashboard';
  private http = inject(HttpClient);

  getMetrics(periodo?: PeriodoFiltro): Observable<DashboardMetrics> {
    let params = new HttpParams();
    if (periodo) {
      params = params.set('periodo', periodo);
    }
    return this.http.get<DashboardMetrics>(this.API_URL, { params });
  }

  getObrigacoesPorStatus(): Observable<ChartData> {
    return this.http.get<{ [key: string]: number }>(`${this.API_URL}/por-status`).pipe(
      map(data => this.transformStatusToChartData(data)),
      catchError(() => of(this.getEmptyChartData()))
    );
  }

  getObrigacoesPorResponsavel(limit: number = 10): Observable<ChartData> {
    return this.http.get<ResponsavelCount[]>(`${this.API_URL}/por-responsavel?limit=${limit}`).pipe(
      map(data => this.transformResponsavelToChartData(data)),
      catchError(() => of(this.getEmptyChartData()))
    );
  }

  getObrigacoesTendencia(dias: number = 30): Observable<ChartData> {
    return this.http.get<TendenciaData[]>(`${this.API_URL}/tendencia?dias=${dias}`).pipe(
      map(data => this.transformTendenciaToChartData(data)),
      catchError(() => of(this.getEmptyChartData()))
    );
  }

  getObrigacoesAtrasadasDetalhadas(limit: number = 10): Observable<ObrigacaoAtrasada[]> {
    return this.http.get<ObrigacaoAtrasada[]>(`${this.API_URL}/atrasadas?limit=${limit}`).pipe(
      catchError(() => of([]))
    );
  }

  getAtividadesRecentes(limit: number = 20): Observable<Atividade[]> {
    return this.http.get<Atividade[]>(`${this.API_URL}/atividades?limit=${limit}`).pipe(
      catchError(() => of([]))
    );
  }

  private transformStatusToChartData(data: { [key: string]: number }): ChartData {
    const statusColors: { [key: string]: string } = {
      'PENDENTE': '#ffc107',
      'SUBMETIDA': '#17a2b8',
      'APROVADA': '#28a745',
      'REJEITADA': '#dc3545'
    };

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map(label => statusColors[label] || '#6c757d');

    return {
      labels,
      datasets: [{
        label: 'Obrigações por Status',
        data: values,
        backgroundColor: colors,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  }

  private transformResponsavelToChartData(data: ResponsavelCount[]): ChartData {
    const labels = data.map(r => r.responsavelNome);

    return {
      labels,
      datasets: [
        {
          label: 'Pendentes',
          data: data.map(r => r.pendentes),
          backgroundColor: '#ffc107',
          borderColor: '#ffc107',
          borderWidth: 1
        },
        {
          label: 'Submetidas',
          data: data.map(r => r.submetidas),
          backgroundColor: '#17a2b8',
          borderColor: '#17a2b8',
          borderWidth: 1
        },
        {
          label: 'Aprovadas',
          data: data.map(r => r.aprovadas),
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          borderWidth: 1
        },
        {
          label: 'Rejeitadas',
          data: data.map(r => r.rejeitadas),
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          borderWidth: 1
        }
      ]
    };
  }

  private transformTendenciaToChartData(data: TendenciaData[]): ChartData {
    const labels = data.map(d => {
      const date = new Date(d.data);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Criadas',
          data: data.map(d => d.criadas),
          borderColor: '#6c757d',
          backgroundColor: 'rgba(108, 117, 125, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Submetidas',
          data: data.map(d => d.submetidas),
          borderColor: '#17a2b8',
          backgroundColor: 'rgba(23, 162, 184, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Aprovadas',
          data: data.map(d => d.aprovadas),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Rejeitadas',
          data: data.map(d => d.rejeitadas),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2
        }
      ]
    };
  }

  private getEmptyChartData(): ChartData {
    return {
      labels: [],
      datasets: []
    };
  }
}
