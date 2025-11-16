package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Feedback;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.TipoFeedback;
import com.compliance.sgc.dto.feedback.FeedbackCreateDTO;
import com.compliance.sgc.dto.feedback.FeedbackResponseDTO;
import com.compliance.sgc.exception.RecursoNaoEncontradoException;
import com.compliance.sgc.repository.FeedbackRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service para gerenciar feedbacks.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UsuarioRepository usuarioRepository;

    private static final String UPLOAD_DIR = "uploads/feedback-screenshots/";

    /**
     * Cria um novo feedback.
     */
    @Transactional
    public FeedbackResponseDTO createFeedback(Long usuarioId, FeedbackCreateDTO createDTO, MultipartFile screenshot) {
        log.debug("Criando feedback - usuário ID: {}, tipo: {}", usuarioId, createDTO.getTipo());

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + usuarioId));

        Feedback feedback = new Feedback();
        feedback.setUsuario(usuario);
        feedback.setTipo(createDTO.getTipo());
        feedback.setTitulo(createDTO.getTitulo());
        feedback.setDescricao(createDTO.getDescricao());
        feedback.setNavegador(createDTO.getNavegador());
        feedback.setUrl(createDTO.getUrl());
        feedback.setResolvido(false);

        // Salva screenshot se fornecido
        if (screenshot != null && !screenshot.isEmpty()) {
            String screenshotPath = saveScreenshot(screenshot);
            feedback.setScreenshotPath(screenshotPath);
        }

        feedback = feedbackRepository.save(feedback);
        log.info("Feedback criado com sucesso - ID: {}", feedback.getFeedbackId());

        // TODO: Enviar email para admins notificando novo feedback

        return toDTO(feedback);
    }

    /**
     * Lista todos os feedbacks (admin).
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> listarTodos() {
        log.debug("Listando todos os feedbacks");
        return feedbackRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista feedbacks por tipo.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> listarPorTipo(TipoFeedback tipo) {
        log.debug("Listando feedbacks por tipo: {}", tipo);
        return feedbackRepository.findByTipoOrderByDataCriacaoDesc(tipo).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista feedbacks não resolvidos.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> listarNaoResolvidos() {
        log.debug("Listando feedbacks não resolvidos");
        return feedbackRepository.findByResolvidoFalseOrderByDataCriacaoDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista feedbacks de um usuário.
     */
    @Transactional(readOnly = true)
    public List<FeedbackResponseDTO> listarPorUsuario(Long usuarioId) {
        log.debug("Listando feedbacks do usuário ID: {}", usuarioId);
        return feedbackRepository.findByUsuarioUsuarioIdOrderByDataCriacaoDesc(usuarioId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Marca feedback como resolvido com resposta.
     */
    @Transactional
    public FeedbackResponseDTO resolverFeedback(Long feedbackId, String resposta) {
        log.debug("Resolvendo feedback ID: {}", feedbackId);

        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Feedback não encontrado: " + feedbackId));

        feedback.setResolvido(true);
        feedback.setResposta(resposta);
        feedback = feedbackRepository.save(feedback);

        log.info("Feedback resolvido - ID: {}", feedbackId);

        // TODO: Enviar email para usuário notificando resolução

        return toDTO(feedback);
    }

    /**
     * Salva screenshot no sistema de arquivos.
     */
    private String saveScreenshot(MultipartFile file) {
        try {
            // Cria diretório se não existir
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Gera nome único
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";
            String filename = UUID.randomUUID() + extension;

            // Salva arquivo
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            log.debug("Screenshot salvo: {}", filename);
            return UPLOAD_DIR + filename;

        } catch (IOException e) {
            log.error("Erro ao salvar screenshot", e);
            return null;
        }
    }

    /**
     * Converte Entity para DTO.
     */
    private FeedbackResponseDTO toDTO(Feedback entity) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setFeedbackId(entity.getFeedbackId());
        dto.setUsuarioId(entity.getUsuario().getUsuarioId());
        dto.setUsuarioNome(entity.getUsuario().getNome());
        dto.setTipo(entity.getTipo());
        dto.setTitulo(entity.getTitulo());
        dto.setDescricao(entity.getDescricao());
        dto.setNavegador(entity.getNavegador());
        dto.setUrl(entity.getUrl());
        dto.setScreenshotPath(entity.getScreenshotPath());
        dto.setResolvido(entity.getResolvido());
        dto.setResposta(entity.getResposta());
        dto.setDataCriacao(entity.getDataCriacao());
        return dto;
    }
}
