import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { FAQS, FAQ, VIDEO_TUTORIALS, VideoTutorial, HELP_CONTENT } from '../constants/help-content';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contextual-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    InputTextModule,
    AccordionModule,
    TabViewModule
  ],
  template: `
    <p-sidebar
      [(visible)]="visible"
      position="right"
      [style]="{width: '500px'}"
      [modal]="false"
      styleClass="help-sidebar"
    >
      <ng-template pTemplate="header">
        <div class="help-header">
          <i class="pi pi-book" style="margin-right: 8px;"></i>
          <span>Central de Ajuda</span>
        </div>
      </ng-template>

      <div class="help-content">
        <!-- Busca -->
        <div class="search-box">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              placeholder="Buscar na ajuda..."
              class="w-full"
            />
          </span>
        </div>

        <!-- Tabs -->
        <p-tabView styleClass="help-tabs">
          <!-- Tab: FAQs -->
          <p-tabPanel header="FAQs" leftIcon="pi pi-question-circle">
            <div class="faq-section">
              <p-accordion *ngIf="!searchQuery">
                <p-accordionTab
                  *ngFor="let category of faqCategories"
                  [header]="category + ' (' + getFaqsByCategory(category).length + ')'"
                >
                  <div class="faq-list">
                    <div *ngFor="let faq of getFaqsByCategory(category)" class="faq-item">
                      <h4 class="faq-question">{{ faq.question }}</h4>
                      <p class="faq-answer">{{ faq.answer }}</p>
                    </div>
                  </div>
                </p-accordionTab>
              </p-accordion>

              <!-- Resultados de busca -->
              <div *ngIf="searchQuery" class="search-results">
                <div *ngIf="filteredFaqs.length === 0" class="no-results">
                  <i class="pi pi-search" style="font-size: 2rem; color: #9ca3af;"></i>
                  <p>Nenhum resultado encontrado para "{{ searchQuery }}"</p>
                </div>

                <div *ngFor="let faq of filteredFaqs" class="faq-item">
                  <span class="faq-category-badge">{{ faq.category }}</span>
                  <h4 class="faq-question">{{ faq.question }}</h4>
                  <p class="faq-answer">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </p-tabPanel>

          <!-- Tab: Vídeos -->
          <p-tabPanel header="Vídeos" leftIcon="pi pi-youtube">
            <div class="videos-section">
              <div *ngFor="let video of videoTutorials" class="video-item">
                <div class="video-thumbnail" (click)="openVideo(video)">
                  <i class="pi pi-play-circle"></i>
                  <span class="video-duration">{{ video.duration }}</span>
                </div>
                <div class="video-info">
                  <h4 class="video-title">{{ video.title }}</h4>
                  <p class="video-description">{{ video.description }}</p>
                  <span class="video-category-badge">{{ video.category }}</span>
                </div>
              </div>
            </div>
          </p-tabPanel>

          <!-- Tab: Guias -->
          <p-tabPanel header="Guias" leftIcon="pi pi-book">
            <div class="guides-section">
              <div class="guide-item" *ngFor="let guide of guides">
                <div class="guide-icon">
                  <i [class]="guide.icon"></i>
                </div>
                <div class="guide-info">
                  <h4 class="guide-title">{{ guide.title }}</h4>
                  <p class="guide-description">{{ guide.description }}</p>
                  <a [href]="guide.link" target="_blank" class="guide-link">
                    Acessar guia <i class="pi pi-external-link"></i>
                  </a>
                </div>
              </div>
            </div>
          </p-tabPanel>
        </p-tabView>
      </div>
    </p-sidebar>

    <!-- Modal de Vídeo -->
    <div *ngIf="selectedVideo" class="video-modal-overlay" (click)="closeVideo()">
      <div class="video-modal" (click)="$event.stopPropagation()">
        <div class="video-modal-header">
          <h3>{{ selectedVideo.title }}</h3>
          <button class="close-btn" (click)="closeVideo()">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="video-container">
          <iframe
            *ngIf="videoUrl"
            [src]="videoUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .help-sidebar {
      .p-sidebar-header {
        background: #6366f1;
        color: white;
      }

      .p-sidebar-content {
        padding: 0;
      }
    }

    .help-header {
      display: flex;
      align-items: center;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .help-content {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .search-box {
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    :host ::ng-deep .help-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;

      .p-tabview-panels {
        flex: 1;
        overflow-y: auto;
      }
    }

    .faq-section {
      padding: 16px;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .faq-item {
      padding: 12px;
      border-left: 3px solid #6366f1;
      background: #f9fafb;
      border-radius: 4px;
    }

    .faq-category-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #6366f1;
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
      margin-bottom: 8px;
    }

    .faq-question {
      margin: 0 0 8px 0;
      font-size: 0.938rem;
      font-weight: 600;
      color: #1f2937;
    }

    .faq-answer {
      margin: 0;
      font-size: 0.875rem;
      color: #4b5563;
      line-height: 1.5;
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .no-results {
      text-align: center;
      padding: 40px 20px;
      color: #6b7280;
    }

    .videos-section {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .video-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .video-item:hover {
      border-color: #6366f1;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
    }

    .video-thumbnail {
      position: relative;
      width: 120px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .video-thumbnail i {
      font-size: 2rem;
      color: white;
    }

    .video-duration {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .video-info {
      flex: 1;
    }

    .video-title {
      margin: 0 0 4px 0;
      font-size: 0.938rem;
      font-weight: 600;
      color: #1f2937;
    }

    .video-description {
      margin: 0 0 8px 0;
      font-size: 0.813rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .video-category-badge {
      display: inline-block;
      padding: 2px 8px;
      background: #ede9fe;
      color: #6366f1;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .guides-section {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .guide-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .guide-icon {
      width: 48px;
      height: 48px;
      background: #ede9fe;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .guide-icon i {
      font-size: 1.5rem;
      color: #6366f1;
    }

    .guide-info {
      flex: 1;
    }

    .guide-title {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .guide-description {
      margin: 0 0 8px 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
    }

    .guide-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .guide-link:hover {
      text-decoration: underline;
    }

    .video-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .video-modal {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
    }

    .video-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .video-modal-header h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      color: #6b7280;
      font-size: 1.25rem;
    }

    .close-btn:hover {
      color: #1f2937;
    }

    .video-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
    }

    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  `]
})
export class ContextualHelpComponent implements OnInit, OnDestroy {
  visible = false;
  searchQuery = '';
  faqs = FAQS;
  filteredFaqs: FAQ[] = [];
  faqCategories: string[] = [];
  videoTutorials = VIDEO_TUTORIALS;
  selectedVideo: VideoTutorial | null = null;
  videoUrl: SafeResourceUrl | null = null;

