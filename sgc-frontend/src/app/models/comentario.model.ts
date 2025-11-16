/**
 * Modelos para Comentários
 */

export interface Comentario {
  comentarioId: number;
  obrigacaoId: number;
  autorId: number;
  autorNome: string;
  autorEmail: string;
  conteudo: string;
  editado: boolean;
  dataEdicao?: Date;
  criadoEm: Date;
  comentarioPaiId?: number;
  respostas: Comentario[];
}

export interface ComentarioCreateDTO {
  obrigacaoId: number;
  conteudo: string;
  comentarioPaiId?: number;
}

export interface ComentarioUpdateDTO {
  conteudo: string;
}
