package com.compliance.sgc.dto.norma;

import com.compliance.sgc.domain.enums.TipoNorma;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record NormaResponseDTO(
    Long normaId,
    String titulo,
    String numero,
    Integer ano,
    TipoNorma tipoNorma,
    String orgaoEmissor,
    LocalDate dataPublicacao,
    String ementa,
    String urlPublicacao,
    Boolean ativo,
    LocalDateTime criadoEm,
    String criadoPor
) {}
