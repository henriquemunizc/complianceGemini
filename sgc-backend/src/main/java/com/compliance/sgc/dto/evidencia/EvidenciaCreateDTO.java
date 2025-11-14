package com.compliance.sgc.dto.evidencia;

import com.compliance.sgc.domain.enums.TipoEvidencia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record EvidenciaCreateDTO(
    @NotNull(message = "Obrigação é obrigatória")
    Long obrigacaoId,

    @NotNull(message = "Tipo de evidência é obrigatório")
    TipoEvidencia tipoEvidencia,

    String urlExterna,

    String conteudoTexto,

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao
) {}
