package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.TipoNotificacao;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Notificacao - Notificações do sistema para usuários.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Entity
@Table(name = "TBL_NOTIFICACOES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notificacao_id")
  private Long notificacaoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id", nullable = false)
  private Usuario usuario;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo", nullable = false, length = 50)
  private TipoNotificacao tipo;

  @Column(name = "titulo", nullable = false, length = 200)
  private String titulo;

  @Column(name = "mensagem", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String mensagem;

  @Column(name = "link", length = 500)
  private String link;

  @Column(name = "lida", nullable = false)
  private Boolean lida = false;

  @Column(name = "data_leitura")
  private LocalDateTime dataLeitura;

  /**
   * Marca a notificação como lida.
   */
  public void marcarComoLida() {
    this.lida = true;
    this.dataLeitura = LocalDateTime.now();
  }
}
