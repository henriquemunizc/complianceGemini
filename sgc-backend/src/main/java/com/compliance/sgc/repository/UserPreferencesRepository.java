package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.UserPreferences;
import com.compliance.sgc.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para UserPreferences.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {

    /**
     * Busca preferências por usuário.
     */
    Optional<UserPreferences> findByUsuario(Usuario usuario);

    /**
     * Busca preferências por ID do usuário.
     */
    Optional<UserPreferences> findByUsuarioUsuarioId(Long usuarioId);

    /**
     * Verifica se existem preferências para um usuário.
     */
    boolean existsByUsuarioUsuarioId(Long usuarioId);
}
