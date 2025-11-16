package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.TipoFeedback;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Feedback - Feedbacks, bugs e sugestões enviados pelos usuários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Entity
@Table(name = "TBL_FEEDBACK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Feedback extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Long feedbackId;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private TipoFeedback tipo;

    @Column(name = "titulo", length = 200)
    private String titulo;

    @Column(name = "descricao", nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "navegador", length = 100)
    private String navegador;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "screenshot_path", length = 500)
    private String screenshotPath;

    @Column(name = "resolvido", nullable = false)
    private Boolean resolvido = false;

    @Column(name = "resposta", columnDefinition = "TEXT")
    private String resposta;
}
