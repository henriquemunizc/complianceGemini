package com.compliance.sgc.dto.comentario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para criação de Comentario.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record ComentarioCreateDTO(
    @NotNull(message = "ID da obrigação é obrigatório") Long obrigacaoId,
    @NotBlank(message = "Conteúdo é obrigatório") String conteudo,
    Long comentarioPaiId // opcional, para respostas
    ) {}
