-- =====================================================
-- SGC - Sistema de Gestão de Compliance
-- Migration: V2 - Índices de Performance
-- Database: SQL Server
-- Data: 2025-11-14
-- =====================================================

-- =====================================================
-- ÍNDICES COMPOSTOS PARA QUERIES COMPLEXAS
-- =====================================================

-- Para queries que filtram obrigações por status e responsável
CREATE INDEX IDX_OBRIGACOES_STATUS_RESPONSAVEL
ON TBL_OBRIGACOES(status, responsavel_id)
INCLUDE (titulo, prazo_execucao);

-- Para queries que buscam obrigações atrasadas
CREATE INDEX IDX_OBRIGACOES_PRAZO_STATUS
ON TBL_OBRIGACOES(prazo_execucao, status)
WHERE ativo = 1;

-- Para queries que buscam evidências por tipo e data
CREATE INDEX IDX_EVIDENCIAS_TIPO_DATA
ON TBL_EVIDENCIAS(tipo_evidencia, criado_em DESC);

-- Para queries de histórico ordenadas por data
CREATE INDEX IDX_HISTORICO_OBRIGACAO_DATA
ON TBL_HISTORICO_STATUS(obrigacao_id, data_mudanca DESC);

-- Para queries que buscam normas ativas por tipo
CREATE INDEX IDX_NORMAS_TIPO_ATIVO
ON TBL_NORMAS(tipo_norma, ativo)
INCLUDE (titulo, numero, ano);

-- =====================================================
-- ÍNDICES FULLTEXT PARA BUSCA DE TEXTO
-- (Opcional - depende de licença SQL Server)
-- =====================================================

-- Descomente se houver suporte a Full-Text Search
/*
-- Criar catálogo fulltext
CREATE FULLTEXT CATALOG SGC_FULLTEXT_CATALOG AS DEFAULT;

-- Índice fulltext para busca em normas
CREATE FULLTEXT INDEX ON TBL_NORMAS(titulo, ementa)
KEY INDEX PK__TBL_NORM__[...] -- Substituir pelo nome da PK
ON SGC_FULLTEXT_CATALOG;

-- Índice fulltext para busca em obrigações
CREATE FULLTEXT INDEX ON TBL_OBRIGACOES(titulo, descricao)
KEY INDEX PK__TBL_OBRI__[...]
ON SGC_FULLTEXT_CATALOG;
*/

-- =====================================================
-- ESTATÍSTICAS PERSONALIZADAS
-- =====================================================

-- Atualizar estatísticas manualmente para garantir planos de execução otimizados
UPDATE STATISTICS TBL_OBRIGACOES WITH FULLSCAN;
UPDATE STATISTICS TBL_NORMAS WITH FULLSCAN;
UPDATE STATISTICS TBL_EVIDENCIAS WITH FULLSCAN;
UPDATE STATISTICS TBL_HISTORICO_STATUS WITH FULLSCAN;
