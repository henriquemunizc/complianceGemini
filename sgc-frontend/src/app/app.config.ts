import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () => import('./components/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'obrigacoes',
        loadComponent: () => import('./components/obrigacao-list.component').then(m => m.ObrigacaoListComponent),
        canActivate: []  // authGuard will be added here
      }
    ]),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations()
  ]
};
