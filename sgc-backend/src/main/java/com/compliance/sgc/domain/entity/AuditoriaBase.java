package com.compliance.sgc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Classe base para auditoria de entidades.
 * Fornece campos comuns de auditoria: criado_em, criado_por, atualizado_em, atualizado_por.
 * Todas as entidades principais devem estender esta classe.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditoriaBase {

  @CreatedDate
  @Column(name = "criado_em", nullable = false, updatable = false)
  private LocalDateTime criadoEm;

  @CreatedBy
  @Column(name = "criado_por", nullable = false, updatable = false, length = 100)
  private String criadoPor;

  @LastModifiedDate
  @Column(name = "atualizado_em")
  private LocalDateTime atualizadoEm;

  @LastModifiedBy
  @Column(name = "atualizado_por", length = 100)
  private String atualizadoPor;
}
