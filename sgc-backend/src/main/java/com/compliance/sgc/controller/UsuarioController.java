package com.compliance.sgc.controller;

import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.dto.usuario.TrocarSenhaDTO;
import com.compliance.sgc.dto.usuario.UsuarioCreateDTO;
import com.compliance.sgc.dto.usuario.UsuarioResponseDTO;
import com.compliance.sgc.dto.usuario.UsuarioUpdateDTO;
import com.compliance.sgc.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para gerenciamento de usuários.
 * Endpoints: /api/v1/usuarios
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

  private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

  private final UsuarioService usuarioService;

  public UsuarioController(UsuarioService usuarioService) {
    this.usuarioService = usuarioService;
  }

  /**
   * Cria um novo usuário.
   * Requer role: ADMIN
   *
   * @param dto Dados do usuário a ser criado
   * @return UsuarioResponseDTO com status 201 (CREATED)
   */
  @PostMapping
  public ResponseEntity<UsuarioResponseDTO> criar(@Valid @RequestBody UsuarioCreateDTO dto) {
    logger.info("POST /api/v1/usuarios - Criar usuário: {}", dto.email());
    UsuarioResponseDTO response = usuarioService.criar(dto);
    return new ResponseEntity<>(response, HttpStatus.CREATED);
  }

  /**
   * Atualiza um usuário existente.
   * Requer role: ADMIN
   *
   * @param id ID do usuário
   * @param dto Dados a serem atualizados
   * @return UsuarioResponseDTO com status 200 (OK)
   */
  @PutMapping("/{id}")
  public ResponseEntity<UsuarioResponseDTO> atualizar(
      @PathVariable Long id, @Valid @RequestBody UsuarioUpdateDTO dto) {
    logger.info("PUT /api/v1/usuarios/{} - Atualizar usuário", id);
    UsuarioResponseDTO response = usuarioService.atualizar(id, dto);
    return ResponseEntity.ok(response);
  }

  /**
   * Busca um usuário por ID.
   * Todos os usuários autenticados podem acessar.
   *
   * @param id ID do usuário
   * @return UsuarioResponseDTO com status 200 (OK)
   */
  @GetMapping("/{id}")
  public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id) {
    logger.debug("GET /api/v1/usuarios/{} - Buscar por ID", id);
    UsuarioResponseDTO response = usuarioService.buscarPorId(id);
    return ResponseEntity.ok(response);
  }

  /**
   * Lista usuários com filtro opcional por perfil.
   * Todos os usuários autenticados podem acessar.
   *
   * @param perfil Perfil para filtrar (opcional)
   * @return Lista de UsuarioResponseDTO com status 200 (OK)
   */
  @GetMapping
  public ResponseEntity<List<UsuarioResponseDTO>> listar(
      @RequestParam(required = false) PerfilUsuario perfil) {
    logger.debug("GET /api/v1/usuarios - Listar usuários com filtro: perfil={}", perfil);
    List<UsuarioResponseDTO> response = usuarioService.listar(perfil);
    return ResponseEntity.ok(response);
  }

  /**
   * Exclui (soft delete) um usuário.
   * Requer role: ADMIN
   *
   * @param id ID do usuário
   * @return Status 204 (NO CONTENT)
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> excluir(@PathVariable Long id) {
    logger.info("DELETE /api/v1/usuarios/{} - Excluir (soft delete)", id);
    usuarioService.excluir(id);
    return ResponseEntity.noContent().build();
  }

  /**
   * Troca a senha de um usuário.
   * Requer role: ADMIN
   *
   * @param id ID do usuário
   * @param dto Dados da troca de senha
   * @return Status 204 (NO CONTENT)
   */
  @PostMapping("/{id}/trocar-senha")
  public ResponseEntity<Void> trocarSenha(
      @PathVariable Long id, @Valid @RequestBody TrocarSenhaDTO dto) {
    logger.info("POST /api/v1/usuarios/{}/trocar-senha - Trocar senha", id);
    usuarioService.trocarSenha(id, dto);
    return ResponseEntity.noContent().build();
  }
}
