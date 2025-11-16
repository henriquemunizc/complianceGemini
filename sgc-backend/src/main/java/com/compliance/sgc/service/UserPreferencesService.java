package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.UserPreferences;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.dto.preferences.UserPreferencesDTO;
import com.compliance.sgc.dto.preferences.UserPreferencesUpdateDTO;
import com.compliance.sgc.exception.RecursoNaoEncontradoException;
import com.compliance.sgc.repository.UserPreferencesRepository;
import com.compliance.sgc.repository.UsuarioRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service para gerenciar preferências do usuário.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    /**
     * Obtém preferências do usuário (cria se não existir).
     */
    @Transactional(readOnly = true)
    public UserPreferencesDTO getPreferences(Long usuarioId) {
        log.debug("Buscando preferências do usuário ID: {}", usuarioId);

        UserPreferences preferences = preferencesRepository.findByUsuarioUsuarioId(usuarioId)
                .orElseGet(() -> createDefaultPreferences(usuarioId));

        return toDTO(preferences);
    }

    /**
     * Atualiza preferências do usuário.
     */
    @Transactional
    public UserPreferencesDTO updatePreferences(Long usuarioId, UserPreferencesUpdateDTO updateDTO) {
        log.debug("Atualizando preferências do usuário ID: {}", usuarioId);

        UserPreferences preferences = preferencesRepository.findByUsuarioUsuarioId(usuarioId)
                .orElseGet(() -> createDefaultPreferences(usuarioId));

        // Atualiza campos se fornecidos
        if (updateDTO.getToursCompleted() != null) {
            preferences.setToursCompletedList(updateDTO.getToursCompleted());
        }

        if (updateDTO.getOnboardingCompleted() != null) {
            preferences.setOnboardingCompleted(updateDTO.getOnboardingCompleted());
        }

        if (updateDTO.getChecklistItems() != null) {
            preferences.setChecklistItemsMap(updateDTO.getChecklistItems());
        }

        if (updateDTO.getTheme() != null) {
            preferences.setTheme(updateDTO.getTheme());
        }

        if (updateDTO.getLanguage() != null) {
            preferences.setLanguage(updateDTO.getLanguage());
        }

        if (updateDTO.getCustomSettings() != null) {
            try {
                preferences.setCustomSettings(objectMapper.writeValueAsString(updateDTO.getCustomSettings()));
            } catch (JsonProcessingException e) {
                log.error("Erro ao serializar customSettings", e);
                preferences.setCustomSettings("{}");
            }
        }

        preferences = preferencesRepository.save(preferences);
        log.info("Preferências atualizadas para usuário ID: {}", usuarioId);

        return toDTO(preferences);
    }

    /**
     * Adiciona um tour completado.
     */
    @Transactional
    public UserPreferencesDTO addCompletedTour(Long usuarioId, String tourId) {
        log.debug("Adicionando tour '{}' aos completados do usuário ID: {}", tourId, usuarioId);

        UserPreferences preferences = preferencesRepository.findByUsuarioUsuarioId(usuarioId)
                .orElseGet(() -> createDefaultPreferences(usuarioId));

        List<String> tours = new ArrayList<>(preferences.getToursCompletedList());
        if (!tours.contains(tourId)) {
            tours.add(tourId);
            preferences.setToursCompletedList(tours);
            preferences = preferencesRepository.save(preferences);
            log.info("Tour '{}' adicionado para usuário ID: {}", tourId, usuarioId);
        }

        return toDTO(preferences);
    }

    /**
     * Atualiza item do checklist de onboarding.
     */
    @Transactional
    public UserPreferencesDTO updateChecklistItem(Long usuarioId, String itemId, Boolean completed) {
        log.debug("Atualizando checklist item '{}' = {} para usuário ID: {}", itemId, completed, usuarioId);

        UserPreferences preferences = preferencesRepository.findByUsuarioUsuarioId(usuarioId)
                .orElseGet(() -> createDefaultPreferences(usuarioId));

        Map<String, Boolean> checklist = new HashMap<>(preferences.getChecklistItemsMap());
        checklist.put(itemId, completed);
        preferences.setChecklistItemsMap(checklist);

        preferences = preferencesRepository.save(preferences);
        log.info("Checklist item '{}' atualizado para usuário ID: {}", itemId, usuarioId);

        return toDTO(preferences);
    }

    /**
     * Marca onboarding como completado.
     */
    @Transactional
    public UserPreferencesDTO completeOnboarding(Long usuarioId) {
        log.debug("Marcando onboarding como completado para usuário ID: {}", usuarioId);

        UserPreferences preferences = preferencesRepository.findByUsuarioUsuarioId(usuarioId)
                .orElseGet(() -> createDefaultPreferences(usuarioId));

        preferences.setOnboardingCompleted(true);
        preferences = preferencesRepository.save(preferences);

        log.info("Onboarding completado para usuário ID: {}", usuarioId);
        return toDTO(preferences);
    }

    /**
     * Cria preferências padrão para um usuário.
     */
    private UserPreferences createDefaultPreferences(Long usuarioId) {
        log.debug("Criando preferências padrão para usuário ID: {}", usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + usuarioId));

        UserPreferences preferences = new UserPreferences();
        preferences.setUsuario(usuario);
        preferences.setToursCompletedList(new ArrayList<>());
        preferences.setOnboardingCompleted(false);
        preferences.setChecklistItemsMap(new HashMap<>());
        preferences.setTheme("light");
        preferences.setLanguage("pt-BR");
        preferences.setCustomSettings("{}");

        return preferencesRepository.save(preferences);
    }

    /**
     * Converte Entity para DTO.
     */
    private UserPreferencesDTO toDTO(UserPreferences entity) {
        UserPreferencesDTO dto = new UserPreferencesDTO();
        dto.setPreferenceId(entity.getPreferenceId());
        dto.setUsuarioId(entity.getUsuario().getUsuarioId());
        dto.setToursCompleted(entity.getToursCompletedList());
        dto.setOnboardingCompleted(entity.getOnboardingCompleted());
        dto.setChecklistItems(entity.getChecklistItemsMap());
        dto.setTheme(entity.getTheme());
        dto.setLanguage(entity.getLanguage());

        // Parse customSettings JSON
        try {
            if (entity.getCustomSettings() != null && !entity.getCustomSettings().isEmpty()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> customSettings = objectMapper.readValue(
                        entity.getCustomSettings(), Map.class);
                dto.setCustomSettings(customSettings);
            }
        } catch (JsonProcessingException e) {
            log.error("Erro ao deserializar customSettings", e);
            dto.setCustomSettings(new HashMap<>());
        }

        return dto;
    }
}
