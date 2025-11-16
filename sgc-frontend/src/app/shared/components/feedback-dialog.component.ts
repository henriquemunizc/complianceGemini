import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

interface FeedbackType {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    ButtonModule,
    FileUploadModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      [style]="{width: '550px'}"
      styleClass="feedback-dialog"
    >
      <ng-template pTemplate="header">
        <div class="dialog-header">
          <i [class]="getHeaderIcon()"></i>
          <span>{{ getHeaderTitle() }}</span>
        </div>
      </ng-template>

      <form [formGroup]="feedbackForm" (ngSubmit)="submitFeedback()">
        <!-- Tipo -->
        <div class="form-field">
          <label for="tipo">Tipo *</label>
          <p-dropdown
            id="tipo"
            formControlName="tipo"
            [options]="feedbackTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione o tipo"
            styleClass="w-full"
          >
            <ng-template let-option pTemplate="item">
              <div class="dropdown-item">
                <i [class]="option.icon"></i>
                <span>{{ option.label }}</span>
              </div>
            </ng-template>
          </p-dropdown>
          <small class="p-error" *ngIf="feedbackForm.get('tipo')?.invalid && feedbackForm.get('tipo')?.touched">
            Tipo é obrigatório
          </small>
        </div>

        <!-- Título (apenas para bugs e sugestões) -->
        <div class="form-field" *ngIf="showTituloField">
          <label for="titulo">Título *</label>
          <input
            id="titulo"
            type="text"
            pInputText
            formControlName="titulo"
            placeholder="Resumo breve do problema ou sugestão"
            class="w-full"
          />
          <small class="p-error" *ngIf="feedbackForm.get('titulo')?.invalid && feedbackForm.get('titulo')?.touched">
            Título é obrigatório
          </small>
        </div>

        <!-- Descrição -->
        <div class="form-field">
          <label for="descricao">Descrição *</label>
          <textarea
            id="descricao"
            pInputTextarea
            formControlName="descricao"
            [placeholder]="getDescriptionPlaceholder()"
            rows="6"
            class="w-full"
          ></textarea>
          <small class="p-error" *ngIf="feedbackForm.get('descricao')?.invalid && feedbackForm.get('descricao')?.touched">
            Descrição é obrigatória
          </small>
          <small class="help-text">{{ feedbackForm.get('descricao')?.value?.length || 0 }} / 2000 caracteres</small>
        </div>

        <!-- Screenshot (opcional) -->
        <div class="form-field">
          <label for="screenshot">Screenshot (opcional)</label>
          <p-fileUpload
            mode="basic"
            chooseLabel="Escolher arquivo"
            [auto]="true"
            accept="image/*"
            [maxFileSize]="5000000"
            (onSelect)="onFileSelect($event)"
            styleClass="w-full"
          ></p-fileUpload>
          <small class="help-text">
            <i class="pi pi-info-circle"></i>
            Anexe uma captura de tela para ilustrar o problema (max 5MB)
          </small>
          <div class="screenshot-preview" *ngIf="screenshotPreview">
            <img [src]="screenshotPreview" alt="Screenshot preview" />
            <button
              type="button"
              class="remove-screenshot"
              (click)="removeScreenshot()"
              title="Remover"
            >
              <i class="pi pi-times"></i>
            </button>
          </div>
        </div>

