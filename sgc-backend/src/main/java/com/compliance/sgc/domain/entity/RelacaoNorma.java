package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.TipoRelacaoNorma;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Entidade RelacaoNorma - Relacionamentos entre Normas.
 * Exemplo: Lei A REGULAMENTA Lei B, Lei X REVOGA Lei Y.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_RELACOES_NORMAS")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RelacaoNorma {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "relacao_id")
  private Long relacaoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "norma_origem_id", nullable = false)
  private Norma normaOrigem;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "norma_destino_id", nullable = false)
  private Norma normaDestino;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_relacao", nullable = false, length = 50)
  private TipoRelacaoNorma tipoRelacao;

  @Column(name = "descricao", length = 500)
  private String descricao;

  @CreatedDate
  @Column(name = "criado_em", nullable = false, updatable = false)
  private LocalDateTime criadoEm;

  @CreatedBy
  @Column(name = "criado_por", nullable = false, updatable = false, length = 100)
  private String criadoPor;
}
