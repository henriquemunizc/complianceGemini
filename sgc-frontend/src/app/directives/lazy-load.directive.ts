import { Directive, ElementRef, OnInit, OnDestroy, Input, Renderer2 } from '@angular/core';

/**
 * Diretiva para Lazy Loading de Imagens usando IntersectionObserver API.
 *
 * Uso: <img [appLazyLoad]="imageUrl" alt="description">
 *
 * Performance: Carrega imagens apenas quando entram no viewport
 * Acessibilidade: Mantém atributos alt e aria
 *
 * @author Performance & Accessibility Team
 * @version 1.0
 */
@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Input('appLazyLoad') targetSource: string = '';
  @Input() placeholderSrc: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ECarregando...%3C/text%3E%3C/svg%3E';

  private observer?: IntersectionObserver;
  private isLoaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Define placeholder inicial com blur
    this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholderSrc);
    this.renderer.setStyle(this.el.nativeElement, 'filter', 'blur(5px)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'filter 0.3s ease-in-out');

    // Acessibilidade: marca como carregando
    this.renderer.setAttribute(this.el.nativeElement, 'aria-busy', 'true');

    // Cria IntersectionObserver
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => this.onIntersection(entries),
        {
          rootMargin: '50px', // Carrega 50px antes de entrar no viewport
          threshold: 0.01
        }
      );
      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback para navegadores antigos
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private onIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach(entry => {
      if (entry.isIntersecting && !this.isLoaded) {
        this.loadImage();
        if (this.observer) {
          this.observer.unobserve(this.el.nativeElement);
        }
      }
    });
  }

  private loadImage(): void {
    const img = new Image();

    img.onload = () => {
      // Remove blur e carrega imagem real
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.targetSource);
      this.renderer.setStyle(this.el.nativeElement, 'filter', 'blur(0)');

      // Acessibilidade: marca como carregada
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-busy');

      this.isLoaded = true;
    };

    img.onerror = () => {
      // Fallback em caso de erro
      console.warn(`Erro ao carregar imagem: ${this.targetSource}`);
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholderSrc);
      this.renderer.setStyle(this.el.nativeElement, 'filter', 'blur(0)');
      this.renderer.removeAttribute(this.el.nativeElement, 'aria-busy');
    };

    img.src = this.targetSource;
  }
}
