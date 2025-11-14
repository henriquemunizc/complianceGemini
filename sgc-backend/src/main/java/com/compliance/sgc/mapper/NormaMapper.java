package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.dto.norma.NormaCreateDTO;
import com.compliance.sgc.dto.norma.NormaResponseDTO;
import com.compliance.sgc.dto.norma.NormaUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NormaMapper {

  Norma toEntity(NormaCreateDTO dto);

  NormaResponseDTO toResponseDTO(Norma entity);

  void updateEntityFromDTO(NormaUpdateDTO dto, @MappingTarget Norma entity);
}
