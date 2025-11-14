package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.domain.enums.TipoEvidencia;
import com.compliance.sgc.dto.evidencia.EvidenciaCreateDTO;
import com.compliance.sgc.dto.evidencia.EvidenciaResponseDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.exception.UnauthorizedException;
import com.compliance.sgc.mapper.EvidenciaMapper;
import com.compliance.sgc.repository.EvidenciaRepository;
import com.compliance.sgc.repository.ObrigacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class EvidenciaService {

  private static final Logger logger = LoggerFactory.getLogger(EvidenciaService.class);

  private final EvidenciaRepository evidenciaRepository;
  private final ObrigacaoRepository obrigacaoRepository;
  private final UsuarioRepository usuarioRepository;
  private final FileStorageService fileStorageService;
  private final EvidenciaMapper mapper;

  public EvidenciaService(
      EvidenciaRepository evidenciaRepository,
      ObrigacaoRepository obrigacaoRepository,
      UsuarioRepository usuarioRepository,
      FileStorageService fileStorageService,
      EvidenciaMapper mapper) {
    this.evidenciaRepository = evidenciaRepository;
    this.obrigacaoRepository = obrigacaoRepository;
    this.usuarioRepository = usuarioRepository;
    this.fileStorageService = fileStorageService;
    this.mapper = mapper;
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN')")
  public EvidenciaResponseDTO adicionarEvidenciaArquivo(
      Long obrigacaoId, MultipartFile arquivo, String descricao) {
    logger.info("Adicionando evidência de arquivo para obrigação: ID={}", obrigacaoId);

    Obrigacao obrigacao = validarAcessoObrigacao(obrigacaoId);

    // Validação: arquivo não pode ser nulo
    if (arquivo == null || arquivo.isEmpty()) {
      throw new BusinessValidationException("Arquivo é obrigatório");
    }

    // Armazenar arquivo (com todas as validações de segurança)
    String caminhoArquivo = fileStorageService.storeFile(arquivo);

    // Criar evidência
    Evidencia evidencia = new Evidencia();
    evidencia.setObrigacao(obrigacao);
    evidencia.setTipo(TipoEvidencia.ARQUIVO);
    evidencia.setDescricao(descricao);
    evidencia.setNomeArquivoOriginal(arquivo.getOriginalFilename());
    evidencia.setCaminhoArquivo(caminhoArquivo);
    evidencia.setTamanhoBytes(arquivo.getSize());
    evidencia.setMimeType(arquivo.getContentType());
    evidencia.setDataSubmissao(LocalDateTime.now());
    evidencia.setAtivo(true);

    Evidencia saved = evidenciaRepository.save(evidencia);
    logger.info("Evidência de arquivo criada: ID={}", saved.getEvidenciaId());
    return mapper.toResponseDTO(saved);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN')")
  public EvidenciaResponseDTO adicionarEvidenciaLink(Long obrigacaoId, EvidenciaCreateDTO dto) {
    logger.info("Adicionando evidência de link para obrigação: ID={}", obrigacaoId);

    Obrigacao obrigacao = validarAcessoObrigacao(obrigacaoId);

    // Validação: URL externa é obrigatória para tipo LINK
    if (dto.urlExterna() == null || dto.urlExterna().isBlank()) {
      throw new BusinessValidationException("URL externa é obrigatória para evidências do tipo LINK");
    }

    // Validação básica de URL (proteção contra XSS)
    if (!isValidUrl(dto.urlExterna())) {
      throw new BusinessValidationException("URL inválida");
    }

    // Criar evidência
    Evidencia evidencia = new Evidencia();
    evidencia.setObrigacao(obrigacao);
    evidencia.setTipo(TipoEvidencia.LINK);
    evidencia.setDescricao(dto.descricao());
    evidencia.setUrlExterna(dto.urlExterna());
    evidencia.setDataSubmissao(LocalDateTime.now());
    evidencia.setAtivo(true);

    Evidencia saved = evidenciaRepository.save(evidencia);
    logger.info("Evidência de link criada: ID={}", saved.getEvidenciaId());
    return mapper.toResponseDTO(saved);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN')")
  public EvidenciaResponseDTO adicionarEvidenciaTexto(Long obrigacaoId, EvidenciaCreateDTO dto) {
    logger.info("Adicionando evidência de texto para obrigação: ID={}", obrigacaoId);

    Obrigacao obrigacao = validarAcessoObrigacao(obrigacaoId);

    // Validação: conteúdo de texto é obrigatório
    if (dto.conteudoTexto() == null || dto.conteudoTexto().isBlank()) {
      throw new BusinessValidationException(
          "Conteúdo de texto é obrigatório para evidências do tipo TEXTO");
    }

    // Validação: tamanho máximo do texto (proteção contra DoS)
    if (dto.conteudoTexto().length() > 10000) {
      throw new BusinessValidationException(
          "Conteúdo de texto excede o tamanho máximo permitido (10.000 caracteres)");
    }

    // Criar evidência
    Evidencia evidencia = new Evidencia();
    evidencia.setObrigacao(obrigacao);
    evidencia.setTipo(TipoEvidencia.TEXTO);
    evidencia.setDescricao(dto.descricao());
    evidencia.setConteudoTexto(dto.conteudoTexto());
    evidencia.setDataSubmissao(LocalDateTime.now());
    evidencia.setAtivo(true);

    Evidencia saved = evidenciaRepository.save(evidencia);
    logger.info("Evidência de texto criada: ID={}", saved.getEvidenciaId());
    return mapper.toResponseDTO(saved);
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public List<EvidenciaResponseDTO> listarPorObrigacao(Long obrigacaoId) {
    logger.debug("Listando evidências para obrigação: ID={}", obrigacaoId);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(obrigacaoId)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", obrigacaoId));

    // Validação de acesso: RESPONSAVEL só pode ver suas próprias obrigações
    validarAcessoLeitura(obrigacao);

    List<Evidencia> evidencias = evidenciaRepository.findByObrigacaoAndAtivo(obrigacao, true);
    return evidencias.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public org.springframework.core.io.Resource downloadArquivo(Long id) {
    logger.info("Download de arquivo de evidência: ID={}", id);

    Evidencia evidencia =
        evidenciaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Evidencia", "id", id));

    // Validação: deve ser do tipo ARQUIVO
    if (evidencia.getTipo() != TipoEvidencia.ARQUIVO) {
      throw new BusinessValidationException("Esta evidência não é do tipo arquivo");
    }

    // Validação de acesso
    validarAcessoLeitura(evidencia.getObrigacao());

    // Carregar arquivo
    return fileStorageService.loadFileAsResource(evidencia.getCaminhoArquivo());
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN')")
  public void excluir(Long id) {
    logger.info("Excluindo evidência: ID={}", id);

    Evidencia evidencia =
        evidenciaRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Evidencia", "id", id));

    // Validação de acesso
    validarAcessoObrigacao(evidencia.getObrigacao().getObrigacaoId());

    // Se for arquivo, deletar do sistema de arquivos
    if (evidencia.getTipo() == TipoEvidencia.ARQUIVO && evidencia.getCaminhoArquivo() != null) {
      try {
        fileStorageService.deleteFile(evidencia.getCaminhoArquivo());
      } catch (Exception ex) {
        logger.error("Erro ao deletar arquivo físico: {}", evidencia.getCaminhoArquivo(), ex);
        // Continuar com soft delete mesmo se falhar a exclusão física
      }
    }

    // Soft delete
    evidencia.setAtivo(false);
    evidenciaRepository.save(evidencia);

    logger.info("Evidência excluída com sucesso: ID={}", id);
  }

  private Obrigacao validarAcessoObrigacao(Long obrigacaoId) {
    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(obrigacaoId)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", obrigacaoId));

    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    // RESPONSAVEL só pode adicionar evidências às suas próprias obrigações
    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL
        && !obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException(
          "Você não tem permissão para adicionar evidências a esta obrigação");
    }

    return obrigacao;
  }

  private void validarAcessoLeitura(Obrigacao obrigacao) {
    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL
        && !obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException(
          "Você não tem permissão para visualizar evidências desta obrigação");
    }
  }

  private boolean isValidUrl(String url) {
    // Validação básica de URL (proteção contra javascript:, data:, etc.)
    if (url == null || url.isBlank()) {
      return false;
    }

    String lowerUrl = url.toLowerCase();

    // Permitir apenas http:// e https://
    if (!lowerUrl.startsWith("http://") && !lowerUrl.startsWith("https://")) {
      return false;
    }

    // Rejeitar esquemas maliciosos
    if (lowerUrl.contains("javascript:")
        || lowerUrl.contains("data:")
        || lowerUrl.contains("vbscript:")) {
      return false;
    }

    return true;
  }

  private String getEmailUsuarioLogado() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
  }
}
