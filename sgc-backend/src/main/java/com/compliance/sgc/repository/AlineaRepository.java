package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Alinea;
import com.compliance.sgc.domain.entity.Inciso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlineaRepository extends JpaRepository<Alinea, Long> {

  List<Alinea> findByIncisoOrderByOrdem(Inciso inciso);
}
