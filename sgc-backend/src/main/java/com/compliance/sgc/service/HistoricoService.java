package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.HistoricoStatus;
import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.dto.historico.HistoricoResponseDTO;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.exception.UnauthorizedException;
import com.compliance.sgc.mapper.HistoricoMapper;
import com.compliance.sgc.repository.HistoricoStatusRepository;
import com.compliance.sgc.repository.ObrigacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HistoricoService {

  private static final Logger logger = LoggerFactory.getLogger(HistoricoService.class);

  private final HistoricoStatusRepository historicoRepository;
  private final ObrigacaoRepository obrigacaoRepository;
  private final UsuarioRepository usuarioRepository;
  private final HistoricoMapper mapper;

  public HistoricoService(
      HistoricoStatusRepository historicoRepository,
      ObrigacaoRepository obrigacaoRepository,
      UsuarioRepository usuarioRepository,
      HistoricoMapper mapper) {
    this.historicoRepository = historicoRepository;
    this.obrigacaoRepository = obrigacaoRepository;
    this.usuarioRepository = usuarioRepository;
    this.mapper = mapper;
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public List<HistoricoResponseDTO> listarPorObrigacao(Long obrigacaoId) {
    logger.debug("Listando histórico para obrigação: ID={}", obrigacaoId);

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(obrigacaoId)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", obrigacaoId));

    // Validação de acesso: RESPONSAVEL só pode ver histórico de suas próprias obrigações
    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL
        && !obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException(
          "Você não tem permissão para visualizar o histórico desta obrigação");
    }

    // Buscar histórico ordenado por data (mais recente primeiro)
    List<HistoricoStatus> historico =
        historicoRepository.findByObrigacaoOrderByDataMudancaDesc(obrigacao);

    return historico.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
  }

  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  public HistoricoResponseDTO buscarPorId(Long id) {
    logger.debug("Buscando registro de histórico: ID={}", id);

    HistoricoStatus historico =
        historicoRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("HistoricoStatus", "id", id));

    // Validação de acesso
    Obrigacao obrigacao = historico.getObrigacao();
    String emailUsuarioLogado = getEmailUsuarioLogado();
    Usuario usuarioLogado =
        usuarioRepository
            .findByEmail(emailUsuarioLogado)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", emailUsuarioLogado));

    if (usuarioLogado.getPerfil() == PerfilUsuario.ROLE_RESPONSAVEL
        && !obrigacao.getResponsavel().getEmail().equals(emailUsuarioLogado)) {
      throw new UnauthorizedException(
          "Você não tem permissão para visualizar este registro de histórico");
    }

    return mapper.toResponseDTO(historico);
  }

  private String getEmailUsuarioLogado() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
  }
}
