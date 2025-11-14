package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Artigo;
import com.compliance.sgc.domain.entity.Inciso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IncisoRepository extends JpaRepository<Inciso, Long> {

  List<Inciso> findByArtigoOrderByOrdem(Artigo artigo);
}
