package com.compliance.sgc.dto.obrigacao;

import com.compliance.sgc.domain.enums.Periodicidade;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Schema(description = "Dados de resposta de uma obrigação de compliance")
public record ObrigacaoResponseDTO(
    @Schema(description = "ID da obrigação", example = "1")
    Long obrigacaoId,

    @Schema(description = "Título da obrigação", example = "Envio de relatório mensal ao BCB")
    String titulo,

    @Schema(description = "Descrição detalhada da obrigação", example = "Enviar relatório de controles internos conforme Resolução 4.557/2017")
    String descricao,

    @Schema(description = "Data limite para cumprimento", example = "2025-12-31")
    LocalDate prazoExecucao,

    @Schema(description = "Periodicidade da obrigação", example = "MENSAL")
    Periodicidade periodicidade,

    @Schema(description = "ID do responsável", example = "1")
    Long responsavelId,

    @Schema(description = "Nome do responsável", example = "João Silva")
    String responsavelNome,

    @Schema(description = "Status atual da obrigação", example = "RASCUNHO")
    StatusObrigacao status,

    @Schema(description = "Data e hora da submissão para aprovação", example = "2025-11-15T10:30:00")
    LocalDateTime dataSubmissao,

    @Schema(description = "Data e hora da aprovação", example = "2025-11-16T14:20:00")
    LocalDateTime dataAprovacao,

    @Schema(description = "Nome do aprovador", example = "Maria Santos")
    String aprovadorNome,

    @Schema(description = "Comentários em caso de reprovação", example = "Documentação incompleta")
    String comentariosReprovacao,

    @Schema(description = "Indica se a obrigação está ativa", example = "true")
    Boolean ativo,

    @Schema(description = "Data e hora de criação do registro", example = "2025-11-14T08:00:00")
    LocalDateTime criadoEm
) {}
