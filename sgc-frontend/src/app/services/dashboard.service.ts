import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(this.API_URL);
  }
}
