package com.compliance.sgc.controller;

import com.compliance.sgc.dto.norma.NormaCreateDTO;
import com.compliance.sgc.dto.norma.NormaResponseDTO;
import com.compliance.sgc.dto.norma.NormaUpdateDTO;
import com.compliance.sgc.service.NormaService;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/normas")
public class NormaController {

  private static final Logger logger = LoggerFactory.getLogger(NormaController.class);

  private final NormaService normaService;

  public NormaController(NormaService normaService) {
    this.normaService = normaService;
  }

  @PostMapping
  public ResponseEntity<NormaResponseDTO> criar(@Valid @RequestBody NormaCreateDTO dto) {
    logger.info("POST /api/v1/normas - Criar norma: {} {}/{}", dto.tipo(), dto.numero(), dto.ano());
    NormaResponseDTO response = normaService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  @PutMapping("/{id}")
  public ResponseEntity<NormaResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody NormaUpdateDTO dto) {
    logger.info("PUT /api/v1/normas/{} - Atualizar norma", id);
    NormaResponseDTO response = normaService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  public ResponseEntity<NormaResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/normas/{} - Buscar por ID", id);
    NormaResponseDTO response = normaService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }

  @GetMapping
  public ResponseEntity<Page<NormaResponseDTO>> listar(
      @RequestParam(required = false) String tipo,
      @RequestParam(required = false) Integer ano,
      @RequestParam(required = false) Boolean vigente,
      @PageableDefault(size = 20, sort = "dataPublicacao", direction = Sort.Direction.DESC)
          Pageable pageable) {
    logger.debug("GET /api/v1/normas - Listar com filtros");
    Page<NormaResponseDTO> response = normaService.listar(tipo, ano, vigente, pageable);
    return ResponseEntity.ok(response);
  }

  @GetMapping("/vigentes")
  public ResponseEntity<List<NormaResponseDTO>> buscarVigentes() {
    logger.debug("GET /api/v1/normas/vigentes - Buscar normas vigentes");
    List<NormaResponseDTO> response = normaService.buscarNormasVigentes();
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/normas/{} - Excluir (soft delete)", id);
    normaService.excluir(id);
    return ResponseEntity.noContent().build();
  }
}
