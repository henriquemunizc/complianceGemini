# SGC - Sistema de Gestão de Compliance

Sistema completo para gerenciamento de obrigações de compliance regulatório, desenvolvido com **Spring Boot 3**, **Angular 17**, **PrimeNG 17** e **SQL Server**.

## 🏗️ Arquitetura

### Backend (Java 21 + Spring Boot 3)
- **Framework**: Spring Boot 3.2.1, Spring Security 6
- **Banco de Dados**: SQL Server com Flyway migrations
- **Autenticação**: JWT stateless (HMAC-SHA256)
- **Validação**: jakarta.validation + OWASP Top 10 protections
- **Mapeamento**: MapStruct 1.5.5
- **Padrão**: Layered Architecture (Controller → Service → Repository)

### Frontend (Angular 17 + PrimeNG 17)
- **Framework**: Angular 17.3 (Standalone Components)
- **UI Library**: PrimeNG 17.18 (Lara Light Blue theme)
- **State Management**: RxJS 7.8 (BehaviorSubject para auth)
- **HTTP**: Interceptor funcional para JWT
- **Guards**: CanActivateFn para proteção de rotas

## 📊 Modelo de Dados

### Entidades Principais
1. **Normas** - Leis, decretos, resoluções (hierarquia: Artigo → Inciso → Alínea)
2. **Obrigações** - Tarefas de compliance vinculadas a normas
3. **Evidências** - Comprovação (ARQUIVO, LINK, TEXTO)
4. **Workflow** - Fluxo de aprovação (PENDENTE → SUBMETIDA → APROVADA/REJEITADA)
5. **Histórico** - Trilha de auditoria imutável
6. **Usuários** - 4 perfis (ADMIN, COMPLIANCE, RESPONSAVEL, VISUALIZADOR)

### Relacionamentos
- Norma 1:N Artigos
- Artigo 1:N Incisos
- Inciso 1:N Alíneas
- Obrigação N:N Hierarquia de Normas (tabela associativa)
- Obrigação 1:N Evidências
- Obrigação 1:N Histórico de Status

## 🔒 Segurança (OWASP Top 10)

### Backend
- **A01 Broken Access Control**: @PreAuthorize + role-based authorization + ownership validation
- **A02 Cryptographic Failures**: BCrypt password hashing + JWT HMAC-SHA256 + HSTS
- **A03 Injection**: JPA parameterized queries + jakarta.validation
- **A04 Insecure Design**: Business rule validation + hierarchy consistency checks
- **A05 Security Misconfiguration**: Security headers (X-Frame-Options, HSTS) + generic error messages
- **A07 Auth Failures**: JWT expiration + inactive user validation + information exposure prevention
- **A08 Software Integrity**: File signature validation (magic numbers: PDF, PNG, JPEG, ZIP)
- **A09 Logging Failures**: Security event logging + failed authentication logging

### Frontend
- **JWT Storage**: localStorage (sgc_token)
- **HTTP Interceptor**: Automatic Bearer token injection
- **Auth Guard**: Route protection with returnUrl
- **Role-based UI**: Conditional rendering based on user roles

## 🚀 Como Executar

### Pré-requisitos
- Java 21
- Node.js 20+
- SQL Server 2019+
- Maven 3.8+
- Angular CLI 17+

### Backend

```bash
cd sgc-backend

# Configurar variáveis de ambiente
export JWT_SECRET=sua-chave-secreta-aqui
export DB_URL=jdbc:sqlserver://localhost:1433;databaseName=sgc
export DB_USERNAME=usuario
export DB_PASSWORD=senha

# Executar Flyway migrations
mvn flyway:migrate

# Compilar e executar
mvn spring-boot:run
```

Aplicação rodando em: http://localhost:8080

### Frontend

```bash
cd sgc-frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm start
```

Aplicação rodando em: http://localhost:4200

## 📡 API Endpoints

### Autenticação
- `POST /api/v1/auth/login` - Login com email/senha

### Obrigações
- `POST /api/v1/obrigacoes` - Criar obrigação (COMPLIANCE, ADMIN)
- `GET /api/v1/obrigacoes` - Listar com filtros + paginação
- `GET /api/v1/obrigacoes/{id}` - Buscar por ID
- `PUT /api/v1/obrigacoes/{id}` - Atualizar (COMPLIANCE, ADMIN)
- `POST /api/v1/obrigacoes/{id}/submeter` - Submeter para aprovação (RESPONSAVEL)
- `POST /api/v1/obrigacoes/{id}/aprovar` - Aprovar (COMPLIANCE, ADMIN)
- `POST /api/v1/obrigacoes/{id}/rejeitar` - Rejeitar (COMPLIANCE, ADMIN)
- `GET /api/v1/obrigacoes/atrasadas` - Buscar atrasadas
- `DELETE /api/v1/obrigacoes/{id}` - Soft delete (COMPLIANCE, ADMIN)

