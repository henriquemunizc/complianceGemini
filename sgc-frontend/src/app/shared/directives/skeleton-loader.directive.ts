/**
 * SkeletonLoaderDirective
 *
 * Diretiva para exibir skeleton loading no lugar do conteúdo real
 *
 * @example
 * <div [appSkeletonLoader]="carregando">
 *   <p>Conteúdo real aqui</p>
 * </div>
 */

import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSkeletonLoader]',
  standalone: true
})
export class SkeletonLoaderDirective implements OnChanges {
  @Input() appSkeletonLoader: boolean = false;

  /** Altura do skeleton (padrão: auto) */
  @Input() skeletonHeight?: string;

  /** Largura do skeleton (padrão: 100%) */
  @Input() skeletonWidth: string = '100%';

  /** Tipo de skeleton: text, circle, rectangle */
  @Input() skeletonType: 'text' | 'circle' | 'rectangle' = 'rectangle';

  /** Número de linhas (para tipo text) */
  @Input() skeletonLines: number = 1;

  private originalContent?: string;
  private skeletonContainer?: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSkeletonLoader']) {
      if (this.appSkeletonLoader) {
        this.showSkeleton();
      } else {
        this.hideSkeleton();
      }
    }
  }

  private showSkeleton(): void {
    // Salvar conteúdo original
    if (!this.originalContent) {
      this.originalContent = this.el.nativeElement.innerHTML;
    }

    // Criar container do skeleton
    this.skeletonContainer = this.renderer.createElement('div');
    this.renderer.addClass(this.skeletonContainer, 'skeleton-loader');
    this.renderer.addClass(this.skeletonContainer, `skeleton-loader--${this.skeletonType}`);

    // Aplicar estilos
    if (this.skeletonHeight) {
      this.renderer.setStyle(this.skeletonContainer, 'height', this.skeletonHeight);
    }
    this.renderer.setStyle(this.skeletonContainer, 'width', this.skeletonWidth);

    // Criar linhas para tipo text
    if (this.skeletonType === 'text') {
      for (let i = 0; i < this.skeletonLines; i++) {
        const line = this.renderer.createElement('div');
        this.renderer.addClass(line, 'skeleton-line');

        // Última linha com largura reduzida
        if (i === this.skeletonLines - 1 && this.skeletonLines > 1) {
          this.renderer.setStyle(line, 'width', '80%');
        }

        this.renderer.appendChild(this.skeletonContainer, line);
      }
    }

    // Limpar conteúdo e adicionar skeleton
    this.el.nativeElement.innerHTML = '';
    this.renderer.appendChild(this.el.nativeElement, this.skeletonContainer);

    // Adicionar estilos CSS
    this.injectStyles();
  }

  private hideSkeleton(): void {
    if (this.originalContent) {
      this.el.nativeElement.innerHTML = this.originalContent;
      this.originalContent = undefined;
      this.skeletonContainer = undefined;
    }
  }

  private injectStyles(): void {
    // Verifica se os estilos já foram injetados
    if (document.getElementById('skeleton-loader-styles')) {
      return;
    }

    const style = this.renderer.createElement('style');
    this.renderer.setAttribute(style, 'id', 'skeleton-loader-styles');

    const css = `
      .skeleton-loader {
        background: linear-gradient(
          90deg,
          var(--color-neutral-100) 25%,
          var(--color-neutral-200) 50%,
          var(--color-neutral-100) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease-in-out infinite;
        border-radius: var(--radius-sm);
      }

      .skeleton-loader--rectangle {
        min-height: 60px;
      }

      .skeleton-loader--circle {
        border-radius: var(--radius-full);
        width: 60px;
        height: 60px;
      }

      .skeleton-loader--text {
        padding: 0;
        background: transparent;
      }

      .skeleton-line {
        height: 1em;
        background: linear-gradient(
          90deg,
          var(--color-neutral-100) 25%,
          var(--color-neutral-200) 50%,
          var(--color-neutral-100) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s ease-in-out infinite;
        border-radius: var(--radius-xs);
        margin-bottom: var(--spacing-sm);
      }

      .skeleton-line:last-child {
        margin-bottom: 0;
      }

      @keyframes skeleton-loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `;

    this.renderer.appendChild(style, this.renderer.createText(css));
    this.renderer.appendChild(document.head, style);
  }
}
