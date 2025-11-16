package com.compliance.sgc.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Entidade UserPreferences - Preferências e configurações do usuário.
 * Armazena tours completados, onboarding, checklist e preferências de UI.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Entity
@Table(name = "TBL_USER_PREFERENCES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences extends AuditoriaBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    /**
     * IDs dos tours já completados (ex: "first-login", "dashboard")
     * Armazenado como JSON array: ["first-login", "dashboard"]
     */
    @Column(name = "tours_completed", columnDefinition = "TEXT")
    private String toursCompleted;

    /**
     * Se o onboarding foi completado
     */
    @Column(name = "onboarding_completed", nullable = false)
    private Boolean onboardingCompleted = false;

    /**
     * Itens do checklist de onboarding e status
     * Armazenado como JSON object: {"complete-profile": true, "create-obligation": false}
     */
    @Column(name = "checklist_items", columnDefinition = "TEXT")
    private String checklistItems;

    /**
     * Tema da interface: "light" ou "dark"
     */
    @Column(name = "theme", length = 20)
    private String theme = "light";

    /**
     * Idioma/Locale: "pt-BR", "en-US", etc.
     */
    @Column(name = "language", length = 10)
    private String language = "pt-BR";

    /**
     * Configurações adicionais customizadas
     * Armazenado como JSON object para extensibilidade futura
     */
    @Column(name = "custom_settings", columnDefinition = "TEXT")
    private String customSettings;

    /**
     * Helper: Converte toursCompleted de String JSON para List<String>
     */
    @Transient
    public List<String> getToursCompletedList() {
        if (toursCompleted == null || toursCompleted.isEmpty()) {
            return new ArrayList<>();
        }
        // Parse JSON array simples: ["first-login", "dashboard"]
        String clean = toursCompleted.replace("[", "").replace("]", "").replace("\"", "");
        if (clean.isEmpty()) {
            return new ArrayList<>();
        }
        return List.of(clean.split(","));
    }

    /**
     * Helper: Define toursCompleted a partir de List<String>
     */
    @Transient
    public void setToursCompletedList(List<String> tours) {
        if (tours == null || tours.isEmpty()) {
            this.toursCompleted = "[]";
        } else {
            this.toursCompleted = "[\"" + String.join("\",\"", tours) + "\"]";
        }
    }

    /**
     * Helper: Converte checklistItems de String JSON para Map<String, Boolean>
     */
    @Transient
    public Map<String, Boolean> getChecklistItemsMap() {
        Map<String, Boolean> map = new HashMap<>();
        if (checklistItems == null || checklistItems.isEmpty() || checklistItems.equals("{}")) {
            return map;
        }
        // Parse JSON object simples: {"complete-profile": true, "create-obligation": false}
        String clean = checklistItems.replace("{", "").replace("}", "").replace("\"", "");
        if (clean.isEmpty()) {
            return map;
        }
        String[] pairs = clean.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":");
            if (keyValue.length == 2) {
                map.put(keyValue[0].trim(), Boolean.parseBoolean(keyValue[1].trim()));
            }
        }
        return map;
    }

    /**
     * Helper: Define checklistItems a partir de Map<String, Boolean>
     */
    @Transient
    public void setChecklistItemsMap(Map<String, Boolean> items) {
        if (items == null || items.isEmpty()) {
            this.checklistItems = "{}";
        } else {
            StringBuilder sb = new StringBuilder("{");
            items.forEach((key, value) -> {
                if (sb.length() > 1) sb.append(",");
                sb.append("\"").append(key).append("\":").append(value);
            });
            sb.append("}");
            this.checklistItems = sb.toString();
        }
    }
}
