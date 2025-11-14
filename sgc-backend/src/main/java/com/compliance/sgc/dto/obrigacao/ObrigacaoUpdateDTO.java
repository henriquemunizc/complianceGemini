package com.compliance.sgc.dto.obrigacao;

import com.compliance.sgc.domain.enums.Periodicidade;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ObrigacaoUpdateDTO(
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    String descricao,

    LocalDate prazoExecucao,

    Periodicidade periodicidade,

    Long responsavelId
) {}
