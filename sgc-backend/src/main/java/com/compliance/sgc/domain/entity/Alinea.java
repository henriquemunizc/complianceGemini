package com.compliance.sgc.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Alinea - Alíneas de um Inciso.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_ALINEAS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Alinea extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "alinea_id")
  private Long alineaId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inciso_id", nullable = false)
  private Inciso inciso;

  @Column(name = "letra_alinea", nullable = false, length = 10)
  private String letraAlinea;

  @Column(name = "texto_alinea", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String textoAlinea;

  @Column(name = "ordem", nullable = false)
  private Integer ordem;
}
