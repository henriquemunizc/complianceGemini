package com.compliance.sgc.dto.obrigacao;

import com.compliance.sgc.domain.enums.Periodicidade;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

@Schema(description = "Dados para criação de uma nova obrigação de compliance")
public record ObrigacaoCreateDTO(
    @Schema(description = "Título da obrigação", example = "Envio de relatório mensal ao BCB")
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 500, message = "Título deve ter no máximo 500 caracteres")
    String titulo,

    @Schema(description = "Descrição detalhada da obrigação", example = "Enviar relatório de controles internos conforme Resolução 4.557/2017")
    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @Schema(description = "Data limite para cumprimento da obrigação", example = "2025-12-31")
    @Future(message = "Prazo de execução deve ser futuro")
    LocalDate prazoExecucao,

    @Schema(description = "Periodicidade da obrigação (UNICA, MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL)", example = "MENSAL")
    Periodicidade periodicidade,

    @Schema(description = "ID do usuário responsável pela obrigação", example = "1")
    @NotNull(message = "Responsável é obrigatório")
    Long responsavelId,

    @Schema(description = "Lista de vínculos com a hierarquia de normas (norma -> artigo -> inciso)")
    @NotEmpty(message = "Deve haver pelo menos um vínculo com a hierarquia de normas")
    List<VinculoHierarquiaDTO> vinculosHierarquia
) {}
