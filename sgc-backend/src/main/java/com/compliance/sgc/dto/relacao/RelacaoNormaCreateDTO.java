package com.compliance.sgc.dto.relacao;

import com.compliance.sgc.domain.enums.TipoRelacaoNorma;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para criação de relação entre normas.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record RelacaoNormaCreateDTO(
    @NotNull(message = "ID da norma origem é obrigatório") Long normaOrigemId,
    @NotNull(message = "ID da norma destino é obrigatório") Long normaDestinoId,
    @NotNull(message = "Tipo de relação é obrigatório") TipoRelacaoNorma tipoRelacao,
    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres") String descricao) {}
