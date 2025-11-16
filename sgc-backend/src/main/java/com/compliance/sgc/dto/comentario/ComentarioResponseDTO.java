package com.compliance.sgc.dto.comentario;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de resposta para Comentario.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public record ComentarioResponseDTO(
    Long comentarioId,
    Long obrigacaoId,
    Long autorId,
    String autorNome,
    String autorEmail,
    String conteudo,
    Boolean editado,
    LocalDateTime dataEdicao,
    LocalDateTime criadoEm,
    Long comentarioPaiId,
    List<ComentarioResponseDTO> respostas) {}
