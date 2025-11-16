package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository para a entidade Usuario.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

  /**
   * Busca usuário por email.
   *
   * @param email Email do usuário
   * @return Optional com o usuário se encontrado
   */
  Optional<Usuario> findByEmail(String email);

  /**
   * Verifica se existe usuário com o email.
   *
   * @param email Email a verificar
   * @return true se existir
   */
  boolean existsByEmail(String email);

  /**
   * Busca usuários por perfil.
   *
   * @param perfil Perfil do usuário
   * @return Lista de usuários com o perfil
   */
  List<Usuario> findByPerfil(PerfilUsuario perfil);

  /**
   * Busca usuários ativos.
   *
   * @param ativo Status de ativo
   * @return Lista de usuários ativos
   */
  List<Usuario> findByAtivo(Boolean ativo);

  /**
   * Busca usuários por perfil e status ativo.
   *
   * @param perfil Perfil do usuário
   * @param ativo Status de ativo
   * @return Lista de usuários
   */
  List<Usuario> findByPerfilAndAtivo(PerfilUsuario perfil, Boolean ativo);

  /**
   * Conta usuários por status ativo.
   *
   * @param ativo Status de ativo
   * @return Quantidade de usuários
   */
  Long countByAtivo(Boolean ativo);
}
