package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.PerfilUsuario;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Usuario - Usuários do sistema (Responsáveis, Compliance, Admin).
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_USUARIOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "usuario_id")
  private Long usuarioId;

  @Column(name = "nome", nullable = false, length = 200)
  private String nome;

  @Column(name = "email", nullable = false, unique = true, length = 200)
  private String email;

  @Column(name = "senha_hash", nullable = false, length = 255)
  private String senhaHash;

  @Enumerated(EnumType.STRING)
  @Column(name = "perfil", nullable = false, length = 50)
  private PerfilUsuario perfil;

  @Column(name = "ativo", nullable = false)
  private Boolean ativo = true;
}