  guides = [
    {
      title: 'Manual do Usuário',
      description: 'Guia completo de todas as funcionalidades do SGC',
      icon: 'pi pi-file-pdf',
      link: '/assets/docs/manual-usuario.pdf'
    },
    {
      title: 'Guia de Compliance',
      description: 'Boas práticas para gestão de compliance',
      icon: 'pi pi-shield',
      link: '/assets/docs/guia-compliance.pdf'
    },
    {
      title: 'API Documentation',
      description: 'Documentação técnica da API REST',
      icon: 'pi pi-code',
      link: '/assets/docs/api-docs.html'
    },
    {
      title: 'Glossário',
      description: 'Termos e definições do sistema',
      icon: 'pi pi-book',
      link: '/assets/docs/glossario.pdf'
    }
  ];

  private eventListeners: (() => void)[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Extrai categorias únicas dos FAQs
    this.faqCategories = [...new Set(this.faqs.map(faq => faq.category))];

    // Listener para abrir painel de ajuda
    const openListener = () => {
      this.visible = true;
    };
    window.addEventListener('open-help-center', openListener);
    this.eventListeners.push(() => window.removeEventListener('open-help-center', openListener));

    // Listener para mostrar vídeos
    const videosListener = () => {
      this.visible = true;
      // TODO: Mudar para tab de vídeos programaticamente
    };
    window.addEventListener('show-video-tutorials', videosListener);
    this.eventListeners.push(() => window.removeEventListener('show-video-tutorials', videosListener));
  }

  ngOnDestroy(): void {
    this.eventListeners.forEach(cleanup => cleanup());
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredFaqs = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredFaqs = this.faqs.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.toLowerCase().includes(query)
    );
  }

  getFaqsByCategory(category: string): FAQ[] {
    return this.faqs.filter(faq => faq.category === category);
  }

  openVideo(video: VideoTutorial): void {
    this.selectedVideo = video;
    const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  closeVideo(): void {
    this.selectedVideo = null;
    this.videoUrl = null;
  }
}
