package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.TipoNorma;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entidade Norma - Normas legais (Lei, Decreto, Resolução, etc.).
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_NORMAS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Norma extends AuditoriaBase {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "norma_id")
  private Long normaId;

  @Column(name = "titulo", nullable = false, length = 500)
  private String titulo;

  @Column(name = "numero", nullable = false, length = 50)
  private String numero;

  @Column(name = "ano", nullable = false)
  private Integer ano;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_norma", nullable = false, length = 50)
  private TipoNorma tipoNorma;

  @Column(name = "orgao_emissor", length = 200)
  private String orgaoEmissor;

  @Column(name = "data_publicacao", nullable = false)
  private LocalDate dataPublicacao;

  @Column(name = "ementa", columnDefinition = "NVARCHAR(MAX)")
  private String ementa;

  @Column(name = "url_publicacao", length = 500)
  private String urlPublicacao;

  @Column(name = "ativo", nullable = false)
  private Boolean ativo = true;

  @OneToMany(mappedBy = "norma", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Artigo> artigos = new ArrayList<>();

  /**
   * Método helper para adicionar artigo mantendo consistência bidirecional.
   */
  public void addArtigo(Artigo artigo) {
    artigos.add(artigo);
    artigo.setNorma(this);
  }

  /**
   * Método helper para remover artigo mantendo consistência bidirecional.
   */
  public void removeArtigo(Artigo artigo) {
    artigos.remove(artigo);
    artigo.setNorma(null);
  }
}
