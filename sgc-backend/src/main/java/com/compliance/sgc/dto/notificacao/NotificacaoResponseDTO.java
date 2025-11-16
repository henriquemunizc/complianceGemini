package com.compliance.sgc.dto.notificacao;

import com.compliance.sgc.domain.enums.TipoNotificacao;
import java.time.LocalDateTime;

/**
 * DTO de resposta para Notificacao.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record NotificacaoResponseDTO(
    Long notificacaoId,
    Long usuarioId,
    String usuarioNome,
    TipoNotificacao tipo,
    String titulo,
    String mensagem,
    String link,
    Boolean lida,
    LocalDateTime dataLeitura,
    LocalDateTime criadoEm) {}
