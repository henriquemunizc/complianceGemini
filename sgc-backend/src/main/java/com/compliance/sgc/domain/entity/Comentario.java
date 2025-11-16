package com.compliance.sgc.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Comentario - Comentários em obrigações.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Entity
@Table(name = "TBL_COMENTARIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Comentario extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "comentario_id")
  private Long comentarioId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "obrigacao_id", nullable = false)
  private Obrigacao obrigacao;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "autor_id", nullable = false)
  private Usuario autor;

  @Column(name = "conteudo", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String conteudo;

  @Column(name = "editado", nullable = false)
  private Boolean editado = false;

  @Column(name = "data_edicao")
  private LocalDateTime dataEdicao;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "comentario_pai_id")
  private Comentario comentarioPai;

  @OneToMany(mappedBy = "comentarioPai", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Comentario> respostas = new ArrayList<>();

  /**
   * Marca o comentário como editado.
   */
  public void marcarComoEditado() {
    this.editado = true;
    this.dataEdicao = LocalDateTime.now();
  }

  /**
   * Adiciona uma resposta ao comentário.
   */
  public void addResposta(Comentario resposta) {
    respostas.add(resposta);
    resposta.setComentarioPai(this);
  }
}
