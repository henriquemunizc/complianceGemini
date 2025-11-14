package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.dto.obrigacao.ObrigacaoCreateDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoResponseDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ObrigacaoMapper {

  @Mapping(target = "responsavel", ignore = true)
  @Mapping(target = "vinculosHierarquia", ignore = true)
  Obrigacao toEntity(ObrigacaoCreateDTO dto);

  @Mapping(source = "responsavel.usuarioId", target = "responsavelId")
  @Mapping(source = "responsavel.nome", target = "responsavelNome")
  @Mapping(source = "aprovador.nome", target = "aprovadorNome")
  ObrigacaoResponseDTO toResponseDTO(Obrigacao entity);

  @Mapping(target = "responsavel", ignore = true)
  void updateEntityFromDTO(ObrigacaoUpdateDTO dto, @MappingTarget Obrigacao entity);
}
