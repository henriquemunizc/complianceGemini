package com.compliance.sgc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
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
 * Entidade ObrigacaoHierarquia - Vinculação N:N entre Obrigações e itens da hierarquia de Normas.
 * Uma obrigação pode estar vinculada a um ou mais itens (Norma, Artigo, Inciso ou Alínea).
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_OBRIGACAO_HIERARQUIA")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObrigacaoHierarquia {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "obrigacao_id", nullable = false)
  private Obrigacao obrigacao;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "norma_id")
  private Norma norma;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "artigo_id")
  private Artigo artigo;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inciso_id")
  private Inciso inciso;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "alinea_id")
  private Alinea alinea;

  @CreatedDate
  @Column(name = "criado_em", nullable = false, updatable = false)
  private LocalDateTime criadoEm;

  @CreatedBy
  @Column(name = "criado_por", nullable = false, updatable = false, length = 100)
  private String criadoPor;

  /**
   * Valida se pelo menos um item da hierarquia está presente.
   * Este método pode ser usado em validações de negócio no Service.
   */
  public boolean isValid() {
    return norma != null || artigo != null || inciso != null || alinea != null;
  }
}
