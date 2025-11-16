package com.compliance.sgc.dto.preferences;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * DTO para atualizar Preferências do Usuário.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesUpdateDTO {

    private List<String> toursCompleted;
    private Boolean onboardingCompleted;
    private Map<String, Boolean> checklistItems;
    private String theme;
    private String language;
    private Map<String, Object> customSettings;
}
