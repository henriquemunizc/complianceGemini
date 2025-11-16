package com.compliance.sgc.dto.usuario;

import com.compliance.sgc.domain.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para criação de usuários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record UsuarioCreateDTO(
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    String nome,

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    @Size(max = 200, message = "Email deve ter no máximo 200 caracteres")
    String email,

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 100, message = "Senha deve ter entre 8 e 100 caracteres")
    String senha,

    @NotNull(message = "Perfil é obrigatório")
    PerfilUsuario perfil
) {}
