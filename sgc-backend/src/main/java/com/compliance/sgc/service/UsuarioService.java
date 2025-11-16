package com.compliance.sgc.service;

import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.PerfilUsuario;
import com.compliance.sgc.dto.usuario.TrocarSenhaDTO;
import com.compliance.sgc.dto.usuario.UsuarioCreateDTO;
import com.compliance.sgc.dto.usuario.UsuarioResponseDTO;
import com.compliance.sgc.dto.usuario.UsuarioUpdateDTO;
import com.compliance.sgc.exception.BusinessValidationException;
import com.compliance.sgc.exception.EntityNotFoundException;
import com.compliance.sgc.mapper.UsuarioMapper;
import com.compliance.sgc.repository.UsuarioRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciamento de usuários do sistema.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Service
@Transactional
public class UsuarioService {

  private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

  private final UsuarioRepository usuarioRepository;
  private final UsuarioMapper mapper;
  private final PasswordEncoder passwordEncoder;

  public UsuarioService(
      UsuarioRepository usuarioRepository,
      UsuarioMapper mapper,
      PasswordEncoder passwordEncoder) {
    this.usuarioRepository = usuarioRepository;
    this.mapper = mapper;
    this.passwordEncoder = passwordEncoder;
  }

  /**
   * Cria um novo usuário no sistema.
   * Apenas usuários com perfil ADMIN podem criar usuários.
   *
   * @param dto Dados do usuário a ser criado
   * @return UsuarioResponseDTO com os dados do usuário criado
   * @throws BusinessValidationException se o email já estiver cadastrado ou senha for fraca
   */
  @PreAuthorize("hasRole('ADMIN')")
  public UsuarioResponseDTO criar(UsuarioCreateDTO dto) {
    logger.info("Criando novo usuário: {}", dto.email());

    // Validação: email único
    if (usuarioRepository.existsByEmail(dto.email())) {
      throw new BusinessValidationException(
          String.format("Já existe um usuário cadastrado com o email '%s'", dto.email()));
    }

    // Validação: senha forte (mínimo 8 caracteres - já validado pela annotation, mas reforçamos)
    validarSenhaForte(dto.senha());

    // Converte DTO para entidade
    Usuario usuario = mapper.toEntity(dto);

    // Hash da senha com BCrypt
    usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
    usuario.setAtivo(true);

    Usuario saved = usuarioRepository.save(usuario);
    logger.info("Usuário criado com sucesso: ID={}, Email={}", saved.getUsuarioId(), saved.getEmail());
    return mapper.toResponseDTO(saved);
  }