        <!-- Informações do sistema (coletadas automaticamente) -->
        <div class="system-info" *ngIf="isBugReport">
          <div class="info-header">
            <i class="pi pi-info-circle"></i>
            <span>Informações do sistema (coletadas automaticamente)</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">Navegador:</span>
              <span class="info-value">{{ systemInfo.browser }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">URL atual:</span>
              <span class="info-value">{{ systemInfo.currentUrl }}</span>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button
            pButton
            type="button"
            label="Cancelar"
            class="p-button-text"
            (click)="cancel()"
            [disabled]="submitting"
          ></button>
          <button
            pButton
            type="submit"
            [label]="submitting ? 'Enviando...' : 'Enviar'"
            [icon]="submitting ? 'pi pi-spin pi-spinner' : 'pi pi-send'"
            [disabled]="feedbackForm.invalid || submitting"
          ></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .feedback-dialog {
      .p-dialog-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .form-field {
      margin-bottom: 20px;
    }

    .form-field label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .help-text {
      display: block;
      margin-top: 4px;
      font-size: 0.813rem;
      color: #6b7280;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dropdown-item i {
      color: #6366f1;
    }

    .system-info {
      margin-bottom: 20px;
      padding: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 0.813rem;
      font-weight: 600;
      color: #4b5563;
    }

    .info-header i {
      color: #6366f1;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item {
      display: flex;
      gap: 8px;
      font-size: 0.813rem;
    }

    .info-label {
      color: #6b7280;
      font-weight: 500;
    }

    .info-value {
      color: #374151;
      word-break: break-all;
    }

    .screenshot-preview {
      position: relative;
      margin-top: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      max-width: 100%;
    }

    .screenshot-preview img {
      width: 100%;
      display: block;
    }

    .remove-screenshot {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .remove-screenshot:hover {
      background: rgba(220, 38, 38, 1);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }

    :host ::ng-deep {
      .p-error {
        display: block;
        margin-top: 4px;
        font-size: 0.813rem;
        color: #ef4444;
      }

      .w-full {
        width: 100%;
      }
    }
  `]
})
export class FeedbackDialogComponent implements OnInit, OnDestroy {
  visible = false;
  feedbackForm: FormGroup;
  submitting = false;
  screenshotFile: File | null = null;
  screenshotPreview: string | null = null;

  feedbackTypes: FeedbackType[] = [
    { label: 'Bug / Erro', value: 'BUG', icon: 'pi pi-exclamation-triangle' },
    { label: 'Sugestão / Melhoria', value: 'SUGESTAO', icon: 'pi pi-lightbulb' },
    { label: 'Dúvida / Pergunta', value: 'DUVIDA', icon: 'pi pi-question-circle' },
    { label: 'Elogio', value: 'ELOGIO', icon: 'pi pi-heart' },
    { label: 'Outro', value: 'OUTRO', icon: 'pi pi-comment' }
  ];

  systemInfo = {
    browser: this.getBrowserInfo(),
    currentUrl: window.location.href
  };

  private eventListeners: (() => void)[] = [];
  private initialFeedbackType: string = 'BUG';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private messageService: MessageService
  ) {
    this.feedbackForm = this.fb.group({
      tipo: ['', Validators.required],
      titulo: [''],
      descricao: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    // Listener para reportar bug
    const bugListener = () => {
      this.initialFeedbackType = 'BUG';
      this.feedbackForm.patchValue({ tipo: 'BUG' });
      this.visible = true;
    };
    window.addEventListener('report-issue', bugListener);
    this.eventListeners.push(() => window.removeEventListener('report-issue', bugListener));

    // Listener para enviar feedback
    const feedbackListener = () => {
      this.initialFeedbackType = 'SUGESTAO';
      this.feedbackForm.patchValue({ tipo: 'SUGESTAO' });
      this.visible = true;
    };
    window.addEventListener('send-feedback', feedbackListener);
    this.eventListeners.push(() => window.removeEventListener('send-feedback', feedbackListener));

    // Atualiza validações quando tipo muda
    this.feedbackForm.get('tipo')?.valueChanges.subscribe(() => {
      this.updateTituloValidation();
    });
  }

  ngOnDestroy(): void {
    this.eventListeners.forEach(cleanup => cleanup());
  }

  get showTituloField(): boolean {
    const tipo = this.feedbackForm.get('tipo')?.value;
    return tipo === 'BUG' || tipo === 'SUGESTAO';
  }

  get isBugReport(): boolean {
    return this.feedbackForm.get('tipo')?.value === 'BUG';
  }

  getHeaderIcon(): string {
    const tipo = this.feedbackForm.get('tipo')?.value;
    const feedbackType = this.feedbackTypes.find(ft => ft.value === tipo);
    return feedbackType?.icon || 'pi pi-comment';
  }

  getHeaderTitle(): string {
    const tipo = this.feedbackForm.get('tipo')?.value;
    const feedbackType = this.feedbackTypes.find(ft => ft.value === tipo);
    return feedbackType ? `Enviar ${feedbackType.label}` : 'Enviar Feedback';
  }

  getDescriptionPlaceholder(): string {
    const tipo = this.feedbackForm.get('tipo')?.value;
    const placeholders: Record<string, string> = {
      'BUG': 'Descreva o problema: o que aconteceu, o que você esperava, e como reproduzir...',
      'SUGESTAO': 'Descreva sua sugestão: qual melhoria você gostaria de ver e como ela ajudaria...',
      'DUVIDA': 'Descreva sua dúvida com o máximo de detalhes possível...',
      'ELOGIO': 'Compartilhe o que você mais gostou no sistema...',
      'OUTRO': 'Descreva seu feedback...'
    };
    return placeholders[tipo] || 'Escreva aqui...';
  }

  onFileSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.screenshotFile = file;

      // Gera preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.screenshotPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeScreenshot(): void {
    this.screenshotFile = null;
    this.screenshotPreview = null;
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid) {
      Object.keys(this.feedbackForm.controls).forEach(key => {
        this.feedbackForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    const formData = new FormData();
    formData.append('tipo', this.feedbackForm.get('tipo')?.value);
    formData.append('titulo', this.feedbackForm.get('titulo')?.value || '');
    formData.append('descricao', this.feedbackForm.get('descricao')?.value);
    formData.append('navegador', this.systemInfo.browser);
    formData.append('url', this.systemInfo.currentUrl);

    if (this.screenshotFile) {
      formData.append('screenshot', this.screenshotFile);
    }

    this.http.post('/api/v1/feedback', formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Feedback Enviado',
          detail: 'Obrigado pelo seu feedback! Nossa equipe irá analisá-lo.',
          life: 5000
        });
        this.resetForm();
        this.visible = false;
        this.submitting = false;
      },
      error: (error) => {
        console.error('Erro ao enviar feedback:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível enviar o feedback. Tente novamente.',
          life: 5000
        });
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.resetForm();
    this.visible = false;
  }

  private resetForm(): void {
    this.feedbackForm.reset();
    this.screenshotFile = null;
    this.screenshotPreview = null;
  }

  private updateTituloValidation(): void {
    const tituloControl = this.feedbackForm.get('titulo');
    if (this.showTituloField) {
      tituloControl?.setValidators([Validators.required, Validators.maxLength(200)]);
    } else {
      tituloControl?.clearValidators();
    }
    tituloControl?.updateValueAndValidity();
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browser = 'Desconhecido';

    if (ua.includes('Firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browser = 'Chrome';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browser = 'Safari';
    } else if (ua.includes('Edg')) {
      browser = 'Edge';
    } else if (ua.includes('MSIE') || ua.includes('Trident')) {
      browser = 'Internet Explorer';
    }

    return `${browser} (${navigator.platform})`;
  }
}
