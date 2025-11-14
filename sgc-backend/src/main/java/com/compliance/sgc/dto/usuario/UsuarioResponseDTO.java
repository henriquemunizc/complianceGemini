package com.compliance.sgc.dto.usuario;

import com.compliance.sgc.domain.enums.PerfilUsuario;

public record UsuarioResponseDTO(
    Long usuarioId,
    String nome,
    String email,
    PerfilUsuario perfil,
    Boolean ativo
) {}
