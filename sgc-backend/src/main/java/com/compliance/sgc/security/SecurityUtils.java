package com.compliance.sgc.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Classe utilitária para obter informações do usuário autenticado.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
public class SecurityUtils {

  private SecurityUtils() {
    // Utility class
  }

  /**
   * Retorna o email do usuário autenticado no contexto de segurança.
   *
   * @return Email do usuário autenticado
   */
  public static String getCurrentUserEmail() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
      return "system";
    }

    Object principal = authentication.getPrincipal();

    if (principal instanceof UserDetails) {
      return ((UserDetails) principal).getUsername();
    } else if (principal instanceof String) {
      return (String) principal;
    }

    return "system";
  }

  /**
   * Retorna o nome do usuário autenticado.
   *
   * @return Nome do usuário autenticado
   */
  public static String getCurrentUserName() {
    return getCurrentUserEmail();
  }

  /**
   * Verifica se há um usuário autenticado.
   *
   * @return true se há usuário autenticado
   */
  public static boolean isAuthenticated() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    return authentication != null && authentication.isAuthenticated();
  }
}
