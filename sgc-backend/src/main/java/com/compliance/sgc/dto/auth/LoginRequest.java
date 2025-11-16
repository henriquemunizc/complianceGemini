package com.compliance.sgc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para requisição de login.
 *
 * @param email Email do usuário
 * @param senha Senha do usuário
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Schema(description = "Dados de autenticação para login no sistema")
public record LoginRequest(
    @Schema(description = "Email do usuário", example = "admin@sgc.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    String email,

    @Schema(description = "Senha do usuário", example = "senha123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String senha
) {}
