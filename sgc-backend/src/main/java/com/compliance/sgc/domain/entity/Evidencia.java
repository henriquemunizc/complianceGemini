package com.compliance.sgc.domain.entity;

import com.compliance.sgc.domain.enums.TipoEvidencia;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Entidade Evidencia - Evidências de cumprimento de obrigações.
 * Suporta 3 tipos: ARQUIVO (upload), LINK (URL externa), TEXTO (HTML/Markdown).
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-14
 */
@Entity
@Table(name = "TBL_EVIDENCIAS")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Evidencia {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "evidencia_id")
  private Long evidenciaId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "obrigacao_id", nullable = false)
  private Obrigacao obrigacao;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_evidencia", nullable = false, length = 50)
  private TipoEvidencia tipoEvidencia;

  // Campos para tipo ARQUIVO
  @Column(name = "nome_arquivo_original", length = 500)
  private String nomeArquivoOriginal;

  @Column(name = "caminho_arquivo", length = 1000)
  private String caminhoArquivo;

  @Column(name = "tamanho_bytes")
  private Long tamanhoBytes;

  @Column(name = "mime_type", length = 100)
  private String mimeType;

  // Campo para tipo LINK
  @Column(name = "url_externa", length = 1000)
  private String urlExterna;

  // Campo para tipo TEXTO
  @Column(name = "conteudo_texto", columnDefinition = "NVARCHAR(MAX)")
  private String conteudoTexto;

  @Column(name = "descricao", length = 500)
  private String descricao;

  @CreatedDate
  @Column(name = "criado_em", nullable = false, updatable = false)
  private LocalDateTime criadoEm;

  @CreatedBy
  @Column(name = "criado_por", nullable = false, updatable = false, length = 100)
  private String criadoPor;
}
