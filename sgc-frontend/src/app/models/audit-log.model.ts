/**
 * Modelos para Audit Log
 */

export interface AuditLog {
  auditLogId: number;
  usuario: string;
  entidade: string;
  entidadeId: number;
  acao: string;
  valorAnterior?: string;
  valorNovo?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilter {
  entidade?: string;
  entidadeId?: number;
  usuario?: string;
  inicio?: Date;
  fim?: Date;
}
