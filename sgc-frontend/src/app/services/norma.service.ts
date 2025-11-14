import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NormaCreate, NormaUpdate, NormaResponse } from '../models/norma.model';
import { Page } from './obrigacao.service';

@Injectable({
  providedIn: 'root'
})
export class NormaService {
  private readonly API_URL = '/api/v1/normas';
  private http = inject(HttpClient);

  criar(norma: NormaCreate): Observable<NormaResponse> {
    return this.http.post<NormaResponse>(this.API_URL, norma);
  }

  atualizar(id: number, norma: NormaUpdate): Observable<NormaResponse> {
    return this.http.put<NormaResponse>(`${this.API_URL}/${id}`, norma);
  }

  buscarPorId(id: number): Observable<NormaResponse> {
    return this.http.get<NormaResponse>(`${this.API_URL}/${id}`);
  }

  listar(
    filters?: {
      tipo?: string;
      ano?: number;
      vigente?: boolean;
    },
    page: number = 0,
    size: number = 20
  ): Observable<Page<NormaResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters?.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters?.ano) {
      params = params.set('ano', filters.ano.toString());
    }
    if (filters?.vigente !== undefined) {
      params = params.set('vigente', filters.vigente.toString());
    }

    return this.http.get<Page<NormaResponse>>(this.API_URL, { params });
  }

  buscarVigentes(): Observable<NormaResponse[]> {
    return this.http.get<NormaResponse[]>(`${this.API_URL}/vigentes`);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
