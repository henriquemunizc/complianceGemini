package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Alinea;
import com.compliance.sgc.domain.entity.Inciso;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.AlineaRepository;
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
 * Controller REST para gerenciamento de alíneas de incisos.
 * Lightweight CRUD sem service layer.
 * Endpoints: /api/v1/alineas
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/alineas")
public class AlineaController {

  private static final Logger logger = LoggerFactory.getLogger(AlineaController.class);

  private final AlineaRepository alineaRepository;
  private final IncisoRepository incisoRepository;

  public AlineaController(AlineaRepository alineaRepository, IncisoRepository incisoRepository) {
    this.alineaRepository = alineaRepository;
    this.incisoRepository = incisoRepository;
  }

  /**
   * DTO para criação de alínea.
   */
  public record AlineaCreateDTO(
      @NotNull(message = "ID do inciso é obrigatório") Long incisoId,
      @NotBlank(message = "Letra da alínea é obrigatória")
          @Size(max = 10, message = "Letra da alínea deve ter no máximo 10 caracteres")
          String letraAlinea,
      @NotBlank(message = "Texto da alínea é obrigatório") String textoAlinea,
      @NotNull(message = "Ordem é obrigatória") Integer ordem) {}

  /**
   * DTO para atualização de alínea.
   */
  public record AlineaUpdateDTO(
      @Size(max = 10, message = "Letra da alínea deve ter no máximo 10 caracteres")
          String letraAlinea,
      String textoAlinea,
      Integer ordem) {}

  /**
   * DTO de resposta de alínea.
   */
  public record AlineaResponseDTO(
      Long alineaId, Long incisoId, String letraAlinea, String textoAlinea, Integer ordem) {}

  /**
   * Busca alíneas de um inciso.
   * Todos os usuários autenticados podem acessar.
   *
   * @param incisoId ID do inciso
   * @return Lista de AlineaResponseDTO
   */
  @GetMapping("/inciso/{incisoId}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<List<AlineaResponseDTO>> buscarPorInciso(@PathVariable Long incisoId) {
    logger.debug("GET /api/v1/alineas/inciso/{} - Buscar alíneas por inciso", incisoId);

    Inciso inciso =
        incisoRepository
            .findById(incisoId)
            .orElseThrow(() -> new EntityNotFoundException("Inciso", "id", incisoId));

    List<AlineaResponseDTO> alineas =
        alineaRepository.findByIncisoOrderByOrdem(inciso).stream()
            .map(
                a ->
                    new AlineaResponseDTO(
                        a.getAlineaId(),
                        a.getInciso().getIncisoId(),
                        a.getLetraAlinea(),
                        a.getTextoAlinea(),
                        a.getOrdem()))
            .collect(Collectors.toList());

    return ResponseEntity.ok(alineas);
  }

  /**
   * Busca uma alínea por ID.
   * Todos os usuários autenticados podem acessar.
   *
   * @param id ID da alínea
   * @return AlineaResponseDTO
   */
  @GetMapping("/{id}")
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public ResponseEntity<AlineaResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/alineas/{} - Buscar alínea por ID", id);

    Alinea alinea =
        alineaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alinea", "id", id));

    AlineaResponseDTO response =
        new AlineaResponseDTO(
            alinea.getAlineaId(),
            alinea.getInciso().getIncisoId(),
            alinea.getLetraAlinea(),
            alinea.getTextoAlinea(),
            alinea.getOrdem());

    return ResponseEntity.ok(response);
  }

  /**
   * Cria uma nova alínea.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param dto Dados da alínea
   * @return AlineaResponseDTO com status 201 (CREATED)
   */
  @PostMapping
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<AlineaResponseDTO> criar(@Valid @RequestBody AlineaCreateDTO dto) {
    logger.info(
        "POST /api/v1/alineas - Criar alínea: {} para inciso ID={}",
        dto.letraAlinea(),
        dto.incisoId());

    // Validar que o inciso existe
    Inciso inciso =
        incisoRepository
            .findById(dto.incisoId())
            .orElseThrow(() -> new EntityNotFoundException("Inciso", "id", dto.incisoId()));

    Alinea alinea = new Alinea();
    alinea.setInciso(inciso);
    alinea.setLetraAlinea(dto.letraAlinea());
    alinea.setTextoAlinea(dto.textoAlinea());
    alinea.setOrdem(dto.ordem());

    Alinea saved = alineaRepository.save(alinea);

    AlineaResponseDTO response =
        new AlineaResponseDTO(
            saved.getAlineaId(),
            saved.getInciso().getIncisoId(),
            saved.getLetraAlinea(),
            saved.getTextoAlinea(),
            saved.getOrdem());

    logger.info("Alínea criada com sucesso: ID={}", saved.getAlineaId());
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Atualiza uma alínea.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID da alínea
   * @param dto Dados a serem atualizados
   * @return AlineaResponseDTO
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<AlineaResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody AlineaUpdateDTO dto) {
    logger.info("PUT /api/v1/alineas/{} - Atualizar alínea", id);

    Alinea alinea =
        alineaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alinea", "id", id));

    // Atualizar apenas campos não-nulos
    if (dto.letraAlinea() != null) {
      alinea.setLetraAlinea(dto.letraAlinea());
    }
    if (dto.textoAlinea() != null) {
      alinea.setTextoAlinea(dto.textoAlinea());
    }
    if (dto.ordem() != null) {
      alinea.setOrdem(dto.ordem());
    }

    Alinea updated = alineaRepository.save(alinea);

    AlineaResponseDTO response =
        new AlineaResponseDTO(
            updated.getAlineaId(),
            updated.getInciso().getIncisoId(),
            updated.getLetraAlinea(),
            updated.getTextoAlinea(),
            updated.getOrdem());

    logger.info("Alínea atualizada com sucesso: ID={}", id);
    return ResponseEntity.ok(response);
  }

  /**
   * Exclui uma alínea.
   * Requer role: COMPLIANCE ou ADMIN
   *
   * @param id ID da alínea
   * @return Status 204 (NO CONTENT)
   */
  @DeleteMapping("/{id}")
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/alineas/{} - Excluir alínea", id);

    Alinea alinea =
        alineaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Alinea", "id", id));

    alineaRepository.delete(alinea);
    logger.info("Alínea excluída com sucesso: ID={}", id);
    return ResponseEntity.noContent().build();
  }
}
