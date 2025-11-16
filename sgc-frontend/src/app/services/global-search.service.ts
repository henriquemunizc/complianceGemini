import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SearchResult {
  tipo: string;
  id: number;
  titulo: string;
  descricao: string;
  url: string;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private apiUrl = `${environment.apiUrl}/search`;
  private readonly RECENT_SEARCHES_KEY = 'sgc_recent_searches';
  private readonly MAX_RECENT_SEARCHES = 5;

  constructor(private http: HttpClient) {}

  /**
   * Realiza busca global no sistema
   * @param query Termo de busca
   * @returns Observable com resultados agrupados por tipo
   */
  search(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const params = new HttpParams().set('q', query.trim());
    return this.http.get<SearchResult[]>(this.apiUrl, { params });
  }

  /**
   * Salva busca recente no localStorage
   * @param query Termo buscado
   */
  saveRecentSearch(query: string): void {
    if (!query || query.trim().length === 0) return;

    const recentSearches = this.getRecentSearches();

    // Remove duplicatas
    const filtered = recentSearches.filter(s => s.query !== query.trim());

    // Adiciona nova busca no início
    filtered.unshift({
      query: query.trim(),
      timestamp: Date.now()
    });

    // Mantém apenas as últimas N buscas
    const limited = filtered.slice(0, this.MAX_RECENT_SEARCHES);

    localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(limited));
  }

  /**
   * Retorna lista de buscas recentes
   * @returns Array de buscas recentes
   */
  getRecentSearches(): RecentSearch[] {
    try {
      const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      if (!stored) return [];

      const searches = JSON.parse(stored) as RecentSearch[];

      // Remove buscas com mais de 7 dias
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return searches.filter(s => s.timestamp > sevenDaysAgo);
    } catch (error) {
      console.error('Erro ao carregar buscas recentes:', error);
      return [];
    }
  }

  /**
   * Limpa todas as buscas recentes
   */
  clearRecentSearches(): void {
    localStorage.removeItem(this.RECENT_SEARCHES_KEY);
  }

  /**
   * Remove uma busca recente específica
   * @param query Termo a remover
   */
  removeRecentSearch(query: string): void {
    const searches = this.getRecentSearches();
    const filtered = searches.filter(s => s.query !== query);
    localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  }
}
