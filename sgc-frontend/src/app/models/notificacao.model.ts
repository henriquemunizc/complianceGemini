/**
 * Modelos para Notificações
 */

export enum TipoNotificacao {
  OBRIGACAO_ATRASADA = 'OBRIGACAO_ATRASADA',
  OBRIGACAO_SUBMETIDA = 'OBRIGACAO_SUBMETIDA',
  OBRIGACAO_APROVADA = 'OBRIGACAO_APROVADA',
  OBRIGACAO_REJEITADA = 'OBRIGACAO_REJEITADA',
  NOVA_EVIDENCIA = 'NOVA_EVIDENCIA',
  COMENTARIO_MENCIONOU = 'COMENTARIO_MENCIONOU',
  PRAZO_PROXIMO = 'PRAZO_PROXIMO',
}

export interface Notificacao {
  notificacaoId: number;
  usuarioId: number;
  usuarioNome: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  dataLeitura?: Date;
  criadoEm: Date;
}

export interface NotificacaoCreateDTO {
  usuarioId: number;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string;
}
