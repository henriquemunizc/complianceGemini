package com.compliance.sgc.dto.norma;

import com.compliance.sgc.domain.enums.TipoNorma;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Dados de resposta de uma norma regulatória")
public record NormaResponseDTO(
    @Schema(description = "ID da norma", example = "1")
    Long normaId,

    @Schema(description = "Título completo da norma", example = "Dispõe sobre a implementação de estrutura de gerenciamento de riscos")
    String titulo,

    @Schema(description = "Número da norma", example = "4.557")
    String numero,

    @Schema(description = "Ano de publicação", example = "2017")
    Integer ano,

    @Schema(description = "Tipo da norma", example = "RESOLUCAO")
    TipoNorma tipoNorma,

    @Schema(description = "Órgão emissor", example = "Banco Central do Brasil")
    String orgaoEmissor,

    @Schema(description = "Data de publicação oficial", example = "2017-02-23")
    LocalDate dataPublicacao,

    @Schema(description = "Ementa ou resumo da norma", example = "Dispõe sobre a estrutura de gerenciamento de riscos e de capital")
    String ementa,

    @Schema(description = "URL para acesso ao texto integral", example = "https://www.bcb.gov.br/pre/normativos/busca/normativo.asp?numero=4557")
    String urlPublicacao,

    @Schema(description = "Indica se a norma está ativa", example = "true")
    Boolean ativo,

    @Schema(description = "Data e hora de criação do registro", example = "2025-11-14T08:00:00")
    LocalDateTime criadoEm,

    @Schema(description = "Usuário que criou o registro", example = "admin@sgc.com")
    String criadoPor
) {}
