package com.compliance.sgc.validator;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

/**
 * Sanitizador de Input para Prevenção de XSS e SQL Injection.
 *
 * Security Hardening (OWASP Top 10):
 * - Sanitização de HTML usando OWASP Java HTML Sanitizer
 * - Validação de patterns perigosos (SQL injection)
 * - Whitelist de caracteres permitidos
 *
 * @author Security Team
 * @version 1.0
 * @since 2025-11-16
 */
@Component
public class InputSanitizer {

  private static final PolicyFactory POLICY =
      new HtmlPolicyBuilder()
          .allowElements("b", "i", "u", "em", "strong", "p", "br")
          .allowAttributes("class")
          .globally()
          .toFactory();

  // Patterns perigosos (SQL Injection)
  private static final Pattern SQL_INJECTION_PATTERN =
      Pattern.compile(
          "(?i)(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\\b)",
          Pattern.CASE_INSENSITIVE);

  /**
   * Sanitiza HTML removendo tags perigosas.
   *
   * @param input String de entrada
   * @return String sanitizada
   */
  public String sanitizeHtml(String input) {
    if (input == null || input.isBlank()) {
      return input;
    }
    return POLICY.sanitize(input);
  }

  /**
   * Valida se o input contém padrões de SQL Injection.
   *
   * @param input String de entrada
   * @return true se contém padrão suspeito
   */
  public boolean containsSqlInjectionPattern(String input) {
    if (input == null || input.isBlank()) {
      return false;
    }
    return SQL_INJECTION_PATTERN.matcher(input).find();
  }

  /**
   * Sanitiza string removendo caracteres especiais perigosos.
   *
   * @param input String de entrada
   * @return String sanitizada
   */
  public String sanitizeSpecialChars(String input) {
    if (input == null || input.isBlank()) {
      return input;
    }
    // Remove caracteres null, backspace, etc
    return input.replaceAll("[\\x00\\x08\\x0B\\x0C\\x0E-\\x1F]", "");
  }

  /**
   * Máscara de email para logs (LGPD/GDPR compliance).
   *
   * @param email Email a ser mascarado
   * @return Email mascarado (ex: j***@example.com)
   */
  public String maskEmail(String email) {
    if (email == null || !email.contains("@")) {
      return email;
    }
    String[] parts = email.split("@");
    if (parts[0].length() <= 1) {
      return email;
    }
    return parts[0].charAt(0) + "***@" + parts[1];
  }
}
