package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Norma;
import com.compliance.sgc.domain.enums.TipoNorma;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NormaRepository extends JpaRepository<Norma, Long>, JpaSpecificationExecutor<Norma> {

  List<Norma> findByTipoNormaAndAtivo(TipoNorma tipoNorma, Boolean ativo);

  List<Norma> findByAnoAndAtivo(Integer ano, Boolean ativo);

  List<Norma> findByAtivo(Boolean ativo);

  boolean existsByTipoAndNumeroAndAno(String tipo, String numero, Integer ano);

  @Query(
      "SELECT n FROM Norma n WHERE n.dataPublicacao <= :data AND (n.dataRevogacao IS NULL OR n.dataRevogacao > :data) AND n.ativo = true")
  List<Norma> findNormasVigentes(@Param("data") LocalDate data);
}
