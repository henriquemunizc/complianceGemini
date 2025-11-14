import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoResponse } from '../models/historico.model';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private readonly API_URL = '/api/v1/historico';
  private http = inject(HttpClient);

  listarPorObrigacao(obrigacaoId: number): Observable<HistoricoResponse[]> {
    return this.http.get<HistoricoResponse[]>(`${this.API_URL}/obrigacao/${obrigacaoId}`);
  }

  buscarPorId(id: number): Observable<HistoricoResponse> {
    return this.http.get<HistoricoResponse>(`${this.API_URL}/${id}`);
  }
}
