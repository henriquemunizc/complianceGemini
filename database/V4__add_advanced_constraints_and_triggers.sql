-- =====================================================
-- SGC - Sistema de Gestão de Compliance
-- Migration: V4 - Constraints Avançadas e Triggers
-- Database: SQL Server
-- Data: 2025-11-14
-- Descrição: Adiciona validações complexas e automações
-- =====================================================

-- =====================================================
-- CONSTRAINTS ADICIONAIS PARA VALIDAÇÃO DE INTEGRIDADE
-- =====================================================

-- Garantir que data de atualização seja >= data de criação
ALTER TABLE TBL_USUARIOS
ADD CONSTRAINT CHK_USUARIOS_DATAS CHECK (atualizado_em IS NULL OR atualizado_em >= criado_em);

ALTER TABLE TBL_NORMAS
ADD CONSTRAINT CHK_NORMAS_DATAS CHECK (atualizado_em IS NULL OR atualizado_em >= criado_em);

ALTER TABLE TBL_OBRIGACOES
ADD CONSTRAINT CHK_OBRIGACOES_DATAS CHECK (atualizado_em IS NULL OR atualizado_em >= criado_em);

-- Validação de evidências conforme tipo
ALTER TABLE TBL_EVIDENCIAS
ADD CONSTRAINT CHK_EVIDENCIA_ARQUIVO CHECK (
    tipo_evidencia <> 'ARQUIVO' OR (
        nome_arquivo_original IS NOT NULL AND
        caminho_arquivo IS NOT NULL AND
        tamanho_bytes IS NOT NULL AND
        mime_type IS NOT NULL
    )
);

ALTER TABLE TBL_EVIDENCIAS
ADD CONSTRAINT CHK_EVIDENCIA_LINK CHECK (
    tipo_evidencia <> 'LINK' OR url_externa IS NOT NULL
);

ALTER TABLE TBL_EVIDENCIAS
ADD CONSTRAINT CHK_EVIDENCIA_TEXTO CHECK (
    tipo_evidencia <> 'TEXTO' OR conteudo_texto IS NOT NULL
);

-- Validação de workflow: APROVADO requer aprovador e data
ALTER TABLE TBL_OBRIGACOES
ADD CONSTRAINT CHK_OBRIGACAO_APROVADO CHECK (
    status <> 'APROVADO' OR (aprovador_id IS NOT NULL AND data_aprovacao IS NOT NULL)
);

-- Validação de workflow: REPROVADO requer comentários
ALTER TABLE TBL_OBRIGACOES
ADD CONSTRAINT CHK_OBRIGACAO_REPROVADO CHECK (
    status <> 'REPROVADO' OR comentarios_reprovacao IS NOT NULL
);

-- Validação de workflow: EM_ANALISE requer data de submissão
ALTER TABLE TBL_OBRIGACOES
ADD CONSTRAINT CHK_OBRIGACAO_EM_ANALISE CHECK (
    status <> 'EM_ANALISE' OR data_submissao IS NOT NULL
);

-- =====================================================
-- TRIGGER: Registrar mudança de status automaticamente
-- =====================================================
GO

CREATE OR ALTER TRIGGER TRG_OBRIGACAO_STATUS_CHANGE
ON TBL_OBRIGACOES
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Verificar se houve mudança de status
    IF UPDATE(status)
    BEGIN
        INSERT INTO TBL_HISTORICO_STATUS (
            obrigacao_id,
            status_anterior,
            status_novo,
            data_mudanca,
            usuario_id,
            comentarios
        )
        SELECT
            i.obrigacao_id,
            d.status,
            i.status,
            GETDATE(),
            -- Tenta obter usuario_id do contexto (CONTEXT_INFO) ou usa aprovador_id
            ISNULL(
                (SELECT usuario_id FROM TBL_USUARIOS WHERE email = CAST(CONTEXT_INFO() AS VARCHAR(200))),
                i.aprovador_id
            ),
            CASE
                WHEN i.status = 'REPROVADO' THEN i.comentarios_reprovacao
                ELSE NULL
            END
        FROM inserted i
        INNER JOIN deleted d ON i.obrigacao_id = d.obrigacao_id
        WHERE i.status <> d.status;
    END
END;
GO

-- =====================================================
-- STORED PROCEDURE: Marcar obrigações atrasadas
-- =====================================================
GO

CREATE OR ALTER PROCEDURE SP_MARCAR_OBRIGACOES_ATRASADAS
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @count INT = 0;

    -- Atualizar obrigações que estão PENDENTE e passaram do prazo
    UPDATE TBL_OBRIGACOES
    SET status = 'ATRASADO',
        atualizado_em = GETDATE(),
        atualizado_por = 'SYSTEM_JOB'
    WHERE status = 'PENDENTE'
      AND prazo_execucao < CAST(GETDATE() AS DATE)
      AND ativo = 1;

    SET @count = @@ROWCOUNT;

    -- Log de execução
    PRINT CONCAT('SP_MARCAR_OBRIGACOES_ATRASADAS: ', @count, ' obrigação(ões) marcadas como ATRASADO.');

    RETURN @count;
END;
GO

-- =====================================================
-- JOB SQL SERVER AGENT (OPCIONAL - DESCOMENTE PARA USAR)
-- Executa SP_MARCAR_OBRIGACOES_ATRASADAS diariamente às 00:00
-- =====================================================

