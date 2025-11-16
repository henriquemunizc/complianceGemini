import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ObrigacaoService } from '../services/obrigacao.service';
import { NormaService } from '../services/norma.service';
import { UsuarioService } from '../services/usuario.service';
import { ObrigacaoCreate, ObrigacaoUpdate, VinculoHierarquia } from '../models/obrigacao.model';
import { NormaResponse } from '../models/norma.model';
import { UsuarioResponse } from '../models/auth.model';

@Component({
  selector: 'app-obrigacao-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    TableModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="card">
      <h2>{{ isEditMode ? 'Editar Obrigação' : 'Nova Obrigação' }}</h2>

      <form [formGroup]="obrigacaoForm" (ngSubmit)="salvar()">
        <div class="grid">
          <!-- Título -->
          <div class="col-12">
            <label for="titulo" class="block mb-2">Título *</label>
            <input
              pInputText
              id="titulo"
              formControlName="titulo"
              placeholder="Título da obrigação"
              class="w-full"
              [class.ng-invalid]="isFieldInvalid('titulo')"
              [class.ng-dirty]="obrigacaoForm.get('titulo')?.touched"
            />
            <small class="p-error" *ngIf="isFieldInvalid('titulo')">
              Título é obrigatório
            </small>
          </div>

          <!-- Descrição -->
          <div class="col-12">
            <label for="descricao" class="block mb-2">Descrição</label>
            <textarea
              pInputTextarea
              id="descricao"
              formControlName="descricao"
              rows="4"
              placeholder="Descrição detalhada da obrigação"
              class="w-full"
            ></textarea>
          </div>

          <!-- Prazo de Execução -->
          <div class="col-12 md:col-6">
            <label for="prazoExecucao" class="block mb-2">Prazo de Execução *</label>
            <p-calendar
              id="prazoExecucao"
              formControlName="prazoExecucao"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              [minDate]="hoje"
              placeholder="dd/mm/aaaa"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('prazoExecucao')"
              [class.ng-dirty]="obrigacaoForm.get('prazoExecucao')?.touched"
            ></p-calendar>
            <small class="p-error" *ngIf="isFieldInvalid('prazoExecucao')">
              <span *ngIf="obrigacaoForm.get('prazoExecucao')?.errors?.['required']">Prazo é obrigatório</span>
              <span *ngIf="obrigacaoForm.get('prazoExecucao')?.errors?.['minDate']">Prazo não pode ser anterior a hoje</span>
            </small>
          </div>

          <!-- Responsável -->
          <div class="col-12 md:col-6">
            <label for="responsavelId" class="block mb-2">Responsável *</label>
            <p-dropdown
              id="responsavelId"
              formControlName="responsavelId"
              [options]="usuarios"
              optionLabel="nome"
              optionValue="usuarioId"
              placeholder="Selecione o responsável"
              [filter]="true"
              filterBy="nome,email"
              styleClass="w-full"
              [class.ng-invalid]="isFieldInvalid('responsavelId')"
              [class.ng-dirty]="obrigacaoForm.get('responsavelId')?.touched"
            >
              <ng-template let-usuario pTemplate="item">
                <div>
                  <div>{{ usuario.nome }}</div>
                  <small class="text-600">{{ usuario.email }}</small>
                </div>
              </ng-template>
            </p-dropdown>
            <small class="p-error" *ngIf="isFieldInvalid('responsavelId')">
              Responsável é obrigatório
            </small>
          </div>

          <!-- Vínculos Hierárquicos -->
          <div class="col-12">
            <div class="flex justify-content-between align-items-center mb-2">
              <label class="font-semibold">Vínculos com Normas</label>
              <p-button
                label="Adicionar Vínculo"
                icon="pi pi-plus"
                size="small"
                [outlined]="true"
                (onClick)="mostrarFormVinculo = true"
              ></p-button>
            </div>

            <!-- Form para adicionar vínculo -->
            <p-card *ngIf="mostrarFormVinculo" class="mb-3">
              <div class="grid">
                <div class="col-12">
                  <label for="normaId" class="block mb-2">Norma *</label>
                  <p-dropdown
                    id="normaId"
                    [(ngModel)]="novoVinculo.normaId"
                    [ngModelOptions]="{standalone: true}"
                    [options]="normas"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione a norma"
                    [filter]="true"
                    styleClass="w-full"
                  ></p-dropdown>
                </div>

                <div class="col-12 md:col-4">
                  <label for="artigoId" class="block mb-2">Artigo (Opcional)</label>
                  <input
                    pInputText
                    id="artigoId"
                    [(ngModel)]="novoVinculo.artigoId"
                    [ngModelOptions]="{standalone: true}"
                    type="number"
                    placeholder="Ex: 1"
                    class="w-full"
                  />
                </div>

                <div class="col-12 md:col-4">
                  <label for="incisoId" class="block mb-2">Inciso (Opcional)</label>
                  <input
                    pInputText
                    id="incisoId"
                    [(ngModel)]="novoVinculo.incisoId"
                    [ngModelOptions]="{standalone: true}"
                    type="number"
                    placeholder="Ex: 2"
                    class="w-full"
                  />
                </div>

                <div class="col-12 md:col-4">
                  <label for="alineaId" class="block mb-2">Alínea (Opcional)</label>
                  <input
                    pInputText
                    id="alineaId"
                    [(ngModel)]="novoVinculo.alineaId"
                    [ngModelOptions]="{standalone: true}"
                    type="number"
                    placeholder="Ex: 3"
                    class="w-full"
                  />
                </div>

                <div class="col-12 flex gap-2 justify-content-end">
                  <p-button
                    label="Cancelar"
                    icon="pi pi-times"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="cancelarVinculo()"
                  ></p-button>
                  <p-button
                    label="Adicionar"
                    icon="pi pi-check"
                    (onClick)="adicionarVinculo()"
                    [disabled]="!novoVinculo.normaId"
                  ></p-button>
                </div>
              </div>
            </p-card>

            <!-- Tabela de vínculos -->
            <p-table
              [value]="vinculos"
              *ngIf="vinculos.length > 0"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Norma</th>
                  <th>Artigo</th>
                  <th>Inciso</th>
                  <th>Alínea</th>
                  <th style="width: 100px">Ações</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-vinculo let-i="rowIndex">
                <tr>
                  <td>{{ getNormaLabel(vinculo.normaId) }}</td>
                  <td>{{ vinculo.artigoId || '-' }}</td>
                  <td>{{ vinculo.incisoId || '-' }}</td>
                  <td>{{ vinculo.alineaId || '-' }}</td>
                  <td>
                    <p-button
                      icon="pi pi-trash"
                      size="small"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      (onClick)="removerVinculo(i)"
                    ></p-button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
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
              [disabled]="!obrigacaoForm.valid"
              [loading]="salvando"
            ></p-button>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ObrigacaoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private obrigacaoService = inject(ObrigacaoService);
  private normaService = inject(NormaService);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  obrigacaoForm!: FormGroup;
  isEditMode = false;
  obrigacaoId?: number;
  salvando = false;
  hoje = new Date();

  usuarios: UsuarioResponse[] = [];
  normas: Array<{ label: string; value: number }> = [];
  vinculos: VinculoHierarquia[] = [];

  mostrarFormVinculo = false;
  novoVinculo: VinculoHierarquia = {};

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios();
    this.loadNormas();
    this.checkEditMode();
  }

  initForm(): void {
    this.obrigacaoForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: [''],
      prazoExecucao: [null, [Validators.required, this.minDateValidator(this.hoje)]],
      responsavelId: [null, Validators.required]
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.obrigacaoId = +id;
      this.loadObrigacao(this.obrigacaoId);
    }
  }

  loadObrigacao(id: number): void {
    this.obrigacaoService.buscarPorId(id).subscribe({
      next: (obrigacao) => {
        this.obrigacaoForm.patchValue({
          titulo: obrigacao.titulo,
          descricao: obrigacao.descricao,
          prazoExecucao: new Date(obrigacao.prazoExecucao),
          responsavelId: obrigacao.responsavelId
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar obrigação'
        });
        this.cancelar();
      }
    });
  }

  loadUsuarios(): void {
    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios.filter(u => u.ativo);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar usuários'
        });
      }
    });
  }

  loadNormas(): void {
    this.normaService.buscarVigentes().subscribe({
      next: (normas) => {
        this.normas = normas.map(n => ({
          label: `${n.tipo} ${n.numero}/${n.ano} - ${n.ementa.substring(0, 50)}...`,
          value: n.normaId
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar normas'
        });
      }
    });
  }

  adicionarVinculo(): void {
    if (!this.novoVinculo.normaId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione uma norma'
      });
      return;
    }

    this.vinculos.push({ ...this.novoVinculo });
    this.cancelarVinculo();
  }

  removerVinculo(index: number): void {
    this.vinculos.splice(index, 1);
  }

  cancelarVinculo(): void {
    this.novoVinculo = {};
    this.mostrarFormVinculo = false;
  }

  getNormaLabel(normaId?: number): string {
    if (!normaId) return '-';
    const norma = this.normas.find(n => n.value === normaId);
    return norma ? norma.label : `ID: ${normaId}`;
  }

  salvar(): void {
    if (this.obrigacaoForm.invalid) {
      this.markFormGroupTouched(this.obrigacaoForm);
      return;
    }

    if (this.vinculos.length === 0 && !this.isEditMode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Adicione pelo menos um vínculo com norma'
      });
      return;
    }

    this.salvando = true;
    const formValue = this.obrigacaoForm.value;

    const obrigacaoData = {
      titulo: formValue.titulo,
      descricao: formValue.descricao || undefined,
      prazoExecucao: this.formatDate(formValue.prazoExecucao),
      responsavelId: formValue.responsavelId,
      vinculosHierarquia: this.vinculos
    };

    const operation = this.isEditMode && this.obrigacaoId
      ? this.obrigacaoService.atualizar(this.obrigacaoId, obrigacaoData as ObrigacaoUpdate)
      : this.obrigacaoService.criar(obrigacaoData as ObrigacaoCreate);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Obrigação ${this.isEditMode ? 'atualizada' : 'criada'} com sucesso`
        });
        this.router.navigate(['/obrigacoes']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: error.error?.message || `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} obrigação`
        });
        this.salvando = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/obrigacoes']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.obrigacaoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private minDateValidator(minDate: Date) {
    return (control: any) => {
      if (!control.value) return null;
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      return inputDate < min ? { minDate: true } : null;
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
