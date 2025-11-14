package com.compliance.sgc.dto.obrigacao;

import jakarta.validation.constraints.Size;

public record AprovarObrigacaoDTO(
    @Size(max = 1000, message = "Motivo da aprovação deve ter no máximo 1000 caracteres")
        String motivoAprovacao) {}
