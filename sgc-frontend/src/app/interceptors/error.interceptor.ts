import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro desconhecido';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente ou de rede
        errorMessage = 'Erro de rede. Verifique sua conexão.';
        messageService.add({
          severity: 'error',
          summary: 'Erro de Conexão',
          detail: errorMessage,
          life: 5000
        });
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 401:
            // Unauthorized - fazer logout automático
            errorMessage = 'Sessão expirada. Faça login novamente.';
            localStorage.removeItem('sgc_token');
            localStorage.removeItem('sgc_user');
            router.navigate(['/login']);
            messageService.add({
              severity: 'warn',
              summary: 'Sessão Expirada',
              detail: errorMessage,
              life: 5000
            });
            break;

          case 403:
            // Forbidden
            errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
            messageService.add({
              severity: 'error',
              summary: 'Acesso Negado',
              detail: errorMessage,
              life: 5000
            });
            break;

          case 404:
            // Not Found
            errorMessage = 'Recurso não encontrado.';
            messageService.add({
              severity: 'warn',
              summary: 'Não Encontrado',
              detail: errorMessage,
              life: 5000
            });
            break;

          case 500:
            // Internal Server Error
            errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
            messageService.add({
              severity: 'error',
              summary: 'Erro no Servidor',
              detail: errorMessage,
              life: 5000
            });
            break;

          case 0:
            // Network error (server down or CORS)
            errorMessage = 'Sem conexão com o servidor.';
            messageService.add({
              severity: 'error',
              summary: 'Sem Conexão',
              detail: errorMessage,
              life: 5000
            });
            break;

          default:
            // Outros erros
            errorMessage = error.error?.message || `Erro: ${error.status} - ${error.statusText}`;
            messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: errorMessage,
              life: 5000
            });
        }
      }

      return throwError(() => error);
    })
  );
};
