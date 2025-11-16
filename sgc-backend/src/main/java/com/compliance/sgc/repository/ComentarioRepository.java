package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Comentario;
import com.compliance.sgc.domain.entity.Obrigacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository para Comentario.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

  /**
   * Busca comentários de uma obrigação ordenados por data (mais recente primeiro).
   * Retorna apenas comentários principais (não respostas).
   */
  @Query("SELECT c FROM Comentario c WHERE c.obrigacao = :obrigacao AND c.comentarioPai IS NULL ORDER BY c.criadoEm DESC")
  List<Comentario> findByObrigacaoOrderByCriadoEmDesc(@Param("obrigacao") Obrigacao obrigacao);

  /**
   * Busca todos os comentários de uma obrigação (incluindo respostas).
   */
  List<Comentario> findByObrigacao(Obrigacao obrigacao);

  /**
   * Conta comentários de uma obrigação.
   */
  Long countByObrigacao(Obrigacao obrigacao);

  /**
   * Busca respostas de um comentário.
   */
  List<Comentario> findByComentarioPaiOrderByCriadoEmAsc(Comentario comentarioPai);
}
