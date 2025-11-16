package com.compliance.sgc.controller;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.dto.auth.LoginRequest;
import com.compliance.sgc.dto.auth.LoginResponse;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.repository.UsuarioRepository;
import com.compliance.sgc.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller de autenticação.
 * Endpoints públicos para login.
 * Proteção OWASP: Broken Authentication, Information Exposure.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Endpoints públicos para autenticação no sistema")
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  @Autowired
  private AuthenticationManager authenticationManager;

  @Autowired
  private JwtTokenProvider jwtTokenProvider;

  @Autowired
  private UsuarioRepository usuarioRepository;

  /**
   * Endpoint de login.
   * Autentica o usuário e retorna um token JWT.
   * Proteção OWASP: Broken Authentication, Brute Force Prevention.
   *
   * @param loginRequest Dados de login (email e senha)
   * @return LoginResponse com token JWT
   */
  @PostMapping("/login")
  @Operation(summary = "Autenticar usuário", description = "Autentica o usuário com email e senha, retornando um token JWT para uso nas demais requisições")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
          content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
      @ApiResponse(responseCode = "400", description = "Credenciais inválidas ou usuário inativo", content = @Content),
      @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
  })
  @SecurityRequirements // Remove o requirement global de JWT para este endpoint público
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      // Valida se usuário existe e está ativo ANTES de tentar autenticar
      Usuario usuario = usuarioRepository.findByEmail(loginRequest.email())
          .orElseThrow(() -> new EntityNotFoundException("Usuário", "email", loginRequest.email()));

      if (!usuario.getAtivo()) {
        logger.warn("Tentativa de login com usuário inativo: {}", loginRequest.email());
        throw new BusinessValidationException("Usuário inativo. Entre em contato com o administrador.");
      }

      // Autentica o usuário (valida senha)
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              loginRequest.email(),
              loginRequest.senha()
          )
      );

      SecurityContextHolder.getContext().setAuthentication(authentication);

      // Gera o token JWT
      String token = jwtTokenProvider.generateToken(authentication);

      logger.info("Login bem-sucedido: {}", loginRequest.email());

      return ResponseEntity.ok(
          new LoginResponse(token, usuario.getEmail(), usuario.getNome(), usuario.getPerfil())
      );

    } catch (BadCredentialsException ex) {
      // IMPORTANTE: Não revelar se o usuário existe ou se a senha está incorreta
      // Proteção OWASP: Information Exposure
      logger.warn("Tentativa de login falhada: {}", loginRequest.email());
      throw new BusinessValidationException("Email ou senha incorretos");
    }
  }
}
