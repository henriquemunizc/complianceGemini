package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.dto.norma.NormaCreateDTO;
import com.compliance.sgc.dto.norma.NormaResponseDTO;
import com.compliance.sgc.dto.norma.NormaUpdateDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.mapper.NormaMapper;
import com.compliance.sgc.repository.NormaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NormaService {

  private static final Logger logger = LoggerFactory.getLogger(NormaService.class);

  private final NormaRepository normaRepository;
  private final NormaMapper mapper;

  public NormaService(NormaRepository normaRepository, NormaMapper mapper) {
    this.normaRepository = normaRepository;
    this.mapper = mapper;
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public NormaResponseDTO criar(NormaCreateDTO dto) {
    logger.info("Criando nova norma: {} - {}", dto.tipo(), dto.numero());

    // Validação: não pode haver norma duplicada (tipo + numero + ano)
    boolean existe =
        normaRepository.existsByTipoAndNumeroAndAno(dto.tipo(), dto.numero(), dto.ano());
    if (existe) {
      throw new BusinessValidationException(
          String.format(
              "Já existe uma norma %s nº %s/%d", dto.tipo(), dto.numero(), dto.ano()));
    }

    // Validação: data de publicação não pode ser futura
    if (dto.dataPublicacao().isAfter(LocalDate.now())) {
      throw new BusinessValidationException("Data de publicação não pode ser futura");
    }

    // Validação: se tiver data de revogação, deve ser posterior à publicação
    if (dto.dataRevogacao() != null
        && dto.dataRevogacao().isBefore(dto.dataPublicacao())) {
      throw new BusinessValidationException(
          "Data de revogação deve ser posterior à data de publicação");
    }

    Norma norma = mapper.toEntity(dto);
    norma.setAtivo(true);

    Norma saved = normaRepository.save(norma);
    logger.info("Norma criada com sucesso: ID={}", saved.getNormaId());
    return mapper.toResponseDTO(saved);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public NormaResponseDTO atualizar(Long id, NormaUpdateDTO dto) {
    logger.info("Atualizando norma: ID={}", id);

    Norma norma =
        normaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", id));

    // Atualizar apenas campos não-nulos
    mapper.updateEntityFromDTO(dto, norma);

    // Validações de datas
    if (norma.getDataPublicacao() != null && norma.getDataPublicacao().isAfter(LocalDate.now())) {
      throw new BusinessValidationException("Data de publicação não pode ser futura");
    }

    if (norma.getDataRevogacao() != null
        && norma.getDataRevogacao().isBefore(norma.getDataPublicacao())) {
      throw new BusinessValidationException(
          "Data de revogação deve ser posterior à data de publicação");
    }

    Norma updated = normaRepository.save(norma);
    logger.info("Norma atualizada com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public NormaResponseDTO buscarPorId(Long id) {
    logger.debug("Buscando norma: ID={}", id);

    Norma norma =
        normaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", id));

    return mapper.toResponseDTO(norma);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public Page<NormaResponseDTO> listar(String tipo, Integer ano, Boolean vigente, Pageable pageable) {
    logger.debug("Listando normas com filtros: tipo={}, ano={}, vigente={}", tipo, ano, vigente);

    Specification<Norma> spec = Specification.where(null);

    if (tipo != null && !tipo.isBlank()) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("tipo"), tipo));
    }

    if (ano != null) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("ano"), ano));
    }

    if (Boolean.TRUE.equals(vigente)) {
      LocalDate hoje = LocalDate.now();
      spec =
          spec.and(
              (root, query, cb) ->
                  cb.and(
                      cb.lessThanOrEqualTo(root.get("dataPublicacao"), hoje),
                      cb.or(
                          cb.isNull(root.get("dataRevogacao")),
                          cb.greaterThan(root.get("dataRevogacao"), hoje))));
    }

    // Apenas ativos
    spec = spec.and((root, query, cb) -> cb.equal(root.get("ativo"), true));

    return normaRepository.findAll(spec, pageable).map(mapper::toResponseDTO);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public void excluir(Long id) {
    logger.info("Excluindo (soft delete) norma: ID={}", id);

    Norma norma =
        normaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", id));

    // Soft delete
    norma.setAtivo(false);
    normaRepository.save(norma);

    logger.info("Norma excluída com sucesso: ID={}", id);
  }

  @Transactional(readOnly = true)
  public List<NormaResponseDTO> buscarNormasVigentes() {
    logger.debug("Buscando normas vigentes");
    List<Norma> vigentes = normaRepository.findNormasVigentes(LocalDate.now());
    return vigentes.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
  }
}