  /**
   * Atualiza dados de um usuário existente.
   * Apenas usuários com perfil ADMIN podem atualizar usuários.
   *
   * @param id ID do usuário
   * @param dto Dados a serem atualizados
   * @return UsuarioResponseDTO com os dados atualizados
   * @throws EntityNotFoundException se o usuário não for encontrado
   * @throws BusinessValidationException se o email já estiver em uso por outro usuário
   */
  @PreAuthorize("hasRole('ADMIN')")
  public UsuarioResponseDTO atualizar(Long id, UsuarioUpdateDTO dto) {
    logger.info("Atualizando usuário: ID={}", id);

    Usuario usuario =
        usuarioRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "id", id));

    // Validação: se está alterando email, verificar se não está em uso
    if (dto.email() != null && !dto.email().equals(usuario.getEmail())) {
      if (usuarioRepository.existsByEmail(dto.email())) {
        throw new BusinessValidationException(
            String.format("Já existe um usuário cadastrado com o email '%s'", dto.email()));
      }
    }

    // Atualizar apenas campos não-nulos
    mapper.updateEntityFromDTO(dto, usuario);

    Usuario updated = usuarioRepository.save(usuario);
    logger.info("Usuário atualizado com sucesso: ID={}", id);
    return mapper.toResponseDTO(updated);
  }

  /**
   * Busca um usuário por ID.
   * Todos os usuários autenticados podem buscar usuários.
   *
   * @param id ID do usuário
   * @return UsuarioResponseDTO com os dados do usuário
   * @throws EntityNotFoundException se o usuário não for encontrado
   */
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public UsuarioResponseDTO buscarPorId(Long id) {
    logger.debug("Buscando usuário: ID={}", id);

    Usuario usuario =
        usuarioRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "id", id));

    return mapper.toResponseDTO(usuario);
  }

  /**
   * Lista usuários com filtro opcional por perfil.
   * Todos os usuários autenticados podem listar usuários.
   *
   * @param perfil Perfil para filtrar (opcional)
   * @return Lista de UsuarioResponseDTO
   */
  @PreAuthorize("hasAnyRole('RESPONSAVEL', 'COMPLIANCE', 'ADMIN', 'VISUALIZADOR')")
  @Transactional(readOnly = true)
  public List<UsuarioResponseDTO> listar(PerfilUsuario perfil) {
    logger.debug("Listando usuários com filtro: perfil={}", perfil);

    List<Usuario> usuarios;

    if (perfil != null) {
      usuarios = usuarioRepository.findByPerfilAndAtivo(perfil, true);
    } else {
      usuarios = usuarioRepository.findByAtivo(true);
    }

    return usuarios.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
  }

  /**
   * Exclui (soft delete) um usuário.
   * Apenas usuários com perfil ADMIN podem excluir usuários.
   *
   * @param id ID do usuário a ser excluído
   * @throws EntityNotFoundException se o usuário não for encontrado
   */
  @PreAuthorize("hasRole('ADMIN')")
  public void excluir(Long id) {
    logger.info("Excluindo (soft delete) usuário: ID={}", id);

    Usuario usuario =
        usuarioRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "id", id));

    // Soft delete
    usuario.setAtivo(false);
    usuarioRepository.save(usuario);

    logger.info("Usuário excluído com sucesso: ID={}", id);
  }

  /**
   * Troca a senha de um usuário.
   * Apenas usuários com perfil ADMIN podem trocar senhas.
   *
   * @param id ID do usuário
   * @param dto Dados da troca de senha (senha atual e nova senha)
   * @throws EntityNotFoundException se o usuário não for encontrado
   * @throws BusinessValidationException se a senha atual estiver incorreta ou nova senha for fraca
   */
  @PreAuthorize("hasRole('ADMIN')")
  public void trocarSenha(Long id, TrocarSenhaDTO dto) {
    logger.info("Trocando senha do usuário: ID={}", id);

    Usuario usuario =
        usuarioRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario", "id", id));

    // Validação: verificar senha atual
    if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenhaHash())) {
      throw new BusinessValidationException("Senha atual incorreta");
    }

    // Validação: nova senha forte
    validarSenhaForte(dto.novaSenha());

    // Validação: nova senha diferente da atual
    if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenhaHash())) {
      throw new BusinessValidationException("Nova senha deve ser diferente da senha atual");
    }

    // Atualizar senha com BCrypt
    usuario.setSenhaHash(passwordEncoder.encode(dto.novaSenha()));
    usuarioRepository.save(usuario);

    logger.info("Senha do usuário atualizada com sucesso: ID={}", id);
  }

  /**
   * Valida se a senha é forte o suficiente.
   * Critérios: mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número.
   *
   * @param senha Senha a ser validada
   * @throws BusinessValidationException se a senha não atender aos critérios
   */
  private void validarSenhaForte(String senha) {
    if (senha == null || senha.length() < 8) {
      throw new BusinessValidationException("Senha deve ter no mínimo 8 caracteres");
    }

    boolean temMaiuscula = senha.matches(".*[A-Z].*");
    boolean temMinuscula = senha.matches(".*[a-z].*");
    boolean temNumero = senha.matches(".*\\d.*");

    if (!temMaiuscula || !temMinuscula || !temNumero) {
      throw new BusinessValidationException(
          "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número");
    }
  }
}
