package com.compliance.sgc.dto.usuario;

import com.compliance.sgc.domain.enums.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO para atualização de usuários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record UsuarioUpdateDTO(
    @Size(max = 200, message = "Nome deve ter no máximo 200 caracteres")
    String nome,

    @Email(message = "Email deve ser válido")
    @Size(max = 200, message = "Email deve ter no máximo 200 caracteres")
    String email,

    PerfilUsuario perfil,

    Boolean ativo
) {}
