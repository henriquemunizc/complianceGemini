package com.compliance.sgc.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Provedor de tokens JWT.
 * Responsável por gerar, validar e extrair informações de tokens JWT.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Component
public class JwtTokenProvider {

  private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

  @Value("${jwt.secret}")
  private String jwtSecret;

  @Value("${jwt.expiration}")
  private long jwtExpirationMs;

  @Value("${jwt.issuer}")
  private String jwtIssuer;

  /**
   * Gera token JWT a partir da autenticação.
   *
   * @param authentication Autenticação do Spring Security
   * @return Token JWT como String
   */
  public String generateToken(Authentication authentication) {
    UserDetails userDetails = (UserDetails) authentication.getPrincipal();
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

    return Jwts.builder()
        .subject(userDetails.getUsername())
        .issuedAt(now)
        .expiration(expiryDate)
        .issuer(jwtIssuer)
        .signWith(getSigningKey())
        .compact();
  }

  /**
   * Gera token JWT a partir do email do usuário.
   *
   * @param email Email do usuário
   * @return Token JWT como String
   */
  public String generateTokenFromEmail(String email) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

    return Jwts.builder()
        .subject(email)
        .issuedAt(now)
        .expiration(expiryDate)
        .issuer(jwtIssuer)
        .signWith(getSigningKey())
        .compact();
  }

  /**
   * Extrai o email (subject) do token JWT.
   *
   * @param token Token JWT
   * @return Email do usuário
   */
  public String getEmailFromToken(String token) {
    Claims claims = Jwts.parser()
        .verifyWith(getSigningKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();

    return claims.getSubject();
  }

  /**
   * Valida o token JWT.
   *
   * @param token Token JWT a ser validado
   * @return true se válido, false caso contrário
   */
  public boolean validateToken(String token) {
    try {
      Jwts.parser()
          .verifyWith(getSigningKey())
          .build()
          .parseSignedClaims(token);
      return true;
    } catch (SecurityException ex) {
      logger.error("Assinatura JWT inválida: {}", ex.getMessage());
    } catch (MalformedJwtException ex) {
      logger.error("Token JWT malformado: {}", ex.getMessage());
    } catch (ExpiredJwtException ex) {
      logger.error("Token JWT expirado: {}", ex.getMessage());
    } catch (UnsupportedJwtException ex) {
      logger.error("Token JWT não suportado: {}", ex.getMessage());
    } catch (IllegalArgumentException ex) {
      logger.error("JWT claims string está vazia: {}", ex.getMessage());
    }
    return false;
  }

  /**
   * Obtém a chave de assinatura a partir do secret configurado.
   *
   * @return SecretKey para assinatura/validação
   */
  private SecretKey getSigningKey() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
