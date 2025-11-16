import { Injectable } from '@angular/core';

export interface SavedFilter {
  id: string;
  name: string;
  entityType: string;
  filters: any;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private readonly FILTERS_KEY = 'sgc_saved_filters';

  constructor() {}

  /**
   * Salva um filtro
   * @param name Nome do filtro
   * @param entityType Tipo de entidade (obrigacoes, normas, etc)
   * @param filters Objeto com os filtros
   * @returns O filtro salvo
   */
  saveFilter(name: string, entityType: string, filters: any): SavedFilter {
    const savedFilters = this.loadFilters();

    const newFilter: SavedFilter = {
      id: this.generateId(),
      name: name.trim(),
      entityType,
      filters: JSON.parse(JSON.stringify(filters)), // Deep copy
      createdAt: Date.now()
    };

    savedFilters.push(newFilter);
    this.persistFilters(savedFilters);

    return newFilter;
  }

  /**
   * Carrega todos os filtros salvos
   * @param entityType Tipo de entidade (opcional - filtra por tipo)
   * @returns Array de filtros salvos
   */
  loadFilters(entityType?: string): SavedFilter[] {
    try {
      const stored = localStorage.getItem(this.FILTERS_KEY);
      if (!stored) return [];

      const filters = JSON.parse(stored) as SavedFilter[];

      // Filtra por tipo de entidade se especificado
      if (entityType) {
        return filters.filter(f => f.entityType === entityType);
      }

      return filters;
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error);
      return [];
    }
  }

  /**
   * Remove um filtro salvo
   * @param id ID do filtro
   */
  deleteFilter(id: string): void {
    const filters = this.loadFilters();
    const filtered = filters.filter(f => f.id !== id);
    this.persistFilters(filtered);
  }

  /**
   * Atualiza um filtro existente
   * @param id ID do filtro
   * @param updates Atualizações
   */
  updateFilter(id: string, updates: Partial<SavedFilter>): void {
    const filters = this.loadFilters();
    const index = filters.findIndex(f => f.id === id);

    if (index !== -1) {
      filters[index] = {
        ...filters[index],
        ...updates
      };
      this.persistFilters(filters);
    }
  }

  /**
   * Obtém um filtro pelo ID
   * @param id ID do filtro
   * @returns O filtro ou undefined
   */
  getFilter(id: string): SavedFilter | undefined {
    const filters = this.loadFilters();
    return filters.find(f => f.id === id);
  }

  /**
   * Limpa todos os filtros salvos
   */
  clearAllFilters(): void {
    localStorage.removeItem(this.FILTERS_KEY);
  }

  /**
   * Verifica se existem filtros ativos
   * @param filters Objeto de filtros
   * @returns true se houver filtros ativos
   */
  hasActiveFilters(filters: any): boolean {
    if (!filters) return false;

    return Object.keys(filters).some(key => {
      const value = filters[key];
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    });
  }

  /**
   * Conta quantos filtros estão ativos
   * @param filters Objeto de filtros
   * @returns Número de filtros ativos
   */
  countActiveFilters(filters: any): number {
    if (!filters) return 0;

    return Object.keys(filters).filter(key => {
      const value = filters[key];
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }

  /**
   * Limpa todos os filtros (reseta para valores vazios)
   * @param filters Objeto de filtros
   * @returns Novo objeto com filtros limpos
   */
  clearFilters(filters: any): any {
    const cleared: any = {};
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (Array.isArray(value)) {
        cleared[key] = [];
      } else if (typeof value === 'string') {
        cleared[key] = '';
      } else if (typeof value === 'number') {
        cleared[key] = null;
      } else if (value instanceof Date) {
        cleared[key] = null;
      } else {
        cleared[key] = null;
      }
    });
    return cleared;
  }

  private persistFilters(filters: SavedFilter[]): void {
    localStorage.setItem(this.FILTERS_KEY, JSON.stringify(filters));
  }

  private generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
