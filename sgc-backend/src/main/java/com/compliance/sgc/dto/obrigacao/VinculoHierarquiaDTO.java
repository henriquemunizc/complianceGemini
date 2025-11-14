package com.compliance.sgc.dto.obrigacao;

public record VinculoHierarquiaDTO(
    Long normaId,
    Long artigoId,
    Long incisoId,
    Long alineaId
) {
  public boolean isValid() {
    return normaId != null || artigoId != null || incisoId != null || alineaId != null;
  }
}
