package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Artigo;
import com.compliance.sgc.domain.entity.Norma;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtigoRepository extends JpaRepository<Artigo, Long> {

  List<Artigo> findByNormaOrderByOrdem(Norma norma);
}
