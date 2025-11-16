package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.AuditLog;
import com.compliance.sgc.dto.audit.AuditLogResponseDTO;
import com.compliance.sgc.repository.AuditLogRepository;
import com.compliance.sgc.security.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciamento de logs de auditoria.
 * Este service é responsável por registrar todas as operações importantes do sistema.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional
public class AuditLogService {

  private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

  private final AuditLogRepository auditLogRepository;
  private final ObjectMapper objectMapper;

  public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
    this.auditLogRepository = auditLogRepository;
    this.objectMapper = objectMapper;
  }

  /**
   * Registra uma operação de auditoria.
   *
   * @param entidade Nome da entidade (ex: "Obrigacao", "Usuario")
   * @param entidadeId ID da entidade
   * @param acao Ação realizada (ex: "CREATE", "UPDATE", "DELETE", "APROVAR", "REJEITAR")
   * @param valorAnterior Valor anterior (JSON)
   * @param valorNovo Valor novo (JSON)
   */
  public void log(
      String entidade, Long entidadeId, String acao, Object valorAnterior, Object valorNovo) {
    try {
      String usuario = SecurityUtils.getCurrentUserEmail();

      String valorAnteriorJson = valorAnterior != null ? toJson(valorAnterior) : null;
      String valorNovoJson = valorNovo != null ? toJson(valorNovo) : null;

      AuditLog auditLog =
          new AuditLog(usuario, entidade, entidadeId, acao, valorAnteriorJson, valorNovoJson);

      auditLogRepository.save(auditLog);

      logger.debug(
          "Audit log registrado: {} {} {} por {}", acao, entidade, entidadeId, usuario);

    } catch (Exception e) {
      logger.error("Erro ao registrar audit log", e);
      // Não propagar exceção para não afetar a operação principal
    }
  }

  /**
   * Registra criação de entidade.
   */
  public void logCreate(String entidade, Long entidadeId, Object entidadeObj) {
    log(entidade, entidadeId, "CREATE", null, entidadeObj);
  }

  /**
   * Registra atualização de entidade.
   */
  public void logUpdate(String entidade, Long entidadeId, Object valorAnterior, Object valorNovo) {
    log(entidade, entidadeId, "UPDATE", valorAnterior, valorNovo);
  }

  /**
   * Registra exclusão de entidade.
   */
  public void logDelete(String entidade, Long entidadeId, Object entidadeObj) {
    log(entidade, entidadeId, "DELETE", entidadeObj, null);
  }

  /**
   * Registra ação customizada.
   */
  public void logCustomAction(
      String entidade, Long entidadeId, String acao, Object valorAnterior, Object valorNovo) {
    log(entidade, entidadeId, acao, valorAnterior, valorNovo);
  }

  /**
   * Busca histórico de auditoria de uma entidade.
   * Apenas ADMIN pode acessar.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @Transactional(readOnly = true)
  public List<AuditLogResponseDTO> buscarPorEntidade(String entidade, Long entidadeId) {
    logger.debug("Buscando audit logs para {} ID={}", entidade, entidadeId);

    List<AuditLog> logs = auditLogRepository.findByEntidadeAndEntidadeId(entidade, entidadeId);
    return logs.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Busca histórico de auditoria de um usuário.
   * Apenas ADMIN pode acessar.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @Transactional(readOnly = true)
  public List<AuditLogResponseDTO> buscarPorUsuario(String email) {
    logger.debug("Buscando audit logs do usuário: {}", email);

    List<AuditLog> logs = auditLogRepository.findByUsuarioOrderByTimestampDesc(email);
    return logs.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Busca histórico de auditoria por período.
   * Apenas ADMIN pode acessar.
   */
  @PreAuthorize("hasRole('ADMIN')")
  @Transactional(readOnly = true)
  public List<AuditLogResponseDTO> buscarPorPeriodo(LocalDateTime inicio, LocalDateTime fim) {
    logger.debug("Buscando audit logs entre {} e {}", inicio, fim);

    List<AuditLog> logs = auditLogRepository.findByPeriodo(inicio, fim);
    return logs.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Converte objeto para JSON.
   */
  private String toJson(Object obj) {
    try {
      return objectMapper.writeValueAsString(obj);
    } catch (JsonProcessingException e) {
      logger.warn("Erro ao converter objeto para JSON: {}", e.getMessage());
      return obj.toString();
    }
  }

  /**
   * Converte entidade para DTO.
   */
  private AuditLogResponseDTO toResponseDTO(AuditLog auditLog) {
    return new AuditLogResponseDTO(
        auditLog.getAuditLogId(),
        auditLog.getUsuario(),
        auditLog.getEntidade(),
        auditLog.getEntidadeId(),
        auditLog.getAcao(),
        auditLog.getValorAnterior(),
        auditLog.getValorNovo(),
        auditLog.getTimestamp(),
        auditLog.getIpAddress(),
        auditLog.getUserAgent());
  }
}
