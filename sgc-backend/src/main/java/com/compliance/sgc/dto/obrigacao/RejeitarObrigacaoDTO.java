package com.compliance.sgc.dto.obrigacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RejeitarObrigacaoDTO(
    @NotBlank(message = "Motivo da rejeição é obrigatório")
        @Size(max = 1000, message = "Motivo da rejeição deve ter no máximo 1000 caracteres")
        String motivoRejeicao) {}
