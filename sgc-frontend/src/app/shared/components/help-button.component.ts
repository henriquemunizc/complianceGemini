import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-help-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <div class="help-button-wrapper">
      <button
        pButton
        type="button"
        icon="pi pi-question-circle"
        class="p-button-rounded p-button-help help-button"
        [pTooltip]="'Ajuda e Suporte'"
        tooltipPosition="left"
        (click)="menu.toggle($event)"
      ></button>

      <p-menu
        #menu
        [model]="menuItems"
        [popup]="true"
        appendTo="body"
        styleClass="help-menu"
      ></p-menu>
    </div>
  `,
  styles: [`
    .help-button-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
    }

    :host ::ng-deep .help-button {
      width: 56px;
      height: 56px;
      font-size: 1.5rem;
      background: #6366f1;
      border-color: #6366f1;
      box-shadow: 0 4px 6px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
    }

    :host ::ng-deep .help-button:hover {
      background: #4f46e5;
      border-color: #4f46e5;
      box-shadow: 0 6px 12px rgba(99, 102, 241, 0.5), 0 4px 8px rgba(0, 0, 0, 0.1);
      transform: scale(1.05);
    }

    :host ::ng-deep .help-button:active {
      transform: scale(0.95);
    }

    :host ::ng-deep .help-menu {
      min-width: 250px;
    }

    :host ::ng-deep .help-menu .p-menuitem-icon {
      color: #6366f1;
    }

    :host ::ng-deep .help-menu .p-menuitem-text {
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .help-button-wrapper {
        bottom: 16px;
        right: 16px;
      }

      :host ::ng-deep .help-button {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
      }
    }
  `]
})
export class HelpButtonComponent {
  menuItems: MenuItem[];

  constructor(private tourService: TourService) {
    this.menuItems = [
      {
        label: 'Ver Tour Novamente',
        icon: 'pi pi-play-circle',
        command: () => this.startTour()
      },
      {
        separator: true
      },
      {
        label: 'Atalhos de Teclado',
        icon: 'pi pi-keyboard',
        command: () => this.showKeyboardShortcuts()
      },
      {
        label: 'Central de Ajuda',
        icon: 'pi pi-book',
        command: () => this.openHelpCenter()
      },
      {
        separator: true
      },
      {
        label: 'Documentação',
        icon: 'pi pi-file-pdf',
        url: '/assets/docs/manual-usuario.pdf',
        target: '_blank'
      },
      {
        label: 'Vídeos Tutoriais',
        icon: 'pi pi-youtube',
        command: () => this.showVideoTutorials()
      },
      {
        separator: true
      },
      {
        label: 'Reportar Problema',
        icon: 'pi pi-exclamation-triangle',
        command: () => this.reportIssue()
      },
      {
        label: 'Enviar Feedback',
        icon: 'pi pi-comment',
        command: () => this.sendFeedback()
      }
    ];
  }

  startTour(): void {
    // Verifica se está na primeira vez ou reinicia tour
    const currentPath = window.location.pathname;

    if (currentPath.includes('/dashboard')) {
      this.tourService.startTour('dashboard');
    } else if (currentPath.includes('/obrigacoes')) {
      this.tourService.startTour('obrigacoes');
    } else {
      this.tourService.startTour('first-login');
    }
  }

  showKeyboardShortcuts(): void {
    // Dispara evento customizado para abrir modal de atalhos
    window.dispatchEvent(new CustomEvent('show-keyboard-shortcuts'));
  }

  openHelpCenter(): void {
    // Dispara evento customizado para abrir painel de ajuda
    window.dispatchEvent(new CustomEvent('open-help-center'));
  }

  showVideoTutorials(): void {
    // Dispara evento customizado para abrir vídeos tutoriais
    window.dispatchEvent(new CustomEvent('show-video-tutorials'));
  }

  reportIssue(): void {
    // Dispara evento customizado para abrir formulário de bug report
    window.dispatchEvent(new CustomEvent('report-issue'));
  }

  sendFeedback(): void {
    // Dispara evento customizado para abrir formulário de feedback
    window.dispatchEvent(new CustomEvent('send-feedback'));
  }
}
