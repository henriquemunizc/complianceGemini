package com.compliance.sgc.mapper;

import com.compliance.sgc.domain.entity.HistoricoStatus;
import com.compliance.sgc.dto.historico.HistoricoResponseDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface HistoricoMapper {

  @Mapping(source = "obrigacao.obrigacaoId", target = "obrigacaoId")
  @Mapping(source = "usuario.nome", target = "usuarioNome")
  HistoricoResponseDTO toResponseDTO(HistoricoStatus entity);
}
