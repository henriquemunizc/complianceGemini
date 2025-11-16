-- ===========================================================================
-- Migration V5: Adicionar Índices Compostos para Otimização de Performance
-- ===========================================================================
-- Autor: Performance Team
-- Data: 2025-11-16
-- Descrição: Índices compostos para queries frequentes do dashboard e listas
-- ===========================================================================

-- Índice composto para busca de obrigações por status e ativo
-- Otimiza: Dashboard metrics, filtros de lista
CREATE NONCLUSTERED INDEX IX_Obrigacao_Status_Ativo_Prazo
    ON Obrigacao(status, ativo, prazo_execucao)
    INCLUDE (obrigacao_id, titulo, responsavel_id);

-- Índice composto para normas vigentes (tipo + ano + vigência)
-- Otimiza: Busca de normas por tipo e ano, filtro de vigentes
CREATE NONCLUSTERED INDEX IX_Norma_Tipo_Ano_Vigente
    ON Norma(tipo, ano, ativo)
    INCLUDE (norma_id, numero, ementa, data_publicacao, data_revogacao);

-- Índice composto para obrigações atrasadas
-- Otimiza: Dashboard - obrigações atrasadas
CREATE NONCLUSTERED INDEX IX_Obrigacao_Prazo_Status_Ativo
    ON Obrigacao(prazo_execucao, status, ativo)
    WHERE ativo = 1;

-- Índice para evidências por obrigação
-- Otimiza: Carregamento de evidências na tela de detalhes
CREATE NONCLUSTERED INDEX IX_Evidencia_Obrigacao_Ativo
    ON Evidencia(obrigacao_id, ativo)
    INCLUDE (evidencia_id, nome_arquivo, data_upload);

-- Índice para histórico por obrigação
-- Otimiza: Timeline de histórico na tela de detalhes
CREATE NONCLUSTERED INDEX IX_Historico_Obrigacao_Data
    ON HistoricoObrigacao(obrigacao_id, data_mudanca DESC)
    INCLUDE (historico_id, status_anterior, status_novo, usuario_id);

-- Índice para relações norma-obrigação
-- Otimiza: Busca de obrigações relacionadas a uma norma
CREATE NONCLUSTERED INDEX IX_RelacaoNormaObrigacao_Norma
    ON RelacaoNormaObrigacao(norma_id, ativo)
    INCLUDE (obrigacao_id);

CREATE NONCLUSTERED INDEX IX_RelacaoNormaObrigacao_Obrigacao
    ON RelacaoNormaObrigacao(obrigacao_id, ativo)
    INCLUDE (norma_id);

-- Índice para usuários ativos
-- Otimiza: Dashboard - contagem de usuários ativos
CREATE NONCLUSTERED INDEX IX_Usuario_Ativo_Perfil
    ON Usuario(ativo, perfil)
    INCLUDE (usuario_id, nome, email);

-- Statistics Update (melhora estimativas do query optimizer)
UPDATE STATISTICS Obrigacao;
UPDATE STATISTICS Norma;
UPDATE STATISTICS Usuario;
UPDATE STATISTICS Evidencia;
UPDATE STATISTICS HistoricoObrigacao;
