package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Evidencia;
import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.enums.TipoEvidencia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EvidenciaRepository extends JpaRepository<Evidencia, Long> {

  List<Evidencia> findByObrigacao(Obrigacao obrigacao);

  List<Evidencia> findByObrigacaoAndTipoEvidencia(Obrigacao obrigacao, TipoEvidencia tipoEvidencia);

  Long countByObrigacao(Obrigacao obrigacao);
}
