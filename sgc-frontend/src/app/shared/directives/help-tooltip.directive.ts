import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { HELP_CONTENT, HelpContent } from '../constants/help-content';

@Directive({
  selector: '[appHelpTooltip]',
  standalone: true
})
export class HelpTooltipDirective implements OnInit, OnDestroy {
  @Input('appHelpTooltip') helpKey: string = '';
  @Input() helpPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() showIcon: boolean = true;

  private helpIcon: HTMLElement | null = null;
  private tooltip: HTMLElement | null = null;
  private helpContent: HelpContent | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Busca conteúdo de ajuda
    this.helpContent = HELP_CONTENT[this.helpKey] || null;

    if (!this.helpContent) {
      console.warn(`Help content not found for key: ${this.helpKey}`);
      return;
    }

    // Cria ícone de ajuda
    if (this.showIcon) {
      this.createHelpIcon();
    } else {
      // Se não mostra ícone, adiciona tooltip direto no elemento
      this.setupTooltipOnElement();
    }
  }

  ngOnDestroy(): void {
    this.removeTooltip();
    if (this.helpIcon && this.helpIcon.parentNode) {
      this.helpIcon.parentNode.removeChild(this.helpIcon);
    }
  }

  private createHelpIcon(): void {
    // Wrapper para alinhar ícone ao lado do elemento
    const wrapper = this.renderer.createElement('span');
    this.renderer.setStyle(wrapper, 'display', 'inline-flex');
    this.renderer.setStyle(wrapper, 'align-items', 'center');
    this.renderer.setStyle(wrapper, 'gap', '4px');

    // Move o elemento para dentro do wrapper
    const parent = this.el.nativeElement.parentNode;
    this.renderer.insertBefore(parent, wrapper, this.el.nativeElement);
    this.renderer.appendChild(wrapper, this.el.nativeElement);

    // Cria ícone de interrogação
    this.helpIcon = this.renderer.createElement('i');
    this.renderer.addClass(this.helpIcon, 'pi');
    this.renderer.addClass(this.helpIcon, 'pi-question-circle');
    this.renderer.addClass(this.helpIcon, 'help-tooltip-icon');
    this.renderer.setStyle(this.helpIcon, 'color', '#6366f1');
    this.renderer.setStyle(this.helpIcon, 'cursor', 'help');
    this.renderer.setStyle(this.helpIcon, 'fontSize', '0.875rem');

    // Adiciona ícone ao wrapper
    this.renderer.appendChild(wrapper, this.helpIcon);

    // Event listeners no ícone
    this.renderer.listen(this.helpIcon, 'mouseenter', () => this.showTooltip());
    this.renderer.listen(this.helpIcon, 'mouseleave', () => this.hideTooltip());
    this.renderer.listen(this.helpIcon, 'click', (e: Event) => this.showDetailedHelp(e));
  }

  private setupTooltipOnElement(): void {
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'help');
    this.renderer.listen(this.el.nativeElement, 'mouseenter', () => this.showTooltip());
    this.renderer.listen(this.el.nativeElement, 'mouseleave', () => this.hideTooltip());
  }

  private showTooltip(): void {
    if (!this.helpContent || this.tooltip) return;

    this.tooltip = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltip, 'help-tooltip');
    this.renderer.setProperty(this.tooltip, 'innerHTML', this.helpContent.short);

    // Estilos do tooltip
    this.renderer.setStyle(this.tooltip, 'position', 'absolute');
    this.renderer.setStyle(this.tooltip, 'background', '#1f2937');
    this.renderer.setStyle(this.tooltip, 'color', 'white');
    this.renderer.setStyle(this.tooltip, 'padding', '8px 12px');
    this.renderer.setStyle(this.tooltip, 'border-radius', '6px');
    this.renderer.setStyle(this.tooltip, 'font-size', '0.875rem');
    this.renderer.setStyle(this.tooltip, 'max-width', '250px');
    this.renderer.setStyle(this.tooltip, 'z-index', '9999');
    this.renderer.setStyle(this.tooltip, 'box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
    this.renderer.setStyle(this.tooltip, 'pointer-events', 'none');

    // Adiciona ao body
    this.renderer.appendChild(document.body, this.tooltip);

    // Posiciona tooltip
    this.positionTooltip();
  }

  private positionTooltip(): void {
    if (!this.tooltip) return;

    const targetElement = this.helpIcon || this.el.nativeElement;
    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.helpPosition) {
      case 'top':
        top = rect.top + window.scrollY - tooltipRect.height - 8;
        left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + window.scrollY + 8;
        left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left + window.scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = rect.top + window.scrollY + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + window.scrollX + 8;
        break;
    }

    this.renderer.setStyle(this.tooltip, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left}px`);
  }

  private hideTooltip(): void {
    this.removeTooltip();
  }

  private removeTooltip(): void {
    if (this.tooltip && this.tooltip.parentNode) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }

  private showDetailedHelp(event: Event): void {
    event.stopPropagation();

    if (!this.helpContent) return;

    // Cria modal com ajuda detalhada
    const modal = this.renderer.createElement('div');
    this.renderer.addClass(modal, 'help-modal-overlay');
    this.renderer.setStyle(modal, 'position', 'fixed');
    this.renderer.setStyle(modal, 'top', '0');
    this.renderer.setStyle(modal, 'left', '0');
    this.renderer.setStyle(modal, 'width', '100%');
    this.renderer.setStyle(modal, 'height', '100%');
    this.renderer.setStyle(modal, 'background', 'rgba(0, 0, 0, 0.5)');
    this.renderer.setStyle(modal, 'display', 'flex');
    this.renderer.setStyle(modal, 'align-items', 'center');
    this.renderer.setStyle(modal, 'justify-content', 'center');
    this.renderer.setStyle(modal, 'z-index', '10000');

    const modalContent = this.renderer.createElement('div');
    this.renderer.setStyle(modalContent, 'background', 'white');
    this.renderer.setStyle(modalContent, 'padding', '24px');
    this.renderer.setStyle(modalContent, 'border-radius', '8px');
    this.renderer.setStyle(modalContent, 'max-width', '500px');
    this.renderer.setStyle(modalContent, 'box-shadow', '0 20px 25px rgba(0,0,0,0.15)');

    const title = this.renderer.createElement('h3');
    this.renderer.setProperty(title, 'innerHTML', '❓ Ajuda');
    this.renderer.setStyle(title, 'margin-top', '0');
    this.renderer.setStyle(title, 'color', '#1f2937');

    const content = this.renderer.createElement('div');
    this.renderer.setProperty(content, 'innerHTML', this.helpContent.long);
    this.renderer.setStyle(content, 'margin', '16px 0');
    this.renderer.setStyle(content, 'line-height', '1.6');
    this.renderer.setStyle(content, 'color', '#4b5563');

    const closeBtn = this.renderer.createElement('button');
    this.renderer.setProperty(closeBtn, 'innerHTML', 'Fechar');
    this.renderer.setStyle(closeBtn, 'background', '#6366f1');
    this.renderer.setStyle(closeBtn, 'color', 'white');
    this.renderer.setStyle(closeBtn, 'border', 'none');
    this.renderer.setStyle(closeBtn, 'padding', '8px 16px');
    this.renderer.setStyle(closeBtn, 'border-radius', '6px');
    this.renderer.setStyle(closeBtn, 'cursor', 'pointer');
    this.renderer.setStyle(closeBtn, 'margin-top', '16px');

    this.renderer.listen(closeBtn, 'click', () => {
      this.renderer.removeChild(document.body, modal);
    });

    this.renderer.listen(modal, 'click', (e: Event) => {
      if (e.target === modal) {
        this.renderer.removeChild(document.body, modal);
      }
    });

    this.renderer.appendChild(modalContent, title);
    this.renderer.appendChild(modalContent, content);
    this.renderer.appendChild(modalContent, closeBtn);
    this.renderer.appendChild(modal, modalContent);
    this.renderer.appendChild(document.body, modal);
  }
}
