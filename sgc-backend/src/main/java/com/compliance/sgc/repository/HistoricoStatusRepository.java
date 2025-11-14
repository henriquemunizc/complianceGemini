package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.HistoricoStatus;
import com.compliance.sgc.domain.entity.Obrigacao;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HistoricoStatusRepository extends JpaRepository<HistoricoStatus, Long> {

  List<HistoricoStatus> findByObrigacaoOrderByDataMudancaDesc(Obrigacao obrigacao);

  List<HistoricoStatus> findTop10ByObrigacaoOrderByDataMudancaDesc(Obrigacao obrigacao);
}
