package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.Periodicidade;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Obrigacao - Obrigações de compliance vinculadas a normas.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_OBRIGACOES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Obrigacao extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "obrigacao_id")
  private Long obrigacaoId;

  @Column(name = "titulo", nullable = false, length = 500)
  private String titulo;

  @Column(name = "descricao", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String descricao;

  @Column(name = "prazo_execucao")
  private LocalDate prazoExecucao;

  @Enumerated(EnumType.STRING)
  @Column(name = "periodicidade", length = 50)
  private Periodicidade periodicidade;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "responsavel_id", nullable = false)
  private Usuario responsavel;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 50)
  private StatusObrigacao status = StatusObrigacao.PENDENTE;

  @Column(name = "data_submissao")
  private LocalDateTime dataSubmissao;

  @Column(name = "data_aprovacao")
  private LocalDateTime dataAprovacao;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "aprovador_id")
  private Usuario aprovador;

  @Column(name = "comentarios_reprovacao", columnDefinition = "NVARCHAR(MAX)")
  private String comentariosReprovacao;

  @Column(name = "ativo", nullable = false)
  private Boolean ativo = true;

  @OneToMany(mappedBy = "obrigacao", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ObrigacaoHierarquia> vinculosHierarquia = new ArrayList<>();

  @OneToMany(mappedBy = "obrigacao", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Evidencia> evidencias = new ArrayList<>();

  @OneToMany(mappedBy = "obrigacao", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<HistoricoStatus> historicos = new ArrayList<>();

  /**
   * Método helper para adicionar vínculo de hierarquia.
   */
  public void addVinculoHierarquia(ObrigacaoHierarquia vinculo) {
    vinculosHierarquia.add(vinculo);
    vinculo.setObrigacao(this);
  }

  /**
   * Método helper para adicionar evidência.
   */
  public void addEvidencia(Evidencia evidencia) {
    evidencias.add(evidencia);
    evidencia.setObrigacao(this);
  }

  /**
   * Método helper para adicionar histórico.
   */
  public void addHistorico(HistoricoStatus historico) {
    historicos.add(historico);
    historico.setObrigacao(this);
  }
}
