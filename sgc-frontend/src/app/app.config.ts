import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { MessageService } from 'primeng/api';
import { SelectivePreloadStrategy } from './strategies/selective-preload.strategy';

import { authGuard } from './guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./components/login.component').then(m => m.LoginComponent)
      },
      {
        path: '',
        loadComponent: () => import('./components/app-layout.component').then(m => m.AppLayoutComponent),
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./components/dashboard.component').then(m => m.DashboardComponent),
            data: { preload: true }
          },
          // Rotas de Normas
          {
            path: 'normas',
            loadComponent: () => import('./components/norma-list.component').then(m => m.NormaListComponent),
            data: { preload: true }
          },
          {
            path: 'normas/nova',
            loadComponent: () => import('./components/norma-form.component').then(m => m.NormaFormComponent)
          },
          {
            path: 'normas/:id',
            loadComponent: () => import('./components/norma-detail.component').then(m => m.NormaDetailComponent)
          },
          {
            path: 'normas/:id/editar',
            loadComponent: () => import('./components/norma-form.component').then(m => m.NormaFormComponent)
          },
          // Rotas de Obrigações
          {
            path: 'obrigacoes',
            loadComponent: () => import('./components/obrigacao-list.component').then(m => m.ObrigacaoListComponent),
            data: { preload: true }
          },
          {
            path: 'obrigacoes/nova',
            loadComponent: () => import('./components/obrigacao-form.component').then(m => m.ObrigacaoFormComponent)
          },
          {
            path: 'obrigacoes/:id',
            loadComponent: () => import('./components/obrigacao-detail.component').then(m => m.ObrigacaoDetailComponent)
          },
          {
            path: 'obrigacoes/:id/editar',
            loadComponent: () => import('./components/obrigacao-form.component').then(m => m.ObrigacaoFormComponent)
          },
          // Rotas de Usuários
          {
            path: 'usuarios',
            loadComponent: () => import('./components/usuario-list.component').then(m => m.UsuarioListComponent)
          },
          {
            path: 'usuarios/novo',
            loadComponent: () => import('./components/usuario-form.component').then(m => m.UsuarioFormComponent)
          },
          {
            path: 'usuarios/:id/editar',
            loadComponent: () => import('./components/usuario-form.component').then(m => m.UsuarioFormComponent)
          }
        ]
      }
    ], withPreloading(SelectivePreloadStrategy)),
    provideHttpClient(withInterceptors([
      jwtInterceptor,
      loadingInterceptor,
      errorInterceptor
    ])),
    provideAnimations(),
    MessageService,
    SelectivePreloadStrategy
  ]
};
