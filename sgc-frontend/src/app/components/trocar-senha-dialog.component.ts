import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { UsuarioService, TrocarSenha } from '../services/usuario.service';

@Component({
  selector: 'app-trocar-senha-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    PasswordModule,
    ButtonModule
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [draggable]="false"
      [style]="{ width: '450px' }"
      (onHide)="onHide()"
    >
      <ng-template pTemplate="header">
        <h3>Trocar Senha</h3>
        <p class="subtitle" *ngIf="usuarioNome">{{ usuarioNome }}</p>
      </ng-template>

      <form [formGroup]="form" (ngSubmit)="trocarSenha()">
        <div class="form-content">
          <div class="form-field">
            <label for="novaSenha">Nova Senha *</label>
            <p-password
              id="novaSenha"
              formControlName="novaSenha"
              [toggleMask]="true"
              [feedback]="true"
              placeholder="Digite a nova senha"
              styleClass="w-full"
              [inputStyle]="{'width': '100%'}"
            >
              <ng-template pTemplate="footer">
                <p class="password-requirements">
                  Requisitos: mínimo 8 caracteres, uma maiúscula, uma minúscula e um número
                </p>
              </ng-template>
            </p-password>
            <small class="p-error" *ngIf="form.get('novaSenha')?.hasError('required') && form.get('novaSenha')?.touched">
              Nova senha é obrigatória
            </small>
            <small class="p-error" *ngIf="form.get('novaSenha')?.hasError('minlength') && form.get('novaSenha')?.touched">
              Senha deve ter no mínimo 8 caracteres
            </small>
            <small class="p-error" *ngIf="form.get('novaSenha')?.hasError('pattern') && form.get('novaSenha')?.touched">
              Senha deve conter maiúscula, minúscula e número
            </small>
          </div>

          <div class="form-field">
            <label for="confirmarSenha">Confirmar Senha *</label>
            <p-password
              id="confirmarSenha"
              formControlName="confirmarSenha"
              [toggleMask]="true"
              [feedback]="false"
              placeholder="Confirme a nova senha"
              styleClass="w-full"
              [inputStyle]="{'width': '100%'}"
            ></p-password>
            <small class="p-error" *ngIf="form.get('confirmarSenha')?.hasError('required') && form.get('confirmarSenha')?.touched">
              Confirmação de senha é obrigatória
            </small>
            <small class="p-error" *ngIf="form.hasError('senhasDiferentes') && form.get('confirmarSenha')?.touched">
              As senhas não coincidem
            </small>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-secondary"
          (click)="fechar()"
          [disabled]="salvando"
        ></button>
        <button
          pButton
          label="Alterar Senha"
          icon="pi pi-check"
          (click)="trocarSenha()"
          [loading]="salvando"
          [disabled]="form.invalid"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .subtitle {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: normal;
      margin: 0.25rem 0 0;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 1rem 0;
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

    .p-error {
      color: #e24c4c;
      font-size: 0.875rem;
    }

    .password-requirements {
      font-size: 0.875rem;
      color: #6c757d;
      margin: 0.5rem 0 0;
    }

    ::ng-deep .w-full {
      width: 100%;
    }

    ::ng-deep .p-password {
      width: 100%;
    }

    ::ng-deep .p-password input {
      width: 100%;
    }

    ::ng-deep .p-dialog-header {
      padding-bottom: 0.5rem;
    }
  `]
})
export class TrocarSenhaDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() usuarioId?: number;
  @Input() usuarioNome?: string;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);

  form!: FormGroup;
  salvando = false;

  constructor() {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.resetForm();
    }
  }

  private initForm(): void {
    // Padrão de senha forte: mínimo 8 caracteres, pelo menos uma maiúscula, uma minúscula e um número
    const senhaPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    this.form = this.fb.group({
      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.pattern(senhaPattern)]],
      confirmarSenha: ['', Validators.required]
    }, {
      validators: this.senhasIguaisValidator
    });
  }

  private senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
    const novaSenha = control.get('novaSenha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (novaSenha && confirmarSenha && novaSenha !== confirmarSenha) {
      return { senhasDiferentes: true };
    }

    return null;
  }

  private resetForm(): void {
    this.form.reset();
    this.salvando = false;
  }

  async trocarSenha(): Promise<void> {
    if (this.form.invalid || !this.usuarioId) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }

    try {
      this.salvando = true;

      const dados: TrocarSenha = {
        novaSenha: this.form.value.novaSenha
      };

      await this.usuarioService.trocarSenha(this.usuarioId, dados).toPromise();

      this.onSuccess.emit();
      this.fechar();
    } catch (error: any) {
      console.error('Erro ao trocar senha:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error?.error?.message || 'Não foi possível alterar a senha'
      });
    } finally {
      this.salvando = false;
    }
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onHide(): void {
    this.visibleChange.emit(false);
    this.resetForm();
  }
}
