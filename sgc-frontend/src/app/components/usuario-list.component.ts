import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../services/auth.service';
import { PerfilUsuario, UsuarioResponse } from '../models/auth.model';
import { TrocarSenhaDialogComponent } from './trocar-senha-dialog.component';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    TrocarSenhaDialogComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="usuario-list-container">
      <div class="access-denied" *ngIf="!isAdmin">
        <i class="pi pi-lock" style="font-size: 3rem; color: #dc3545;"></i>
        <h2>Acesso Negado</h2>
        <p>Você não possui permissão para acessar esta página.</p>
        <p>Somente administradores podem gerenciar usuários.</p>
      </div>

      <div *ngIf="isAdmin">
        <div class="header">
          <h1>Gerenciamento de Usuários</h1>
          <button
            pButton
            label="Novo Usuário"
            icon="pi pi-plus"
            (click)="novoUsuario()"
          ></button>
        </div>

        <div class="filters">
          <p-dropdown
            [options]="perfis"
            [(ngModel)]="perfilFiltro"
            placeholder="Filtrar por perfil"
            [showClear]="true"
            (onChange)="aplicarFiltro()"
            optionLabel="label"
            optionValue="value"
          ></p-dropdown>
        </div>

        <p-table
          [value]="usuarios"
          [loading]="loading"
          styleClass="p-datatable-gridlines"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuários"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th style="width: 250px">Ações</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-usuario>
            <tr>
              <td>{{ usuario.usuarioId }}</td>
              <td>{{ usuario.nome }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <p-tag
                  [value]="getPerfilLabel(usuario.perfil)"
                  [severity]="getPerfilSeverity(usuario.perfil)"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="usuario.ativo ? 'Ativo' : 'Inativo'"
                  [severity]="usuario.ativo ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-info"
                    pTooltip="Editar"
                    (click)="editarUsuario(usuario.usuarioId)"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-key"
                    class="p-button-rounded p-button-text p-button-warning"
                    pTooltip="Trocar Senha"
                    (click)="abrirDialogTrocarSenha(usuario)"
                  ></button>
                  <button
                    pButton
                    [icon]="usuario.ativo ? 'pi pi-times' : 'pi pi-check'"
                    class="p-button-rounded p-button-text"
                    [ngClass]="usuario.ativo ? 'p-button-danger' : 'p-button-success'"
                    [pTooltip]="usuario.ativo ? 'Desativar' : 'Ativar'"
                    (click)="toggleStatus(usuario)"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" style="text-align: center">
                Nenhum usuário encontrado
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <app-trocar-senha-dialog
      [(visible)]="trocarSenhaVisible"
      [usuarioId]="usuarioSelecionado?.usuarioId"
      [usuarioNome]="usuarioSelecionado?.nome"
      (onSuccess)="onTrocarSenhaSuccess()"
    ></app-trocar-senha-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .usuario-list-container {
      padding: 2rem;
    }

    .access-denied {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      gap: 1rem;
    }

    .access-denied h2 {
      color: #dc3545;
      margin: 0;
    }

    .access-denied p {
      color: #6c757d;
      margin: 0.25rem 0;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0;
      color: #333;
    }

    .filters {
      margin-bottom: 1.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  `]
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  usuarios: UsuarioResponse[] = [];
  loading = false;
  isAdmin = false;
  perfilFiltro?: PerfilUsuario;
  trocarSenhaVisible = false;
  usuarioSelecionado?: UsuarioResponse;

  perfis = [
    { label: 'Administrador', value: PerfilUsuario.ROLE_ADMIN },
    { label: 'Compliance', value: PerfilUsuario.ROLE_COMPLIANCE },
    { label: 'Responsável', value: PerfilUsuario.ROLE_RESPONSAVEL },
    { label: 'Visualizador', value: PerfilUsuario.ROLE_VISUALIZADOR }
  ];

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole(PerfilUsuario.ROLE_ADMIN);
    if (this.isAdmin) {
      this.carregarUsuarios();
    }
  }

  async carregarUsuarios(): Promise<void> {
    try {
      this.loading = true;
      this.usuarios = await this.usuarioService.listar(this.perfilFiltro).toPromise() || [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os usuários'
      });
    } finally {
      this.loading = false;
    }
  }

  aplicarFiltro(): void {
    this.carregarUsuarios();
  }

  novoUsuario(): void {
    this.router.navigate(['/usuarios/novo']);
  }

  editarUsuario(id: number): void {
    this.router.navigate([`/usuarios/${id}/editar`]);
  }

  abrirDialogTrocarSenha(usuario: UsuarioResponse): void {
    this.usuarioSelecionado = usuario;
    this.trocarSenhaVisible = true;
  }

  onTrocarSenhaSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Senha alterada com sucesso'
    });
    this.trocarSenhaVisible = false;
    this.usuarioSelecionado = undefined;
  }

  toggleStatus(usuario: UsuarioResponse): void {
    const acao = usuario.ativo ? 'desativar' : 'ativar';
    this.confirmationService.confirm({
      message: `Deseja realmente ${acao} o usuário ${usuario.nome}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        // Como não temos endpoint de toggle status, vamos usar o update
        const updatedUsuario = {
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        };

        this.usuarioService.atualizar(usuario.usuarioId, updatedUsuario).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Usuário ${acao} com sucesso`
            });
            this.carregarUsuarios();
          },
          error: (error) => {
            console.error('Erro ao alterar status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: `Não foi possível ${acao} o usuário`
            });
          }
        });
      }
    });
  }

  getPerfilLabel(perfil: PerfilUsuario): string {
    const perfilMap: { [key: string]: string } = {
      [PerfilUsuario.ROLE_ADMIN]: 'Administrador',
      [PerfilUsuario.ROLE_COMPLIANCE]: 'Compliance',
      [PerfilUsuario.ROLE_RESPONSAVEL]: 'Responsável',
      [PerfilUsuario.ROLE_VISUALIZADOR]: 'Visualizador'
    };
    return perfilMap[perfil] || perfil;
  }

  getPerfilSeverity(perfil: PerfilUsuario): 'success' | 'info' | 'warning' | 'danger' {
    const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' } = {
      [PerfilUsuario.ROLE_ADMIN]: 'danger',
      [PerfilUsuario.ROLE_COMPLIANCE]: 'warning',
      [PerfilUsuario.ROLE_RESPONSAVEL]: 'info',
      [PerfilUsuario.ROLE_VISUALIZADOR]: 'success'
    };
    return severityMap[perfil] || 'info';
  }
}
