package com.compliance.sgc.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO para troca de senha de usuário.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record TrocarSenhaDTO(
    @NotBlank(message = "Senha atual é obrigatória")
    String senhaAtual,

    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, max = 100, message = "Nova senha deve ter entre 8 e 100 caracteres")
    String novaSenha
) {}
