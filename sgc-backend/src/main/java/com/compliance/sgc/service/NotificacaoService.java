package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Notificacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.TipoNotificacao;
import com.compliance.sgc.dto.notificacao.NotificacaoCreateDTO;
import com.compliance.sgc.dto.notificacao.NotificacaoResponseDTO;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.NotificacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import com.compliance.sgc.security.SecurityUtils;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciamento de notificações.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional
public class NotificacaoService {

  private static final Logger logger = LoggerFactory.getLogger(NotificacaoService.class);

  private final NotificacaoRepository notificacaoRepository;
  private final UsuarioRepository usuarioRepository;

  public NotificacaoService(
      NotificacaoRepository notificacaoRepository, UsuarioRepository usuarioRepository) {
    this.notificacaoRepository = notificacaoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Cria uma nova notificação para um usuário.
   */
  public NotificacaoResponseDTO criar(NotificacaoCreateDTO dto) {
    logger.info("Criando notificação para usuário: {}", dto.usuarioId());

    Usuario usuario =
        usuarioRepository
            .findById(dto.usuarioId())
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "id", dto.usuarioId()));

    Notificacao notificacao = new Notificacao();
    notificacao.setUsuario(usuario);
    notificacao.setTipo(dto.tipo());
    notificacao.setTitulo(dto.titulo());
    notificacao.setMensagem(dto.mensagem());
    notificacao.setLink(dto.link());
    notificacao.setLida(false);

    Notificacao saved = notificacaoRepository.save(notificacao);
    logger.info("Notificação criada: ID={}", saved.getNotificacaoId());

    return toResponseDTO(saved);
  }

  /**
   * Cria notificação usando métodos de conveniência.
   */
  public void criarNotificacao(
      Usuario usuario, TipoNotificacao tipo, String titulo, String mensagem, String link) {
    logger.info("Criando notificação tipo {} para usuário: {}", tipo, usuario.getEmail());

    Notificacao notificacao = new Notificacao();
    notificacao.setUsuario(usuario);
    notificacao.setTipo(tipo);
    notificacao.setTitulo(titulo);
    notificacao.setMensagem(mensagem);
    notificacao.setLink(link);
    notificacao.setLida(false);

    notificacaoRepository.save(notificacao);
  }

  /**
   * Lista todas as notificações do usuário logado.
   */
  @Transactional(readOnly = true)
  public List<NotificacaoResponseDTO> listarMinhasNotificacoes() {
    String email = SecurityUtils.getCurrentUserEmail();
    Usuario usuario =
        usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", email));

    logger.debug("Listando notificações do usuário: {}", email);

    List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioOrderByCriadoEmDesc(usuario);
    return notificacoes.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Lista notificações não lidas do usuário logado.
   */
  @Transactional(readOnly = true)
  public List<NotificacaoResponseDTO> listarNaoLidas() {
    String email = SecurityUtils.getCurrentUserEmail();
    Usuario usuario =
        usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", email));

    logger.debug("Listando notificações não lidas do usuário: {}", email);

    List<Notificacao> notificacoes =
        notificacaoRepository.findByUsuarioAndLidaOrderByCriadoEmDesc(usuario, false);
    return notificacoes.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Retorna contador de notificações não lidas.
   */
  @Transactional(readOnly = true)
  public Long contarNaoLidas() {
    String email = SecurityUtils.getCurrentUserEmail();
    Usuario usuario =
        usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", email));

    Long count = notificacaoRepository.countByUsuarioAndLida(usuario, false);
    logger.debug("Contador de não lidas para {}: {}", email, count);
    return count;
  }

  /**
   * Marca uma notificação como lida.
   */
  public void marcarComoLida(Long notificacaoId) {
    logger.info("Marcando notificação {} como lida", notificacaoId);

    Notificacao notificacao =
        notificacaoRepository
            .findById(notificacaoId)
            .orElseThrow(() -> new EntityNotFoundException("Notificacao", "id", notificacaoId));

    // Verificar se a notificação pertence ao usuário logado
    String email = SecurityUtils.getCurrentUserEmail();
    if (!notificacao.getUsuario().getEmail().equals(email)) {
      throw new IllegalStateException("Você não tem permissão para alterar esta notificação");
    }

    notificacao.marcarComoLida();
    notificacaoRepository.save(notificacao);
  }

  /**
   * Marca todas as notificações do usuário logado como lidas.
   */
  public void marcarTodasComoLidas() {
    String email = SecurityUtils.getCurrentUserEmail();
    Usuario usuario =
        usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", email));

    logger.info("Marcando todas as notificações como lidas para usuário: {}", email);

    List<Notificacao> notificacoes =
        notificacaoRepository.findByUsuarioAndLidaOrderByCriadoEmDesc(usuario, false);

    notificacoes.forEach(Notificacao::marcarComoLida);
    notificacaoRepository.saveAll(notificacoes);

    logger.info("Total de {} notificações marcadas como lidas", notificacoes.size());
  }

  /**
   * Converte entidade para DTO.
   */
  private NotificacaoResponseDTO toResponseDTO(Notificacao notificacao) {
    return new NotificacaoResponseDTO(
        notificacao.getNotificacaoId(),
        notificacao.getUsuario().getUsuarioId(),
        notificacao.getUsuario().getNome(),
        notificacao.getTipo(),
        notificacao.getTitulo(),
        notificacao.getMensagem(),
        notificacao.getLink(),
        notificacao.getLida(),
        notificacao.getDataLeitura(),
        notificacao.getCriadoEm());
  }
}
