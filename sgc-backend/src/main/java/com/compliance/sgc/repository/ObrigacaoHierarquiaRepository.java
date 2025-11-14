package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.ObrigacaoHierarquia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ObrigacaoHierarquiaRepository extends JpaRepository<ObrigacaoHierarquia, Long> {

  List<ObrigacaoHierarquia> findByObrigacao(Obrigacao obrigacao);

  void deleteByObrigacao(Obrigacao obrigacao);
}
