package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.dto.usuario.UsuarioCreateDTO;
import com.compliance.sgc.dto.usuario.UsuarioResponseDTO;
import com.compliance.sgc.dto.usuario.UsuarioUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Mapper para conversão entre Usuario e DTOs.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UsuarioMapper {

  /**
   * Converte entidade Usuario para UsuarioResponseDTO.
   *
   * @param entity Entidade Usuario
   * @return UsuarioResponseDTO
   */
  UsuarioResponseDTO toResponseDTO(Usuario entity);

  /**
   * Converte UsuarioCreateDTO para entidade Usuario.
   * Ignora o campo senha (será tratado manualmente no service com BCrypt).
   *
   * @param dto UsuarioCreateDTO
   * @return Entidade Usuario
   */
  @Mapping(target = "usuarioId", ignore = true)
  @Mapping(target = "senhaHash", ignore = true)
  @Mapping(target = "ativo", ignore = true)
  @Mapping(target = "criadoEm", ignore = true)
  @Mapping(target = "atualizadoEm", ignore = true)
  @Mapping(target = "criadoPor", ignore = true)
  @Mapping(target = "atualizadoPor", ignore = true)
  Usuario toEntity(UsuarioCreateDTO dto);

  /**
   * Atualiza entidade Usuario com dados de UsuarioUpdateDTO.
   * Ignora campos nulos (atualização parcial).
   *
   * @param dto UsuarioUpdateDTO
   * @param entity Entidade Usuario a ser atualizada
   */
  @Mapping(target = "usuarioId", ignore = true)
  @Mapping(target = "senhaHash", ignore = true)
  @Mapping(target = "criadoEm", ignore = true)
  @Mapping(target = "atualizadoEm", ignore = true)
  @Mapping(target = "criadoPor", ignore = true)
  @Mapping(target = "atualizadoPor", ignore = true)
  void updateEntityFromDTO(UsuarioUpdateDTO dto, @MappingTarget Usuario entity);
}
