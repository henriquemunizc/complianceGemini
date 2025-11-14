package com.compliance.sgc.dto.auth;

import com.compliance.sgc.domain.enums.PerfilUsuario;

/**
 * DTO para resposta de login.
 *
 * @param token Token JWT gerado
 * @param tipo Tipo do token (sempre "Bearer")
 * @param email Email do usuário autenticado
 * @param nome Nome do usuário autenticado
 * @param perfil Perfil/Role do usuário
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
public record LoginResponse(
    String token,
    String tipo,
    String email,
    String nome,
    PerfilUsuario perfil
) {
  /**
   * Construtor com tipo padrão "Bearer".
   */
  public LoginResponse(String token, String email, String nome, PerfilUsuario perfil) {
    this(token, "Bearer", email, nome, perfil);
  }
}
