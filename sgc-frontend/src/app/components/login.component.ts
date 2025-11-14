import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="flex align-items-center justify-content-center min-h-screen">
      <p-card header="SGC - Sistema de Gestão de Compliance" [style]="{width: '400px'}">
        <form (ngSubmit)="onSubmit()">
          <div class="field">
            <label for="email">Email</label>
            <input
              pInputText
              id="email"
              type="email"
              [(ngModel)]="credentials.email"
              name="email"
              required
              class="w-full"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div class="field">
            <label for="senha">Senha</label>
            <p-password
              [(ngModel)]="credentials.senha"
              name="senha"
              [toggleMask]="true"
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Digite sua senha"
              required
            ></p-password>
          </div>

          <p-message
            *ngIf="errorMessage"
            severity="error"
            [text]="errorMessage"
            styleClass="w-full mb-3"
          ></p-message>

          <p-button
            type="submit"
            label="Entrar"
            icon="pi pi-sign-in"
            [loading]="loading"
            styleClass="w-full"
          ></p-button>
        </form>
      </p-card>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-password {
      width: 100%;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials: LoginRequest = {
    email: '',
    senha: ''
  };

  loading = false;
  errorMessage = '';

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response.nome);
        this.router.navigate(['/obrigacoes']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
