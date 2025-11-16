import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EvidenciaService } from '../services/evidencia.service';
import { TipoEvidencia } from '../models/evidencia.model';

interface TipoEvidenciaOption {
  label: string;
  value: TipoEvidencia;
  icon: string;
}

@Component({
  selector: 'app-evidencia-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    InputTextareaModule,
    SelectButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <p-dialog
      [header]="'Adicionar Evidência'"
      [(visible)]="visible"
      [modal]="true"
      [style]="{width: '600px'}"
      [draggable]="false"
      [resizable]="false"
      (onHide)="fechar()"
    >
      <div class="grid">
        <!-- Seletor de Tipo -->
        <div class="col-12">
          <label class="block mb-3 font-semibold">Tipo de Evidência</label>
          <p-selectButton
            [options]="tiposEvidencia"
            [(ngModel)]="tipoSelecionado"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full"
          >
            <ng-template let-item>
              <div class="flex flex-column align-items-center gap-2 p-2">
                <i [class]="item.icon" style="font-size: 1.5rem"></i>
                <span>{{ item.label }}</span>
              </div>
            </ng-template>
          </p-selectButton>
        </div>

        <!-- Upload de Arquivo -->
        <div class="col-12" *ngIf="tipoSelecionado === 'ARQUIVO'">
          <label class="block mb-2 font-semibold">Arquivo</label>
          <p-fileUpload
            #fileUpload
            mode="advanced"
            [auto]="false"
            [multiple]="false"
            [showUploadButton]="false"
            [showCancelButton]="false"
            chooseLabel="Selecionar Arquivo"
            [maxFileSize]="maxFileSize"
            (onSelect)="onFileSelect($event)"
            (onClear)="arquivo = null"
            accept="*/*"
          >
            <ng-template pTemplate="content" let-files>
              <div *ngIf="files && files.length > 0" class="mt-3">
                <div class="flex align-items-center gap-3 p-3 surface-100 border-round">
                  <i class="pi pi-file text-4xl text-primary"></i>
                  <div class="flex-1">
                    <div class="font-semibold">{{ files[0].name }}</div>
                    <small class="text-600">{{ formatFileSize(files[0].size) }}</small>
                  </div>
                  <p-button
                    icon="pi pi-times"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="fileUpload.clear()"
                  ></p-button>
                </div>
              </div>
            </ng-template>
          </p-fileUpload>
          <small class="text-600">Tamanho máximo: {{ formatFileSize(maxFileSize) }}</small>
        </div>

        <!-- Link Externo -->
        <div class="col-12" *ngIf="tipoSelecionado === 'LINK'">
          <label for="urlExterna" class="block mb-2 font-semibold">URL</label>
          <input
            pInputText
            id="urlExterna"
            [(ngModel)]="urlExterna"
            type="url"
            placeholder="https://exemplo.com/documento.pdf"
            class="w-full"
          />
          <small class="text-600">Informe uma URL válida</small>
        </div>

        <!-- Texto -->
        <div class="col-12" *ngIf="tipoSelecionado === 'TEXTO'">
          <label for="conteudoTexto" class="block mb-2 font-semibold">Conteúdo</label>
          <textarea
            pInputTextarea
            id="conteudoTexto"
            [(ngModel)]="conteudoTexto"
            rows="8"
            [maxlength]="10000"
            placeholder="Digite ou cole o texto da evidência..."
            class="w-full"
          ></textarea>
          <small class="text-600">{{ conteudoTexto?.length || 0 }} / 10.000 caracteres</small>
        </div>

        <!-- Descrição (opcional para todos os tipos) -->
        <div class="col-12">
          <label for="descricao" class="block mb-2 font-semibold">Descrição (Opcional)</label>
          <textarea
            pInputTextarea
            id="descricao"
            [(ngModel)]="descricao"
            rows="3"
            placeholder="Adicione uma descrição para esta evidência..."
            class="w-full"
          ></textarea>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-content-end">
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            [outlined]="true"
            (onClick)="fechar()"
          ></p-button>

          <p-button
            label="Enviar"
            icon="pi pi-check"
            [loading]="enviando"
            [disabled]="!isValid()"
            (onClick)="enviar()"
          ></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class EvidenciaUploadComponent {
  private evidenciaService = inject(EvidenciaService);
  private messageService = inject(MessageService);

  @Input() obrigacaoId!: number;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onUploadSuccess = new EventEmitter<void>();

  tiposEvidencia: TipoEvidenciaOption[] = [
    { label: 'Arquivo', value: TipoEvidencia.ARQUIVO, icon: 'pi pi-file' },
    { label: 'Link', value: TipoEvidencia.LINK, icon: 'pi pi-link' },
    { label: 'Texto', value: TipoEvidencia.TEXTO, icon: 'pi pi-align-left' }
  ];

  tipoSelecionado: TipoEvidencia = TipoEvidencia.ARQUIVO;
  arquivo: File | null = null;
  urlExterna = '';
  conteudoTexto = '';
  descricao = '';
  enviando = false;

  maxFileSize = 10 * 1024 * 1024; // 10MB

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      this.arquivo = event.files[0];
    }
  }

  isValid(): boolean {
    switch (this.tipoSelecionado) {
      case TipoEvidencia.ARQUIVO:
        return this.arquivo !== null;
      case TipoEvidencia.LINK:
        return this.urlExterna.trim().length > 0 && this.isValidUrl(this.urlExterna);
      case TipoEvidencia.TEXTO:
        return this.conteudoTexto.trim().length > 0;
      default:
        return false;
    }
  }

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  enviar(): void {
    if (!this.isValid() || !this.obrigacaoId) {
      return;
    }

    this.enviando = true;

    switch (this.tipoSelecionado) {
      case TipoEvidencia.ARQUIVO:
        this.enviarArquivo();
        break;
      case TipoEvidencia.LINK:
        this.enviarLink();
        break;
      case TipoEvidencia.TEXTO:
        this.enviarTexto();
        break;
    }
  }

  private enviarArquivo(): void {
    if (!this.arquivo) return;

    this.evidenciaService.adicionarArquivo(
      this.obrigacaoId,
      this.arquivo,
      this.descricao || undefined
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Arquivo enviado com sucesso'
        });
        this.resetForm();
        this.onUploadSuccess.emit();
        this.fechar();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao enviar arquivo'
        });
        this.enviando = false;
      }
    });
  }

  private enviarLink(): void {
    this.evidenciaService.adicionarLink(this.obrigacaoId, {
      urlExterna: this.urlExterna,
      descricao: this.descricao || undefined
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Link adicionado com sucesso'
        });
        this.resetForm();
        this.onUploadSuccess.emit();
        this.fechar();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao adicionar link'
        });
        this.enviando = false;
      }
    });
  }

  private enviarTexto(): void {
    this.evidenciaService.adicionarTexto(this.obrigacaoId, {
      conteudoTexto: this.conteudoTexto,
      descricao: this.descricao || undefined
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Texto adicionado com sucesso'
        });
        this.resetForm();
        this.onUploadSuccess.emit();
        this.fechar();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || 'Erro ao adicionar texto'
        });
        this.enviando = false;
      }
    });
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  private resetForm(): void {
    this.tipoSelecionado = TipoEvidencia.ARQUIVO;
    this.arquivo = null;
    this.urlExterna = '';
    this.conteudoTexto = '';
    this.descricao = '';
    this.enviando = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
