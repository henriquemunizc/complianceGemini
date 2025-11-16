package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Artigo;
import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.ArtigoRepository;
import com.compliance.sgc.repository.NormaRepository;
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
 * Controller REST para gerenciamento de artigos de normas.
 * Lightweight CRUD sem service layer.
 * Endpoints: /api/v1/artigos
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/artigos")
public class ArtigoController {

  private static final Logger logger = LoggerFactory.getLogger(ArtigoController.class);

  private final ArtigoRepository artigoRepository;
  private final NormaRepository normaRepository;

  public ArtigoController(ArtigoRepository artigoRepository, NormaRepository normaRepository) {
    this.artigoRepository = artigoRepository;
    this.normaRepository = normaRepository;
  }

  /**
   * DTO para criação de artigo.
   */
  public record ArtigoCreateDTO(
      @NotNull(message = "ID da norma é obrigatório") Long normaId,
      @NotBlank(message = "Número do artigo é obrigatório")
          @Size(max = 20, message = "Número do artigo deve ter no máximo 20 caracteres")
          String numeroArtigo,
      @NotBlank(message = "Texto do artigo é obrigatório") String textoArtigo,
      @NotNull(message = "Ordem é obrigatória") Integer ordem) {}

  /**
   * DTO para atualização de artigo.
   */
  public record ArtigoUpdateDTO(
      @Size(max = 20, message = "Número do artigo deve ter no máximo 20 caracteres")
          String numeroArtigo,
      String textoArtigo,
      Integer ordem) {}

  /**
   * DTO de resposta de artigo.
   */
  public record ArtigoResponseDTO(
      Long artigoId, Long normaId, String numeroArtigo, String textoArtigo, Integer ordem) {}

  /**
   * Busca artigos de uma norma.
   * Todos os usuários autenticados podem acessar.
   *
   * @param normaId ID da norma
   * @return Lista de ArtigoResponseDTO
   */
  @GetMapping("/norma/{normaId}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<List<ArtigoResponseDTO>> buscarPorNorma(@PathVariable Long normaId) {
    logger.debug("GET /api/v1/artigos/norma/{} - Buscar artigos por norma", normaId);

    Norma norma =
        normaRepository
            .findById(normaId)
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", normaId));

    List<ArtigoResponseDTO> artigos =
        artigoRepository.findByNormaOrderByOrdem(norma).stream()
            .map(
                a ->
                    new ArtigoResponseDTO(
                        a.getArtigoId(),
                        a.getNorma().getNormaId(),
                        a.getNumeroArtigo(),
                        a.getTextoArtigo(),
                        a.getOrdem()))
            .collect(Collectors.toList());

    return ResponseEntity.ok(artigos);
  }

  /**
   * Busca um artigo por ID.
   * Todos os usuários autenticados podem acessar.
   *
   * @param id ID do artigo
   * @return ArtigoResponseDTO
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<ArtigoResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/artigos/{} - Buscar artigo por ID", id);

    Artigo artigo =
        artigoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Artigo", "id", id));

    ArtigoResponseDTO response =
        new ArtigoResponseDTO(
            artigo.getArtigoId(),
            artigo.getNorma().getNormaId(),
            artigo.getNumeroArtigo(),
            artigo.getTextoArtigo(),
            artigo.getOrdem());

    return ResponseEntity.ok(response);
  }

  /**
   * Cria um novo artigo.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param dto Dados do artigo
   * @return ArtigoResponseDTO com status 201 (CREATED)
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<ArtigoResponseDTO> criar(@Valid @RequestBody ArtigoCreateDTO dto) {
    logger.info(
        "POST /api/v1/artigos - Criar artigo: {} para norma ID={}",
        dto.numeroArtigo(),
        dto.normaId());

    // Validar que a norma existe
    Norma norma =
        normaRepository
            .findById(dto.normaId())
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", dto.normaId()));

    Artigo artigo = new Artigo();
    artigo.setNorma(norma);
    artigo.setNumeroArtigo(dto.numeroArtigo());
    artigo.setTextoArtigo(dto.textoArtigo());
    artigo.setOrdem(dto.ordem());

    Artigo saved = artigoRepository.save(artigo);

    ArtigoResponseDTO response =
        new ArtigoResponseDTO(
            saved.getArtigoId(),
            saved.getNorma().getNormaId(),
            saved.getNumeroArtigo(),
            saved.getTextoArtigo(),
            saved.getOrdem());

    logger.info("Artigo criado com sucesso: ID={}", saved.getArtigoId());
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Atualiza um artigo.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID do artigo
   * @param dto Dados a serem atualizados
   * @return ArtigoResponseDTO
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<ArtigoResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody ArtigoUpdateDTO dto) {
    logger.info("PUT /api/v1/artigos/{} - Atualizar artigo", id);

    Artigo artigo =
        artigoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Artigo", "id", id));

    // Atualizar apenas campos não-nulos
    if (dto.numeroArtigo() != null) {
      artigo.setNumeroArtigo(dto.numeroArtigo());
    }
    if (dto.textoArtigo() != null) {
      artigo.setTextoArtigo(dto.textoArtigo());
    }
    if (dto.ordem() != null) {
      artigo.setOrdem(dto.ordem());
    }

    Artigo updated = artigoRepository.save(artigo);

    ArtigoResponseDTO response =
        new ArtigoResponseDTO(
            updated.getArtigoId(),
            updated.getNorma().getNormaId(),
            updated.getNumeroArtigo(),
            updated.getTextoArtigo(),
            updated.getOrdem());

    logger.info("Artigo atualizado com sucesso: ID={}", id);
    return ResponseEntity.ok(response);
  }

  /**
   * Exclui um artigo.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID do artigo
   * @return Status 204 (NO CONTENT)
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/artigos/{} - Excluir artigo", id);

    Artigo artigo =
        artigoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Artigo", "id", id));

    artigoRepository.delete(artigo);
    logger.info("Artigo excluído com sucesso: ID={}", id);
    return ResponseEntity.noContent().build();
  }
}
