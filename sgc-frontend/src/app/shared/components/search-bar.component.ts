/**
 * SearchBarComponent
 *
 * Barra de pesquisa com autocomplete e debounce
 *
 * @example
 * <app-search-bar
 *   placeholder="Buscar obrigações..."
 *   [suggestions]="sugestoes"
 *   (onSearch)="buscar($event)">
 * </app-search-bar>
 */

import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, AutoCompleteModule],
  template: `
    <div class="search-bar">
      <span class="p-input-icon-left search-input-wrapper">
        <i class="pi pi-search"></i>
        <input
          *ngIf="!suggestions || suggestions.length === 0"
          type="text"
          pInputText
          [(ngModel)]="searchValue"
          [placeholder]="placeholder"
          (input)="onInput($event)"
          (keyup.enter)="onEnterPress()"
          class="search-input"
          [attr.aria-label]="placeholder">
      </span>

      <p-autoComplete
        *ngIf="suggestions && suggestions.length > 0"
        [(ngModel)]="searchValue"
        [suggestions]="filteredSuggestions"
        (completeMethod)="filterSuggestions($event)"
        (onSelect)="onSuggestionSelect($event)"
        (onKeyUp)="onInput($event)"
        [placeholder]="placeholder"
        [minLength]="1"
        [dropdown]="false"
        [forceSelection]="false"
        [inputStyle]="{ width: '100%' }"
        styleClass="search-autocomplete">
        <ng-template let-item pTemplate="item">
          <div class="suggestion-item">
            <i class="pi pi-search suggestion-icon"></i>
            <span>{{ item }}</span>
          </div>
        </ng-template>
      </p-autoComplete>

      <button
        *ngIf="searchValue && showClearButton"
        class="clear-button"
        (click)="clearSearch()"
        type="button"
        aria-label="Limpar pesquisa">
        <i class="pi pi-times"></i>
      </button>
    </div>
  `,
  styles: [`
    .search-bar {
      position: relative;
      width: 100%;
    }

    .search-input-wrapper {
      width: 100%;
      display: block;
    }

    .search-input {
      width: 100%;
      padding-left: 2.5rem;
      padding-right: 2.5rem;
      font-size: var(--font-size-sm);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-medium);
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--color-primary-light);
      }

      &:focus {
        border-color: var(--color-primary);
        box-shadow: var(--focus-ring);
      }
    }

    :host ::ng-deep {
      .search-autocomplete {
        width: 100%;

        .p-autocomplete-input {
          width: 100%;
          padding-left: 2.5rem;
          padding-right: 2.5rem;
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
        }

        .p-autocomplete-panel {
          margin-top: 0.25rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }
      }

      .p-input-icon-left > i:first-of-type {
        left: 0.875rem;
        color: var(--color-text-tertiary);
      }
    }

    .clear-button {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-text-tertiary);
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-neutral-200);
        color: var(--color-text-primary);
      }

      &:active {
        transform: translateY(-50%) scale(0.95);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xs) 0;
    }

    .suggestion-icon {
      color: var(--color-text-tertiary);
      font-size: 0.875rem;
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  /** Placeholder do input */
  @Input() placeholder: string = 'Buscar...';

  /** Lista de sugestões para autocomplete (opcional) */
  @Input() suggestions?: string[];

  /** Tempo de debounce em ms (padrão: 300ms) */
  @Input() debounceTime: number = 300;

  /** Exibir botão de limpar (padrão: true) */
  @Input() showClearButton: boolean = true;

  /** Evento disparado quando o usuário pesquisa */
  @Output() onSearch = new EventEmitter<string>();

  searchValue: string = '';
  filteredSuggestions: string[] = [];
  private searchSubject = new Subject<string>();
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.onSearch.emit(value);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onInput(event: any): void {
    const value = typeof event === 'string' ? event : event.target?.value || '';
    this.searchSubject.next(value);
  }

  onEnterPress(): void {
    this.onSearch.emit(this.searchValue);
  }

  filterSuggestions(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredSuggestions = this.suggestions?.filter(item =>
      item.toLowerCase().includes(query)
    ) || [];
  }

  onSuggestionSelect(event: any): void {
    this.onSearch.emit(event);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.onSearch.emit('');
  }
}
