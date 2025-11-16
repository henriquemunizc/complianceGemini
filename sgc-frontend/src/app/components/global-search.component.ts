import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { HotkeysService } from '@ngneat/hotkeys';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { GlobalSearchService, SearchResult, RecentSearch } from '../services/global-search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OverlayPanelModule,
    InputTextModule,
    ButtonModule,
    BadgeModule,
    DividerModule,
    ProgressSpinnerModule
  ],
  template: `
    <div class="global-search-container">
      <button
        pButton
        type="button"
        icon="pi pi-search"
        class="p-button-rounded p-button-text"
        (click)="op.toggle($event)"
        [pTooltip]="'Buscar (Ctrl+K)'"
        tooltipPosition="bottom">
      </button>

      <p-overlayPanel #op [dismissable]="true" [showCloseIcon]="false" styleClass="global-search-overlay">
        <div class="search-panel">
          <!-- Input de busca -->
          <div class="search-input-wrapper">
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input
                #searchInput
                pInputText
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                (keydown)="onKeyDown($event)"
                placeholder="Buscar em todo o sistema..."
                class="w-full" />
            </span>
            <small class="keyboard-hint">Ctrl+K</small>
          </div>

          <!-- Loading -->
          <div *ngIf="isLoading" class="text-center p-4">
            <p-progressSpinner styleClass="w-3rem h-3rem"></p-progressSpinner>
          </div>

          <!-- Resultados -->
          <div *ngIf="!isLoading && searchQuery && results.length > 0" class="search-results">
            <div *ngFor="let group of groupedResults" class="result-group">
              <div class="result-group-header">
                <i [class]="getIconForType(group.tipo)"></i>
                <span>{{ group.tipo }}</span>
                <p-badge [value]="group.items.length.toString()" severity="secondary"></p-badge>
              </div>
              <div
                *ngFor="let result of group.items; let i = index"
                class="result-item"
                [class.selected]="isSelected(result)"
                (click)="selectResult(result)"
                (mouseenter)="highlightResult(result)">
                <div class="result-content">
                  <div class="result-title" [innerHTML]="highlightText(result.titulo)"></div>
                  <div class="result-description" [innerHTML]="highlightText(result.descricao)"></div>
                </div>
                <i class="pi pi-arrow-right result-arrow"></i>
              </div>
            </div>
          </div>

          <!-- Sem resultados -->
          <div *ngIf="!isLoading && searchQuery && results.length === 0" class="no-results">
            <i class="pi pi-search" style="font-size: 2rem; color: var(--text-color-secondary)"></i>
            <p>Nenhum resultado encontrado para "{{ searchQuery }}"</p>
          </div>

          <!-- Buscas recentes -->
          <div *ngIf="!searchQuery && recentSearches.length > 0" class="recent-searches">
            <div class="recent-header">
              <span><i class="pi pi-clock"></i> Buscas recentes</span>
              <button
                pButton
                type="button"
                label="Limpar"
                class="p-button-text p-button-sm"
                (click)="clearRecent()">
              </button>
            </div>
            <div
              *ngFor="let recent of recentSearches"
              class="recent-item"
              (click)="searchRecent(recent.query)">
              <i class="pi pi-history"></i>
              <span>{{ recent.query }}</span>
              <button
                pButton
                type="button"
                icon="pi pi-times"
                class="p-button-text p-button-sm p-button-rounded"
                (click)="removeRecent($event, recent.query)">
              </button>
            </div>
          </div>

          <!-- Dicas -->
          <div *ngIf="!searchQuery && recentSearches.length === 0" class="search-tips">
            <p><i class="pi pi-info-circle"></i> Dicas de busca:</p>
            <ul>
              <li>Use palavras-chave para encontrar normas, obrigações e evidências</li>
              <li>Navegue pelos resultados usando as setas ↑ ↓</li>
              <li>Pressione Enter para acessar o resultado selecionado</li>
            </ul>
          </div>

          <!-- Navegação com teclado -->
          <div class="keyboard-navigation-hint" *ngIf="results.length > 0">
            <span><i class="pi pi-arrow-up"></i> <i class="pi pi-arrow-down"></i> Navegar</span>
            <span><i class="pi pi-sign-in"></i> Selecionar</span>
            <span>Esc Fechar</span>
          </div>
        </div>
      </p-overlayPanel>
    </div>
  `,
  styles: [`
    .global-search-container {
      display: inline-block;
    }

    :host ::ng-deep .global-search-overlay {
      width: 600px;
      max-width: 90vw;
    }

    .search-panel {
      padding: 1rem;
      max-height: 70vh;
      overflow-y: auto;
    }

    .search-input-wrapper {
      position: relative;
      margin-bottom: 1rem;
    }

    .keyboard-hint {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: var(--surface-100);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .search-results {
      margin-top: 1rem;
    }

    .result-group {
      margin-bottom: 1.5rem;
    }

    .result-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: var(--surface-50);
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin-bottom: 0.5rem;
    }

    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }

    .result-item:hover,
    .result-item.selected {
      background: var(--primary-50);
      border-color: var(--primary-200);
    }

    .result-content {
      flex: 1;
    }

    .result-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      color: var(--text-color);
    }

    .result-description {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .result-arrow {
      color: var(--text-color-secondary);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .result-item:hover .result-arrow,
    .result-item.selected .result-arrow {
      opacity: 1;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-secondary);
    }

    .no-results i {
      margin-bottom: 1rem;
    }

    .recent-searches {
      margin-top: 1rem;
    }

    .recent-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-color-secondary);
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .recent-item:hover {
      background: var(--surface-100);
    }

    .recent-item i.pi-history {
      color: var(--text-color-secondary);
    }

    .recent-item span {
      flex: 1;
    }

    .search-tips {
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .search-tips p {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-color-secondary);
    }

    .search-tips ul {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }

    .search-tips li {
      padding: 0.25rem 0;
      color: var(--text-color-secondary);
    }

    .keyboard-navigation-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-200);
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .keyboard-navigation-hint span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    :host ::ng-deep .highlight {
      background-color: yellow;
      font-weight: 600;
      padding: 0 2px;
    }
  `]
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  results: SearchResult[] = [];
  recentSearches: RecentSearch[] = [];
  isLoading = false;
  selectedIndex = -1;

  private searchSubject = new Subject<string>();
  private subscription!: Subscription;
  private hotkeySubscription?: Subscription;

  constructor(
    private searchService: GlobalSearchService,
    private hotkeysService: HotkeysService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Configurar debounce para busca
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length === 0) {
          this.isLoading = false;
          return [];
        }
        this.isLoading = true;
        return this.searchService.search(query);
      })
    ).subscribe({
      next: (results) => {
        this.results = results;
        this.selectedIndex = -1;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar:', error);
        this.isLoading = false;
        this.results = [];
      }
    });

    // Carregar buscas recentes
    this.loadRecentSearches();

    // Configurar hotkey Ctrl+K / Cmd+K
    this.hotkeySubscription = this.hotkeysService
      .addShortcut({ keys: 'control.k' })
      .subscribe(() => {
        this.focusSearch();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.hotkeySubscription?.unsubscribe();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveSelection(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveSelection(-1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.selectedIndex >= 0 && this.selectedIndex < this.results.length) {
        this.selectResult(this.results[this.selectedIndex]);
      }
    } else if (event.key === 'Escape') {
      this.searchQuery = '';
      this.results = [];
    }
  }

  moveSelection(direction: number): void {
    const newIndex = this.selectedIndex + direction;
    if (newIndex >= -1 && newIndex < this.results.length) {
      this.selectedIndex = newIndex;
    }
  }

  highlightResult(result: SearchResult): void {
    this.selectedIndex = this.results.indexOf(result);
  }

  isSelected(result: SearchResult): boolean {
    return this.results.indexOf(result) === this.selectedIndex;
  }

  selectResult(result: SearchResult): void {
    this.searchService.saveRecentSearch(this.searchQuery);
    this.router.navigate([result.url]);
    this.searchQuery = '';
    this.results = [];
  }

  searchRecent(query: string): void {
    this.searchQuery = query;
    this.onSearchChange(query);
  }

  removeRecent(event: Event, query: string): void {
    event.stopPropagation();
    this.searchService.removeRecentSearch(query);
    this.loadRecentSearches();
  }

  clearRecent(): void {
    this.searchService.clearRecentSearches();
    this.loadRecentSearches();
  }

  loadRecentSearches(): void {
    this.recentSearches = this.searchService.getRecentSearches();
  }

  focusSearch(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 100);
  }

  get groupedResults(): { tipo: string; items: SearchResult[] }[] {
    const groups = new Map<string, SearchResult[]>();

    this.results.forEach(result => {
      if (!groups.has(result.tipo)) {
        groups.set(result.tipo, []);
      }
      groups.get(result.tipo)!.push(result);
    });

    return Array.from(groups.entries()).map(([tipo, items]) => ({ tipo, items }));
  }

  highlightText(text: string): string {
    if (!this.searchQuery || !text) return text;

    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getIconForType(tipo: string): string {
    const icons: Record<string, string> = {
      'Normas': 'pi pi-book',
      'Obrigações': 'pi pi-check-square',
      'Evidências': 'pi pi-file',
      'Usuários': 'pi pi-users'
    };
    return icons[tipo] || 'pi pi-circle';
  }
}
