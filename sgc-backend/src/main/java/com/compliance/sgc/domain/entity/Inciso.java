package com.compliance.sgc.domain.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Inciso - Incisos de um Artigo.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_INCISOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Inciso extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "inciso_id")
  private Long incisoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "artigo_id", nullable = false)
  private Artigo artigo;

  @Column(name = "numero_inciso", nullable = false, length = 20)
  private String numeroInciso;

  @Column(name = "texto_inciso", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String textoInciso;

  @Column(name = "ordem", nullable = false)
  private Integer ordem;

  @OneToMany(mappedBy = "inciso", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Alinea> alineas = new ArrayList<>();

  /**
   * Método helper para adicionar alínea mantendo consistência bidirecional.
   */
  public void addAlinea(Alinea alinea) {
    alineas.add(alinea);
    alinea.setInciso(this);
  }

  /**
   * Método helper para remover alínea mantendo consistência bidirecional.
   */
  public void removeAlinea(Alinea alinea) {
    alineas.remove(alinea);
    alinea.setInciso(null);
  }
}
