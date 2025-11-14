package com.compliance.sgc.dto.norma;

import com.compliance.sgc.domain.enums.TipoNorma;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record NormaUpdateDTO(
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    @Size(max = 50, message = "Número deve ter no máximo 50 caracteres")
    String numero,

    Integer ano,

    TipoNorma tipoNorma,

    @Size(max = 200, message = "Órgão emissor deve ter no máximo 200 caracteres")
    String orgaoEmissor,

    @PastOrPresent(message = "Data de publicação não pode ser futura")
    LocalDate dataPublicacao,

    String ementa,

    @Size(max = 500, message = "URL deve ter no máximo 500 caracteres")
    String urlPublicacao,

    Boolean ativo
) {}
