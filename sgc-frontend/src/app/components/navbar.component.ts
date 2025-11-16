import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { PerfilUsuario } from '../models/auth.model';
import { GlobalSearchComponent } from './global-search.component';
import { NotificationBellComponent } from './notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, AvatarModule, GlobalSearchComponent, NotificationBellComponent],
  template: `
    <div class="navbar-container">
      <p-menubar [model]="menuItems">
        <ng-template pTemplate="start">
          <div class="navbar-brand">
            <i class="pi pi-shield"></i>
            <span class="brand-text">SGC - Compliance</span>
          </div>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="navbar-actions">
            <app-global-search></app-global-search>
            <app-notification-bell></app-notification-bell>
            <div class="navbar-user">
              <p-avatar
                [label]="getUserInitials()"
                shape="circle"
                styleClass="user-avatar"
              ></p-avatar>
              <div class="user-info">
                <span class="user-name">{{ getUserName() }}</span>
                <span class="user-role">{{ getUserRole() }}</span>
              </div>
              <button
                class="logout-button"
                (click)="logout()"
                title="Sair"
              >
                <i class="pi pi-sign-out"></i>
              </button>
            </div>
          </div>
        </ng-template>
      </p-menubar>
    </div>
  `,
  styles: [`
    .navbar-container {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: #2196F3;
      padding: 0 1rem;
    }

    .navbar-brand i {
      font-size: 1.5rem;
    }

    .brand-text {
      color: #333;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .user-role {
      font-size: 0.75rem;
      color: #6c757d;
    }

    ::ng-deep .user-avatar {
      background-color: #2196F3;
      color: white;
      font-weight: 600;
    }

    .logout-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      color: #6c757d;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logout-button:hover {
      background-color: #f8f9fa;
      color: #dc3545;
    }

    .logout-button i {
      font-size: 1.25rem;
    }

    ::ng-deep .p-menubar {
      border-radius: 0;
      border: none;
      border-bottom: 1px solid #dee2e6;
      padding: 0.75rem 1rem;
    }

    ::ng-deep .p-menubar .p-menubar-root-list {
      gap: 0.5rem;
    }

    ::ng-deep .p-menubar .p-menuitem-link {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      transition: all 0.3s;
    }

    ::ng-deep .p-menubar .p-menuitem-link:hover {
      background-color: #f8f9fa;
    }

    ::ng-deep .p-menubar .p-menuitem-link .p-menuitem-text {
      color: #333;
      font-weight: 500;
    }

    ::ng-deep .p-menubar .p-menuitem-link .p-menuitem-icon {
      color: #2196F3;
    }

    @media (max-width: 768px) {
      .navbar-brand .brand-text {
        display: none;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuItems: MenuItem[] = [];

  constructor() {
    this.buildMenu();
  }

  private buildMenu(): void {
    const currentUser = this.authService.currentUser$;

    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Normas',
        icon: 'pi pi-book',
        routerLink: '/normas'
      },
      {
        label: 'Obrigações',
        icon: 'pi pi-file',
        routerLink: '/obrigacoes'
      }
    ];

    // Adiciona menu de usuários apenas para ADMIN
    if (this.authService.hasRole(PerfilUsuario.ROLE_ADMIN)) {
      this.menuItems.push({
        label: 'Usuários',
        icon: 'pi pi-users',
        routerLink: '/usuarios'
      });
    }
  }

  getUserName(): string {
    let name = '';
    this.authService.currentUser$.subscribe(user => {
      name = user?.nome || 'Usuário';
    }).unsubscribe();
    return name;
  }

  getUserRole(): string {
    let role = '';
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const roleMap: { [key: string]: string } = {
          [PerfilUsuario.ROLE_ADMIN]: 'Administrador',
          [PerfilUsuario.ROLE_COMPLIANCE]: 'Compliance',
          [PerfilUsuario.ROLE_RESPONSAVEL]: 'Responsável',
          [PerfilUsuario.ROLE_VISUALIZADOR]: 'Visualizador'
        };
        role = roleMap[user.perfil] || user.perfil;
      }
    }).unsubscribe();
    return role;
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
