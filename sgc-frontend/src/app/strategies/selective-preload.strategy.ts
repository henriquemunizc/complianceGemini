import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Estratégia de Preload Seletivo para Performance Otimizada.
 *
 * Carrega rotas em background após delay de 2 segundos,
 * priorizando rotas marcadas com preload: true
 *
 * Performance: Reduz tempo de navegação inicial
 * UX: Carregamento suave após interação inicial
 *
 * @author Performance Team
 * @version 1.0
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Se a rota tem preload configurado, carrega após 2 segundos
    if (route.data && route.data['preload']) {
      console.log('Preloading:', route.path);
      return timer(2000).pipe(
        mergeMap(() => load())
      );
    }

    // Caso contrário, não carrega até ser necessário
    return of(null);
  }
}
