package com.compliance.sgc.dto.norma;

import com.compliance.sgc.domain.enums.TipoNorma;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record NormaCreateDTO(
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    @NotBlank(message = "Número é obrigatório")
    @Size(max = 50, message = "Número deve ter no máximo 50 caracteres")
    String numero,

    @NotNull(message = "Ano é obrigatório")
    Integer ano,

    @NotNull(message = "Tipo de norma é obrigatório")
    TipoNorma tipoNorma,

    @Size(max = 200, message = "Órgão emissor deve ter no máximo 200 caracteres")
    String orgaoEmissor,

    @NotNull(message = "Data de publicação é obrigatória")
    @PastOrPresent(message = "Data de publicação não pode ser futura")
    LocalDate dataPublicacao,

    String ementa,

    @Size(max = 500, message = "URL deve ter no máximo 500 caracteres")
    String urlPublicacao
) {}
