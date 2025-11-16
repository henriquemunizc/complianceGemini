import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NormaService } from '../services/norma.service';
import { NormaCreate, NormaUpdate } from '../models/norma.model';

@Component({
  selector: 'app-norma-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    CalendarModule,
    DropdownModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="card">
      <h2>{{ isEditMode ? 'Editar Norma' : 'Nova Norma' }}</h2>

      <form [formGroup]="normaForm" (ngSubmit)="salvar()">
        <div class="grid">
          <!-- Tipo -->
          <div class="col-12 md:col-6">
            <label for="tipo" class="block mb-2">Tipo *</label>
            <p-dropdown
              id="tipo"
              formControlName="tipo"
              [options]="tipoOptions"
              placeholder="Selecione o tipo"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('tipo')"
              [class.ng-dirty]="normaForm.get('tipo')?.touched"
            ></p-dropdown>
            <small class="p-error" *ngIf="isFieldInvalid('tipo')">
              Tipo é obrigatório
            </small>
          </div>

          <!-- Número -->
          <div class="col-12 md:col-3">
            <label for="numero" class="block mb-2">Número *</label>
            <input
              pInputText
              id="numero"
              formControlName="numero"
              placeholder="Ex: 8.112"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('numero')"
              [class.ng-dirty]="normaForm.get('numero')?.touched"
            />
            <small class="p-error" *ngIf="isFieldInvalid('numero')">
              Número é obrigatório
            </small>
          </div>

          <!-- Ano -->
          <div class="col-12 md:col-3">
            <label for="ano" class="block mb-2">Ano *</label>
            <p-inputNumber
              id="ano"
              formControlName="ano"
              [useGrouping]="false"
              [showButtons]="false"
              placeholder="Ex: 1990"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('ano')"
              [class.ng-dirty]="normaForm.get('ano')?.touched"
            ></p-inputNumber>
            <small class="p-error" *ngIf="isFieldInvalid('ano')">
              <span *ngIf="normaForm.get('ano')?.errors?.['required']">Ano é obrigatório</span>
              <span *ngIf="normaForm.get('ano')?.errors?.['min']">Ano deve ser >= 1900</span>
            </small>
          </div>

          <!-- Ementa -->
          <div class="col-12">
            <label for="ementa" class="block mb-2">Ementa *</label>
            <textarea
              pInputTextarea
              id="ementa"
              formControlName="ementa"
              rows="4"
              placeholder="Descrição resumida da norma"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('ementa')"
              [class.ng-dirty]="normaForm.get('ementa')?.touched"
            ></textarea>
            <small class="p-error" *ngIf="isFieldInvalid('ementa')">
              Ementa é obrigatória
            </small>
          </div>

          <!-- Data de Publicação -->
          <div class="col-12 md:col-6">
            <label for="dataPublicacao" class="block mb-2">Data de Publicação *</label>
            <p-calendar
              id="dataPublicacao"
              formControlName="dataPublicacao"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              [maxDate]="hoje"
              placeholder="dd/mm/aaaa"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('dataPublicacao')"
              [class.ng-dirty]="normaForm.get('dataPublicacao')?.touched"
            ></p-calendar>
            <small class="p-error" *ngIf="isFieldInvalid('dataPublicacao')">
              <span *ngIf="normaForm.get('dataPublicacao')?.errors?.['required']">Data de publicação é obrigatória</span>
              <span *ngIf="normaForm.get('dataPublicacao')?.errors?.['maxDate']">Data não pode ser futura</span>
            </small>
          </div>

          <!-- Data de Revogação -->
          <div class="col-12 md:col-6">
            <label for="dataRevogacao" class="block mb-2">Data de Revogação</label>
            <p-calendar
              id="dataRevogacao"
              formControlName="dataRevogacao"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              placeholder="dd/mm/aaaa (opcional)"
              styleClass="w-full"
            ></p-calendar>
          </div>

          <!-- Link Oficial -->
          <div class="col-12">
            <label for="linkOficial" class="block mb-2">Link Oficial</label>
            <input
              pInputText
              id="linkOficial"
              formControlName="linkOficial"
              type="url"
              placeholder="https://exemplo.com.br/norma"
              class="w-full"
            />
          </div>

          <!-- Botões -->
          <div class="col-12 flex gap-2 justify-content-end mt-3">
            <p-button
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              [outlined]="true"
              (onClick)="cancelar()"
            ></p-button>

            <p-button
              label="Salvar"
              icon="pi pi-check"
              type="submit"
              [disabled]="!normaForm.valid"
              [loading]="salvando"
            ></p-button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class NormaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private normaService = inject(NormaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  normaForm!: FormGroup;
  isEditMode = false;
  normaId?: number;
  salvando = false;
  hoje = new Date();

  tipoOptions = [
    { label: 'Lei', value: 'Lei' },
    { label: 'Decreto', value: 'Decreto' },
    { label: 'Portaria', value: 'Portaria' },
    { label: 'Resolução', value: 'Resolução' },
    { label: 'Instrução Normativa', value: 'Instrução Normativa' },
    { label: 'Medida Provisória', value: 'Medida Provisória' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.normaForm = this.fb.group({
      tipo: ['', Validators.required],
      numero: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(1900)]],
      ementa: ['', Validators.required],
      dataPublicacao: [null, [Validators.required, this.maxDateValidator(this.hoje)]],
      dataRevogacao: [null],
      linkOficial: ['']
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.normaId = +id;
      this.loadNorma(this.normaId);
    }
  }

  loadNorma(id: number): void {
    this.normaService.buscarPorId(id).subscribe({
      next: (norma) => {
        this.normaForm.patchValue({
          tipo: norma.tipo,
          numero: norma.numero,
          ano: norma.ano,
          ementa: norma.ementa,
          dataPublicacao: new Date(norma.dataPublicacao),
          dataRevogacao: norma.dataRevogacao ? new Date(norma.dataRevogacao) : null,
          linkOficial: norma.linkOficial || ''
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar norma'
        });
        this.cancelar();
      }
    });
  }

  salvar(): void {
    if (this.normaForm.invalid) {
      this.markFormGroupTouched(this.normaForm);
      return;
    }

    this.salvando = true;
    const formValue = this.normaForm.value;

    const normaData = {
      tipo: formValue.tipo,
      numero: formValue.numero,
      ano: formValue.ano,
      ementa: formValue.ementa,
      dataPublicacao: this.formatDate(formValue.dataPublicacao),
      dataRevogacao: formValue.dataRevogacao ? this.formatDate(formValue.dataRevogacao) : undefined,
      linkOficial: formValue.linkOficial || undefined
    };

    const operation = this.isEditMode && this.normaId
      ? this.normaService.atualizar(this.normaId, normaData as NormaUpdate)
      : this.normaService.criar(normaData as NormaCreate);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Norma ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso`
        });
        this.router.navigate(['/normas']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} norma`
        });
        this.salvando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/normas']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.normaForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private maxDateValidator(maxDate: Date) {
    return (control: any) => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      maxDate.setHours(0, 0, 0, 0);
      return inputDate > maxDate ? { maxDate: true } : null;
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
