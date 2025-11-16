package com.compliance.sgc.controller;

import com.compliance.sgc.domain.enums.TipoFeedback;
import com.compliance.sgc.dto.feedback.FeedbackCreateDTO;
import com.compliance.sgc.dto.feedback.FeedbackResponseDTO;
import com.compliance.sgc.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller REST para gerenciar feedbacks.
 * Endpoints /api/v1/feedback
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Feedback", description = "Gerenciamento de feedbacks e bugs")
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * POST /api/v1/feedback - Envia novo feedback.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Enviar feedback", description = "Cria um novo feedback (bug, sugestão, etc)")
    public ResponseEntity<FeedbackResponseDTO> createFeedback(
            @RequestParam("tipo") TipoFeedback tipo,
            @RequestParam(value = "titulo", required = false) String titulo,
            @RequestParam("descricao") String descricao,
            @RequestParam(value = "navegador", required = false) String navegador,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "screenshot", required = false) MultipartFile screenshot,
            Authentication authentication) {

        log.debug("POST /api/v1/feedback - tipo: {} - usuário: {}", tipo, authentication.getName());

        // Cria DTO
        FeedbackCreateDTO createDTO = new FeedbackCreateDTO();
        createDTO.setTipo(tipo);
        createDTO.setTitulo(titulo);
        createDTO.setDescricao(descricao);
        createDTO.setNavegador(navegador);
        createDTO.setUrl(url);

        Long usuarioId = extractUsuarioId(authentication);
        FeedbackResponseDTO created = feedbackService.createFeedback(usuarioId, createDTO, screenshot);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/v1/feedback - Lista todos os feedbacks (ADMIN).
     */
    @GetMapping
    @Operation(summary = "Listar feedbacks", description = "Lista todos os feedbacks (apenas ADMIN)")
    public ResponseEntity<List<FeedbackResponseDTO>> listarTodos() {
        log.debug("GET /api/v1/feedback");
        List<FeedbackResponseDTO> feedbacks = feedbackService.listarTodos();
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * GET /api/v1/feedback/tipo/{tipo} - Lista feedbacks por tipo (ADMIN).
     */
    @GetMapping("/tipo/{tipo}")
    @Operation(summary = "Listar por tipo", description = "Lista feedbacks por tipo (apenas ADMIN)")
    public ResponseEntity<List<FeedbackResponseDTO>> listarPorTipo(@PathVariable TipoFeedback tipo) {
        log.debug("GET /api/v1/feedback/tipo/{}", tipo);
        List<FeedbackResponseDTO> feedbacks = feedbackService.listarPorTipo(tipo);
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * GET /api/v1/feedback/nao-resolvidos - Lista feedbacks não resolvidos (ADMIN).
     */
    @GetMapping("/nao-resolvidos")
    @Operation(summary = "Listar não resolvidos", description = "Lista feedbacks pendentes (apenas ADMIN)")
    public ResponseEntity<List<FeedbackResponseDTO>> listarNaoResolvidos() {
        log.debug("GET /api/v1/feedback/nao-resolvidos");
        List<FeedbackResponseDTO> feedbacks = feedbackService.listarNaoResolvidos();
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * GET /api/v1/feedback/meus - Lista feedbacks do usuário logado.
     */
    @GetMapping("/meus")
    @Operation(summary = "Meus feedbacks", description = "Lista feedbacks enviados pelo usuário logado")
    public ResponseEntity<List<FeedbackResponseDTO>> listarMeusFeedbacks(Authentication authentication) {
        log.debug("GET /api/v1/feedback/meus - usuário: {}", authentication.getName());
        Long usuarioId = extractUsuarioId(authentication);
        List<FeedbackResponseDTO> feedbacks = feedbackService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(feedbacks);
    }

    /**
     * PUT /api/v1/feedback/{feedbackId}/resolver - Marca feedback como resolvido (ADMIN).
     */
    @PutMapping("/{feedbackId}/resolver")
    @Operation(summary = "Resolver feedback", description = "Marca feedback como resolvido com resposta (apenas ADMIN)")
    public ResponseEntity<FeedbackResponseDTO> resolverFeedback(
            @PathVariable Long feedbackId,
            @RequestParam String resposta) {

        log.debug("PUT /api/v1/feedback/{}/resolver", feedbackId);
        FeedbackResponseDTO resolved = feedbackService.resolverFeedback(feedbackId, resposta);
        return ResponseEntity.ok(resolved);
    }

    /**
     * Extrai usuarioId do Authentication.
     * TODO: Ajustar conforme implementação real de autenticação.
     */
    private Long extractUsuarioId(Authentication authentication) {
        // FIXME: Implementar extração real do usuário logado
        return 1L;
    }
}
