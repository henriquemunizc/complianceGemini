package com.compliance.sgc.dto.preferences;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DTO de Preferências do Usuário - Response.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDTO {

    private Long preferenceId;
    private Long usuarioId;
    private List<String> toursCompleted = new ArrayList<>();
    private Boolean onboardingCompleted = false;
    private Map<String, Boolean> checklistItems = new HashMap<>();
    private String theme = "light";
    private String language = "pt-BR";
    private Map<String, Object> customSettings = new HashMap<>();
}
