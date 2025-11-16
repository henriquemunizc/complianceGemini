package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Notificacao;
import com.compliance.sgc.domain.entity.Usuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository para Notificacao.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

  /**
   * Busca notificações de um usuário ordenadas por data de criação (mais recente primeiro).
   */
  List<Notificacao> findByUsuarioOrderByCriadoEmDesc(Usuario usuario);

  /**
   * Busca notificações não lidas de um usuário.
   */
  List<Notificacao> findByUsuarioAndLidaOrderByCriadoEmDesc(Usuario usuario, Boolean lida);

  /**
   * Conta notificações não lidas de um usuário.
   */
  Long countByUsuarioAndLida(Usuario usuario, Boolean lida);

  /**
   * Busca últimas N notificações de um usuário.
   */
  @Query("SELECT n FROM Notificacao n WHERE n.usuario = :usuario ORDER BY n.criadoEm DESC")
  List<Notificacao> findTopNByUsuario(@Param("usuario") Usuario usuario);
}
