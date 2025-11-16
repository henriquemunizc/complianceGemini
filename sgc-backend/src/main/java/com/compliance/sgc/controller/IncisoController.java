package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Artigo;
import com.compliance.sgc.domain.entity.Inciso;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.ArtigoRepository;
import com.compliance.sgc.repository.IncisoRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para gerenciamento de incisos de artigos.
 * Lightweight CRUD sem service layer.
 * Endpoints: /api/v1/incisos
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/incisos")
public class IncisoController {

  private static final Logger logger = LoggerFactory.getLogger(IncisoController.class);

  private final IncisoRepository incisoRepository;
  private final ArtigoRepository artigoRepository;

  public IncisoController(IncisoRepository incisoRepository, ArtigoRepository artigoRepository) {
    this.incisoRepository = incisoRepository;
    this.artigoRepository = artigoRepository;
  }

  /**
   * DTO para criação de inciso.
   */
  public record IncisoCreateDTO(
      @NotNull(message = "ID do artigo é obrigatório") Long artigoId,
      @NotBlank(message = "Número do inciso é obrigatório")
          @Size(max = 20, message = "Número do inciso deve ter no máximo 20 caracteres")
          String numeroInciso,
      @NotBlank(message = "Texto do inciso é obrigatório") String textoInciso,
      @NotNull(message = "Ordem é obrigatória") Integer ordem) {}

  /**
   * DTO para atualização de inciso.
   */
  public record IncisoUpdateDTO(
      @Size(max = 20, message = "Número do inciso deve ter no máximo 20 caracteres")
          String numeroInciso,
      String textoInciso,
      Integer ordem) {}

  /**
   * DTO de resposta de inciso.
   */
  public record IncisoResponseDTO(
      Long incisoId, Long artigoId, String numeroInciso, String textoInciso, Integer ordem) {}

  /**
   * Busca incisos de um artigo.
   * Todos os usuários autenticados podem acessar.
   *
   * @param artigoId ID do artigo
   * @return Lista de IncisoResponseDTO
   */
  @GetMapping("/artigo/{artigoId}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<List<IncisoResponseDTO>> buscarPorArtigo(@PathVariable Long artigoId) {
    logger.debug("GET /api/v1/incisos/artigo/{} - Buscar incisos por artigo", artigoId);

    Artigo artigo =
        artigoRepository
            .findById(artigoId)
            .orElseThrow(() -> new EntityNotFoundException("Artigo", "id", artigoId));

    List<IncisoResponseDTO> incisos =
        incisoRepository.findByArtigoOrderByOrdem(artigo).stream()
            .map(
                i ->
                    new IncisoResponseDTO(
                        i.getIncisoId(),
                        i.getArtigo().getArtigoId(),
                        i.getNumeroInciso(),
                        i.getTextoInciso(),
                        i.getOrdem()))
            .collect(Collectors.toList());

    return ResponseEntity.ok(incisos);
  }

  /**
   * Busca um inciso por ID.
   * Todos os usuários autenticados podem acessar.
   *
   * @param id ID do inciso
   * @return IncisoResponseDTO
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<IncisoResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/incisos/{} - Buscar inciso por ID", id);

    Inciso inciso =
        incisoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inciso", "id", id));

    IncisoResponseDTO response =
        new IncisoResponseDTO(
            inciso.getIncisoId(),
            inciso.getArtigo().getArtigoId(),
            inciso.getNumeroInciso(),
            inciso.getTextoInciso(),
            inciso.getOrdem());

    return ResponseEntity.ok(response);
  }

  /**
   * Cria um novo inciso.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param dto Dados do inciso
   * @return IncisoResponseDTO com status 201 (CREATED)
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<IncisoResponseDTO> criar(@Valid @RequestBody IncisoCreateDTO dto) {
    logger.info(
        "POST /api/v1/incisos - Criar inciso: {} para artigo ID={}",
        dto.numeroInciso(),
        dto.artigoId());

    // Validar que o artigo existe
    Artigo artigo =
        artigoRepository
            .findById(dto.artigoId())
            .orElseThrow(() -> new EntityNotFoundException("Artigo", "id", dto.artigoId()));

    Inciso inciso = new Inciso();
    inciso.setArtigo(artigo);
    inciso.setNumeroInciso(dto.numeroInciso());
    inciso.setTextoInciso(dto.textoInciso());
    inciso.setOrdem(dto.ordem());

    Inciso saved = incisoRepository.save(inciso);

    IncisoResponseDTO response =
        new IncisoResponseDTO(
            saved.getIncisoId(),
            saved.getArtigo().getArtigoId(),
            saved.getNumeroInciso(),
            saved.getTextoInciso(),
            saved.getOrdem());

    logger.info("Inciso criado com sucesso: ID={}", saved.getIncisoId());
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Atualiza um inciso.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID do inciso
   * @param dto Dados a serem atualizados
   * @return IncisoResponseDTO
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<IncisoResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody IncisoUpdateDTO dto) {
    logger.info("PUT /api/v1/incisos/{} - Atualizar inciso", id);

    Inciso inciso =
        incisoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inciso", "id", id));

    // Atualizar apenas campos não-nulos
    if (dto.numeroInciso() != null) {
      inciso.setNumeroInciso(dto.numeroInciso());
    }
    if (dto.textoInciso() != null) {
      inciso.setTextoInciso(dto.textoInciso());
    }
    if (dto.ordem() != null) {
      inciso.setOrdem(dto.ordem());
    }

    Inciso updated = incisoRepository.save(inciso);

    IncisoResponseDTO response =
        new IncisoResponseDTO(
            updated.getIncisoId(),
            updated.getArtigo().getArtigoId(),
            updated.getNumeroInciso(),
            updated.getTextoInciso(),
            updated.getOrdem());

    logger.info("Inciso atualizado com sucesso: ID={}", id);
    return ResponseEntity.ok(response);
  }

  /**
   * Exclui um inciso.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID do inciso
   * @return Status 204 (NO CONTENT)
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/incisos/{} - Excluir inciso", id);

    Inciso inciso =
        incisoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Inciso", "id", id));

    incisoRepository.delete(inciso);
    logger.info("Inciso excluído com sucesso: ID={}", id);
    return ResponseEntity.noContent().build();
  }
}
