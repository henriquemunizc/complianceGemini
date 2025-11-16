package com.compliance.sgc.dto.auth;

import com.compliance.sgc.domain.enums.PerfilUsuario;
import io.swagger.v3.oas.annotations.media.Schema;

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
@Schema(description = "Dados de resposta após autenticação bem-sucedida")
public record LoginResponse(
    @Schema(description = "Token JWT para autenticação nas próximas requisições", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    String token,

    @Schema(description = "Tipo do token", example = "Bearer")
    String tipo,

    @Schema(description = "Email do usuário autenticado", example = "admin@sgc.com")
    String email,

    @Schema(description = "Nome do usuário autenticado", example = "Administrador")
    String nome,

    @Schema(description = "Perfil/Papel do usuário no sistema", example = "ADMIN")
    PerfilUsuario perfil
) {
  /**
   * Construtor com tipo padrão "Bearer".
   */
  public LoginResponse(String token, String email, String nome, PerfilUsuario perfil) {
    this(token, "Bearer", email, nome, perfil);
  }
}
