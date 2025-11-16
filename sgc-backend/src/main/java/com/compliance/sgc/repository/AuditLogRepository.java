package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.AuditLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository para AuditLog.
 * IMPORTANTE: Esta tabela é IMUTÁVEL - não deve haver métodos de update ou delete.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

  /**
   * Busca logs de auditoria de uma entidade específica.
   */
  @Query("SELECT a FROM AuditLog a WHERE a.entidade = :entidade AND a.entidadeId = :entidadeId ORDER BY a.timestamp DESC")
  List<AuditLog> findByEntidadeAndEntidadeId(
      @Param("entidade") String entidade, @Param("entidadeId") Long entidadeId);

  /**
   * Busca logs de auditoria de um usuário.
   */
  List<AuditLog> findByUsuarioOrderByTimestampDesc(String usuario);

  /**
   * Busca logs de auditoria por período.
   */
  @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :inicio AND :fim ORDER BY a.timestamp DESC")
  List<AuditLog> findByPeriodo(
      @Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

  /**
   * Busca logs de auditoria de uma entidade em um período.
   */
  @Query(
      "SELECT a FROM AuditLog a WHERE a.entidade = :entidade AND a.entidadeId = :entidadeId AND a.timestamp BETWEEN :inicio AND :fim ORDER BY a.timestamp DESC")
  List<AuditLog> findByEntidadeAndPeriodo(
      @Param("entidade") String entidade,
      @Param("entidadeId") Long entidadeId,
      @Param("inicio") LocalDateTime inicio,
      @Param("fim") LocalDateTime fim);
}
