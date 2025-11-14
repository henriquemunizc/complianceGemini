package com.compliance.sgc.dto.historico;

import com.compliance.sgc.domain.enums.StatusObrigacao;
import java.time.LocalDateTime;

public record HistoricoResponseDTO(
    Long historicoId,
    Long obrigacaoId,
    StatusObrigacao statusAnterior,
    StatusObrigacao statusNovo,
    LocalDateTime dataMudanca,
    String usuarioNome,
    String comentarios
) {}
