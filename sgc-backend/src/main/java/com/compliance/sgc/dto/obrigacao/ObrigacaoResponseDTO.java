package com.compliance.sgc.dto.obrigacao;

import com.compliance.sgc.domain.enums.Periodicidade;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ObrigacaoResponseDTO(
    Long obrigacaoId,
    String titulo,
    String descricao,
    LocalDate prazoExecucao,
    Periodicidade periodicidade,
    Long responsavelId,
    String responsavelNome,
    StatusObrigacao status,
    LocalDateTime dataSubmissao,
    LocalDateTime dataAprovacao,
    String aprovadorNome,
    String comentariosReprovacao,
    Boolean ativo,
    LocalDateTime criadoEm
) {}
