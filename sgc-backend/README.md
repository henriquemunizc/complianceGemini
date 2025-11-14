# SGC Backend - Sistema de Gestão de Compliance

Backend da aplicação SGC, desenvolvido com **Spring Boot 3** e **Java 21**.

---

## 🚀 Tecnologias

- **Java 21** (LTS)
- **Spring Boot 3.2.1**
  - Spring Web
  - Spring Data JPA
  - Spring Security 6
  - Spring Validation
- **SQL Server** (Database)
- **Flyway** (Database Migrations)
- **MapStruct 1.5.5** (DTO Mapping)
- **Lombok** (Boilerplate Reduction)
- **JJWT 0.12.3** (JWT Authentication)
- **SpringDoc OpenAPI 2.3.0** (API Documentation)

---

## 📋 Pré-requisitos

- **Java 21** instalado
- **Maven 3.9+** instalado
- **SQL Server** rodando (localhost:1433 ou configurado)
- **Git**

---

## ⚙️ Configuração

### 1. Banco de Dados

Crie o banco de dados no SQL Server:

```sql
CREATE DATABASE SGC_Compliance;
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` (ou configure no IDE) com:

```bash
# Database
DB_USERNAME=sa
DB_PASSWORD=SuaSenhaSegura

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-com-pelo-menos-256-bits

# Server
SERVER_PORT=8080
```

### 3. Perfis de Ambiente

- **dev**: Desenvolvimento local (padrão)
- **prod**: Produção

Ative o perfil desejado:

```bash
export SPRING_PROFILES_ACTIVE=dev
```

Ou via argumento:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

## 🏗️ Build e Execução

### Compilar

```bash
mvn clean install
```

### Executar

```bash
mvn spring-boot:run
```

Ou executar o JAR gerado:

```bash
java -jar target/sgc-backend-1.0.0-SNAPSHOT.jar
```

### Executar Testes

```bash
mvn test
```

### Gerar Relatório de Cobertura (JaCoCo)

```bash
mvn clean test jacoco:report
```

Relatório disponível em: `target/site/jacoco/index.html`

---

## 📂 Estrutura do Projeto

```
sgc-backend/
├── src/
│   ├── main/
│   │   ├── java/com/compliance/sgc/
│   │   │   ├── config/          # Configurações (CORS, Security, JPA, etc.)
│   │   │   ├── domain/
│   │   │   │   ├── entity/      # Entidades JPA
│   │   │   │   └── enums/       # Enumerações
│   │   │   ├── dto/             # DTOs (Records)
│   │   │   ├── mapper/          # MapStruct Mappers
│   │   │   ├── repository/      # Spring Data JPA Repositories
│   │   │   ├── service/         # Lógica de Negócio
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── exception/       # Tratamento de Exceções
│   │   │   └── security/        # JWT, Filters, UserDetails
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/    # Flyway SQL Scripts
│   └── test/                    # Testes Unitários e de Integração
└── pom.xml
```

---

## 🔐 Segurança

### Autenticação

- **JWT Tokens** (Bearer Token)
- Login: `POST /api/v1/auth/login`
- Refresh: `POST /api/v1/auth/refresh`

### Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| `ADMIN` | Acesso total ao sistema |
| `COMPLIANCE` | Aprovação de obrigações, gestão de normas |
| `RESPONSAVEL` | Criação de evidências, submissão de obrigações |
| `VISUALIZADOR` | Apenas leitura |

### Endpoints Protegidos

Todos os endpoints `/api/v1/**` requerem autenticação, exceto:
- `/api/v1/auth/login`
- `/api/v1/auth/register` (se habilitado)

---

## 📖 Documentação da API

### Swagger UI

Acesse: **http://localhost:8080/swagger-ui.html**

> **Nota:** Desabilitado em produção por segurança.

### OpenAPI JSON

Acesse: **http://localhost:8080/api-docs**

---

## 🗃️ Migrations (Flyway)

As migrations são executadas automaticamente ao iniciar a aplicação.

| Migration | Descrição |
|-----------|-----------|
| `V1__create_initial_schema.sql` | Tabelas principais |
| `V2__create_performance_indexes.sql` | Índices de performance |
| `V3__insert_initial_data.sql` | Dados seed (usuários, normas) |
| `V4__add_advanced_constraints_and_triggers.sql` | Triggers e constraints |

### Usuários Seed (dev)

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@sgc.com.br | SgcAdmin@2025 | ADMIN |
| joao.compliance@sgc.com.br | SgcAdmin@2025 | COMPLIANCE |
| maria.responsavel@sgc.com.br | SgcAdmin@2025 | RESPONSAVEL |
| pedro.visualizador@sgc.com.br | SgcAdmin@2025 | VISUALIZADOR |

---

## 🛠️ Desenvolvimento

### Checkstyle (Google Java Style)

```bash
mvn checkstyle:check
```

### Lombok

Certifique-se de habilitar o processamento de anotações no seu IDE:
- **IntelliJ**: Install Lombok Plugin + Enable Annotation Processing
- **Eclipse**: Install Lombok + Run `lombok.jar`

### MapStruct

Mappers são gerados automaticamente em `target/generated-sources/annotations`.

---

## 🚀 Deploy

### Docker (Opcional)

Crie um `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/sgc-backend-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Build e run:

```bash
docker build -t sgc-backend .
docker run -p 8080:8080 -e SPRING_PROFILES_ACTIVE=prod sgc-backend
```

---

## 📊 Monitoramento (Produção)

### Actuator Endpoints

- **Health**: `GET /actuator/health`
- **Metrics**: `GET /actuator/metrics`
- **Info**: `GET /actuator/info`

---

## 🤝 Contribuindo

1. Clone o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: adiciona minha feature'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Proprietário - Todos os direitos reservados.

---

**Data de Criação:** 2025-11-14
**Versão:** 1.0.0
**Arquiteto:** Arquiteto de Soluções Sênior
