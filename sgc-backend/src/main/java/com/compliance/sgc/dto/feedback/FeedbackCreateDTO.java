package com.compliance.sgc.dto.feedback;

import com.compliance.sgc.domain.enums.TipoFeedback;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para criação de Feedback.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackCreateDTO {

    @NotNull(message = "Tipo é obrigatório")
    private TipoFeedback tipo;

    @Size(max = 200, message = "Título deve ter no máximo 200 caracteres")
    private String titulo;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 2000, message = "Descrição deve ter no máximo 2000 caracteres")
    private String descricao;

    private String navegador;

    private String url;
}
