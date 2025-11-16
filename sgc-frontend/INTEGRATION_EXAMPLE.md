# Exemplo de Integração - Sistema de Onboarding e Help

## 1. Integração no AppComponent (app.component.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Importar componentes de Help e Onboarding
import { HelpButtonComponent } from './shared/components/help-button.component';
import { ContextualHelpComponent } from './shared/components/contextual-help.component';
import { KeyboardShortcutsModalComponent } from './shared/components/keyboard-shortcuts-modal.component';
import { OnboardingChecklistComponent } from './shared/components/onboarding-checklist.component';
import { FeedbackDialogComponent } from './shared/components/feedback-dialog.component';

// Importar services
import { TourService } from './services/tour.service';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    HelpButtonComponent,
    ContextualHelpComponent,
    KeyboardShortcutsModalComponent,
    OnboardingChecklistComponent,
    FeedbackDialogComponent
  ],
  providers: [MessageService],
  template: `
    <router-outlet></router-outlet>

    <!-- Componentes de Help e Onboarding (sempre visíveis) -->
    <app-help-button></app-help-button>
    <app-contextual-help></app-contextual-help>
    <app-keyboard-shortcuts-modal></app-keyboard-shortcuts-modal>
    <app-onboarding-checklist></app-onboarding-checklist>
    <app-feedback-dialog></app-feedback-dialog>

    <!-- Toast para mensagens -->
    <p-toast></p-toast>
  `
})
export class AppComponent implements OnInit {

  constructor(
    private tourService: TourService,
    private keyboardShortcutsService: KeyboardShortcutsService
  ) {}

  ngOnInit(): void {
    // Inicializa atalhos de teclado
    // O serviço já registra os atalhos globalmente no construtor

    // Verifica se é primeiro login
    this.checkFirstLogin();
  }

  private checkFirstLogin(): void {
    const hasSeenFirstLoginTour = this.tourService.isTourCompleted('first-login');

    if (!hasSeenFirstLoginTour) {
      // Aguarda 2 segundos após carregar a página
      setTimeout(() => {
        this.tourService.startTour('first-login');
      }, 2000);
    }
  }
}
```

## 2. Uso da HelpTooltipDirective em Formulários

```typescript
// obrigacao-form.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { HelpTooltipDirective } from '../../shared/directives/help-tooltip.directive';

@Component({
  selector: 'app-obrigacao-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    HelpTooltipDirective  // Importa a diretiva
  ],
  template: `
    <div class="form-field">
      <label for="titulo" appHelpTooltip="obrigacao-titulo">
        Título *
      </label>
      <input id="titulo" type="text" pInputText [(ngModel)]="obrigacao.titulo" />
    </div>

    <div class="form-field">
      <label for="prazo" appHelpTooltip="obrigacao-prazo">
        Prazo *
      </label>
      <p-calendar id="prazo" [(ngModel)]="obrigacao.prazo" dateFormat="dd/mm/yy"></p-calendar>
    </div>

    <div class="form-field">
      <label for="status" appHelpTooltip="obrigacao-status">
        Status
      </label>
      <select id="status" [(ngModel)]="obrigacao.status">
        <option value="PENDENTE">Pendente</option>
        <option value="EM_ANDAMENTO">Em Andamento</option>
        <option value="CONCLUIDA">Concluída</option>
      </select>
    </div>
  `
})
export class ObrigacaoFormComponent {
  obrigacao: any = {};
}
```

## 3. Adicionar Classes CSS para Shepherd.js Tours

Adicione ao arquivo `src/styles.css` ou `src/styles.scss`:

```css
/* Estilos para Shepherd.js Tours */
.sgc-tour-step .shepherd-content {
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.sgc-tour-step .shepherd-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 8px 8px 0 0;
}

.sgc-tour-step .shepherd-text {
  padding: 20px;
  font-size: 0.938rem;
  line-height: 1.6;
  color: #374151;
}

.sgc-tour-step .shepherd-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
}

.sgc-tour-step .shepherd-button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.sgc-tour-step .shepherd-button:hover {
  background: #4f46e5;
}

.sgc-tour-step .shepherd-button.shepherd-button-secondary {
  background: #e5e7eb;
  color: #4b5563;
}

.sgc-tour-step .shepherd-button.shepherd-button-secondary:hover {
  background: #d1d5db;
}

/* Backdrop overlay */
.shepherd-modal-overlay-container {
  background: rgba(0, 0, 0, 0.5);
}
```

## 4. Inicializar Tours em Páginas Específicas

```typescript
// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { TourService } from '../../services/tour.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h1>Dashboard de Compliance</h1>

      <div class="dashboard-cards">
        <!-- Cards de métricas -->
      </div>

      <div class="chart-container">
        <!-- Gráfico -->
      </div>

      <div class="recent-obligations">
        <!-- Obrigações recentes -->
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    // Se usuário nunca viu o tour do dashboard, mostra após 1 segundo
    if (!this.tourService.isTourCompleted('dashboard')) {
      setTimeout(() => {
        this.tourService.startTour('dashboard');
      }, 1000);
    }
  }
}
```

## 5. Consumir API de UserPreferences no Frontend

```typescript
// user-preferences.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface UserPreferences {
  preferenceId: number;
  usuarioId: number;
  toursCompleted: string[];
  onboardingCompleted: boolean;
  checklistItems: { [key: string]: boolean };
  theme: string;
  language: string;
  customSettings: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private apiUrl = '/api/v1/preferences';

  constructor(private http: HttpClient) {}

  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(this.apiUrl);
  }

  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(this.apiUrl, preferences);
  }

  addCompletedTour(tourId: string): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.apiUrl}/tours/${tourId}`, {});
  }

  updateChecklistItem(itemId: string, completed: boolean): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(
      `${this.apiUrl}/checklist/${itemId}?completed=${completed}`,
      {}
    );
  }

  completeOnboarding(): Observable<UserPreferences> {
    return this.http.post<UserPreferences>(`${this.apiUrl}/onboarding/complete`, {});
  }
}
```

