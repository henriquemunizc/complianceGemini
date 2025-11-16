import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ComentarioService } from '../services/comentario.service';
import { Comentario, ComentarioCreateDTO, ComentarioUpdateDTO } from '../models/comentario.model';
import { TimeAgoPipe } from '../pipes/time-ago.pipe';

/**
 * Componente de seção de comentários com suporte a threads e edição.
 */
@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextareaModule,
    AvatarModule,
    DividerModule,
    ConfirmDialogModule,
    TimeAgoPipe,
  ],
  providers: [ConfirmationService],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="comment-section-header">
          <h3><i class="pi pi-comments"></i> Comentários</h3>
          <span class="comment-count">{{ comentarios.length }} comentário(s)</span>
        </div>
      </ng-template>

      <div class="comment-section-content">
        <!-- Editor de novo comentário -->
        <div class="new-comment-editor">
          <div class="editor-header">
            <p-avatar icon="pi pi-user" shape="circle" size="large"></p-avatar>
            <span class="editor-label">Adicionar comentário</span>
          </div>
          <textarea
            pInputTextarea
            [(ngModel)]="novoComentario"
            placeholder="Digite seu comentário... Use @ para mencionar usuários (ex: @usuario@exemplo.com)"
            rows="3"
            class="w-full"
            [disabled]="salvando"
          ></textarea>
          <div class="editor-actions">
            <button
              pButton
              label="Comentar"
              icon="pi pi-send"
              (click)="adicionarComentario()"
              [disabled]="!novoComentario.trim() || salvando"
              [loading]="salvando"
            ></button>
          </div>
        </div>

        <p-divider></p-divider>

        <!-- Lista de comentários -->
        <div *ngIf="comentarios.length === 0" class="empty-state">
          <i class="pi pi-comment" style="font-size: 3rem; color: #999;"></i>
          <p>Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>

        <div *ngFor="let comentario of comentarios" class="comment-item">
          <div class="comment-avatar">
            <p-avatar
              [label]="getInitials(comentario.autorNome)"
              shape="circle"
              size="large"
            ></p-avatar>
          </div>

          <div class="comment-content">
            <div class="comment-author">
              {{ comentario.autorNome }}
              <span class="comment-time">{{ comentario.criadoEm | timeAgo }}</span>
              <span *ngIf="comentario.editado" class="edited-label">(editado)</span>
            </div>

            <!-- Modo visualização -->
            <div *ngIf="comentarioEditando !== comentario.comentarioId" class="comment-text">
              {{ comentario.conteudo }}
            </div>

            <!-- Modo edição -->
            <div *ngIf="comentarioEditando === comentario.comentarioId" class="comment-edit">
              <textarea
                pInputTextarea
                [(ngModel)]="conteudoEditando"
                rows="3"
                class="w-full"
              ></textarea>
              <div class="edit-actions">
                <button
                  pButton
                  label="Salvar"
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="salvarEdicao(comentario)"
                  [disabled]="!conteudoEditando.trim()"
                ></button>
                <button
                  pButton
                  label="Cancelar"
                  icon="pi pi-times"
                  class="p-button-sm p-button-secondary"
                  (click)="cancelarEdicao()"
                ></button>
              </div>
            </div>

            <!-- Ações do comentário -->
            <div class="comment-actions" *ngIf="comentarioEditando !== comentario.comentarioId">
              <button
                pButton
                label="Responder"
                icon="pi pi-reply"
                class="p-button-text p-button-sm"
                (click)="responderComentario(comentario)"
              ></button>
              <button
                pButton
                label="Editar"
                icon="pi pi-pencil"
                class="p-button-text p-button-sm"
                (click)="editarComentario(comentario)"
              ></button>
              <button
                pButton
                label="Excluir"
                icon="pi pi-trash"
                class="p-button-text p-button-sm p-button-danger"
                (click)="excluirComentario(comentario)"
              ></button>
            </div>

            <!-- Respostas (threads) -->
            <div *ngIf="comentario.respostas.length > 0" class="comment-replies">
              <div *ngFor="let resposta of comentario.respostas" class="reply-item">
                <div class="comment-avatar">
                  <p-avatar
                    [label]="getInitials(resposta.autorNome)"
                    shape="circle"
                    size="normal"
                  ></p-avatar>
                </div>
                <div class="comment-content">
                  <div class="comment-author">
                    {{ resposta.autorNome }}
                    <span class="comment-time">{{ resposta.criadoEm | timeAgo }}</span>
                    <span *ngIf="resposta.editado" class="edited-label">(editado)</span>
                  </div>
                  <div class="comment-text">{{ resposta.conteudo }}</div>
                </div>
              </div>
            </div>

            <!-- Editor de resposta -->
            <div *ngIf="respondenodo === comentario.comentarioId" class="reply-editor">
              <textarea
                pInputTextarea
                [(ngModel)]="conteudoResposta"
                placeholder="Digite sua resposta..."
                rows="2"
                class="w-full"
              ></textarea>
              <div class="edit-actions">
                <button
                  pButton
                  label="Responder"
                  icon="pi pi-send"
                  class="p-button-sm"
                  (click)="enviarResposta(comentario)"
                  [disabled]="!conteudoResposta.trim()"
                ></button>
                <button
                  pButton
                  label="Cancelar"
                  icon="pi pi-times"
                  class="p-button-sm p-button-secondary"
                  (click)="cancelarResposta()"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </p-card>

    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [
    `
      .comment-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
      }

      .comment-section-header h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .comment-count {
        color: #666;
        font-size: 0.9rem;
      }

      .comment-section-content {
        padding: 1rem;
      }

      .new-comment-editor {
        margin-bottom: 1.5rem;
      }

      .editor-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .editor-label {
        font-weight: 600;
      }

      .editor-actions {
        margin-top: 0.5rem;
        display: flex;
        justify-content: flex-end;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #999;
      }

      .comment-item {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
      }

      .comment-item:last-child {
        border-bottom: none;
      }

      .comment-avatar {
        flex-shrink: 0;
      }

      .comment-content {
        flex: 1;
      }

      .comment-author {
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .comment-time {
        font-size: 0.85rem;
        color: #999;
        font-weight: normal;
        margin-left: 0.5rem;
      }

      .edited-label {
        font-size: 0.85rem;
        color: #666;
        font-weight: normal;
        font-style: italic;
        margin-left: 0.25rem;
      }

      .comment-text {
        margin-bottom: 0.5rem;
        white-space: pre-wrap;
      }

      .comment-actions {
        display: flex;
        gap: 0.5rem;
      }

      .comment-edit,
      .reply-editor {
        margin-bottom: 0.5rem;
      }

      .edit-actions {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
      }

      .comment-replies {
        margin-top: 1rem;
        padding-left: 2rem;
        border-left: 2px solid #e0e0e0;
      }

      .reply-item {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class CommentSectionComponent implements OnInit {
  @Input() obrigacaoId!: number;

  private comentarioService = inject(ComentarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  comentarios: Comentario[] = [];
  novoComentario = '';
  salvando = false;

  // Estado de edição
  comentarioEditando: number | null = null;
  conteudoEditando = '';

  // Estado de resposta
  respondenodo: number | null = null;
  conteudoResposta = '';

  ngOnInit(): void {
    this.carregarComentarios();
  }

  carregarComentarios(): void {
    this.comentarioService.listarPorObrigacao(this.obrigacaoId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
      },
      error: (err) => {
        console.error('Erro ao carregar comentários:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar comentários',
        });
      },
    });
  }

  adicionarComentario(): void {
    if (!this.novoComentario.trim()) return;

    this.salvando = true;
    const dto: ComentarioCreateDTO = {
      obrigacaoId: this.obrigacaoId,
      conteudo: this.novoComentario,
    };

    this.comentarioService.criar(dto).subscribe({
      next: () => {
        this.novoComentario = '';
        this.salvando = false;
        this.carregarComentarios();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comentário adicionado',
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar comentário:', err);
        this.salvando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar comentário',
        });
      },
    });
  }

  editarComentario(comentario: Comentario): void {
    this.comentarioEditando = comentario.comentarioId;
    this.conteudoEditando = comentario.conteudo;
  }

  salvarEdicao(comentario: Comentario): void {
    const dto: ComentarioUpdateDTO = {
      conteudo: this.conteudoEditando,
    };

    this.comentarioService.atualizar(comentario.comentarioId, dto).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregarComentarios();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Comentário atualizado',
        });
      },
      error: (err) => {
        console.error('Erro ao atualizar comentário:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar comentário',
        });
      },
    });
  }

  cancelarEdicao(): void {
    this.comentarioEditando = null;
    this.conteudoEditando = '';
  }

  excluirComentario(comentario: Comentario): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este comentário?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.comentarioService.excluir(comentario.comentarioId).subscribe({
          next: () => {
            this.carregarComentarios();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Comentário excluído',
            });
          },
          error: (err) => {
            console.error('Erro ao excluir comentário:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao excluir comentário',
            });
          },
        });
      },
    });
  }

  responderComentario(comentario: Comentario): void {
    this.respondenodo = comentario.comentarioId;
    this.conteudoResposta = '';
  }

  enviarResposta(comentarioPai: Comentario): void {
    if (!this.conteudoResposta.trim()) return;

    const dto: ComentarioCreateDTO = {
      obrigacaoId: this.obrigacaoId,
      conteudo: this.conteudoResposta,
      comentarioPaiId: comentarioPai.comentarioId,
    };

    this.comentarioService.criar(dto).subscribe({
      next: () => {
        this.cancelarResposta();
        this.carregarComentarios();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Resposta adicionada',
        });
      },
      error: (err) => {
        console.error('Erro ao adicionar resposta:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao adicionar resposta',
        });
      },
    });
  }

  cancelarResposta(): void {
    this.respondenodo = null;
    this.conteudoResposta = '';
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
