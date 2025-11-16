package com.compliance.sgc.controller;

import com.compliance.sgc.dto.preferences.UserPreferencesDTO;
import com.compliance.sgc.dto.preferences.UserPreferencesUpdateDTO;
import com.compliance.sgc.service.UserPreferencesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para gerenciar preferências do usuário.
 * Endpoints /api/v1/preferences
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "UserPreferences", description = "Gerenciamento de preferências do usuário")
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    /**
     * GET /api/v1/preferences - Obtém preferências do usuário logado.
     */
    @GetMapping
    @Operation(summary = "Obter preferências do usuário", description = "Retorna preferências do usuário logado")
    public ResponseEntity<UserPreferencesDTO> getPreferences(Authentication authentication) {
        log.debug("GET /api/v1/preferences - usuário: {}", authentication.getName());

        Long usuarioId = extractUsuarioId(authentication);
        UserPreferencesDTO preferences = preferencesService.getPreferences(usuarioId);

        return ResponseEntity.ok(preferences);
    }

    /**
     * PUT /api/v1/preferences - Atualiza preferências do usuário logado.
     */
    @PutMapping
    @Operation(summary = "Atualizar preferências", description = "Atualiza preferências do usuário logado")
    public ResponseEntity<UserPreferencesDTO> updatePreferences(
            @RequestBody UserPreferencesUpdateDTO updateDTO,
            Authentication authentication) {

        log.debug("PUT /api/v1/preferences - usuário: {}", authentication.getName());

        Long usuarioId = extractUsuarioId(authentication);
        UserPreferencesDTO updated = preferencesService.updatePreferences(usuarioId, updateDTO);

        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/v1/preferences/tours/{tourId} - Adiciona tour completado.
     */
    @PostMapping("/tours/{tourId}")
    @Operation(summary = "Adicionar tour completado", description = "Marca um tour como completado")
    public ResponseEntity<UserPreferencesDTO> addCompletedTour(
            @PathVariable String tourId,
            Authentication authentication) {

        log.debug("POST /api/v1/preferences/tours/{} - usuário: {}", tourId, authentication.getName());

        Long usuarioId = extractUsuarioId(authentication);
        UserPreferencesDTO updated = preferencesService.addCompletedTour(usuarioId, tourId);

        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/v1/preferences/checklist/{itemId} - Atualiza item do checklist.
     */
    @PutMapping("/checklist/{itemId}")
    @Operation(summary = "Atualizar item do checklist", description = "Marca item do checklist como completado/pendente")
    public ResponseEntity<UserPreferencesDTO> updateChecklistItem(
            @PathVariable String itemId,
            @RequestParam Boolean completed,
            Authentication authentication) {

        log.debug("PUT /api/v1/preferences/checklist/{} = {} - usuário: {}",
                itemId, completed, authentication.getName());

        Long usuarioId = extractUsuarioId(authentication);
        UserPreferencesDTO updated = preferencesService.updateChecklistItem(usuarioId, itemId, completed);

        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/v1/preferences/onboarding/complete - Completa onboarding.
     */
    @PostMapping("/onboarding/complete")
    @Operation(summary = "Completar onboarding", description = "Marca o onboarding como completado")
    public ResponseEntity<UserPreferencesDTO> completeOnboarding(Authentication authentication) {
        log.debug("POST /api/v1/preferences/onboarding/complete - usuário: {}", authentication.getName());

        Long usuarioId = extractUsuarioId(authentication);
        UserPreferencesDTO updated = preferencesService.completeOnboarding(usuarioId);

        return ResponseEntity.ok(updated);
    }

    /**
     * Extrai usuarioId do Authentication (assumindo que o email é o principal).
     * TODO: Ajustar conforme implementação real de autenticação.
     */
    private Long extractUsuarioId(Authentication authentication) {
        // Por enquanto, retorna um ID mockado
        // Na implementação real, você deve extrair do token JWT ou UserDetails
        return 1L; // FIXME: Implementar extração real do usuário logado
    }
}
