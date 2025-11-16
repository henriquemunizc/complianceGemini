package com.compliance.sgc.dto.feedback;

import com.compliance.sgc.domain.enums.TipoFeedback;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de resposta de Feedback.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {

    private Long feedbackId;
    private Long usuarioId;
    private String usuarioNome;
    private TipoFeedback tipo;
    private String titulo;
    private String descricao;
    private String navegador;
    private String url;
    private String screenshotPath;
    private Boolean resolvido;
    private String resposta;
    private LocalDateTime dataCriacao;
}
