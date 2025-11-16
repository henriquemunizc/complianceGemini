import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
  actionLabel?: string;
}

@Component({
  selector: 'app-onboarding-checklist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    CheckboxModule
  ],
  template: `
    <div class="onboarding-checklist" *ngIf="visible && !dismissed">
      <div class="checklist-card" [class.minimized]="minimized">
        <!-- Header -->
        <div class="checklist-header" (click)="toggleMinimize()">
          <div class="header-content">
            <i class="pi pi-check-circle header-icon"></i>
            <div class="header-text">
              <h3>Bem-vindo ao SGC!</h3>
              <p *ngIf="!minimized">Complete estas tarefas para começar</p>
            </div>
          </div>
          <div class="header-actions">
            <span class="progress-text">{{ completedCount }}/{{ totalCount }}</span>
            <button
              class="icon-btn"
              (click)="toggleMinimize(); $event.stopPropagation()"
              [title]="minimized ? 'Expandir' : 'Minimizar'"
            >
              <i [class]="minimized ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
            </button>
            <button
              class="icon-btn"
              (click)="dismiss(); $event.stopPropagation()"
              title="Dispensar"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="checklist-body" *ngIf="!minimized">
          <!-- Progress Bar -->
          <div class="progress-section">
            <p-progressBar
              [value]="progress"
              [showValue]="false"
              styleClass="custom-progress"
            ></p-progressBar>
            <span class="progress-label">{{ progress }}% concluído</span>
          </div>

          <!-- Checklist Items -->
          <div class="checklist-items">
            <div
              *ngFor="let item of checklistItems"
              class="checklist-item"
              [class.completed]="item.completed"
            >
              <div class="item-checkbox">
                <p-checkbox
                  [(ngModel)]="item.completed"
                  [binary]="true"
                  (onChange)="onItemToggle(item)"
                  [inputId]="item.id"
                ></p-checkbox>
              </div>

              <div class="item-content">
                <label [for]="item.id" class="item-title">
                  {{ item.title }}
                  <i *ngIf="item.completed" class="pi pi-check completion-icon"></i>
                </label>
                <p class="item-description">{{ item.description }}</p>

                <button
                  *ngIf="item.action && !item.completed"
                  pButton
                  type="button"
                  [label]="item.actionLabel || 'Começar'"
                  class="p-button-sm p-button-text"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  (click)="item.action()"
                ></button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="checklist-footer" *ngIf="progress === 100">
            <div class="completion-message">
              <i class="pi pi-trophy"></i>
              <div>
                <strong>Parabéns!</strong>
                <p>Você completou todas as tarefas de onboarding!</p>
              </div>
            </div>
            <button
              pButton
              type="button"
              label="Finalizar"
              class="p-button-success"
              (click)="completeOnboarding()"
            ></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .onboarding-checklist {
      position: fixed;
      bottom: 100px;
      right: 24px;
      z-index: 999;
      max-width: 420px;
      width: calc(100vw - 48px);
    }

    .checklist-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .checklist-card.minimized {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .checklist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      cursor: pointer;
      user-select: none;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .header-icon {
      font-size: 1.75rem;
    }

    .header-text h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .header-text p {
      margin: 4px 0 0 0;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-text {
      font-weight: 600;
      font-size: 0.875rem;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
    }

    .icon-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 6px;
      border-radius: 4px;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .icon-btn i {
      font-size: 1.125rem;
    }

    .checklist-body {
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;
    }

    .progress-section {
      margin-bottom: 20px;
    }

    :host ::ng-deep .custom-progress {
      height: 8px;
      border-radius: 4px;

      .p-progressbar-value {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
    }

    .progress-label {
      display: block;
      text-align: right;
      font-size: 0.813rem;
      color: #6b7280;
      margin-top: 4px;
    }

    .checklist-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .checklist-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .checklist-item:hover {
      border-color: #c7d2fe;
      background: #f9fafb;
    }

    .checklist-item.completed {
      opacity: 0.7;
      background: #f0fdf4;
      border-color: #86efac;
    }

    .item-checkbox {
      padding-top: 2px;
    }

    .item-content {
      flex: 1;
    }

    .item-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.938rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 4px;
      cursor: pointer;
    }

    .completion-icon {
      color: #10b981;
      font-size: 0.875rem;
    }

    .item-description {
      margin: 0 0 8px 0;
      font-size: 0.813rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .checklist-footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .completion-message {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fef3c7;
      border-radius: 8px;
      border-left: 4px solid #f59e0b;
    }

    .completion-message i {
      font-size: 2rem;
      color: #f59e0b;
    }

    .completion-message strong {
      display: block;
      font-size: 0.938rem;
      color: #92400e;
      margin-bottom: 2px;
    }

    .completion-message p {
      margin: 0;
      font-size: 0.813rem;
      color: #78350f;
    }

    /* Scrollbar */
    .checklist-body::-webkit-scrollbar {
      width: 6px;
    }

    .checklist-body::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .checklist-body::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    @media (max-width: 768px) {
      .onboarding-checklist {
        bottom: 80px;
        right: 16px;
        left: 16px;
        max-width: none;
        width: auto;
      }
    }
  `]
})
export class OnboardingChecklistComponent implements OnInit {
  visible = false;
  minimized = false;
  dismissed = false;

