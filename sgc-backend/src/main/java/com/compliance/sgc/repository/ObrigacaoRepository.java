package com.compliance.sgc.repository;

import com.compliance.sgc.domain.entity.Obrigacao;
import com.compliance.sgc.domain.entity.Usuario;
import com.compliance.sgc.domain.enums.StatusObrigacao;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ObrigacaoRepository extends JpaRepository<Obrigacao, Long>, JpaSpecificationExecutor<Obrigacao> {

  List<Obrigacao> findByResponsavelAndAtivo(Usuario responsavel, Boolean ativo);

  List<Obrigacao> findByStatusAndAtivo(StatusObrigacao status, Boolean ativo);

  List<Obrigacao> findByResponsavelAndStatusAndAtivo(Usuario responsavel, StatusObrigacao status, Boolean ativo);

  @Query("SELECT o FROM Obrigacao o WHERE o.prazoExecucao < :data AND o.status = 'PENDENTE' AND o.ativo = true")
  List<Obrigacao> findObrigacoesAtrasadas(@Param("data") LocalDate data);

  @Query("SELECT COUNT(o) FROM Obrigacao o WHERE o.responsavel = :responsavel AND o.status = :status AND o.ativo = true")
  Long countByResponsavelAndStatus(@Param("responsavel") Usuario responsavel, @Param("status") StatusObrigacao status);

  Long countByAtivo(Boolean ativo);
}
