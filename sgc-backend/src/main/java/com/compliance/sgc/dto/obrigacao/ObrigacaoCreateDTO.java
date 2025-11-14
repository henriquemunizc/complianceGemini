package com.compliance.sgc.dto.obrigacao;

import com.compliance.sgc.domain.enums.Periodicidade;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record ObrigacaoCreateDTO(
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @Future(message = "Prazo de execução deve ser futuro")
    LocalDate prazoExecucao,

    Periodicidade periodicidade,

    @NotNull(message = "Responsável é obrigatório")
    Long responsavelId,

    @NotEmpty(message = "Deve haver pelo menos um vínculo com a hierarquia de normas")
    List<VinculoHierarquiaDTO> vinculosHierarquia
) {}
