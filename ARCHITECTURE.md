# SGC - Sistema de Gestão de Compliance
## Arquitetura da Solução

---

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Angular 17)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Components   │  │  Services    │  │   Guards     │     │
│  │ (Standalone) │◄─┤  (HttpClient)│◄─┤ (Auth/Role)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ▲                  │                                │
│         │                  │ HTTP/REST (/api/v1/*)          │
│         │ PrimeNG         ▼                                │
└─────────┼──────────────────────────────────────────────────┘
          │
          │ JSON over HTTPS
          │
┌─────────▼──────────────────────────────────────────────────┐
│              BACKEND (Spring Boot 3 + Java 21)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         @RestController Layer (/api/v1/*)            │  │
│  │  (NormaController, ObrigacaoController, etc.)        │  │
│  │  • Validação de DTOs (@Valid)                        │  │
│  │  • Paginação (Pageable)                              │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │ DTOs (Java Records)                │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │                  @Service Layer                       │  │
│  │  (NormaService, ObrigacaoService, etc.)              │  │
│  │  • Lógica de Negócio                                 │  │
│  │  • Validações Complexas                              │  │
│  │  • Workflow de Aprovação                             │  │
│  │  • Transações (@Transactional)                       │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │ Entities (JPA) + MapStruct         │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │      Repository Layer (Spring Data JPA)              │  │
│  │  • Queries customizadas (JPQL)                       │  │
│  │  • Specification para filtros complexos              │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                    │
│  ┌─────────────────────▼────────────────────────────────┐  │
│  │              Spring Security 6 Layer                  │  │
│  │  • JWT Token Authentication                          │  │
│  │  • Role-based Authorization (@PreAuthorize)          │  │
│  │  • Audit Interceptor (JPA EntityListeners)           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────┘
                         │ JPA/Hibernate
                         │
┌────────────────────────▼───────────────────────────────────┐
│                   SQL SERVER DATABASE                      │
│  Hierarquia de Normas:                                     │
│  ┌──────────────┐                                          │
│  │ TBL_NORMAS   │                                          │
│  └──────┬───────┘                                          │
│         │ 1:N                                              │
│  ┌──────▼───────┐     ┌──────────────┐                    │
│  │ TBL_ARTIGOS  │ 1:N │ TBL_INCISOS  │                    │
│  └──────────────┘ ──► └──────┬───────┘                    │
│                              │ 1:N                         │
│                       ┌──────▼───────┐                     │
│                       │ TBL_ALINEAS  │                     │
│                       └──────────────┘                     │
│                                                             │
│  Obrigações e Evidências:                                  │
│  ┌─────────────────┐  ┌──────────────────────┐            │
│  │ TBL_OBRIGACOES  │◄─┤ TBL_OBRIGACAO_HIERARQUIA│          │
│  └────────┬────────┘  └──────────────────────┘            │
│           │ 1:N              (Tabela Associativa)          │
│  ┌────────▼────────┐                                       │
│  │ TBL_EVIDENCIAS  │                                       │
│  └─────────────────┘                                       │
│                                                             │
│  Auditoria e Workflow:                                     │
│  ┌─────────────────┐  ┌──────────────┐                    │
│  │TBL_HISTORICO_   │  │ TBL_USUARIOS │                    │
│  │    STATUS       │  └──────────────┘                    │
│  └─────────────────┘                                       │
│                                                             │
│  Relações entre Normas:                                    │
│  ┌─────────────────┐                                       │
│  │ TBL_RELACOES_   │  (Norma A -regulamenta→ Norma B)     │
│  │     NORMAS      │                                       │
│  └─────────────────┘                                       │
└────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Estrutura de Diretórios

### Backend (Spring Boot)

```
sgc-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── compliance/
│   │   │           └── sgc/
│   │   │               ├── SgcApplication.java
│   │   │               ├── config/
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── MapStructConfig.java
│   │   │               │   ├── JpaAuditConfig.java
│   │   │               │   └── CorsConfig.java
│   │   │               ├── domain/
│   │   │               │   ├── entity/
│   │   │               │   │   ├── Norma.java
│   │   │               │   │   ├── Artigo.java
│   │   │               │   │   ├── Inciso.java
│   │   │               │   │   ├── Alinea.java
│   │   │               │   │   ├── Obrigacao.java
│   │   │               │   │   ├── Usuario.java
│   │   │               │   │   ├── Evidencia.java
│   │   │               │   │   ├── HistoricoStatus.java
│   │   │               │   │   ├── RelacaoNorma.java
│   │   │               │   │   └── AuditoriaBase.java
│   │   │               │   └── enums/
│   │   │               │       ├── StatusObrigacao.java
│   │   │               │       ├── TipoEvidencia.java
│   │   │               │       ├── TipoRelacaoNorma.java
│   │   │               │       └── PerfilUsuario.java
│   │   │               ├── dto/
│   │   │               │   ├── norma/
│   │   │               │   │   ├── NormaCreateDTO.java
│   │   │               │   │   ├── NormaUpdateDTO.java
│   │   │               │   │   └── NormaResponseDTO.java
│   │   │               │   ├── obrigacao/
│   │   │               │   │   ├── ObrigacaoCreateDTO.java
│   │   │               │   │   ├── ObrigacaoUpdateDTO.java
│   │   │               │   │   └── ObrigacaoResponseDTO.java
│   │   │               │   ├── evidencia/
│   │   │               │   │   ├── EvidenciaCreateDTO.java
│   │   │               │   │   └── EvidenciaResponseDTO.java
│   │   │               │   ├── usuario/
│   │   │               │   │   ├── UsuarioCreateDTO.java
│   │   │               │   │   └── UsuarioResponseDTO.java
│   │   │               │   └── historico/
│   │   │               │       └── HistoricoResponseDTO.java
│   │   │               ├── mapper/
│   │   │               │   ├── NormaMapper.java
│   │   │               │   ├── ObrigacaoMapper.java
│   │   │               │   ├── EvidenciaMapper.java
│   │   │               │   ├── UsuarioMapper.java
│   │   │               │   └── HistoricoMapper.java
│   │   │               ├── repository/
│   │   │               │   ├── NormaRepository.java
│   │   │               │   ├── ArtigoRepository.java
│   │   │               │   ├── IncisoRepository.java
│   │   │               │   ├── AlineaRepository.java
│   │   │               │   ├── ObrigacaoRepository.java
│   │   │               │   ├── UsuarioRepository.java
│   │   │               │   ├── EvidenciaRepository.java
│   │   │               │   ├── HistoricoStatusRepository.java
│   │   │               │   └── RelacaoNormaRepository.java
│   │   │               ├── service/
│   │   │               │   ├── NormaService.java
│   │   │               │   ├── ObrigacaoService.java
│   │   │               │   ├── EvidenciaService.java
│   │   │               │   ├── UsuarioService.java
│   │   │               │   ├── HistoricoService.java
│   │   │               │   ├── WorkflowService.java
│   │   │               │   └── RelacaoNormaService.java
│   │   │               ├── controller/
│   │   │               │   ├── NormaController.java
│   │   │               │   ├── ObrigacaoController.java
│   │   │               │   ├── EvidenciaController.java
│   │   │               │   ├── UsuarioController.java
│   │   │               │   ├── HistoricoController.java
│   │   │               │   └── WorkflowController.java
│   │   │               ├── exception/
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   ├── EntityNotFoundException.java
│   │   │               │   ├── BusinessValidationException.java
│   │   │               │   ├── UnauthorizedException.java
│   │   │               │   └── ErrorResponse.java
│   │   │               └── security/
│   │   │                   ├── JwtTokenProvider.java
│   │   │                   ├── JwtAuthenticationFilter.java
│   │   │                   ├── UserDetailsServiceImpl.java
│   │   │                   └── AuditInterceptor.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/
│   │           └── migration/
│   │               ├── V1__create_initial_schema.sql
│   │               ├── V2__create_audit_tables.sql
│   │               └── V3__insert_initial_data.sql
│   └── test/
│       └── java/
│           └── com/
│               └── compliance/
│                   └── sgc/
│                       ├── service/
│                       ├── controller/
│                       └── repository/
├── pom.xml
└── README.md
```

### Frontend (Angular)

```
sgc-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── storage.service.ts
│   │   │   └── models/
│   │   │       ├── usuario.model.ts
│   │   │       └── auth-response.model.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   │   └── navbar.component.ts
│   │   │   │   ├── sidebar/
│   │   │   │   │   └── sidebar.component.ts
│   │   │   │   └── loading/
│   │   │   │       └── loading.component.ts
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── features/
│   │   │   ├── normas/
│   │   │   │   ├── models/
│   │   │   │   │   ├── norma.model.ts
│   │   │   │   │   ├── artigo.model.ts
│   │   │   │   │   ├── inciso.model.ts
│   │   │   │   │   └── alinea.model.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── norma.service.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── norma-list/
│   │   │   │   │   │   ├── norma-list.component.ts
│   │   │   │   │   │   ├── norma-list.component.html
│   │   │   │   │   │   └── norma-list.component.scss
│   │   │   │   │   ├── norma-form/
│   │   │   │   │   │   ├── norma-form.component.ts
│   │   │   │   │   │   ├── norma-form.component.html
│   │   │   │   │   │   └── norma-form.component.scss
│   │   │   │   │   └── norma-tree/
│   │   │   │   │       ├── norma-tree.component.ts
│   │   │   │   │       ├── norma-tree.component.html
│   │   │   │   │       └── norma-tree.component.scss
│   │   │   │   └── normas.routes.ts
│   │   │   ├── obrigacoes/
│   │   │   │   ├── models/
│   │   │   │   │   ├── obrigacao.model.ts
│   │   │   │   │   └── status-obrigacao.enum.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── obrigacao.service.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── obrigacao-list/
│   │   │   │   │   ├── obrigacao-form/
│   │   │   │   │   └── obrigacao-detail/
│   │   │   │   └── obrigacoes.routes.ts
│   │   │   ├── evidencias/
│   │   │   │   ├── models/
│   │   │   │   │   └── evidencia.model.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── evidencia.service.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── evidencia-upload/
│   │   │   │   │   └── evidencia-list/
│   │   │   │   └── evidencias.routes.ts
│   │   │   ├── workflow/
│   │   │   │   ├── models/
│   │   │   │   │   └── historico.model.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── workflow.service.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── workflow-approval/
│   │   │   │   │   └── historico-timeline/
│   │   │   │   └── workflow.routes.ts
│   │   │   └── dashboard/
│   │   │       ├── components/
│   │   │       │   └── dashboard/
│   │   │       └── dashboard.routes.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   └── images/
│   ├── styles.scss
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔐 Camadas de Segurança

### Autenticação
- JWT/Opaque Tokens via Spring Security 6
- Token armazenado no LocalStorage/SessionStorage
- Interceptor Angular para anexar token em todas as requisições
- Refresh Token para renovação automática

### Autorização
- Perfis de Usuário: `ADMIN`, `COMPLIANCE`, `RESPONSAVEL`, `VISUALIZADOR`
- Anotações `@PreAuthorize` nos métodos do Service/Controller
- Guards no Angular para proteção de rotas

### Auditoria
- Interceptor JPA para capturar automaticamente:
  - `criado_em`, `criado_por`
  - `atualizado_em`, `atualizado_por`
- Tabela `TBL_HISTORICO_STATUS` para rastreamento imutável de mudanças

---

## 🔄 Fluxo de Workflow de Aprovação

```
┌─────────────┐
│  PENDENTE   │ (Obrigação criada)
└──────┬──────┘
       │
       │ Responsável anexa evidências
       ▼
┌─────────────┐
│ EM_ANALISE  │ (Evidências submetidas)
└──────┬──────┘
       │
       ├────► APROVADO (Compliance aprova)
       │
       └────► REPROVADO (Compliance reprova com comentários)
                  │
                  └────► Volta para PENDENTE (Responsável corrige)
```

**Status Automáticos:**
- `ATRASADO`: Trigger/Job verifica obrigações com prazo vencido

---

## 📦 Dependências Principais

### Backend (pom.xml)
- Spring Boot 3.x (Web, Data JPA, Security, Validation)
- MapStruct 1.5+
- SQL Server JDBC Driver
- Lombok
- Jackson (JSON)
- SpringDoc OpenAPI (Swagger)
- JUnit 5 + Mockito (Testes)

### Frontend (package.json)
- Angular 17+
- PrimeNG 17+
- PrimeIcons
- RxJS
- TypeScript 5+

---

## 🎯 Princípios de Design

1. **Separation of Concerns**: Cada camada tem responsabilidade única
2. **DRY (Don't Repeat Yourself)**: MapStruct elimina mapeamentos manuais
3. **Security by Default**: Todas as rotas protegidas por padrão
4. **Fail-Fast**: Validações na entrada (DTOs) impedem dados inválidos
5. **Auditability**: Todo evento relevante é registrado
6. **Immutability**: Histórico de status é append-only (nunca deletado/atualizado)
7. **Mobile-First**: UI responsiva usando PrimeNG Grid System

---

## 🚀 Fluxo de Dados

### Criação de Obrigação (Exemplo)

**Frontend:**
```typescript
// 1. Usuario preenche formulário
obrigacaoForm.setValue({...});

// 2. Service envia para backend
obrigacaoService.create(form.value)
  .subscribe(response => {...});
```

**Backend:**
```java
// 1. Controller recebe DTO
@PostMapping
public ResponseEntity<ObrigacaoResponseDTO> create(
  @Valid @RequestBody ObrigacaoCreateDTO dto) {

  // 2. Service processa lógica
  ObrigacaoResponseDTO response = obrigacaoService.create(dto);

  // 3. Retorna DTO de resposta
  return ResponseEntity.status(201).body(response);
}

// Service
public ObrigacaoResponseDTO create(ObrigacaoCreateDTO dto) {
  // Mapeia DTO -> Entity
  Obrigacao entity = mapper.toEntity(dto);

  // Validações de negócio
  validarNormaExiste(dto.normaId());

  // Persiste
  entity = repository.save(entity);

  // Registra histórico
  historicoService.registrar(entity, StatusObrigacao.PENDENTE);

  // Mapeia Entity -> DTO
  return mapper.toResponseDTO(entity);
}
```

---

## 🎯 Decisões Arquiteturais Refinadas

### 1. Vinculação de Obrigações à Hierarquia de Normas

**Decisão:** Tabela associativa `TBL_OBRIGACAO_HIERARQUIA`

**Justificativa:**
- Uma obrigação pode estar vinculada a múltiplos itens da hierarquia
- Exemplo: "Obrigação X" existe por causa do "Artigo 5, Inciso II" E "Lei Y, Artigo 10"
- Tabela associativa permite N:N entre Obrigação e qualquer nível da hierarquia

**Schema:**
```sql
CREATE TABLE TBL_OBRIGACAO_HIERARQUIA (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    obrigacao_id BIGINT NOT NULL,
    norma_id BIGINT NULL,          -- FK para TBL_NORMAS
    artigo_id BIGINT NULL,         -- FK para TBL_ARTIGOS
    inciso_id BIGINT NULL,         -- FK para TBL_INCISOS
    alinea_id BIGINT NULL,         -- FK para TBL_ALINEAS
    FOREIGN KEY (obrigacao_id) REFERENCES TBL_OBRIGACOES(obrigacao_id),
    CHECK (
        (norma_id IS NOT NULL) OR
        (artigo_id IS NOT NULL) OR
        (inciso_id IS NOT NULL) OR
        (alinea_id IS NOT NULL)
    )
);
```

### 2. Armazenamento de Evidências

**Decisão:** Armazenamento híbrido

**Tipos de Evidência:**
1. **Arquivo (Upload):** Armazena metadados no DB + arquivo no filesystem/cloud
   - `tipo_evidencia = 'ARQUIVO'`
   - `caminho_arquivo` (VARCHAR): path relativo (ex: `/uploads/2025/11/file.pdf`)
   - `nome_arquivo_original` (VARCHAR): nome original do arquivo
   - `tamanho_bytes` (BIGINT)
   - `mime_type` (VARCHAR)

2. **Link Externo:**
   - `tipo_evidencia = 'LINK'`
   - `url_externa` (VARCHAR): URL completa

3. **Texto Rico:**
   - `tipo_evidencia = 'TEXTO'`
   - `conteudo_texto` (NVARCHAR(MAX)): texto em HTML/Markdown

**Implementação Backend:**
- `FileStorageService`: Gerencia upload/download de arquivos
- Diretório: `/uploads/{ano}/{mes}/{uuid}_{nomeOriginal}`
- Validação: Tamanho máximo (10MB), tipos permitidos (PDF, DOCX, XLSX, PNG, JPG)

### 3. Paginação e Filtros

**Paginação:**
- Usar `Pageable` do Spring Data em todos os métodos de listagem
- Padrão: 20 itens por página
- Frontend: PrimeNG `p-Table` com `lazy loading`

**Filtros Complexos:**
- Usar `Specification<T>` do Spring Data JPA para queries dinâmicas
- Exemplo: Filtrar obrigações por status, responsável, prazo, norma vinculada

**Exemplo Controller:**
```java
@GetMapping("/api/v1/obrigacoes")
public Page<ObrigacaoResponseDTO> listar(
    @RequestParam(required = false) String status,
    @RequestParam(required = false) Long responsavelId,
    Pageable pageable
) {
    return obrigacaoService.listar(status, responsavelId, pageable);
}
```

### 4. Versionamento de API

**Decisão:** Prefixo `/api/v1/` em todas as rotas

**Rationale:**
- Facilita evolução da API sem quebrar clientes existentes
- Padrão de mercado para APIs REST

**Configuração:**
```java
@RestController
@RequestMapping("/api/v1/normas")
public class NormaController { ... }
```

### 5. CORS Configuration

**Ambientes:**
- **Dev:** `http://localhost:4200` (Angular CLI)
- **Prod:** `https://sgc.dominio.com.br`

**Configuração:**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 6. Error Response Padrão

**Estrutura:**
```java
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path,
    Map<String, String> validationErrors // Para erros de validação
) {}
```

**Exemplo de Resposta (400 Bad Request):**
```json
{
  "timestamp": "2025-11-14T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Erro de validação",
  "path": "/api/v1/obrigacoes",
  "validationErrors": {
    "titulo": "não deve estar vazio",
    "prazo": "não pode ser no passado"
  }
}
```

### 7. Flyway para Migrations

**Decisão:** Usar Flyway (não Liquibase)

**Organização:**
- `V1__create_initial_schema.sql`: Tabelas principais
- `V2__create_audit_tables.sql`: Histórico de status
- `V3__insert_initial_data.sql`: Dados seed (usuário admin, perfis)
- `V4__create_indexes.sql`: Índices de performance

### 8. Auditoria JPA

**Classe Base:**
```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditoriaBase {
    @CreatedDate
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @CreatedBy
    @Column(name = "criado_por", nullable = false, updatable = false, length = 100)
    private String criadoPor;

    @LastModifiedDate
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    @LastModifiedBy
    @Column(name = "atualizado_por", length = 100)
    private String atualizadoPor;
}
```

**Configuração:**
```java
@Configuration
@EnableJpaAuditing
public class JpaAuditConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();
            return Optional.ofNullable(auth)
                .map(Authentication::getName);
        };
    }
}
```

---

## 📝 Próximos Passos

1. ✅ Arquitetura definida e refinada
2. ⏳ Modelagem completa do banco de dados (SQL DDL)
3. ⏳ Setup dos projetos (backend + frontend)
4. ⏳ Implementação das camadas (bottom-up)
5. ⏳ Integração e testes

---

## 📊 Resumo das Melhorias (BMad v6 - Refinamento)

**O que foi ajustado após auto-crítica:**

1. ✅ **Hierarquia de Normas:** Clarificado relacionamento 1:N (Norma → Artigo → Inciso → Alínea)
2. ✅ **Vinculação de Obrigações:** Tabela associativa `TBL_OBRIGACAO_HIERARQUIA` (N:N)
3. ✅ **Evidências:** Estratégia híbrida (DB metadados + filesystem para arquivos)
4. ✅ **Paginação:** `Pageable` + `Specification` para filtros complexos
5. ✅ **API Versionamento:** Prefixo `/api/v1/` em todas as rotas
6. ✅ **CORS:** Configuração explícita para dev/prod
7. ✅ **ErrorResponse:** Estrutura padronizada com suporte a validation errors
8. ✅ **Migrations:** Flyway com scripts organizados por versão
9. ✅ **Auditoria:** Classe base `AuditoriaBase` com `@EntityListeners`
10. ✅ **File Upload:** `FileStorageService` com validações de tipo/tamanho

**Por que estas mudanças melhoram a solução:**
- **Segurança:** Validação de arquivos previne uploads maliciosos
- **Escalabilidade:** Paginação reduz carga de memória
- **Manutenibilidade:** Migrations versionadas facilitam deploy
- **Auditabilidade:** Rastreamento automático de quem/quando modificou
- **Flexibilidade:** Vinculação N:N permite obrigações complexas
- **Usabilidade:** Filtros dinâmicos melhoram experiência do usuário

---

**Data:** 2025-11-14
**Versão:** 1.1 (Refinada - BMad v6)
**Autor:** Arquiteto de Soluções Sênior
