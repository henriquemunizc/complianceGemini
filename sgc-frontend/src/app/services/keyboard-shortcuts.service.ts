import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: 'Navegação' | 'Ações' | 'Busca' | 'Ajuda';
  action: () => void;
  displayKeys?: string; // Para exibição visual (ex: "Ctrl+K" ou "Cmd+K")
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardShortcutsService implements OnDestroy {
  private shortcuts: KeyboardShortcut[] = [];
  private pressedKeys = new Set<string>();
  private sequenceKeys: string[] = [];
  private sequenceTimeout: any;
  private globalListener: ((e: KeyboardEvent) => void) | null = null;

  constructor(private router: Router) {
    this.registerDefaultShortcuts();
    this.setupGlobalListener();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private registerDefaultShortcuts(): void {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const modKey = isMac ? 'Meta' : 'Control';
    const modDisplay = isMac ? 'Cmd' : 'Ctrl';

    // BUSCA
    this.registerShortcut({
      keys: [modKey, 'k'],
      description: 'Abrir busca global',
      category: 'Busca',
      displayKeys: `${modDisplay}+K`,
      action: () => this.openGlobalSearch()
    });

    // NAVEGAÇÃO
    this.registerShortcut({
      keys: [modKey, 'h'],
      description: 'Ir para Dashboard',
      category: 'Navegação',
      displayKeys: `${modDisplay}+H`,
      action: () => this.router.navigate(['/dashboard'])
    });

    this.registerShortcut({
      keys: ['g', 'd'],
      description: 'Go to Dashboard',
      category: 'Navegação',
      displayKeys: 'G → D',
      action: () => this.router.navigate(['/dashboard'])
    });

    this.registerShortcut({
      keys: ['g', 'n'],
      description: 'Go to Normas',
      category: 'Navegação',
      displayKeys: 'G → N',
      action: () => this.router.navigate(['/normas'])
    });

    this.registerShortcut({
      keys: ['g', 'o'],
      description: 'Go to Obrigações',
      category: 'Navegação',
      displayKeys: 'G → O',
      action: () => this.router.navigate(['/obrigacoes'])
    });

    // AÇÕES
    this.registerShortcut({
      keys: [modKey, 'n'],
      description: 'Nova obrigação (se tiver permissão)',
      category: 'Ações',
      displayKeys: `${modDisplay}+N`,
      action: () => this.createNewObligation()
    });

    // AJUDA
    this.registerShortcut({
      keys: ['?'],
      description: 'Mostrar todos os atalhos',
      category: 'Ajuda',
      displayKeys: '?',
      action: () => this.showShortcutsHelp()
    });

    this.registerShortcut({
      keys: [modKey, '/'],
      description: 'Mostrar todos os atalhos',
      category: 'Ajuda',
      displayKeys: `${modDisplay}+/`,
      action: () => this.showShortcutsHelp()
    });

    // ESC
    this.registerShortcut({
      keys: ['Escape'],
      description: 'Fechar modals/overlays',
      category: 'Navegação',
      displayKeys: 'Esc',
      action: () => this.closeModals()
    });
  }

  private setupGlobalListener(): void {
    this.globalListener = (e: KeyboardEvent) => {
      // Ignora se estiver em input/textarea (exceto atalhos específicos)
      const target = e.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // Sempre permite Escape
      if (e.key === 'Escape') {
        this.handleKeyPress(e);
        return;
      }

      // Permite Ctrl/Cmd+K mesmo em inputs
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        this.handleKeyPress(e);
        return;
      }

      // Ignora outros atalhos em campos de input
      if (isInputField && !e.ctrlKey && !e.metaKey) {
        return;
      }

      this.handleKeyPress(e);
    };

    window.addEventListener('keydown', this.globalListener);
  }

  private handleKeyPress(e: KeyboardEvent): void {
    const key = e.key;
    const hasModifier = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;

    // Se for uma sequência (sem modificadores)
    if (!hasModifier && key.length === 1) {
      this.sequenceKeys.push(key.toLowerCase());

      // Limpa timeout anterior
      if (this.sequenceTimeout) {
        clearTimeout(this.sequenceTimeout);
      }

      // Define timeout para resetar sequência
      this.sequenceTimeout = setTimeout(() => {
        this.sequenceKeys = [];
      }, 1000);

      // Verifica se algum atalho de sequência foi ativado
      this.checkSequenceShortcuts();
    } else {
      // Atalho com modificador
      this.checkModifierShortcuts(e);
    }
  }

  private checkSequenceShortcuts(): void {
    for (const shortcut of this.shortcuts) {
      // Apenas atalhos de sequência (sem modificadores)
      if (shortcut.keys.length > 1 && !this.isModifierKey(shortcut.keys[0])) {
        const sequenceMatch = shortcut.keys.every((key, index) =>
          this.sequenceKeys[index]?.toLowerCase() === key.toLowerCase()
        );

        if (sequenceMatch && this.sequenceKeys.length === shortcut.keys.length) {
          shortcut.action();
          this.sequenceKeys = [];
          if (this.sequenceTimeout) {
            clearTimeout(this.sequenceTimeout);
          }
          break;
        }
      }
    }
  }

  private checkModifierShortcuts(e: KeyboardEvent): void {
    for (const shortcut of this.shortcuts) {
      const hasModifier = this.isModifierKey(shortcut.keys[0]);

      if (hasModifier) {
        const modifier = shortcut.keys[0];
        const key = shortcut.keys[1]?.toLowerCase();

        const modifierPressed =
          (modifier === 'Control' && e.ctrlKey) ||
          (modifier === 'Meta' && e.metaKey) ||
          (modifier === 'Shift' && e.shiftKey) ||
          (modifier === 'Alt' && e.altKey);

        if (modifierPressed && e.key.toLowerCase() === key) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      } else if (shortcut.keys.length === 1 && e.key === shortcut.keys[0]) {
        // Atalho de tecla única (como ?)
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }

  private isModifierKey(key: string): boolean {
    return ['Control', 'Meta', 'Shift', 'Alt'].includes(key);
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  unregisterShortcut(keys: string[]): void {
    this.shortcuts = this.shortcuts.filter(s =>
      JSON.stringify(s.keys) !== JSON.stringify(keys)
    );
  }

  getAllShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }

  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return this.shortcuts.filter(s => s.category === category);
  }

  showShortcutsHelp(): void {
    window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts'));
  }

  private openGlobalSearch(): void {
    window.dispatchEvent(new CustomEvent('open-global-search'));
  }

  private createNewObligation(): void {
    // TODO: Verificar permissões antes
    window.dispatchEvent(new CustomEvent('create-new-obligation'));
  }

  private closeModals(): void {
    window.dispatchEvent(new CustomEvent('close-all-modals'));
  }

  private cleanup(): void {
    if (this.globalListener) {
      window.removeEventListener('keydown', this.globalListener);
    }
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
    }
  }
}
