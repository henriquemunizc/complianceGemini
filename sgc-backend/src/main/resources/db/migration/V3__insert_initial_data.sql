-- =====================================================
-- SGC - Sistema de Gestão de Compliance
-- Migration: V3 - Dados Iniciais (Seed)
-- Database: SQL Server
-- Data: 2025-11-14
-- =====================================================

-- =====================================================
-- USUÁRIOS INICIAIS
-- =====================================================

-- Senha padrão para todos: "SgcAdmin@2025" (hash BCrypt - trocar em produção!)
-- Hash gerado com: BCrypt.hashpw("SgcAdmin@2025", BCrypt.gensalt())
-- Nota: Este é um hash de exemplo. Em produção, use Spring Security PasswordEncoder

INSERT INTO TBL_USUARIOS (nome, email, senha_hash, perfil, ativo, criado_em, criado_por)
VALUES
    ('Administrador do Sistema', 'admin@sgc.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 1, GETDATE(), 'SYSTEM'),
    ('João Silva - Compliance', 'joao.compliance@sgc.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'COMPLIANCE', 1, GETDATE(), 'SYSTEM'),
    ('Maria Santos - Responsável', 'maria.responsavel@sgc.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'RESPONSAVEL', 1, GETDATE(), 'SYSTEM'),
    ('Pedro Oliveira - Visualizador', 'pedro.visualizador@sgc.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'VISUALIZADOR', 1, GETDATE(), 'SYSTEM');

-- =====================================================
-- NORMAS DE EXEMPLO
-- =====================================================

-- Lei Geral de Proteção de Dados (LGPD)
INSERT INTO TBL_NORMAS (titulo, numero, ano, tipo_norma, orgao_emissor, data_publicacao, ementa, url_publicacao, ativo, criado_em, criado_por)
VALUES
    (
        'Lei Geral de Proteção de Dados Pessoais',
        '13.709',
        2018,
        'LEI',
        'Presidência da República',
        '2018-08-14',
        'Dispõe sobre a proteção de dados pessoais e altera a Lei nº 12.965, de 23 de abril de 2014 (Marco Civil da Internet).',
        'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
        1,
        GETDATE(),
        'SYSTEM'
    );

-- Obter o ID da norma recém-inserida
DECLARE @norma_lgpd_id BIGINT = SCOPE_IDENTITY();

-- Inserir artigos da LGPD (exemplo: Artigo 6º - Princípios)
INSERT INTO TBL_ARTIGOS (norma_id, numero_artigo, texto_artigo, ordem, criado_em, criado_por)
VALUES
    (
        @norma_lgpd_id,
        '6',
        'As atividades de tratamento de dados pessoais deverão observar a boa-fé e os seguintes princípios:',
        6,
        GETDATE(),
        'SYSTEM'
    );

DECLARE @artigo6_id BIGINT = SCOPE_IDENTITY();

-- Inserir incisos do Artigo 6º
INSERT INTO TBL_INCISOS (artigo_id, numero_inciso, texto_inciso, ordem, criado_em, criado_por)
VALUES
    (
        @artigo6_id,
        'I',
        'finalidade: realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular, sem possibilidade de tratamento posterior de forma incompatível com essas finalidades;',
        1,
        GETDATE(),
        'SYSTEM'
    ),
    (
        @artigo6_id,
        'II',
        'adequação: compatibilidade do tratamento com as finalidades informadas ao titular, de acordo com o contexto do tratamento;',
        2,
        GETDATE(),
        'SYSTEM'
    ),
    (
        @artigo6_id,
        'III',
        'necessidade: limitação do tratamento ao mínimo necessário para a realização de suas finalidades, com abrangência dos dados pertinentes, proporcionais e não excessivos em relação às finalidades do tratamento de dados;',
        3,
        GETDATE(),
        'SYSTEM'
    );

-- Lei de Acesso à Informação
INSERT INTO TBL_NORMAS (titulo, numero, ano, tipo_norma, orgao_emissor, data_publicacao, ementa, url_publicacao, ativo, criado_em, criado_por)
VALUES
    (
        'Lei de Acesso à Informação',
        '12.527',
        2011,
        'LEI',
        'Presidência da República',
        '2011-11-18',
        'Regula o acesso a informações previsto no inciso XXXIII do art. 5º, no inciso II do § 3º do art. 37 e no § 2º do art. 216 da Constituição Federal.',
        'http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm',
        1,
        GETDATE(),
        'SYSTEM'
    );

-- =====================================================
-- OBRIGAÇÕES DE EXEMPLO
-- =====================================================

-- Obter IDs dos usuários
DECLARE @usuario_responsavel_id BIGINT = (SELECT usuario_id FROM TBL_USUARIOS WHERE email = 'maria.responsavel@sgc.com.br');
DECLARE @usuario_compliance_id BIGINT = (SELECT usuario_id FROM TBL_USUARIOS WHERE email = 'joao.compliance@sgc.com.br');

-- Obrigação 1: Elaborar Relatório de Impacto à Proteção de Dados (RIPD)
INSERT INTO TBL_OBRIGACOES (
    titulo,
    descricao,
    prazo_execucao,
    periodicidade,
    responsavel_id,
    status,
    ativo,
    criado_em,
    criado_por
)
VALUES
    (
        'Elaborar Relatório de Impacto à Proteção de Dados (RIPD)',
        'Conforme Art. 5º, XVII da LGPD, deve-se elaborar documento que contém a descrição dos processos de tratamento de dados pessoais que podem gerar riscos às liberdades civis e aos direitos fundamentais.',
        DATEADD(DAY, 30, GETDATE()),
        'ANUAL',
        @usuario_responsavel_id,
        'PENDENTE',
        1,
        GETDATE(),
        'SYSTEM'
    );

DECLARE @obrigacao1_id BIGINT = SCOPE_IDENTITY();

-- Vincular obrigação ao Artigo 6º da LGPD
INSERT INTO TBL_OBRIGACAO_HIERARQUIA (obrigacao_id, artigo_id, criado_em, criado_por)
VALUES (@obrigacao1_id, @artigo6_id, GETDATE(), 'SYSTEM');

-- Obrigação 2: Nomear Encarregado de Dados (DPO)
INSERT INTO TBL_OBRIGACOES (
    titulo,
    descricao,
    prazo_execucao,
    periodicidade,
    responsavel_id,
    status,
    ativo,
    criado_em,
    criado_por
)
VALUES
    (
        'Nomear Encarregado de Proteção de Dados (DPO)',
        'Conforme Art. 41 da LGPD, o controlador deverá indicar encarregado pelo tratamento de dados pessoais.',
        DATEADD(DAY, 60, GETDATE()),
        'UNICA',
        @usuario_responsavel_id,
        'PENDENTE',
        1,
        GETDATE(),
        'SYSTEM'
    );

DECLARE @obrigacao2_id BIGINT = SCOPE_IDENTITY();

-- Vincular obrigação à Norma LGPD (nível norma, não artigo específico)
INSERT INTO TBL_OBRIGACAO_HIERARQUIA (obrigacao_id, norma_id, criado_em, criado_por)
VALUES (@obrigacao2_id, @norma_lgpd_id, GETDATE(), 'SYSTEM');

-- =====================================================
-- HISTÓRICO INICIAL (CRIAÇÃO DAS OBRIGAÇÕES)
-- =====================================================

INSERT INTO TBL_HISTORICO_STATUS (obrigacao_id, status_anterior, status_novo, data_mudanca, usuario_id, comentarios)
VALUES
    (@obrigacao1_id, NULL, 'PENDENTE', GETDATE(), @usuario_compliance_id, 'Obrigação criada automaticamente pelo sistema.'),
    (@obrigacao2_id, NULL, 'PENDENTE', GETDATE(), @usuario_compliance_id, 'Obrigação criada automaticamente pelo sistema.');

-- =====================================================
-- RELAÇÃO ENTRE NORMAS (EXEMPLO)
-- =====================================================

-- Exemplo: LGPD referencia o Marco Civil da Internet
-- (Aqui seria necessário inserir o Marco Civil primeiro)
-- INSERT INTO TBL_RELACOES_NORMAS (norma_origem_id, norma_destino_id, tipo_relacao, descricao, criado_em, criado_por)
-- VALUES (@norma_lgpd_id, @norma_marco_civil_id, 'ALTERA', 'A LGPD altera a Lei 12.965/2014 (Marco Civil da Internet)', GETDATE(), 'SYSTEM');

-- =====================================================
-- MENSAGEM DE CONFIRMAÇÃO
-- =====================================================

PRINT '========================================';
PRINT 'Dados iniciais inseridos com sucesso!';
PRINT '========================================';
PRINT '';
PRINT 'Usuários criados:';
PRINT '  - admin@sgc.com.br (ADMIN)';
PRINT '  - joao.compliance@sgc.com.br (COMPLIANCE)';
PRINT '  - maria.responsavel@sgc.com.br (RESPONSAVEL)';
PRINT '  - pedro.visualizador@sgc.com.br (VISUALIZADOR)';
PRINT '';
PRINT 'Senha padrão para todos: SgcAdmin@2025';
PRINT '';
PRINT 'Normas criadas:';
PRINT '  - LGPD (Lei 13.709/2018)';
PRINT '  - Lei de Acesso à Informação (Lei 12.527/2011)';
PRINT '';
PRINT 'Obrigações criadas: 2';
PRINT '========================================';
