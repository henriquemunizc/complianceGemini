import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ObrigacaoCreate,
  ObrigacaoUpdate,
  ObrigacaoResponse,
  AprovarObrigacao,
  RejeitarObrigacao,
  StatusObrigacao
} from '../models/obrigacao.model';

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ObrigacaoService {
  private readonly API_URL = '/api/v1/obrigacoes';
  private http = inject(HttpClient);

  criar(obrigacao: ObrigacaoCreate): Observable<ObrigacaoResponse> {
    return this.http.post<ObrigacaoResponse>(this.API_URL, obrigacao);
  }

  atualizar(id: number, obrigacao: ObrigacaoUpdate): Observable<ObrigacaoResponse> {
    return this.http.put<ObrigacaoResponse>(`${this.API_URL}/${id}`, obrigacao);
  }

  submeter(id: number): Observable<ObrigacaoResponse> {
    return this.http.post<ObrigacaoResponse>(`${this.API_URL}/${id}/submeter`, {});
  }

  aprovar(id: number, dto: AprovarObrigacao): Observable<ObrigacaoResponse> {
    return this.http.post<ObrigacaoResponse>(`${this.API_URL}/${id}/aprovar`, dto);
  }

  rejeitar(id: number, dto: RejeitarObrigacao): Observable<ObrigacaoResponse> {
    return this.http.post<ObrigacaoResponse>(`${this.API_URL}/${id}/rejeitar`, dto);
  }

  buscarPorId(id: number): Observable<ObrigacaoResponse> {
    return this.http.get<ObrigacaoResponse>(`${this.API_URL}/${id}`);
  }

  listar(
    filters?: {
      status?: StatusObrigacao;
      responsavelId?: number;
      atrasada?: boolean;
    },
    page: number = 0,
    size: number = 20
  ): Observable<Page<ObrigacaoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.responsavelId) {
      params = params.set('responsavelId', filters.responsavelId.toString());
    }
    if (filters?.atrasada !== undefined) {
      params = params.set('atrasada', filters.atrasada.toString());
    }

    return this.http.get<Page<ObrigacaoResponse>>(this.API_URL, { params });
  }

  buscarAtrasadas(): Observable<ObrigacaoResponse[]> {
    return this.http.get<ObrigacaoResponse[]>(`${this.API_URL}/atrasadas`);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
