package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.domain.enums.TipoNorma;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface NormaRepository extends JpaRepository<Norma, Long>, JpaSpecificationExecutor<Norma> {

  List<Norma> findByTipoNormaAndAtivo(TipoNorma tipoNorma, Boolean ativo);

  List<Norma> findByAnoAndAtivo(Integer ano, Boolean ativo);

  List<Norma> findByAtivo(Boolean ativo);
}
