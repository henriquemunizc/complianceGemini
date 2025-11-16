-- =====================================================
-- SGC - Sistema de Gestão de Compliance
-- Migration: V5 - Notificações, Comentários e Auditoria
-- Database: SQL Server
-- Data: 2025-11-16
-- =====================================================

-- =====================================================
-- TABELA: TBL_NOTIFICACOES
-- Descrição: Notificações do sistema para usuários
-- =====================================================
CREATE TABLE TBL_NOTIFICACOES (
    notificacao_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('OBRIGACAO_ATRASADA', 'OBRIGACAO_SUBMETIDA', 'OBRIGACAO_APROVADA', 'OBRIGACAO_REJEITADA', 'NOVA_EVIDENCIA', 'COMENTARIO_MENCIONOU', 'PRAZO_PROXIMO')),
    titulo VARCHAR(200) NOT NULL,
    mensagem NVARCHAR(MAX) NOT NULL,
    link VARCHAR(500) NULL,
    lida BIT NOT NULL DEFAULT 0,
    data_leitura DATETIME2 NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_NOTIFICACAO_USUARIO FOREIGN KEY (usuario_id) REFERENCES TBL_USUARIOS(usuario_id) ON DELETE CASCADE
);

CREATE INDEX IDX_NOTIFICACOES_USUARIO ON TBL_NOTIFICACOES(usuario_id);
CREATE INDEX IDX_NOTIFICACOES_LIDA ON TBL_NOTIFICACOES(lida);
CREATE INDEX IDX_NOTIFICACOES_TIPO ON TBL_NOTIFICACOES(tipo);
CREATE INDEX IDX_NOTIFICACOES_CRIADO_EM ON TBL_NOTIFICACOES(criado_em DESC);

-- =====================================================
-- TABELA: TBL_COMENTARIOS
-- Descrição: Comentários em obrigações (com suporte a threads)
-- =====================================================
CREATE TABLE TBL_COMENTARIOS (
    comentario_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    obrigacao_id BIGINT NOT NULL,
    autor_id BIGINT NOT NULL,
    conteudo NVARCHAR(MAX) NOT NULL,
    editado BIT NOT NULL DEFAULT 0,
    data_edicao DATETIME2 NULL,
    comentario_pai_id BIGINT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_COMENTARIO_OBRIGACAO FOREIGN KEY (obrigacao_id) REFERENCES TBL_OBRIGACOES(obrigacao_id) ON DELETE CASCADE,
    CONSTRAINT FK_COMENTARIO_AUTOR FOREIGN KEY (autor_id) REFERENCES TBL_USUARIOS(usuario_id),
    CONSTRAINT FK_COMENTARIO_PAI FOREIGN KEY (comentario_pai_id) REFERENCES TBL_COMENTARIOS(comentario_id)
);

CREATE INDEX IDX_COMENTARIOS_OBRIGACAO ON TBL_COMENTARIOS(obrigacao_id);
CREATE INDEX IDX_COMENTARIOS_AUTOR ON TBL_COMENTARIOS(autor_id);
CREATE INDEX IDX_COMENTARIOS_PAI ON TBL_COMENTARIOS(comentario_pai_id);
CREATE INDEX IDX_COMENTARIOS_CRIADO_EM ON TBL_COMENTARIOS(criado_em DESC);

-- =====================================================
-- TABELA: TBL_AUDIT_LOG
-- Descrição: Log de auditoria completo do sistema (IMUTÁVEL)
-- =====================================================
CREATE TABLE TBL_AUDIT_LOG (
    audit_log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario VARCHAR(200) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id BIGINT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    valor_anterior NVARCHAR(MAX) NULL,
    valor_novo NVARCHAR(MAX) NULL,
    timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL
);

-- Índices para otimizar consultas de auditoria
CREATE INDEX IDX_AUDIT_LOG_ENTIDADE ON TBL_AUDIT_LOG(entidade, entidade_id);
CREATE INDEX IDX_AUDIT_LOG_USUARIO ON TBL_AUDIT_LOG(usuario);
CREATE INDEX IDX_AUDIT_LOG_TIMESTAMP ON TBL_AUDIT_LOG(timestamp DESC);
CREATE INDEX IDX_AUDIT_LOG_ACAO ON TBL_AUDIT_LOG(acao);

-- =====================================================
-- COMENTÁRIOS SOBRE AS TABELAS
-- =====================================================

-- TBL_NOTIFICACOES:
-- - Armazena todas as notificações do sistema
-- - Campo 'lida' indica se o usuário já visualizou
-- - Campo 'link' permite navegação direta para a tela relevante
-- - Tipos cobrem todos os eventos importantes do sistema

-- TBL_COMENTARIOS:
-- - Suporta threads através do campo comentario_pai_id
-- - Campo 'editado' e 'data_edicao' para transparência
-- - Cascade delete: se obrigação for excluída, comentários também são
-- - Suporte a @mentions processado na aplicação

-- TBL_AUDIT_LOG:
-- - IMUTÁVEL: não deve haver UPDATE ou DELETE
-- - Armazena valor_anterior e valor_novo em JSON
-- - Registra IP e User-Agent para rastreabilidade completa
-- - Permite auditoria forense de todas as operações

-- =====================================================
-- FIM DA MIGRATION V5
-- =====================================================
