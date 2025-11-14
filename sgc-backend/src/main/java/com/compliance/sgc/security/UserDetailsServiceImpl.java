package com.compliance.sgc.security;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.repository.UsuarioRepository;
import java.util.Collection;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementação do UserDetailsService do Spring Security.
 * Carrega os dados do usuário do banco de dados para autenticação.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

  @Autowired
  private UsuarioRepository usuarioRepository;

  /**
   * Carrega o usuário pelo email (username).
   * Converte a entidade Usuario para UserDetails do Spring Security.
   *
   * @param email Email do usuário
   * @return UserDetails com informações do usuário
   * @throws UsernameNotFoundException se usuário não for encontrado
   */
  @Override
  @Transactional(readOnly = true)
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Usuario usuario = usuarioRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException(
            "Usuário não encontrado com email: " + email
        ));

    // Validação de usuário inativo
    if (!usuario.getAtivo()) {
      throw new UsernameNotFoundException("Usuário inativo: " + email);
    }

    return User.builder()
        .username(usuario.getEmail())
        .password(usuario.getSenhaHash())
        .authorities(getAuthorities(usuario))
        .accountExpired(false)
        .accountLocked(!usuario.getAtivo())
        .credentialsExpired(false)
        .disabled(!usuario.getAtivo())
        .build();
  }

  /**
   * Converte o perfil do usuário em GrantedAuthority (role).
   * Formato: ROLE_{PERFIL} (ex: ROLE_ADMIN, ROLE_COMPLIANCE, ROLE_RESPONSAVEL)
   *
   * @param usuario Entidade Usuario
   * @return Collection de GrantedAuthority
   */
  private Collection<? extends GrantedAuthority> getAuthorities(Usuario usuario) {
    String role = "ROLE_" + usuario.getPerfil().name();
    return Collections.singletonList(new SimpleGrantedAuthority(role));
  }
}
