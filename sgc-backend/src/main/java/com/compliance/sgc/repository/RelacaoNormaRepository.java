package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.domain.entity.RelacaoNorma;
import com.compliance.sgc.domain.enums.TipoRelacaoNorma;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RelacaoNormaRepository extends JpaRepository<RelacaoNorma, Long> {

  List<RelacaoNorma> findByNormaOrigem(Norma normaOrigem);

  List<RelacaoNorma> findByNormaDestino(Norma normaDestino);

  List<RelacaoNorma> findByNormaOrigemAndTipoRelacao(Norma normaOrigem, TipoRelacaoNorma tipoRelacao);
}
