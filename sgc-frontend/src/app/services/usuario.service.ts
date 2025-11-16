import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PerfilUsuario, UsuarioResponse } from '../models/auth.model';

export interface UsuarioCreate {
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

export interface UsuarioUpdate {
  nome: string;
  email: string;
  perfil: PerfilUsuario;
}

export interface TrocarSenha {
  novaSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly API_URL = '/api/v1/usuarios';
  private http = inject(HttpClient);

  listar(perfil?: PerfilUsuario): Observable<UsuarioResponse[]> {
    let params = new HttpParams();
    if (perfil) {
      params = params.set('perfil', perfil);
    }
    return this.http.get<UsuarioResponse[]>(this.API_URL, { params });
  }

  criar(usuario: UsuarioCreate): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.API_URL, usuario);
  }

  atualizar(id: number, usuario: UsuarioUpdate): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.API_URL}/${id}`, usuario);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  trocarSenha(id: number, dados: TrocarSenha): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/trocar-senha`, dados);
  }

  obterPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_URL}/${id}`);
  }
}
