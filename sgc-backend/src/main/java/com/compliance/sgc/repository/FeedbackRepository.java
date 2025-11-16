package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Feedback;
import com.compliance.sgc.domain.enums.TipoFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para Feedback.
 *
 * @author Arquiteto de Soluções Sênior
 * @version 1.0
 * @since 2025-11-16
 */
@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /**
     * Busca feedbacks por usuário.
     */
    List<Feedback> findByUsuarioUsuarioIdOrderByDataCriacaoDesc(Long usuarioId);

    /**
     * Busca feedbacks por tipo.
     */
    List<Feedback> findByTipoOrderByDataCriacaoDesc(TipoFeedback tipo);

    /**
     * Busca feedbacks não resolvidos.
     */
    List<Feedback> findByResolvidoFalseOrderByDataCriacaoDesc();

    /**
     * Conta feedbacks não resolvidos.
     */
    long countByResolvidoFalse();
}
