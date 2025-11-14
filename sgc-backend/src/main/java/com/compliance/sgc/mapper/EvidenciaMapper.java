package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.dto.evidencia.EvidenciaCreateDTO;
import com.compliance.sgc.dto.evidencia.EvidenciaResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EvidenciaMapper {

  @Mapping(target = "obrigacao", ignore = true)
  Evidencia toEntity(EvidenciaCreateDTO dto);

  @Mapping(source = "obrigacao.obrigacaoId", target = "obrigacaoId")
  EvidenciaResponseDTO toResponseDTO(Evidencia entity);
}
