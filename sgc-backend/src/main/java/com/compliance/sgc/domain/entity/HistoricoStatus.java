package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.StatusObrigacao;
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
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade HistoricoStatus - Log imutável de mudanças de status de obrigações.
 * Esta tabela é APPEND-ONLY (nunca deletada ou atualizada).
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_HISTORICO_STATUS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HistoricoStatus {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "historico_id")
  private Long historicoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "obrigacao_id", nullable = false)
  private Obrigacao obrigacao;

  @Enumerated(EnumType.STRING)
  @Column(name = "status_anterior", length = 50)
  private StatusObrigacao statusAnterior;

  @Enumerated(EnumType.STRING)
  @Column(name = "status_novo", nullable = false, length = 50)
  private StatusObrigacao statusNovo;

  @Column(name = "data_mudanca", nullable = false)
  private LocalDateTime dataMudanca = LocalDateTime.now();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Column(name = "comentarios", columnDefinition = "NVARCHAR(MAX)")
  private String comentarios;
}
