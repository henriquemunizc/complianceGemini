package com.compliance.sgc.dto.relacao;

import com.compliance.sgc.domain.enums.TipoRelacaoNorma;
import java.time.LocalDateTime;

/**
 * DTO de resposta de relação entre normas.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record RelacaoNormaResponseDTO(
    Long relacaoId,
    Long normaOrigemId,
    String normaOrigemTitulo,
    Long normaDestinoId,
    String normaDestinoTitulo,
    TipoRelacaoNorma tipoRelacao,
    String descricao,
    LocalDateTime criadoEm,
    String criadoPor) {}
