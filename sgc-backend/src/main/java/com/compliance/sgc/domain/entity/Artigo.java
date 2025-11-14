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
 * Entidade Artigo - Artigos de uma Norma.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_ARTIGOS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Artigo extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "artigo_id")
  private Long artigoId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "norma_id", nullable = false)
  private Norma norma;

  @Column(name = "numero_artigo", nullable = false, length = 20)
  private String numeroArtigo;

  @Column(name = "texto_artigo", nullable = false, columnDefinition = "NVARCHAR(MAX)")
  private String textoArtigo;

  @Column(name = "ordem", nullable = false)
  private Integer ordem;

  @OneToMany(mappedBy = "artigo", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Inciso> incisos = new ArrayList<>();

  /**
   * Método helper para adicionar inciso mantendo consistência bidirecional.
   */
  public void addInciso(Inciso inciso) {
    incisos.add(inciso);
    inciso.setArtigo(this);
  }

  /**
   * Método helper para remover inciso mantendo consistência bidirecional.
   */
  public void removeInciso(Inciso inciso) {
    incisos.remove(inciso);
    inciso.setArtigo(null);
  }
}
