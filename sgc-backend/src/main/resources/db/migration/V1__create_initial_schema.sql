-- =====================================================
-- SGC - Sistema de Gestão de Compliance
-- Migration: V1 - Schema Inicial
-- Database: SQL Server
-- Data: 2025-11-14
-- =====================================================

-- =====================================================
-- TABELA: TBL_USUARIOS
-- Descrição: Usuários do sistema (Responsáveis, Compliance, Admin)
-- =====================================================
CREATE TABLE TBL_USUARIOS (
    usuario_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('ADMIN', 'COMPLIANCE', 'RESPONSAVEL', 'VISUALIZADOR')),
    ativo BIT NOT NULL DEFAULT 1,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL
);

CREATE INDEX IDX_USUARIOS_EMAIL ON TBL_USUARIOS(email);
CREATE INDEX IDX_USUARIOS_PERFIL ON TBL_USUARIOS(perfil);

-- =====================================================
-- TABELA: TBL_NORMAS
-- Descrição: Normas legais (Lei, Decreto, Resolução, etc.)
-- =====================================================
CREATE TABLE TBL_NORMAS (
    norma_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    numero VARCHAR(50) NOT NULL,
    ano INT NOT NULL,
    tipo_norma VARCHAR(50) NOT NULL CHECK (tipo_norma IN ('LEI', 'DECRETO', 'RESOLUCAO', 'PORTARIA', 'INSTRUCAO_NORMATIVA')),
    orgao_emissor VARCHAR(200) NULL,
    data_publicacao DATE NOT NULL,
    ementa NVARCHAR(MAX) NULL,
    url_publicacao VARCHAR(500) NULL,
    ativo BIT NOT NULL DEFAULT 1,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT UQ_NORMA_NUMERO_ANO UNIQUE (numero, ano, tipo_norma)
);

CREATE INDEX IDX_NORMAS_TIPO ON TBL_NORMAS(tipo_norma);
CREATE INDEX IDX_NORMAS_ANO ON TBL_NORMAS(ano);
CREATE INDEX IDX_NORMAS_ATIVO ON TBL_NORMAS(ativo);

-- =====================================================
-- TABELA: TBL_ARTIGOS
-- Descrição: Artigos de uma Norma
-- =====================================================
CREATE TABLE TBL_ARTIGOS (
    artigo_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    norma_id BIGINT NOT NULL,
    numero_artigo VARCHAR(20) NOT NULL,
    texto_artigo NVARCHAR(MAX) NOT NULL,
    ordem INT NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_ARTIGO_NORMA FOREIGN KEY (norma_id) REFERENCES TBL_NORMAS(norma_id) ON DELETE CASCADE,
    CONSTRAINT UQ_ARTIGO_NUMERO_NORMA UNIQUE (norma_id, numero_artigo)
);

CREATE INDEX IDX_ARTIGOS_NORMA ON TBL_ARTIGOS(norma_id);

-- =====================================================
-- TABELA: TBL_INCISOS
-- Descrição: Incisos de um Artigo
-- =====================================================
CREATE TABLE TBL_INCISOS (
    inciso_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    artigo_id BIGINT NOT NULL,
    numero_inciso VARCHAR(20) NOT NULL,
    texto_inciso NVARCHAR(MAX) NOT NULL,
    ordem INT NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_INCISO_ARTIGO FOREIGN KEY (artigo_id) REFERENCES TBL_ARTIGOS(artigo_id) ON DELETE CASCADE,
    CONSTRAINT UQ_INCISO_NUMERO_ARTIGO UNIQUE (artigo_id, numero_inciso)
);

CREATE INDEX IDX_INCISOS_ARTIGO ON TBL_INCISOS(artigo_id);

-- =====================================================
-- TABELA: TBL_ALINEAS
-- Descrição: Alíneas de um Inciso
-- =====================================================
CREATE TABLE TBL_ALINEAS (
    alinea_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    inciso_id BIGINT NOT NULL,
    letra_alinea VARCHAR(10) NOT NULL,
    texto_alinea NVARCHAR(MAX) NOT NULL,
    ordem INT NOT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_ALINEA_INCISO FOREIGN KEY (inciso_id) REFERENCES TBL_INCISOS(inciso_id) ON DELETE CASCADE,
    CONSTRAINT UQ_ALINEA_LETRA_INCISO UNIQUE (inciso_id, letra_alinea)
);

CREATE INDEX IDX_ALINEAS_INCISO ON TBL_ALINEAS(inciso_id);

