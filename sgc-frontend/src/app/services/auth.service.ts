import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginRequest, LoginResponse, PerfilUsuario } from '../models/auth.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/v1/auth';
  private readonly TOKEN_KEY = 'sgc_token';
  private readonly USER_KEY = 'sgc_user';

  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  hasRole(role: PerfilUsuario): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.perfil === role : false;
  }

  hasAnyRole(roles: PerfilUsuario[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.perfil) : false;
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult));
  }

  private getUserFromStorage(): LoginResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
