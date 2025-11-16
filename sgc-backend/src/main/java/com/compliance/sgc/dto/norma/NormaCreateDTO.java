package com.compliance.sgc.dto.norma;

import com.compliance.sgc.domain.enums.TipoNorma;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Schema(description = "Dados para criação de uma nova norma regulatória")
public record NormaCreateDTO(
    @Schema(description = "Título completo da norma", example = "Dispõe sobre a implementação de estrutura de gerenciamento de riscos")
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    @Schema(description = "Número da norma", example = "4.557")
    @NotBlank(message = "Número é obrigatório")
    @Size(max = 50, message = "Número deve ter no máximo 50 caracteres")
    String numero,

    @Schema(description = "Ano de publicação da norma", example = "2017")
    @NotNull(message = "Ano é obrigatório")
    Integer ano,

    @Schema(description = "Tipo da norma (LEI, DECRETO, RESOLUCAO, PORTARIA, etc.)", example = "RESOLUCAO")
    @NotNull(message = "Tipo de norma é obrigatório")
    TipoNorma tipoNorma,

    @Schema(description = "Órgão emissor da norma", example = "Banco Central do Brasil")
    @Size(max = 200, message = "Órgão emissor deve ter no máximo 200 caracteres")
    String orgaoEmissor,

    @Schema(description = "Data de publicação oficial", example = "2017-02-23")
    @NotNull(message = "Data de publicação é obrigatória")
    @PastOrPresent(message = "Data de publicação não pode ser futura")
    LocalDate dataPublicacao,

    @Schema(description = "Ementa ou resumo da norma", example = "Dispõe sobre a estrutura de gerenciamento de riscos e de capital para instituições financeiras")
    String ementa,

    @Schema(description = "URL para acesso ao texto integral", example = "https://www.bcb.gov.br/pre/normativos/busca/normativo.asp?numero=4557")
    @Size(max = 500, message = "URL deve ter no máximo 500 caracteres")
    String urlPublicacao
) {}
