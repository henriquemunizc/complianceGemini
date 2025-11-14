import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvidenciaCreate, EvidenciaResponse } from '../models/evidencia.model';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {
  private readonly API_URL = '/api/v1/evidencias';
  private http = inject(HttpClient);

  adicionarArquivo(obrigacaoId: number, arquivo: File, descricao?: string): Observable<EvidenciaResponse> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    if (descricao) {
      formData.append('descricao', descricao);
    }

    return this.http.post<EvidenciaResponse>(
      `${this.API_URL}/obrigacao/${obrigacaoId}/arquivo`,
      formData
    );
  }

  adicionarLink(obrigacaoId: number, evidencia: EvidenciaCreate): Observable<EvidenciaResponse> {
    return this.http.post<EvidenciaResponse>(
      `${this.API_URL}/obrigacao/${obrigacaoId}/link`,
      evidencia
    );
  }

  adicionarTexto(obrigacaoId: number, evidencia: EvidenciaCreate): Observable<EvidenciaResponse> {
    return this.http.post<EvidenciaResponse>(
      `${this.API_URL}/obrigacao/${obrigacaoId}/texto`,
      evidencia
    );
  }

  listarPorObrigacao(obrigacaoId: number): Observable<EvidenciaResponse[]> {
    return this.http.get<EvidenciaResponse[]>(`${this.API_URL}/obrigacao/${obrigacaoId}`);
  }

  downloadArquivo(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/download`, {
      responseType: 'blob'
    });
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  salvarArquivo(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