### Normas
- `POST /api/v1/normas` - Criar norma (COMPLIANCE, ADMIN)
- `GET /api/v1/normas` - Listar com filtros (tipo, ano, vigente)
- `GET /api/v1/normas/{id}` - Buscar por ID
- `PUT /api/v1/normas/{id}` - Atualizar (COMPLIANCE, ADMIN)
- `GET /api/v1/normas/vigentes` - Buscar normas vigentes
- `DELETE /api/v1/normas/{id}` - Soft delete (COMPLIANCE, ADMIN)

### Evidências
- `POST /api/v1/evidencias/obrigacao/{id}/arquivo` - Upload arquivo (multipart/form-data)
- `POST /api/v1/evidencias/obrigacao/{id}/link` - Adicionar link
- `POST /api/v1/evidencias/obrigacao/{id}/texto` - Adicionar texto
- `GET /api/v1/evidencias/obrigacao/{id}` - Listar evidências
- `GET /api/v1/evidencias/{id}/download` - Download arquivo
- `DELETE /api/v1/evidencias/{id}` - Excluir evidência

### Histórico
- `GET /api/v1/historico/obrigacao/{id}` - Listar histórico da obrigação
- `GET /api/v1/historico/{id}` - Buscar registro específico

## 🗂️ Estrutura de Arquivos

```
complianceGemini/
├── ARCHITECTURE.md           # Documentação arquitetural completa
├── README.md                 # Este arquivo
├── database/
│   ├── V1__create_initial_schema.sql         # 9 tabelas principais
│   ├── V2__create_performance_indexes.sql    # Índices compostos
│   ├── V3__insert_initial_data.sql           # Seed data
│   └── V4__add_advanced_constraints_and_triggers.sql
├── sgc-backend/
│   ├── pom.xml
│   ├── src/main/
│   │   ├── java/com/compliance/sgc/
│   │   │   ├── config/          # CorsConfig, JpaAuditConfig, MapStructConfig
│   │   │   ├── controller/      # 5 REST controllers + GlobalExceptionHandler
│   │   │   ├── domain/
│   │   │   │   ├── entity/      # 10 JPA entities
│   │   │   │   └── enums/       # 6 enums
│   │   │   ├── dto/             # 16 DTOs (Records)
│   │   │   ├── exception/       # 4 custom exceptions + ErrorResponse
│   │   │   ├── mapper/          # 5 MapStruct mappers
│   │   │   ├── repository/      # 9 JPA repositories
│   │   │   ├── security/        # JWT provider, filter, UserDetailsService
│   │   │   └── service/         # 5 services (BMad v6)
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── application-test.yml
└── sgc-frontend/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── components/      # 3 standalone components
        │   ├── guards/          # auth.guard.ts
        │   ├── interceptors/    # jwt.interceptor.ts
        │   ├── models/          # 5 TypeScript interfaces
        │   ├── services/        # 5 HTTP services
        │   ├── app.component.ts
        │   └── app.config.ts
        ├── main.ts
        └── styles.css
```

## 📦 Tecnologias Utilizadas

### Backend
- Spring Boot 3.2.1
- Spring Security 6
- Spring Data JPA
- Flyway 10.10.0
- MapStruct 1.5.5
- JJWT 0.12.3 (JWT)
- SpringDoc OpenAPI 2.3.0
- Lombok
- SQL Server JDBC Driver

### Frontend
- Angular 17.3
- PrimeNG 17.18
- PrimeIcons 7.0
- PrimeFlex
- RxJS 7.8
- TypeScript 5.4

## 📝 Metodologia BMad v6

O backend foi desenvolvido utilizando a metodologia **BMad v6** (Geração Bruta → Auto-Crítica → Refinamento):

### Bloco 1: Infraestrutura (Modo Funcional)
- DTOs (16 arquivos)
- MapStruct Mappers (5 arquivos)
- Repositories (9 arquivos)

### Bloco 2: Services Críticos (BMad v6 Completo)
**Geração Bruta:**
- ObrigacaoService, NormaService, FileStorageService, EvidenciaService, HistoricoService

