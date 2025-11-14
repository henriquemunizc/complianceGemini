package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.dto.usuario.UsuarioResponseDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

  UsuarioResponseDTO toResponseDTO(Usuario entity);
}
