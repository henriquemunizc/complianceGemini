import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProgressBarModule, ToastModule],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="loading-bar" *ngIf="loadingService.loading$ | async">
      <p-progressBar mode="indeterminate" [style]="{'height': '4px'}"></p-progressBar>
    </div>

    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
    }
  `]
})
export class AppComponent {
  title = 'SGC - Sistema de Gestão de Compliance';
  loadingService = inject(LoadingService);
}