-- =====================================================
-- TABELA: TBL_RELACOES_NORMAS
-- Descrição: Relacionamentos entre Normas (ex: Lei A regulamenta Lei B)
-- =====================================================
CREATE TABLE TBL_RELACOES_NORMAS (
    relacao_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    norma_origem_id BIGINT NOT NULL,
    norma_destino_id BIGINT NOT NULL,
    tipo_relacao VARCHAR(50) NOT NULL CHECK (tipo_relacao IN ('REGULAMENTA', 'REVOGA', 'ALTERA', 'COMPLEMENTA', 'REFERENCIA')),
    descricao VARCHAR(500) NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    CONSTRAINT FK_RELACAO_NORMA_ORIGEM FOREIGN KEY (norma_origem_id) REFERENCES TBL_NORMAS(norma_id) ON DELETE NO ACTION,
    CONSTRAINT FK_RELACAO_NORMA_DESTINO FOREIGN KEY (norma_destino_id) REFERENCES TBL_NORMAS(norma_id) ON DELETE NO ACTION,
    CONSTRAINT CHK_RELACAO_NORMAS_DIFERENTES CHECK (norma_origem_id <> norma_destino_id)
);

CREATE INDEX IDX_RELACOES_NORMA_ORIGEM ON TBL_RELACOES_NORMAS(norma_origem_id);
CREATE INDEX IDX_RELACOES_NORMA_DESTINO ON TBL_RELACOES_NORMAS(norma_destino_id);

-- =====================================================
-- TABELA: TBL_OBRIGACOES
-- Descrição: Obrigações de compliance vinculadas a normas
-- =====================================================
CREATE TABLE TBL_OBRIGACOES (
    obrigacao_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    descricao NVARCHAR(MAX) NOT NULL,
    prazo_execucao DATE NULL,
    periodicidade VARCHAR(50) NULL CHECK (periodicidade IN ('UNICA', 'MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL')),
    responsavel_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REPROVADO', 'ATRASADO')) DEFAULT 'PENDENTE',
    data_submissao DATETIME2 NULL,
    data_aprovacao DATETIME2 NULL,
    aprovador_id BIGINT NULL,
    comentarios_reprovacao NVARCHAR(MAX) NULL,
    ativo BIT NOT NULL DEFAULT 1,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    atualizado_em DATETIME2 NULL,
    atualizado_por VARCHAR(100) NULL,
    CONSTRAINT FK_OBRIGACAO_RESPONSAVEL FOREIGN KEY (responsavel_id) REFERENCES TBL_USUARIOS(usuario_id),
    CONSTRAINT FK_OBRIGACAO_APROVADOR FOREIGN KEY (aprovador_id) REFERENCES TBL_USUARIOS(usuario_id)
);

CREATE INDEX IDX_OBRIGACOES_RESPONSAVEL ON TBL_OBRIGACOES(responsavel_id);
CREATE INDEX IDX_OBRIGACOES_STATUS ON TBL_OBRIGACOES(status);
CREATE INDEX IDX_OBRIGACOES_PRAZO ON TBL_OBRIGACOES(prazo_execucao);
CREATE INDEX IDX_OBRIGACOES_ATIVO ON TBL_OBRIGACOES(ativo);

-- =====================================================
-- TABELA: TBL_OBRIGACAO_HIERARQUIA
-- Descrição: Vinculação N:N entre Obrigações e itens da hierarquia de Normas
-- =====================================================
CREATE TABLE TBL_OBRIGACAO_HIERARQUIA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    obrigacao_id BIGINT NOT NULL,
    norma_id BIGINT NULL,
    artigo_id BIGINT NULL,
    inciso_id BIGINT NULL,
    alinea_id BIGINT NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    CONSTRAINT FK_OBRIGACAO_HIERARQUIA_OBRIGACAO FOREIGN KEY (obrigacao_id) REFERENCES TBL_OBRIGACOES(obrigacao_id) ON DELETE CASCADE,
    CONSTRAINT FK_OBRIGACAO_HIERARQUIA_NORMA FOREIGN KEY (norma_id) REFERENCES TBL_NORMAS(norma_id),
    CONSTRAINT FK_OBRIGACAO_HIERARQUIA_ARTIGO FOREIGN KEY (artigo_id) REFERENCES TBL_ARTIGOS(artigo_id),
    CONSTRAINT FK_OBRIGACAO_HIERARQUIA_INCISO FOREIGN KEY (inciso_id) REFERENCES TBL_INCISOS(inciso_id),
    CONSTRAINT FK_OBRIGACAO_HIERARQUIA_ALINEA FOREIGN KEY (alinea_id) REFERENCES TBL_ALINEAS(alinea_id),
    CONSTRAINT CHK_OBRIGACAO_HIERARQUIA_AO_MENOS_UM CHECK (
        norma_id IS NOT NULL OR
        artigo_id IS NOT NULL OR
        inciso_id IS NOT NULL OR
        alinea_id IS NOT NULL
    )
);