**Auto-Crítica (12 problemas identificados):**
1. Missing UsuarioService
2. Missing NormaRepository queries (findNormasVigentes, existsByTipoAndNumeroAndAno)
3. Missing ObrigacaoRepository queries
4. FileStorageService sem método download
5. EvidenciaService sem método download
6. Validação de hierarquia inconsistente
7. Logging insuficiente de eventos de segurança
8. Paginação ausente no histórico
9. Validação de evidências na submissão
10. FileStorageService sem Resource wrapper
11. Missing GlobalExceptionHandler
12. Missing DTOs para workflow

**Refinamento:**
- Todos os 12 problemas corrigidos
- Queries adicionadas aos repositories
- Métodos download implementados
- GlobalExceptionHandler criado
- DTOs de workflow criados (AprovarObrigacaoDTO, RejeitarObrigacaoDTO)

### Bloco 3: Controllers (Modo Funcional)
- 4 REST controllers com endpoints completos

## 🔐 Usuários Padrão (Seed Data)

```sql
-- ADMIN
Email: admin@sgc.com
Senha: Admin@123

-- COMPLIANCE
Email: compliance@sgc.com
Senha: Compliance@123

-- RESPONSAVEL
Email: responsavel@sgc.com
Senha: Responsavel@123

-- VISUALIZADOR
Email: visualizador@sgc.com
Senha: Visualizador@123
```

## 🧪 Testes

### Backend (JUnit 5 + Mockito)
```bash
cd sgc-backend
mvn test
```

### Frontend (Jest)
```bash
cd sgc-frontend
npm test
```

## 📊 Estatísticas do Projeto

- **Total de arquivos**: 88 arquivos de código-fonte
- **Backend**: 63 arquivos Java
- **Frontend**: 21 arquivos TypeScript
- **Database**: 4 migrations SQL
- **Linhas de código**: ~8.500 linhas (estimativa)
- **Tempo de desenvolvimento**: Implementação completa em uma sessão
- **Metodologia**: BMad v6 para componentes críticos

## 🎯 Funcionalidades Implementadas

### Gestão de Normas
- ✅ CRUD completo de normas
- ✅ Hierarquia (Artigo → Inciso → Alínea)
- ✅ Filtros por tipo, ano, vigência
- ✅ Validação de unicidade (tipo + numero + ano)
- ✅ Validação de datas (publicação < revogação)

### Gestão de Obrigações
- ✅ CRUD completo
- ✅ Vínculo N:N com hierarquia de normas
- ✅ Atribuição de responsável
- ✅ Prazo de execução
- ✅ Filtros (status, responsável, atrasadas)
- ✅ Paginação lazy

### Workflow de Aprovação
- ✅ Submissão pelo responsável
- ✅ Aprovação/rejeição pelo compliance
- ✅ Validações de transição de status
- ✅ Motivo obrigatório na rejeição
- ✅ Histórico imutável de mudanças

### Gestão de Evidências
- ✅ 3 tipos: ARQUIVO, LINK, TEXTO
- ✅ Upload com validações de segurança:
  - Extensão (whitelist)
  - MIME type (whitelist)
  - Magic number (assinatura de arquivo)
  - Tamanho máximo
  - Path traversal protection
- ✅ Download seguro com controle de acesso
- ✅ Exclusão física + soft delete

### Auditoria
- ✅ Histórico automático de mudanças de status
- ✅ Trigger SQL para auditoria
- ✅ Campos de auditoria (criado_em, criado_por, atualizado_em, atualizado_por)
- ✅ Timeline visual no frontend (PrimeNG p-timeline)

## 📚 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentação arquitetural completa
- [SECURITY.md](./sgc-backend/src/main/resources/SECURITY.md) - Checklist OWASP Top 10

## 🚀 Próximos Passos (Roadmap)

- [ ] Implementar componentes de criação/edição de Normas
- [ ] Implementar componentes de criação/edição de Obrigações
- [ ] Adicionar formulários de upload de evidências com drag-and-drop
- [ ] Implementar dashboard com gráficos (PrimeNG Charts)
- [ ] Adicionar testes unitários (JUnit 5 + Mockito 100% coverage)
- [ ] Adicionar testes E2E (Cypress)
- [ ] Implementar responsive design para mobile
- [ ] Adicionar relatórios em PDF (iText)
- [ ] Implementar notificações por email (Spring Mail)
- [ ] Adicionar SSO com OAuth2 / OIDC
- [ ] Implementar cache com Redis
- [ ] Adicionar observabilidade (Prometheus + Grafana)

## 👨‍💻 Autor

Desenvolvido com metodologia BMad v6 para demonstração de arquitetura enterprise-grade.

## 📄 Licença

Este projeto é um protótipo educacional.

---

**SGC v1.0** - Sistema de Gestão de Compliance
