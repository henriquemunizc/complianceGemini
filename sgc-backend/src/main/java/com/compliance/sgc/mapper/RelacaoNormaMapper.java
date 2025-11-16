package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.RelacaoNorma;
import com.compliance.sgc.dto.relacao.RelacaoNormaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper para conversão entre RelacaoNorma e DTOs.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Mapper(componentModel = "spring")
public interface RelacaoNormaMapper {

  /**
   * Converte entidade RelacaoNorma para RelacaoNormaResponseDTO.
   *
   * @param entity Entidade RelacaoNorma
   * @return RelacaoNormaResponseDTO
   */
  @Mapping(source = "normaOrigem.normaId", target = "normaOrigemId")
  @Mapping(source = "normaOrigem.titulo", target = "normaOrigemTitulo")
  @Mapping(source = "normaDestino.normaId", target = "normaDestinoId")
  @Mapping(source = "normaDestino.titulo", target = "normaDestinoTitulo")
  RelacaoNormaResponseDTO toResponseDTO(RelacaoNorma entity);
}
