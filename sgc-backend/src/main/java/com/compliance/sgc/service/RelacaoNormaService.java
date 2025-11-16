package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.domain.entity.RelacaoNorma;
import com.compliance.sgc.dto.relacao.RelacaoNormaCreateDTO;
import com.compliance.sgc.dto.relacao.RelacaoNormaResponseDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.mapper.RelacaoNormaMapper;
import com.compliance.sgc.repository.NormaRepository;
import com.compliance.sgc.repository.RelacaoNormaRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciamento de relações entre normas.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional
public class RelacaoNormaService {

  private static final Logger logger = LoggerFactory.getLogger(RelacaoNormaService.class);

  private final RelacaoNormaRepository relacaoNormaRepository;
  private final NormaRepository normaRepository;
  private final RelacaoNormaMapper mapper;

  public RelacaoNormaService(
      RelacaoNormaRepository relacaoNormaRepository,
      NormaRepository normaRepository,
      RelacaoNormaMapper mapper) {
    this.relacaoNormaRepository = relacaoNormaRepository;
    this.normaRepository = normaRepository;
    this.mapper = mapper;
  }

  /**
   * Cria uma relação entre duas normas.
   * Apenas usuários com perfil COMPLIANCE ou ADMIN podem criar relações.
   *
   * @param dto Dados da relação
   * @return RelacaoNormaResponseDTO com os dados da relação criada
   * @throws EntityNotFoundException se alguma das normas não for encontrada
   * @throws BusinessValidationException se houver tentativa de criar relação circular
   */
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public RelacaoNormaResponseDTO criar(RelacaoNormaCreateDTO dto) {
    logger.info(
        "Criando relação entre normas: {} -> {} ({})",
        dto.normaOrigemId(),
        dto.normaDestinoId(),
        dto.tipoRelacao());

    // Validação: normaOrigem e normaDestino devem existir
    Norma normaOrigem =
        normaRepository
            .findById(dto.normaOrigemId())
            .orElseThrow(
                () -> new EntityNotFoundException("Norma", "id", dto.normaOrigemId()));

    Norma normaDestino =
        normaRepository
            .findById(dto.normaDestinoId())
            .orElseThrow(
                () -> new EntityNotFoundException("Norma", "id", dto.normaDestinoId()));

    // Validação: não pode criar relação circular (normaOrigem == normaDestino)
    if (dto.normaOrigemId().equals(dto.normaDestinoId())) {
      throw new BusinessValidationException(
          "Não é permitido criar relação entre a mesma norma (relação circular)");
    }

    // Criar relação
    RelacaoNorma relacao = new RelacaoNorma();
    relacao.setNormaOrigem(normaOrigem);
    relacao.setNormaDestino(normaDestino);
    relacao.setTipoRelacao(dto.tipoRelacao());
    relacao.setDescricao(dto.descricao());

    RelacaoNorma saved = relacaoNormaRepository.save(relacao);
    logger.info("Relação criada com sucesso: ID={}", saved.getRelacaoId());
    return mapper.toResponseDTO(saved);
  }

  /**
   * Busca todas as relações de uma norma (origem ou destino).
   * Todos os usuários autenticados podem acessar.
   *
   * @param normaId ID da norma
   * @return Lista de RelacaoNormaResponseDTO
   * @throws EntityNotFoundException se a norma não for encontrada
   */
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public List<RelacaoNormaResponseDTO> buscarPorNorma(Long normaId) {
    logger.debug("Buscando relações da norma: ID={}", normaId);

    Norma norma =
        normaRepository
            .findById(normaId)
            .orElseThrow(() -> new EntityNotFoundException("Norma", "id", normaId));

    // Buscar relações onde a norma é origem ou destino
    List<RelacaoNorma> relacoesOrigem = relacaoNormaRepository.findByNormaOrigem(norma);
    List<RelacaoNorma> relacoesDestino = relacaoNormaRepository.findByNormaDestino(norma);

    // Combinar e mapear
    List<RelacaoNormaResponseDTO> resultado =
        relacoesOrigem.stream().map(mapper::toResponseDTO).collect(Collectors.toList());

    resultado.addAll(
        relacoesDestino.stream().map(mapper::toResponseDTO).collect(Collectors.toList()));

    logger.debug("Encontradas {} relações para norma ID={}", resultado.size(), normaId);
    return resultado;
  }

  /**
   * Exclui uma relação entre normas.
   * Apenas usuários com perfil COMPLIANCE ou ADMIN podem excluir relações.
   *
   * @param id ID da relação
   * @throws EntityNotFoundException se a relação não for encontrada
   */
  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public void excluir(Long id) {
    logger.info("Excluindo relação entre normas: ID={}", id);

    RelacaoNorma relacao =
        relacaoNormaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("RelacaoNorma", "id", id));

    relacaoNormaRepository.delete(relacao);
    logger.info("Relação excluída com sucesso: ID={}", id);
  }
}
