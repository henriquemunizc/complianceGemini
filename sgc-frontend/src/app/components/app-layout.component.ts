import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="layout-wrapper">
      <app-navbar></app-navbar>
      <div class="layout-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
    }

    .layout-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    @media (max-width: 768px) {
      .layout-main {
        padding: 0;
      }
    }
  `]
})
export class AppLayoutComponent {}