/*
USE msdb;
GO

-- Criar job
EXEC sp_add_job
    @job_name = N'SGC - Marcar Obrigações Atrasadas',
    @enabled = 1,
    @description = N'Executa diariamente para marcar obrigações pendentes que passaram do prazo.';

-- Adicionar step (passo)
EXEC sp_add_jobstep
    @job_name = N'SGC - Marcar Obrigações Atrasadas',
    @step_name = N'Executar SP_MARCAR_OBRIGACOES_ATRASADAS',
    @subsystem = N'TSQL',
    @command = N'EXEC SP_MARCAR_OBRIGACOES_ATRASADAS;',
    @database_name = N'SGC_Compliance'; -- Substituir pelo nome do seu banco

-- Criar schedule (diário às 00:00)
EXEC sp_add_schedule
    @schedule_name = N'Diário às 00:00',
    @freq_type = 4, -- Diário
    @freq_interval = 1,
    @active_start_time = 000000; -- 00:00:00

-- Associar schedule ao job
EXEC sp_attach_schedule
    @job_name = N'SGC - Marcar Obrigações Atrasadas',
    @schedule_name = N'Diário às 00:00';

-- Adicionar job ao servidor local
EXEC sp_add_jobserver
    @job_name = N'SGC - Marcar Obrigações Atrasadas',
    @server_name = N'(local)';

GO
*/

-- =====================================================
-- ÍNDICES FILTRADOS PARA SOFT DELETE
-- =====================================================

-- Otimizar queries que sempre filtram ativo = 1
CREATE INDEX IDX_NORMAS_ATIVO_FILTRADO
ON TBL_NORMAS(tipo_norma, ano)
WHERE ativo = 1;

CREATE INDEX IDX_OBRIGACOES_ATIVO_FILTRADO
ON TBL_OBRIGACOES(status, responsavel_id)
WHERE ativo = 1;

-- =====================================================
-- VIEW: Obrigações com detalhes da hierarquia de normas
-- =====================================================
GO

CREATE OR ALTER VIEW VW_OBRIGACOES_COM_NORMAS
AS
SELECT
    o.obrigacao_id,
    o.titulo AS obrigacao_titulo,
    o.descricao AS obrigacao_descricao,
    o.prazo_execucao,
    o.status,
    o.periodicidade,
    u_resp.nome AS responsavel_nome,
    u_resp.email AS responsavel_email,
    u_aprov.nome AS aprovador_nome,
    u_aprov.email AS aprovador_email,
    o.data_submissao,
    o.data_aprovacao,
    n.norma_id,
    n.titulo AS norma_titulo,
    n.numero AS norma_numero,
    n.ano AS norma_ano,
    n.tipo_norma,
    art.numero_artigo,
    art.texto_artigo,
    inc.numero_inciso,
    inc.texto_inciso,
    ali.letra_alinea,
    ali.texto_alinea,
    o.criado_em,
    o.atualizado_em
FROM TBL_OBRIGACOES o
INNER JOIN TBL_USUARIOS u_resp ON o.responsavel_id = u_resp.usuario_id
LEFT JOIN TBL_USUARIOS u_aprov ON o.aprovador_id = u_aprov.usuario_id
LEFT JOIN TBL_OBRIGACAO_HIERARQUIA oh ON o.obrigacao_id = oh.obrigacao_id
LEFT JOIN TBL_NORMAS n ON oh.norma_id = n.norma_id
LEFT JOIN TBL_ARTIGOS art ON oh.artigo_id = art.artigo_id
LEFT JOIN TBL_INCISOS inc ON oh.inciso_id = inc.inciso_id
LEFT JOIN TBL_ALINEAS ali ON oh.alinea_id = ali.alinea_id
WHERE o.ativo = 1;
GO

-- =====================================================
-- VIEW: Dashboard - Resumo de obrigações por status
-- =====================================================
GO

CREATE OR ALTER VIEW VW_DASHBOARD_OBRIGACOES
AS
SELECT
    status,
    COUNT(*) AS total,
    COUNT(CASE WHEN prazo_execucao < CAST(GETDATE() AS DATE) THEN 1 END) AS vencidas,
    COUNT(CASE WHEN prazo_execucao >= CAST(GETDATE() AS DATE) THEN 1 END) AS no_prazo
FROM TBL_OBRIGACOES
WHERE ativo = 1
GROUP BY status;
GO

-- =====================================================
-- FUNCTION: Calcular dias até o prazo
-- =====================================================
GO

CREATE OR ALTER FUNCTION FN_DIAS_ATE_PRAZO(@obrigacao_id BIGINT)
RETURNS INT
AS
BEGIN
    DECLARE @dias INT;

    SELECT @dias = DATEDIFF(DAY, CAST(GETDATE() AS DATE), prazo_execucao)
    FROM TBL_OBRIGACOES
    WHERE obrigacao_id = @obrigacao_id;

    RETURN @dias;
END;
GO

-- =====================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

PRINT '========================================';
PRINT 'V4: Constraints e Triggers aplicados!';
PRINT '========================================';
PRINT '';
PRINT 'Adicionado:';
PRINT '  - ✅ Constraints de validação temporal';
PRINT '  - ✅ Constraints de validação de evidências';
PRINT '  - ✅ Constraints de validação de workflow';
PRINT '  - ✅ Trigger para histórico automático';
PRINT '  - ✅ Stored Procedure para marcar atrasados';
PRINT '  - ✅ Views para dashboard e relatórios';
PRINT '  - ✅ Function para calcular dias até prazo';
PRINT '  - ✅ Índices filtrados para performance';
PRINT '';
PRINT 'ATENÇÃO: Job SQL Server Agent comentado.';
PRINT 'Descomente se desejar execução automática.';
PRINT '========================================';