## 6. Estrutura Final de Arquivos

```
sgc-frontend/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   ├── tour.service.ts                    ✅ CRIADO
│   │   │   ├── keyboard-shortcuts.service.ts      ✅ CRIADO
│   │   │   └── user-preferences.service.ts        📝 EXEMPLO ACIMA
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── help-button.component.ts               ✅ CRIADO
│   │   │   │   ├── contextual-help.component.ts           ✅ CRIADO
│   │   │   │   ├── keyboard-shortcuts-modal.component.ts  ✅ CRIADO
│   │   │   │   ├── onboarding-checklist.component.ts      ✅ CRIADO
│   │   │   │   └── feedback-dialog.component.ts           ✅ CRIADO
│   │   │   ├── directives/
│   │   │   │   └── help-tooltip.directive.ts              ✅ CRIADO
│   │   │   └── constants/
│   │   │       └── help-content.ts                        ✅ CRIADO
│   │   └── app.component.ts                               📝 INTEGRAR CONFORME EXEMPLO

sgc-backend/
└── src/main/java/com/compliance/sgc/
    ├── domain/
    │   ├── entity/
    │   │   ├── UserPreferences.java               ✅ CRIADO
    │   │   └── Feedback.java                      ✅ CRIADO
    │   └── enums/
    │       └── TipoFeedback.java                  ✅ CRIADO
    ├── dto/
    │   ├── preferences/
    │   │   ├── UserPreferencesDTO.java            ✅ CRIADO
    │   │   └── UserPreferencesUpdateDTO.java      ✅ CRIADO
    │   └── feedback/
    │       ├── FeedbackCreateDTO.java             ✅ CRIADO
    │       └── FeedbackResponseDTO.java           ✅ CRIADO
    ├── repository/
    │   ├── UserPreferencesRepository.java         ✅ CRIADO
    │   └── FeedbackRepository.java                ✅ CRIADO
    ├── service/
    │   ├── UserPreferencesService.java            ✅ CRIADO
    │   └── FeedbackService.java                   ✅ CRIADO
    └── controller/
        ├── UserPreferencesController.java         ✅ CRIADO
        └── FeedbackController.java                ✅ CRIADO
```

## 7. Próximos Passos

1. **Integrar componentes no AppComponent** seguindo o exemplo acima
2. **Adicionar estilos CSS** para Shepherd.js tours
3. **Criar tabelas no banco de dados:**
   ```sql
   CREATE TABLE TBL_USER_PREFERENCES (
     preference_id BIGINT PRIMARY KEY AUTO_INCREMENT,
     usuario_id BIGINT NOT NULL UNIQUE,
     tours_completed TEXT,
     onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
     checklist_items TEXT,
     theme VARCHAR(20) DEFAULT 'light',
     language VARCHAR(10) DEFAULT 'pt-BR',
     custom_settings TEXT,
     data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (usuario_id) REFERENCES TBL_USUARIOS(usuario_id)
   );

   CREATE TABLE TBL_FEEDBACK (
     feedback_id BIGINT PRIMARY KEY AUTO_INCREMENT,
     usuario_id BIGINT NOT NULL,
     tipo VARCHAR(20) NOT NULL,
     titulo VARCHAR(200),
     descricao TEXT NOT NULL,
     navegador VARCHAR(100),
     url VARCHAR(500),
     screenshot_path VARCHAR(500),
     resolvido BOOLEAN NOT NULL DEFAULT FALSE,
     resposta TEXT,
     data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (usuario_id) REFERENCES TBL_USUARIOS(usuario_id)
   );
   ```

4. **Testar fluxo completo:**
   - Primeiro login → Tour "first-login" inicia automaticamente
   - Onboarding checklist aparece no canto inferior direito
   - Botão de ajuda (?) sempre visível
   - Atalhos de teclado funcionando (Ctrl+K, ?, etc.)
   - Feedback dialog abre ao clicar em "Reportar Problema"

## 8. Atalhos de Teclado Disponíveis

| Atalho | Ação |
|--------|------|
| `Ctrl+K` ou `Cmd+K` | Abrir busca global |
| `Ctrl+H` ou `Cmd+H` | Ir para Dashboard |
| `Ctrl+N` ou `Cmd+N` | Nova obrigação |
| `Ctrl+/` ou `Cmd+/` | Mostrar atalhos |
| `?` | Mostrar atalhos |
| `G → D` | Go to Dashboard |
| `G → N` | Go to Normas |
| `G → O` | Go to Obrigações |
| `Esc` | Fechar modals |

✅ Sistema de Onboarding e Help completo implementado!
