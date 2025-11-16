package com.compliance.sgc.dto.notificacao;

import com.compliance.sgc.domain.enums.TipoNotificacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para criação de Notificacao.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record NotificacaoCreateDTO(
    @NotNull(message = "ID do usuário é obrigatório") Long usuarioId,
    @NotNull(message = "Tipo de notificação é obrigatório") TipoNotificacao tipo,
    @NotBlank(message = "Título é obrigatório") String titulo,
    @NotBlank(message = "Mensagem é obrigatória") String mensagem,
    String link) {}
