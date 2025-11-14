package com.compliance.sgc.dto.evidencia;

import com.compliance.sgc.domain.enums.TipoEvidencia;
import java.time.LocalDateTime;

public record EvidenciaResponseDTO(
    Long evidenciaId,
    Long obrigacaoId,
    TipoEvidencia tipoEvidencia,
    String nomeArquivoOriginal,
    String caminhoArquivo,
    Long tamanhoBytes,
    String mimeType,
    String urlExterna,
    String conteudoTexto,
    String descricao,
    LocalDateTime criadoEm,
    String criadoPor
) {}
