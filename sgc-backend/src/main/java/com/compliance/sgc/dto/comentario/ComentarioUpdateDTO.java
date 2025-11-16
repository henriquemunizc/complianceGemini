package com.compliance.sgc.dto.comentario;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para atualização de Comentario.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record ComentarioUpdateDTO(
    @NotBlank(message = "Conteúdo é obrigatório") String conteudo) {}