  checklistItems: ChecklistItem[] = [
    {
      id: 'complete-profile',
      title: 'Complete seu perfil',
      description: 'Adicione informações básicas e preferências do sistema',
      completed: false,
      action: () => this.goToProfile(),
      actionLabel: 'Ir para Perfil'
    },
    {
      id: 'create-obligation',
      title: 'Crie sua primeira obrigação',
      description: 'Aprenda a cadastrar obrigações de compliance',
      completed: false,
      action: () => this.createObligation(),
      actionLabel: 'Criar Obrigação'
    },
    {
      id: 'add-evidence',
      title: 'Adicione uma evidência',
      description: 'Anexe documentos, links ou textos como evidência',
      completed: false,
      action: () => this.goToObligations(),
      actionLabel: 'Ver Obrigações'
    },
    {
      id: 'explore-dashboard',
      title: 'Explore o dashboard',
      description: 'Conheça as métricas e indicadores de compliance',
      completed: false,
      action: () => this.goToDashboard(),
      actionLabel: 'Ir para Dashboard'
    }
  ];

  private readonly STORAGE_KEY = 'sgc-onboarding-checklist';
  private readonly DISMISSED_KEY = 'sgc-onboarding-dismissed';

  ngOnInit(): void {
    // Carrega estado do localStorage
    this.loadState();

    // Mostra checklist após 2 segundos (se não foi dispensado)
    setTimeout(() => {
      if (!this.dismissed && !this.isOnboardingComplete()) {
        this.visible = true;
      }
    }, 2000);
  }

  get completedCount(): number {
    return this.checklistItems.filter(item => item.completed).length;
  }

  get totalCount(): number {
    return this.checklistItems.length;
  }

  get progress(): number {
    return Math.round((this.completedCount / this.totalCount) * 100);
  }

  toggleMinimize(): void {
    this.minimized = !this.minimized;
  }

  dismiss(): void {
    this.visible = false;
    this.dismissed = true;
    localStorage.setItem(this.DISMISSED_KEY, 'true');
  }

  onItemToggle(item: ChecklistItem): void {
    this.saveState();
  }

  completeOnboarding(): void {
    localStorage.setItem('sgc-onboarding-completed', 'true');
    this.visible = false;
    this.dismissed = true;

    // Dispara evento de conclusão
    window.dispatchEvent(new CustomEvent('onboarding-completed'));
  }

  isOnboardingComplete(): boolean {
    return localStorage.getItem('sgc-onboarding-completed') === 'true';
  }

  private loadState(): void {
    // Carrega itens completados
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const completedIds = JSON.parse(stored) as string[];
      this.checklistItems.forEach(item => {
        if (completedIds.includes(item.id)) {
          item.completed = true;
        }
      });
    }

    // Carrega estado de dispensado
    this.dismissed = localStorage.getItem(this.DISMISSED_KEY) === 'true';
  }

  private saveState(): void {
    const completedIds = this.checklistItems
      .filter(item => item.completed)
      .map(item => item.id);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(completedIds));
  }

  // Ações dos botões
  private goToProfile(): void {
    window.dispatchEvent(new CustomEvent('navigate-to-profile'));
  }

  private createObligation(): void {
    window.dispatchEvent(new CustomEvent('create-new-obligation'));
  }

  private goToObligations(): void {
    window.location.href = '/obrigacoes';
  }

  private goToDashboard(): void {
    window.location.href = '/dashboard';
  }
}
