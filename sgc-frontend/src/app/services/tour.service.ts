import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

interface TourDefinition {
  id: string;
  title: string;
  steps: Shepherd.Step.StepOptions[];
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private currentTour: Shepherd.Tour | null = null;
  private readonly STORAGE_KEY = 'sgc-completed-tours';

  private tours: Map<string, TourDefinition> = new Map([
    ['first-login', {
      id: 'first-login',
      title: 'Bem-vindo ao SGC',
      steps: [
        {
          id: 'welcome',
          text: '<h3>Bem-vindo ao SGC!</h3><p>Sistema de Gestão de Compliance. Vamos fazer um tour rápido pelas principais funcionalidades.</p>',
          attachTo: { element: '.navbar', on: 'bottom' },
          buttons: [
            {
              text: 'Pular',
              action: () => this.currentTour?.cancel(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'dashboard',
          text: '<h3>Dashboard</h3><p>Aqui você visualiza métricas importantes: obrigações em aberto, vencidas, taxa de compliance e muito mais.</p>',
          attachTo: { element: '.dashboard-cards', on: 'bottom' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'create-obligation',
          text: '<h3>Criar Obrigação</h3><p>Use este botão para criar uma nova obrigação de compliance. Você pode definir prazos, responsáveis e anexar normas.</p>',
          attachTo: { element: '.btn-new-obligation', on: 'left' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'normas-menu',
          text: '<h3>Gerenciar Normas</h3><p>Acesse o cadastro de normas regulatórias (LGPD, ISO, etc.) e associe-as às obrigações.</p>',
          attachTo: { element: '[routerlink="/normas"]', on: 'right' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'user-menu',
          text: '<h3>Perfil e Configurações</h3><p>Acesse seu perfil, preferências e faça logout por aqui.</p>',
          attachTo: { element: '.user-avatar', on: 'left' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'help',
          text: '<h3>Ajuda Sempre Disponível</h3><p>Clique no ícone de ajuda (?) para ver este tour novamente, acessar atalhos de teclado ou reportar problemas.</p>',
          attachTo: { element: '.help-button', on: 'left' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Concluir',
              action: () => this.currentTour?.complete()
            }
          ]
        }
      ]
    }],
    ['dashboard', {
      id: 'dashboard',
      title: 'Tour do Dashboard',
      steps: [
        {
          id: 'metrics',
          text: '<h3>Métricas de Compliance</h3><p>Cards com indicadores: Total de Obrigações, Em Aberto, Vencidas e Taxa de Compliance.</p>',
          attachTo: { element: '.dashboard-cards', on: 'bottom' },
          buttons: [
            {
              text: 'Pular',
              action: () => this.currentTour?.cancel(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'chart',
          text: '<h3>Gráfico de Status</h3><p>Visualização gráfica da distribuição de obrigações por status.</p>',
          attachTo: { element: '.chart-container', on: 'top' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'recent-obligations',
          text: '<h3>Obrigações Recentes</h3><p>Lista das obrigações mais recentes com ações rápidas.</p>',
          attachTo: { element: '.recent-obligations', on: 'top' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Concluir',
              action: () => this.currentTour?.complete()
            }
          ]
        }
      ]
    }],
    ['obrigacoes', {
      id: 'obrigacoes',
      title: 'Gerenciar Obrigações',
      steps: [
        {
          id: 'list',
          text: '<h3>Lista de Obrigações</h3><p>Visualize, filtre e ordene todas as obrigações cadastradas.</p>',
          attachTo: { element: '.obrigacoes-table', on: 'top' },
          buttons: [
            {
              text: 'Pular',
              action: () => this.currentTour?.cancel(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'filters',
          text: '<h3>Filtros</h3><p>Filtre por status, responsável, norma ou prazo para encontrar obrigações específicas.</p>',
          attachTo: { element: '.filters-panel', on: 'bottom' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'create',
          text: '<h3>Nova Obrigação</h3><p>Clique aqui para criar uma nova obrigação com título, descrição, prazo, responsável e normas associadas.</p>',
          attachTo: { element: '.btn-new-obligation', on: 'left' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Concluir',
              action: () => this.currentTour?.complete()
            }
          ]
        }
      ]
    }],
    ['evidencias', {
      id: 'evidencias',
      title: 'Adicionar Evidências',
      steps: [
        {
          id: 'types',
          text: '<h3>Tipos de Evidência</h3><p>Você pode adicionar 3 tipos de evidência: <b>ARQUIVO</b> (upload), <b>LINK</b> (URL externa) ou <b>TEXTO</b> (descrição).</p>',
          attachTo: { element: '.evidence-type-selector', on: 'bottom' },
          buttons: [
            {
              text: 'Pular',
              action: () => this.currentTour?.cancel(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'upload',
          text: '<h3>Upload de Arquivos</h3><p>Arraste e solte arquivos ou clique para selecionar. Formatos aceitos: PDF, DOCX, XLSX, imagens.</p>',
          attachTo: { element: '.file-upload-area', on: 'top' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Próximo',
              action: () => this.currentTour?.next()
            }
          ]
        },
        {
          id: 'validate',
          text: '<h3>Validação de Evidências</h3><p>Responsáveis podem validar ou rejeitar evidências enviadas, garantindo a qualidade do compliance.</p>',
          attachTo: { element: '.evidence-actions', on: 'left' },
          buttons: [
            {
              text: 'Anterior',
              action: () => this.currentTour?.back(),
              secondary: true
            },
            {
              text: 'Concluir',
              action: () => this.currentTour?.complete()
            }
          ]
        }
      ]
    }]
  ]);

  constructor() {}

  /**
   * Inicia um tour pelo ID
   */
  startTour(tourId: string): void {
    const tourDef = this.tours.get(tourId);
    if (!tourDef) {
      console.warn(`Tour "${tourId}" não encontrado`);
      return;
    }

    // Se já tem um tour ativo, cancela
    if (this.currentTour) {
      this.currentTour.cancel();
    }

    // Cria novo tour
    this.currentTour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'sgc-tour-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true
        },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 4
      }
    });

    // Adiciona steps
    tourDef.steps.forEach(step => {
      this.currentTour!.addStep(step);
    });

    // Eventos
    this.currentTour.on('complete', () => {
      this.markTourAsCompleted(tourId);
    });

    this.currentTour.on('cancel', () => {
      console.log(`Tour "${tourId}" cancelado`);
    });

    // Inicia o tour
    this.currentTour.start();
  }

  /**
   * Verifica se um tour já foi completado
   */
  isTourCompleted(tourId: string): boolean {
    const completed = this.getCompletedTours();
    return completed.includes(tourId);
  }

  /**
   * Marca um tour como completado
   */
  private markTourAsCompleted(tourId: string): void {
    const completed = this.getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completed));
    }
  }

  /**
   * Obtém lista de tours completados
   */
  getCompletedTours(): string[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Reseta tours completados (para debug)
   */
  resetCompletedTours(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Lista todos os tours disponíveis
   */
  getAvailableTours(): TourDefinition[] {
    return Array.from(this.tours.values());
  }
}
