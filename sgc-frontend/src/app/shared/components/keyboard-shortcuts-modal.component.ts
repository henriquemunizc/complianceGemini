import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { KeyboardShortcutsService, KeyboardShortcut } from '../../services/keyboard-shortcuts.service';

@Component({
  selector: 'app-keyboard-shortcuts-modal',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [style]="{width: '650px'}"
      styleClass="shortcuts-modal"
      header="Atalhos de Teclado"
    >
      <div class="shortcuts-content">
        <div class="shortcuts-hint">
          <i class="pi pi-info-circle"></i>
          <span>Use esses atalhos para navegar mais rápido pelo sistema</span>
        </div>

        <div class="shortcuts-grid">
          <div *ngFor="let category of categories" class="shortcut-category">
            <h3 class="category-title">
              <i [class]="getCategoryIcon(category)"></i>
              {{ category }}
            </h3>

            <div class="shortcuts-list">
              <div
                *ngFor="let shortcut of getShortcutsByCategory(category)"
                class="shortcut-item"
              >
                <div class="shortcut-keys">
                  <kbd
                    *ngFor="let key of parseDisplayKeys(shortcut.displayKeys || '')"
                    class="key-badge"
                  >
                    {{ key }}
                  </kbd>
                </div>
                <div class="shortcut-description">
                  {{ shortcut.description }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="shortcuts-footer">
          <p>
            <i class="pi pi-lightbulb"></i>
            <strong>Dica:</strong> Pressione <kbd class="key-badge">?</kbd> ou
            <kbd class="key-badge">{{ modDisplay }}/</kbd> para abrir este painel
            a qualquer momento
          </p>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .shortcuts-modal {
      .p-dialog-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .p-dialog-content {
        padding: 0;
      }
    }

    .shortcuts-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    .shortcuts-hint {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #eff6ff;
      border-bottom: 1px solid #dbeafe;
      color: #1e40af;
      font-size: 0.875rem;
    }

    .shortcuts-hint i {
      font-size: 1.125rem;
    }

    .shortcuts-grid {
      padding: 16px;
      display: grid;
      gap: 24px;
    }

    .shortcut-category {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .category-title {
      margin: 0;
      padding: 12px 16px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-title i {
      color: #6366f1;
    }

    .shortcuts-list {
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .shortcut-item:hover {
      background: #f9fafb;
    }

    .shortcut-keys {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 140px;
    }

    .key-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-bottom: 3px solid #9ca3af;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.813rem;
      font-weight: 600;
      color: #374151;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .shortcut-description {
      flex: 1;
      font-size: 0.875rem;
      color: #4b5563;
    }

    .shortcuts-footer {
      padding: 16px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }

    .shortcuts-footer p {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .shortcuts-footer i {
      color: #f59e0b;
    }

    .shortcuts-footer strong {
      color: #374151;
    }

    .shortcuts-footer .key-badge {
      margin: 0 2px;
      min-width: 24px;
      height: 24px;
      font-size: 0.75rem;
    }

    /* Scrollbar styling */
    .shortcuts-content::-webkit-scrollbar {
      width: 8px;
    }

    .shortcuts-content::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .shortcuts-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .shortcuts-content::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
  `]
})
export class KeyboardShortcutsModalComponent implements OnInit, OnDestroy {
  visible = false;
  shortcuts: KeyboardShortcut[] = [];
  categories: string[] = [];
  modDisplay = 'Ctrl';

  private eventListeners: (() => void)[] = [];

  constructor(private shortcutsService: KeyboardShortcutsService) {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    this.modDisplay = isMac ? 'Cmd' : 'Ctrl';
  }

  ngOnInit(): void {
    // Carrega todos os atalhos
    this.shortcuts = this.shortcutsService.getAllShortcuts();

    // Extrai categorias únicas
    this.categories = [...new Set(this.shortcuts.map(s => s.category))];

    // Listener para abrir modal
    const showListener = () => {
      this.visible = true;
    };
    window.addEventListener('show-keyboard-shortcuts', showListener);
    this.eventListeners.push(() => window.removeEventListener('show-keyboard-shortcuts', showListener));

    // Listener para fechar modals
    const closeListener = () => {
      this.visible = false;
    };
    window.addEventListener('close-all-modals', closeListener);
    this.eventListeners.push(() => window.removeEventListener('close-all-modals', closeListener));
  }

  ngOnDestroy(): void {
    this.eventListeners.forEach(cleanup => cleanup());
  }

  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => s.category === category);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'Navegação': 'pi pi-compass',
      'Ações': 'pi pi-bolt',
      'Busca': 'pi pi-search',
      'Ajuda': 'pi pi-question-circle'
    };
    return icons[category] || 'pi pi-circle';
  }

  parseDisplayKeys(displayKeys: string): string[] {
    // Divide as teclas por + ou →
    if (displayKeys.includes('→')) {
      return displayKeys.split('→').map(k => k.trim());
    } else if (displayKeys.includes('+')) {
      return displayKeys.split('+').map(k => k.trim());
    } else {
      return [displayKeys];
    }
  }
}
