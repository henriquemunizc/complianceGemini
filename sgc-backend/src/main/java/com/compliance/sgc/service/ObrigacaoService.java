package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.*;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import com.compliance.sgc.dto.obrigacao.ObrigacaoCreateDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoResponseDTO;
import com.compliance.sgc.dto.obrigacao.ObrigacaoUpdateDTO;
import com.compliance.sgc.dto.obrigacao.VinculoHierarquiaDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.exception.UnauthorizedException;
import com.compliance.sgc.mapper.ObrigacaoMapper;
import com.compliance.sgc.repository.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ObrigacaoService {

  private static final Logger logger = LoggerFactory.getLogger(ObrigacaoService.class);

  private final ObrigacaoRepository obrigacaoRepository;
  private final UsuarioRepository usuarioRepository;
  private final NormaRepository normaRepository;
  private final ArtigoRepository artigoRepository;
  private final IncisoRepository incisoRepository;
  private final AlineaRepository alineaRepository;
  private final ObrigacaoHierarquiaRepository hierarquiaRepository;
  private final HistoricoStatusRepository historicoRepository;
  private final ObrigacaoMapper mapper;

  public ObrigacaoService(
      ObrigacaoRepository obrigacaoRepository,
      UsuarioRepository usuarioRepository,
      NormaRepository normaRepository,
      ArtigoRepository artigoRepository,
      IncisoRepository incisoRepository,
      AlineaRepository alineaRepository,
      ObrigacaoHierarquiaRepository hierarquiaRepository,
      HistoricoStatusRepository historicoRepository,
      ObrigacaoMapper mapper) {
    this.obrigacaoRepository = obrigacaoRepository;
    this.usuarioRepository = usuarioRepository;
    this.normaRepository = normaRepository;
    this.artigoRepository = artigoRepository;
    this.incisoRepository = incisoRepository;
    this.alineaRepository = alineaRepository;
    this.hierarquiaRepository = hierarquiaRepository;
    this.historicoRepository = historicoRepository;
    this.mapper = mapper;
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ObrigacaoResponseDTO criar(ObrigacaoCreateDTO dto) {
    logger.info("Criando nova obrigação: {}", dto.titulo());

    // Validação: responsável deve existir e estar ativo
    Usuario responsavel =
        usuarioRepository
            .findById(dto.responsavelId())
            .orElseThrow(
                () -> new EntityNotFoundException("Usuario", "id", dto.responsavelId()));

    if (!responsavel.getAtivo()) {
      throw new BusinessValidationException(
          "Responsável inativo não pode ser atribuído a obrigações");
    }

    // Validação: prazo não pode ser no passado
    if (dto.prazoExecucao().isBefore(LocalDate.now())) {
      throw new BusinessValidationException("Prazo de execução não pode ser no passado");
    }

    // Criar entidade
    Obrigacao obrigacao = mapper.toEntity(dto);
    obrigacao.setResponsavel(responsavel);
    obrigacao.setStatus(StatusObrigacao.PENDENTE);
    obrigacao.setAtivo(true);

    // Processar vínculos com hierarquia de normas
    for (VinculoHierarquiaDTO vinculo : dto.vinculosHierarquia()) {
      ObrigacaoHierarquia hierarquia = new ObrigacaoHierarquia();
      hierarquia.setObrigacao(obrigacao);

      if (vinculo.normaId() != null) {
        Norma norma =
            normaRepository
                .findById(vinculo.normaId())
                .orElseThrow(
                    () -> new EntityNotFoundException("Norma", "id", vinculo.normaId()));
        hierarquia.setNorma(norma);
      }

      if (vinculo.artigoId() != null) {
        Artigo artigo =
            artigoRepository
                .findById(vinculo.artigoId())
                .orElseThrow(
                    () -> new EntityNotFoundException("Artigo", "id", vinculo.artigoId()));
        hierarquia.setArtigo(artigo);
      }

      if (vinculo.incisoId() != null) {
        Inciso inciso =
            incisoRepository
                .findById(vinculo.incisoId())
                .orElseThrow(
                    () -> new EntityNotFoundException("Inciso", "id", vinculo.incisoId()));
        hierarquia.setInciso(inciso);
      }

      if (vinculo.alineaId() != null) {
        Alinea alinea =
            alineaRepository
                .findById(vinculo.alineaId())
                .orElseThrow(
                    () -> new EntityNotFoundException("Alinea", "id", vinculo.alineaId()));
        hierarquia.setAlinea(alinea);
      }

      if (!hierarquia.isValid()) {
        throw new BusinessValidationException(
            "Vínculo com hierarquia deve ter pelo menos uma referência válida");
      }

      obrigacao.addVinculoHierarquia(hierarquia);
    }

    // Salvar
    Obrigacao saved = obrigacaoRepository.save(obrigacao);

    // Criar histórico inicial
    criarHistorico(saved, null, StatusObrigacao.PENDENTE, "Obrigação criada");

    logger.info("Obrigação criada com sucesso: ID={}", saved.getObrigacaoId());
    return mapper.toResponseDTO(saved);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ObrigacaoResponseDTO atualizar(Long id, ObrigacaoUpdateDTO dto) {
    logger.info("Atualizando obrigação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Validação: não pode editar obrigação aprovada ou rejeitada
    if (obrigacao.getStatus() == StatusObrigacao.APROVADA
        || obrigacao.getStatus() == StatusObrigacao.REJEITADA) {
      throw new BusinessValidationException(
          "Obrigação aprovada ou rejeitada não pode ser editada");
    }

    // Atualizar campos permitidos
    if (dto.titulo() != null) {
      obrigacao.setTitulo(dto.titulo());
    }
    if (dto.descricao() != null) {
      obrigacao.setDescricao(dto.descricao());
    }
    if (dto.prazoExecucao() != null) {
      if (dto.prazoExecucao().isBefore(LocalDate.now())) {
        throw new BusinessValidationException("Prazo de execução não pode ser no passado");
      }
      obrigacao.setPrazoExecucao(dto.prazoExecucao());
    }
    if (dto.responsavelId() != null) {
      Usuario novoResponsavel =
          usuarioRepository
              .findById(dto.responsavelId())
              .orElseThrow(
                  () -> new EntityNotFoundException("Usuario", "id", dto.responsavelId()));
      if (!novoResponsavel.getAtivo()) {
        throw new BusinessValidationException(
            "Responsável inativo não pode ser atribuído a obrigações");
      }
      obrigacao.setResponsavel(novoResponsavel);
    }

    Obrigacao updated = obrigacaoRepository.save(obrigacao);
    logger.info("Obrigação atualizada com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN')")
  public ObrigacaoResponseDTO submeter(Long id) {
    logger.info("Submetendo obrigação para aprovação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Validação: apenas o responsável pode submeter
    String emailUsuarioLogado = getEmailUsuarioLogado();
    if (!obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException("Apenas o responsável pode submeter a obrigação");
    }

    // Validação: status deve ser PENDENTE
    if (obrigacao.getStatus() != StatusObrigacao.PENDENTE) {
      throw new BusinessValidationException(
          "Apenas obrigações pendentes podem ser submetidas para aprovação");
    }

    // Validação: deve ter pelo menos uma evidência
    if (obrigacao.getEvidencias().isEmpty()) {
      throw new BusinessValidationException(
          "Obrigação deve ter pelo menos uma evidência antes de ser submetida");
    }

    // Atualizar status
    StatusObrigacao statusAnterior = obrigacao.getStatus();
    obrigacao.setStatus(StatusObrigacao.SUBMETIDA);
    obrigacao.setDataSubmissao(LocalDateTime.now());

    Obrigacao updated = obrigacaoRepository.save(obrigacao);

    // Criar histórico
    criarHistorico(updated, statusAnterior, StatusObrigacao.SUBMETIDA, "Submetida para aprovação");

    logger.info("Obrigação submetida com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ObrigacaoResponseDTO aprovar(Long id, String motivoAprovacao) {
    logger.info("Aprovando obrigação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Validação: status deve ser SUBMETIDA
    if (obrigacao.getStatus() != StatusObrigacao.SUBMETIDA) {
      throw new BusinessValidationException("Apenas obrigações submetidas podem ser aprovadas");
    }

    // Obter aprovador
    String emailAprovador = getEmailUsuarioLogado();
    Usuario aprovador =
        usuarioRepository
            .findByEmail(emailAprovador)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailAprovador));

    // Atualizar status
    StatusObrigacao statusAnterior = obrigacao.getStatus();
    obrigacao.setStatus(StatusObrigacao.APROVADA);
    obrigacao.setDataAprovacao(LocalDateTime.now());
    obrigacao.setAprovador(aprovador);
    obrigacao.setMotivoAprovacao(motivoAprovacao);

    Obrigacao updated = obrigacaoRepository.save(obrigacao);

    // Criar histórico
    criarHistorico(
        updated,
        statusAnterior,
        StatusObrigacao.APROVADA,
        "Aprovada: " + (motivoAprovacao != null ? motivoAprovacao : ""));

    logger.info("Obrigação aprovada com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public ObrigacaoResponseDTO rejeitar(Long id, String motivoRejeicao) {
    logger.info("Rejeitando obrigação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Validação: status deve ser SUBMETIDA
    if (obrigacao.getStatus() != StatusObrigacao.SUBMETIDA) {
      throw new BusinessValidationException("Apenas obrigações submetidas podem ser rejeitadas");
    }

    // Validação: motivo é obrigatório
    if (motivoRejeicao == null || motivoRejeicao.isBlank()) {
      throw new BusinessValidationException("Motivo da rejeição é obrigatório");
    }

    // Obter aprovador
    String emailAprovador = getEmailUsuarioLogado();
    Usuario aprovador =
        usuarioRepository
            .findByEmail(emailAprovador)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailAprovador));

    // Atualizar status
    StatusObrigacao statusAnterior = obrigacao.getStatus();
    obrigacao.setStatus(StatusObrigacao.REJEITADA);
    obrigacao.setDataAprovacao(LocalDateTime.now());
    obrigacao.setAprovador(aprovador);
    obrigacao.setMotivoRejeicao(motivoRejeicao);

    Obrigacao updated = obrigacaoRepository.save(obrigacao);

    // Criar histórico
    criarHistorico(updated, statusAnterior, StatusObrigacao.REJEITADA, "Rejeitada: " + motivoRejeicao);

    logger.info("Obrigação rejeitada com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public ObrigacaoResponseDTO buscarPorId(Long id) {
    logger.debug("Buscando obrigação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Validação de acesso: RESPONSAVEL só pode ver suas próprias obrigações
    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL
        && !obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException("Você não tem permissão para visualizar esta obrigação");
    }

    return mapper.toResponseDTO(obrigacao);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public Page<ObrigacaoResponseDTO> listar(
      StatusObrigacao status, Long responsavelId, Boolean atrasada, Pageable pageable) {
    logger.debug("Listando obrigações com filtros: status={}, responsavelId={}", status, responsavelId);

    Specification<Obrigacao> spec = Specification.where(null);

    // Filtro de acesso: RESPONSAVEL só vê suas próprias obrigações
    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL) {
      spec =
          spec.and((root, query, cb) -> cb.equal(root.get("responsavel"), usuarioLogado));
    }

    // Filtros opcionais
    if (status != null) {
      spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
    }

    if (responsavelId != null) {
      Usuario responsavel =
          usuarioRepository
              .findById(responsavelId)
              .orElseThrow(
                  () -> new EntityNotFoundException("Usuario", "id", responsavelId));
      spec = spec.and((root, query, cb) -> cb.equal(root.get("responsavel"), responsavel));
    }

    if (Boolean.TRUE.equals(atrasada)) {
      spec =
          spec.and(
              (root, query, cb) ->
                  cb.and(
                      cb.lessThan(root.get("prazoExecucao"), LocalDate.now()),
                      cb.equal(root.get("status"), StatusObrigacao.PENDENTE)));
    }

    // Apenas ativos
    spec = spec.and((root, query, cb) -> cb.equal(root.get("ativo"), true));

    return obrigacaoRepository.findAll(spec, pageable).map(mapper::toResponseDTO);
  }

  @PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
  public void excluir(Long id) {
    logger.info("Excluindo (soft delete) obrigação: ID={}", id);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", id));

    // Soft delete
    obrigacao.setAtivo(false);
    obrigacaoRepository.save(obrigacao);

    logger.info("Obrigação excluída com sucesso: ID={}", id);
  }

  @Transactional(readOnly = true)
  public List<ObrigacaoResponseDTO> buscarAtrasadas() {
    logger.debug("Buscando obrigações atrasadas");
    List<Obrigacao> atrasadas = obrigacaoRepository.findObrigacoesAtrasadas(LocalDate.now());
    return atrasadas.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
  }

  private void criarHistorico(
      Obrigacao obrigacao,
      StatusObrigacao statusAnterior,
      StatusObrigacao statusNovo,
      String observacoes) {
    HistoricoStatus historico = new HistoricoStatus();
    historico.setObrigacao(obrigacao);
    historico.setStatusAnterior(statusAnterior);
    historico.setStatusNovo(statusNovo);
    historico.setDataMudanca(LocalDateTime.now());
    historico.setObservacoes(observacoes);

    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuario =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElse(null);
    if (usuario != null) {
      historico.setUsuario(usuario);
    }

    historicoRepository.save(historico);
  }

  private String getEmailUsuarioLogado() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
  }
}
