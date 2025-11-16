import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Comentario,
  ComentarioCreateDTO,
  ComentarioUpdateDTO,
} from '../models/comentario.model';

/**
 * Service para gerenciamento de comentários.
 */
@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  private readonly API_URL = '/api/v1/comentarios';
  private http = inject(HttpClient);

  /**
   * Cria um novo comentário.
   */
  criar(dto: ComentarioCreateDTO): Observable<Comentario> {
    return this.http.post<Comentario>(this.API_URL, dto);
  }

  /**
   * Lista comentários de uma obrigação.
   */
  listarPorObrigacao(obrigacaoId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.API_URL}/obrigacao/${obrigacaoId}`);
  }

  /**
   * Atualiza um comentário.
   */
  atualizar(comentarioId: number, dto: ComentarioUpdateDTO): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.API_URL}/${comentarioId}`, dto);
  }

  /**
   * Exclui um comentário.
   */
  excluir(comentarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${comentarioId}`);
  }
}