CREATE INDEX IDX_OBRIGACAO_HIERARQUIA_OBRIGACAO ON TBL_OBRIGACAO_HIERARQUIA(obrigacao_id);
CREATE INDEX IDX_OBRIGACAO_HIERARQUIA_NORMA ON TBL_OBRIGACAO_HIERARQUIA(norma_id);
CREATE INDEX IDX_OBRIGACAO_HIERARQUIA_ARTIGO ON TBL_OBRIGACAO_HIERARQUIA(artigo_id);

-- =====================================================
-- TABELA: TBL_EVIDENCIAS
-- Descrição: Evidências de cumprimento de obrigações
-- =====================================================
CREATE TABLE TBL_EVIDENCIAS (
    evidencia_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    obrigacao_id BIGINT NOT NULL,
    tipo_evidencia VARCHAR(50) NOT NULL CHECK (tipo_evidencia IN ('ARQUIVO', 'LINK', 'TEXTO')),

    -- Para tipo ARQUIVO
    nome_arquivo_original VARCHAR(500) NULL,
    caminho_arquivo VARCHAR(1000) NULL,
    tamanho_bytes BIGINT NULL,
    mime_type VARCHAR(100) NULL,

    -- Para tipo LINK
    url_externa VARCHAR(1000) NULL,

    -- Para tipo TEXTO
    conteudo_texto NVARCHAR(MAX) NULL,

    descricao VARCHAR(500) NULL,
    criado_em DATETIME2 NOT NULL DEFAULT GETDATE(),
    criado_por VARCHAR(100) NOT NULL,
    CONSTRAINT FK_EVIDENCIA_OBRIGACAO FOREIGN KEY (obrigacao_id) REFERENCES TBL_OBRIGACOES(obrigacao_id) ON DELETE CASCADE
);

CREATE INDEX IDX_EVIDENCIAS_OBRIGACAO ON TBL_EVIDENCIAS(obrigacao_id);
CREATE INDEX IDX_EVIDENCIAS_TIPO ON TBL_EVIDENCIAS(tipo_evidencia);

-- =====================================================
-- TABELA: TBL_HISTORICO_STATUS
-- Descrição: Log imutável de mudanças de status de obrigações
-- =====================================================
CREATE TABLE TBL_HISTORICO_STATUS (
    historico_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    obrigacao_id BIGINT NOT NULL,
    status_anterior VARCHAR(50) NULL,
    status_novo VARCHAR(50) NOT NULL,
    data_mudanca DATETIME2 NOT NULL DEFAULT GETDATE(),
    usuario_id BIGINT NOT NULL,
    comentarios NVARCHAR(MAX) NULL,
    CONSTRAINT FK_HISTORICO_OBRIGACAO FOREIGN KEY (obrigacao_id) REFERENCES TBL_OBRIGACOES(obrigacao_id) ON DELETE CASCADE,
    CONSTRAINT FK_HISTORICO_USUARIO FOREIGN KEY (usuario_id) REFERENCES TBL_USUARIOS(usuario_id)
);

CREATE INDEX IDX_HISTORICO_OBRIGACAO ON TBL_HISTORICO_STATUS(obrigacao_id);
CREATE INDEX IDX_HISTORICO_DATA ON TBL_HISTORICO_STATUS(data_mudanca);

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================
EXEC sp_addextendedproperty
    @name = N'MS_Description', @value = N'Usuários do sistema (Responsáveis, Compliance, Admin)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE', @level1name = 'TBL_USUARIOS';

EXEC sp_addextendedproperty
    @name = N'MS_Description', @value = N'Normas legais (Leis, Decretos, Resoluções)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE', @level1name = 'TBL_NORMAS';

EXEC sp_addextendedproperty
    @name = N'MS_Description', @value = N'Obrigações de compliance vinculadas a normas',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE', @level1name = 'TBL_OBRIGACOES';

EXEC sp_addextendedproperty
    @name = N'MS_Description', @value = N'Evidências de cumprimento (arquivos, links, texto)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE', @level1name = 'TBL_EVIDENCIAS';

EXEC sp_addextendedproperty
    @name = N'MS_Description', @value = N'Log imutável de mudanças de status (auditoria)',
    @level0type = N'SCHEMA', @level0name = 'dbo',
    @level1type = N'TABLE', @level1name = 'TBL_HISTORICO_STATUS';
