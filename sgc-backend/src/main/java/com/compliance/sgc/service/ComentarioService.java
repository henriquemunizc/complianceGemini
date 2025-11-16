package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Comentario;
import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.TipoNotificacao;
import com.compliance.sgc.dto.comentario.ComentarioCreateDTO;
import com.compliance.sgc.dto.comentario.ComentarioResponseDTO;
import com.compliance.sgc.dto.comentario.ComentarioUpdateDTO;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.ComentarioRepository;
import com.compliance.sgc.repository.ObrigacaoRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import com.compliance.sgc.security.SecurityUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciamento de comentários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional
public class ComentarioService {

  private static final Logger logger = LoggerFactory.getLogger(ComentarioService.class);
  private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)");

  private final ComentarioRepository comentarioRepository;
  private final ObrigacaoRepository obrigacaoRepository;
  private final UsuarioRepository usuarioRepository;
  private final NotificacaoService notificacaoService;

  public ComentarioService(
      ComentarioRepository comentarioRepository,
      ObrigacaoRepository obrigacaoRepository,
      UsuarioRepository usuarioRepository,
      NotificacaoService notificacaoService) {
    this.comentarioRepository = comentarioRepository;
    this.obrigacaoRepository = obrigacaoRepository;
    this.usuarioRepository = usuarioRepository;
    this.notificacaoService = notificacaoService;
  }

  /**
   * Cria um novo comentário.
   */
  public ComentarioResponseDTO criar(ComentarioCreateDTO dto) {
    String email = SecurityUtils.getCurrentUserEmail();
    Usuario autor =
        usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "email", email));

    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(dto.obrigacaoId())
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", dto.obrigacaoId()));

    logger.info("Criando comentário na obrigação: {}", dto.obrigacaoId());

    Comentario comentario = new Comentario();
    comentario.setObrigacao(obrigacao);
    comentario.setAutor(autor);
    comentario.setConteudo(dto.conteudo());
    comentario.setEditado(false);

    // Se é uma resposta, associar ao comentário pai
    if (dto.comentarioPaiId() != null) {
      Comentario comentarioPai =
          comentarioRepository
              .findById(dto.comentarioPaiId())
              .orElseThrow(
                  () -> new EntityNotFoundException("Comentario", "id", dto.comentarioPaiId()));
      comentario.setComentarioPai(comentarioPai);
    }

    Comentario saved = comentarioRepository.save(comentario);
    logger.info("Comentário criado: ID={}", saved.getComentarioId());

    // Processar @mentions e criar notificações
    processarMentions(saved, obrigacao);

    return toResponseDTO(saved);
  }

  /**
   * Lista comentários de uma obrigação.
   */
  @Transactional(readOnly = true)
  public List<ComentarioResponseDTO> listarPorObrigacao(Long obrigacaoId) {
    Obrigacao obrigacao =
        obrigacaoRepository
            .findById(obrigacaoId)
            .orElseThrow(() -> new EntityNotFoundException("Obrigacao", "id", obrigacaoId));

    logger.debug("Listando comentários da obrigação: {}", obrigacaoId);

    List<Comentario> comentarios =
        comentarioRepository.findByObrigacaoOrderByCriadoEmDesc(obrigacao);

    return comentarios.stream().map(this::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Atualiza um comentário.
   */
  public ComentarioResponseDTO atualizar(Long comentarioId, ComentarioUpdateDTO dto) {
    String email = SecurityUtils.getCurrentUserEmail();

    Comentario comentario =
        comentarioRepository
            .findById(comentarioId)
            .orElseThrow(() -> new EntityNotFoundException("Comentario", "id", comentarioId));

    // Verificar se o usuário logado é o autor
    if (!comentario.getAutor().getEmail().equals(email)) {
      throw new IllegalStateException("Apenas o autor pode editar o comentário");
    }

    logger.info("Atualizando comentário: ID={}", comentarioId);

    comentario.setConteudo(dto.conteudo());
    comentario.marcarComoEditado();

    Comentario updated = comentarioRepository.save(comentario);

    // Processar novamente as @mentions
    processarMentions(updated, comentario.getObrigacao());

    return toResponseDTO(updated);
  }

  /**
   * Exclui um comentário.
   */
  public void excluir(Long comentarioId) {
    String email = SecurityUtils.getCurrentUserEmail();

    Comentario comentario =
        comentarioRepository
            .findById(comentarioId)
            .orElseThrow(() -> new EntityNotFoundException("Comentario", "id", comentarioId));

    // Verificar se o usuário logado é o autor
    if (!comentario.getAutor().getEmail().equals(email)) {
      throw new IllegalStateException("Apenas o autor pode excluir o comentário");
    }

    logger.info("Excluindo comentário: ID={}", comentarioId);
    comentarioRepository.delete(comentario);
  }

  /**
   * Processa @mentions no conteúdo e cria notificações.
   */
  private void processarMentions(Comentario comentario, Obrigacao obrigacao) {
    Matcher matcher = MENTION_PATTERN.matcher(comentario.getConteudo());

    while (matcher.find()) {
      String emailMencionado = matcher.group(1);
      logger.debug("Encontrado mention: @{}", emailMencionado);

      usuarioRepository
          .findByEmail(emailMencionado)
          .ifPresent(
              usuario -> {
                String titulo = "Você foi mencionado em um comentário";
                String mensagem =
                    String.format(
                        "%s mencionou você na obrigação: %s",
                        comentario.getAutor().getNome(), obrigacao.getTitulo());
                String link = "/obrigacoes/" + obrigacao.getObrigacaoId();

                notificacaoService.criarNotificacao(
                    usuario, TipoNotificacao.COMENTARIO_MENCIONOU, titulo, mensagem, link);
              });
    }
  }

  /**
   * Converte entidade para DTO.
   */
  private ComentarioResponseDTO toResponseDTO(Comentario comentario) {
    List<ComentarioResponseDTO> respostas = new ArrayList<>();

    if (comentario.getRespostas() != null && !comentario.getRespostas().isEmpty()) {
      respostas =
          comentario.getRespostas().stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    return new ComentarioResponseDTO(
        comentario.getComentarioId(),
        comentario.getObrigacao().getObrigacaoId(),
        comentario.getAutor().getUsuarioId(),
        comentario.getAutor().getNome(),
        comentario.getAutor().getEmail(),
        comentario.getConteudo(),
        comentario.getEditado(),
        comentario.getDataEdicao(),
        comentario.getCriadoEm(),
        comentario.getComentarioPai() != null
            ? comentario.getComentarioPai().getComentarioId()
            : null,
        respostas);
  }
}
