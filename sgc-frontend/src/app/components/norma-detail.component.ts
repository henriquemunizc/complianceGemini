import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NormaService } from '../services/norma.service';
import { AuthService } from '../services/auth.service';
import { NormaResponse } from '../models/norma.model';
import { PerfilUsuario } from '../models/auth.model';

@Component({
  selector: 'app-norma-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="card" *ngIf="norma">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Detalhes da Norma</h2>
        <div class="flex gap-2">
          <p-button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            [outlined]="true"
            (onClick)="voltar()"
          ></p-button>

          <p-button
            *ngIf="canEdit"
            label="Editar"
            icon="pi pi-pencil"
            severity="warning"
            (onClick)="editar()"
          ></p-button>
        </div>
      </div>

      <p-card>
        <div class="grid">
          <!-- Status -->
          <div class="col-12 mb-3">
            <p-tag
              [value]="norma.dataRevogacao ? 'Revogada' : 'Vigente'"
              [severity]="norma.dataRevogacao ? 'danger' : 'success'"
              styleClass="text-xl"
            ></p-tag>
          </div>

          <p-divider></p-divider>

          <!-- Tipo e Identificação -->
          <div class="col-12 md:col-4">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Tipo</label>
              <div class="text-900 text-lg">{{ norma.tipo }}</div>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Número</label>
              <div class="text-900 text-lg">{{ norma.numero }}</div>
            </div>
          </div>

          <div class="col-12 md:col-4">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Ano</label>
              <div class="text-900 text-lg">{{ norma.ano }}</div>
            </div>
          </div>

          <!-- Ementa -->
          <div class="col-12">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Ementa</label>
              <div class="text-900 line-height-3">{{ norma.ementa }}</div>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Datas -->
          <div class="col-12 md:col-6">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Data de Publicação</label>
              <div class="text-900">
                <i class="pi pi-calendar mr-2"></i>
                {{ norma.dataPublicacao | date:'dd/MM/yyyy' }}
              </div>
            </div>
          </div>

          <div class="col-12 md:col-6" *ngIf="norma.dataRevogacao">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Data de Revogação</label>
              <div class="text-900">
                <i class="pi pi-calendar mr-2"></i>
                {{ norma.dataRevogacao | date:'dd/MM/yyyy' }}
              </div>
            </div>
          </div>

          <!-- Link Oficial -->
          <div class="col-12" *ngIf="norma.linkOficial">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Link Oficial</label>
              <div class="text-900">
                <a
                  [href]="norma.linkOficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary"
                >
                  <i class="pi pi-external-link mr-2"></i>
                  {{ norma.linkOficial }}
                </a>
              </div>
            </div>
          </div>

          <p-divider></p-divider>

          <!-- Metadados -->
          <div class="col-12 md:col-6">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">ID</label>
              <div class="text-900">#{{ norma.normaId }}</div>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Criado em</label>
              <div class="text-900">{{ norma.criadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
          </div>

          <div class="col-12 md:col-6" *ngIf="norma.atualizadoEm">
            <div class="mb-3">
              <label class="block text-600 font-semibold mb-2">Atualizado em</label>
              <div class="text-900">{{ norma.atualizadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
          </div>
        </div>
      </p-card>
    </div>

    <!-- Loading State -->
    <div class="card" *ngIf="loading">
      <div class="flex justify-content-center align-items-center" style="min-height: 400px;">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
      </div>
    </div>
  `
})
export class NormaDetailComponent implements OnInit {
  private normaService = inject(NormaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  norma?: NormaResponse;
  loading = false;

  get canEdit(): boolean {
    return this.authService.hasAnyRole([PerfilUsuario.ROLE_COMPLIANCE, PerfilUsuario.ROLE_ADMIN]);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadNorma(+id);
    } else {
      this.voltar();
    }
  }

  loadNorma(id: number): void {
    this.loading = true;
    this.normaService.buscarPorId(id).subscribe({
      next: (norma) => {
        this.norma = norma;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar norma'
        });
        this.loading = false;
        this.voltar();
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/normas']);
  }

  editar(): void {
    if (this.norma) {
      this.router.navigate(['/normas', this.norma.normaId, 'editar']);
    }
  }
}
