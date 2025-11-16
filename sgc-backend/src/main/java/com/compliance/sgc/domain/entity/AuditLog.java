package com.compliance.sgc.domain.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade AuditLog - Registro de auditoria de todas as operações do sistema.
 * Esta tabela é IMUTÁVEL - registros nunca devem ser alterados ou excluídos.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Entity
@Table(name = "TBL_AUDIT_LOG")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "audit_log_id")
  private Long auditLogId;

  @Column(name = "usuario", nullable = false, length = 200)
  private String usuario;

  @Column(name = "entidade", nullable = false, length = 100)
  private String entidade;

  @Column(name = "entidade_id", nullable = false)
  private Long entidadeId;

  @Column(name = "acao", nullable = false, length = 50)
  private String acao;

  @Column(name = "valor_anterior", columnDefinition = "NVARCHAR(MAX)")
  private String valorAnterior;

  @Column(name = "valor_novo", columnDefinition = "NVARCHAR(MAX)")
  private String valorNovo;

  @Column(name = "timestamp", nullable = false)
  private LocalDateTime timestamp;

  @Column(name = "ip_address", length = 45)
  private String ipAddress;

  @Column(name = "user_agent", length = 500)
  private String userAgent;

  /**
   * Construtor para criar novo log de auditoria.
   */
  public AuditLog(
      String usuario,
      String entidade,
      Long entidadeId,
      String acao,
      String valorAnterior,
      String valorNovo) {
    this.usuario = usuario;
    this.entidade = entidade;
    this.entidadeId = entidadeId;
    this.acao = acao;
    this.valorAnterior = valorAnterior;
    this.valorNovo = valorNovo;
    this.timestamp = LocalDateTime.now();
  }
}
