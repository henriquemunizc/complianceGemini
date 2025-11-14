# SGC - Database Migrations (SQL Server)

Este diretório contém as migrations do banco de dados SQL Server, gerenciadas pelo **Flyway**.

---

## 📋 Estrutura das Migrations

As migrations seguem o padrão de nomenclatura do Flyway: `V{versão}__{descrição}.sql`

| Migration | Descrição | Status |
|-----------|-----------|--------|
| **V1__create_initial_schema.sql** | Schema inicial com todas as tabelas principais | ✅ Ready |
| **V2__create_performance_indexes.sql** | Índices compostos para otimização de queries | ✅ Ready |
| **V3__insert_initial_data.sql** | Dados seed (usuários, normas de exemplo) | ✅ Ready |
| **V4__add_advanced_constraints_and_triggers.sql** | Constraints avançadas, triggers, views e SPs | ✅ Ready |

---

## 🗂️ Tabelas do Banco de Dados

### Hierarquia de Normas
```
TBL_NORMAS (Norma)
└── TBL_ARTIGOS (Artigo)
    └── TBL_INCISOS (Inciso)
        └── TBL_ALINEAS (Alínea)
```

### Obrigações e Workflow
- **TBL_OBRIGACOES**: Obrigações de compliance
- **TBL_OBRIGACAO_HIERARQUIA**: Vinculação N:N com hierarquia de normas
- **TBL_EVIDENCIAS**: Evidências de cumprimento (arquivos, links, texto)
- **TBL_HISTORICO_STATUS**: Log imutável de mudanças de status

### Suporte
- **TBL_USUARIOS**: Usuários do sistema (ADMIN, COMPLIANCE, RESPONSAVEL, VISUALIZADOR)
- **TBL_RELACOES_NORMAS**: Relações entre normas (REGULAMENTA, REVOGA, ALTERA, etc.)

---

## 🔐 Usuários Seed

Após executar `V3`, os seguintes usuários estarão disponíveis:

| Email | Perfil | Senha Padrão |
|-------|--------|--------------|
| admin@sgc.com.br | ADMIN | SgcAdmin@2025 |
| joao.compliance@sgc.com.br | COMPLIANCE | SgcAdmin@2025 |
| maria.responsavel@sgc.com.br | RESPONSAVEL | SgcAdmin@2025 |
| pedro.visualizador@sgc.com.br | VISUALIZADOR | SgcAdmin@2025 |

> **⚠️ IMPORTANTE:** Altere essas senhas em produção!

---

## 🚀 Como Executar as Migrations

### Opção 1: Via Flyway CLI

```bash
flyway -url=jdbc:sqlserver://localhost:1433;databaseName=SGC_Compliance \
       -user=sa \
       -password=SuaSenha \
       -locations=filesystem:./database \
       migrate
```

### Opção 2: Via Spring Boot (Automático)

Ao iniciar a aplicação Spring Boot com as configurações corretas no `application.yml`, o Flyway executará automaticamente as migrations.

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

---

## 📊 Funcionalidades Avançadas (V4)

### Triggers

- **TRG_OBRIGACAO_STATUS_CHANGE**: Registra automaticamente mudanças de status no histórico

### Stored Procedures

- **SP_MARCAR_OBRIGACOES_ATRASADAS**: Marca obrigações PENDENTE como ATRASADO quando o prazo vence
  ```sql
  EXEC SP_MARCAR_OBRIGACOES_ATRASADAS;
  ```

### Views

- **VW_OBRIGACOES_COM_NORMAS**: Obrigações com detalhes completos da hierarquia de normas
- **VW_DASHBOARD_OBRIGACOES**: Resumo de obrigações por status (para dashboard)

### Functions

- **FN_DIAS_ATE_PRAZO**: Calcula dias até o prazo de uma obrigação
  ```sql
  SELECT dbo.FN_DIAS_ATE_PRAZO(123);
  ```

---

## ⚙️ SQL Server Agent Job (Opcional)

O script `V4` contém um job comentado para execução diária da SP `SP_MARCAR_OBRIGACOES_ATRASADAS`.

Para habilitar:
1. Descomente o bloco no final de `V4__add_advanced_constraints_and_triggers.sql`
2. Ajuste o nome do banco de dados (`SGC_Compliance`)
3. Execute o script novamente

---

## 🔍 Validações Implementadas

### Constraints Temporais
- `atualizado_em >= criado_em`

### Constraints de Evidências
- **ARQUIVO**: Requer `nome_arquivo_original`, `caminho_arquivo`, `tamanho_bytes`, `mime_type`
- **LINK**: Requer `url_externa`
- **TEXTO**: Requer `conteudo_texto`

### Constraints de Workflow
- **APROVADO**: Requer `aprovador_id` e `data_aprovacao`
- **REPROVADO**: Requer `comentarios_reprovacao`
- **EM_ANALISE**: Requer `data_submissao`

---

## 📈 Índices de Performance

Índices compostos otimizados para queries comuns:

- `IDX_OBRIGACOES_STATUS_RESPONSAVEL`: Filtrar por status e responsável
- `IDX_OBRIGACOES_PRAZO_STATUS`: Buscar obrigações atrasadas
- `IDX_HISTORICO_OBRIGACAO_DATA`: Timeline de histórico
- `IDX_NORMAS_TIPO_ATIVO_FILTRADO`: Soft delete otimizado

---

## 📝 Auditoria

Todas as tabelas principais possuem colunas de auditoria:

- `criado_em` (DATETIME2): Data/hora de criação
- `criado_por` (VARCHAR): Usuário que criou
- `atualizado_em` (DATETIME2): Data/hora da última atualização
- `atualizado_por` (VARCHAR): Usuário que atualizou

Estas colunas serão preenchidas automaticamente via **JPA Auditing** no backend.

---

## 🛡️ Segurança

### Senhas

As senhas são armazenadas como hash BCrypt (coluna `senha_hash` com 255 caracteres).

O hash de exemplo nas migrations é:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```
Que corresponde à senha: `SgcAdmin@2025`

### Perfis de Usuário

- **ADMIN**: Acesso total ao sistema
- **COMPLIANCE**: Aprovação de obrigações, visualização de relatórios
- **RESPONSAVEL**: Criação de evidências, submissão para análise
- **VISUALIZADOR**: Apenas leitura

---

## 🔄 Fluxo de Status de Obrigações

```
PENDENTE → EM_ANALISE → APROVADO
    ↓           ↓
ATRASADO    REPROVADO → (volta para PENDENTE)
```

---

**Data de Criação:** 2025-11-14
**Versão do Schema:** 1.0
**Database:** SQL Server
**Gerenciador de Migrations:** Flyway
