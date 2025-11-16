package com.compliance.sgc.dto.audit;

import java.time.LocalDateTime;

/**
 * DTO de resposta para AuditLog.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record AuditLogResponseDTO(
    Long auditLogId,
    String usuario,
    String entidade,
    Long entidadeId,
    String acao,
    String valorAnterior,
    String valorNovo,
    LocalDateTime timestamp,
    String ipAddress,
    String userAgent) {}
