import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsuarioService, UsuarioCreate, UsuarioUpdate } from '../services/usuario.service';
import { PerfilUsuario, UsuarioResponse } from '../models/auth.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="usuario-form-container">
      <p-card>
        <ng-template pTemplate="header">
          <div class="card-header">
            <h2>{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          </div>
        </ng-template>

        <form [formGroup]="form" (ngSubmit)="salvar()">
          <div class="form-grid">
            <div class="form-field">
              <label for="nome">Nome *</label>
              <input
                pInputText
                id="nome"
                formControlName="nome"
                placeholder="Nome completo"
                [class.ng-invalid]="isFieldInvalid('nome')"
              />
              <small class="p-error" *ngIf="isFieldInvalid('nome')">
                Nome é obrigatório
              </small>
            </div>

            <div class="form-field">
              <label for="email">Email *</label>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                placeholder="email@exemplo.com"
                [class.ng-invalid]="isFieldInvalid('email')"
              />
              <small class="p-error" *ngIf="form.get('email')?.hasError('required') && form.get('email')?.touched">
                Email é obrigatório
              </small>
              <small class="p-error" *ngIf="form.get('email')?.hasError('email') && form.get('email')?.touched">
                Email inválido
              </small>
            </div>

            <div class="form-field" *ngIf="!isEditMode">
              <label for="senha">Senha *</label>
              <p-password
                id="senha"
                formControlName="senha"
                [toggleMask]="true"
                [feedback]="true"
                placeholder="Digite a senha"
                styleClass="w-full"
                [inputStyle]="{'width': '100%'}"
              >
                <ng-template pTemplate="footer">
                  <p class="password-requirements">
                    Requisitos: mínimo 8 caracteres, uma maiúscula, uma minúscula e um número
                  </p>
                </ng-template>
              </p-password>
              <small class="p-error" *ngIf="form.get('senha')?.hasError('required') && form.get('senha')?.touched">
                Senha é obrigatória
              </small>
              <small class="p-error" *ngIf="form.get('senha')?.hasError('minlength') && form.get('senha')?.touched">
                Senha deve ter no mínimo 8 caracteres
              </small>
              <small class="p-error" *ngIf="form.get('senha')?.hasError('pattern') && form.get('senha')?.touched">
                Senha deve conter maiúscula, minúscula e número
              </small>
            </div>

            <div class="form-field">
              <label for="perfil">Perfil *</label>
              <p-dropdown
                id="perfil"
                formControlName="perfil"
                [options]="perfis"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione o perfil"
                [class.ng-invalid]="isFieldInvalid('perfil')"
                styleClass="w-full"
              ></p-dropdown>
              <small class="p-error" *ngIf="isFieldInvalid('perfil')">
                Perfil é obrigatório
              </small>
            </div>
          </div>

          <div class="form-actions">
            <button
              pButton
              type="button"
              label="Cancelar"
              icon="pi pi-times"
              class="p-button-secondary"
              (click)="cancelar()"
            ></button>
            <button
              pButton
              type="submit"
              [label]="isEditMode ? 'Atualizar' : 'Criar'"
              icon="pi pi-check"
              [loading]="saving"
              [disabled]="form.invalid"
            ></button>
          </div>
        </form>
      </p-card>
    </div>
    <p-toast></p-toast>
  `,
  styles: [`
    .usuario-form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .card-header {
      padding: 1.5rem;
    }

    .card-header h2 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .form-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr;
    }

    @media (min-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr 1fr;
      }

      .form-field:first-child,
      .form-field:nth-child(2) {
        grid-column: span 1;
      }
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-weight: 600;
      color: #333;
    }

    .form-field input,
    .form-field ::ng-deep .p-dropdown,
    .form-field ::ng-deep .p-password {
      width: 100%;
    }

    .p-error {
      color: #e24c4c;
      font-size: 0.875rem;
    }

    .password-requirements {
      font-size: 0.875rem;
      color: #6c757d;
      margin: 0.5rem 0 0;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    ::ng-deep .w-full {
      width: 100%;
    }

    ::ng-deep .p-password input {
      width: 100%;
    }
  `]
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  usuarioId?: number;
  saving = false;

  perfis = [
    { label: 'Administrador', value: PerfilUsuario.ROLE_ADMIN },
    { label: 'Compliance', value: PerfilUsuario.ROLE_COMPLIANCE },
    { label: 'Responsável', value: PerfilUsuario.ROLE_RESPONSAVEL },
    { label: 'Visualizador', value: PerfilUsuario.ROLE_VISUALIZADOR }
  ];

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  private initForm(): void {
    // Padrão de senha forte: mínimo 8 caracteres, pelo menos uma maiúscula, uma minúscula e um número
    const senhaPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.pattern(senhaPattern)]],
      perfil: ['', Validators.required]
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.usuarioId = Number(id);
      this.form.get('senha')?.clearValidators();
      this.form.get('senha')?.updateValueAndValidity();
      this.carregarUsuario(this.usuarioId);
    }
  }

  private async carregarUsuario(id: number): Promise<void> {
    try {
      const usuario = await this.usuarioService.obterPorId(id).toPromise();
      if (usuario) {
        this.form.patchValue({
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os dados do usuário'
      });
      this.router.navigate(['/usuarios']);
    }
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    try {
      this.saving = true;

      if (this.isEditMode && this.usuarioId) {
        const updateData: UsuarioUpdate = {
          nome: this.form.value.nome,
          email: this.form.value.email,
          perfil: this.form.value.perfil
        };
        await this.usuarioService.atualizar(this.usuarioId, updateData).toPromise();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário atualizado com sucesso'
        });
      } else {
        const createData: UsuarioCreate = {
          nome: this.form.value.nome,
          email: this.form.value.email,
          senha: this.form.value.senha,
          perfil: this.form.value.perfil
        };
        await this.usuarioService.criar(createData).toPromise();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário criado com sucesso'
        });
      }

      setTimeout(() => {
        this.router.navigate(['/usuarios']);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error?.error?.message || 'Não foi possível salvar o usuário'
      });
    } finally {
      this.saving = false;
    }
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
