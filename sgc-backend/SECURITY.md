# SGC Backend - Documentação de Segurança

## 🔐 Spring Security 6 - Proteções OWASP Top 10

Este documento descreve as implementações de segurança do SGC Backend e como elas protegem contra o **OWASP Top 10**.

---

## 📋 Implementações de Segurança

### 1. Autenticação JWT Stateless

**Arquivos:**
- `JwtTokenProvider.java`
- `JwtAuthenticationFilter.java`
- `UserDetailsServiceImpl.java`

**Proteções:**
- ✅ **A02:2021 - Cryptographic Failures**: Tokens assinados com HMAC-SHA256
- ✅ **A07:2021 - Identification and Authentication Failures**: JWT stateless previne session hijacking
- ✅ Tokens com tempo de expiração configurável (`jwt.expiration`)
- ✅ Validação rigorosa de assinatura, expiração, issuer

**Fluxo:**
1. Cliente faz login em `/api/v1/auth/login`
2. Backend valida credenciais e retorna token JWT
3. Cliente envia token no header `Authorization: Bearer {token}`
4. `JwtAuthenticationFilter` valida token e autentica usuário

---

### 2. Autorização Baseada em Roles (RBAC)

**Perfis Implementados:**
- `ROLE_ADMIN`: Acesso total ao sistema
- `ROLE_COMPLIANCE`: Gerencia normas, aprova obrigações
- `ROLE_RESPONSAVEL`: Cria evidências, submete obrigações
- `ROLE_VISUALIZADOR`: Apenas leitura

**Implementação:**
```java
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig { ... }
```

**Uso em Services/Controllers:**
```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUsuario(Long id) { ... }

@PreAuthorize("hasAnyRole('COMPLIANCE', 'ADMIN')")
public void aprovarObrigacao(Long id) { ... }

@PreAuthorize("hasRole('RESPONSAVEL') and #obrigacao.responsavel.email == authentication.name")
public void submeterEvidencia(Obrigacao obrigacao) { ... }
```

**Proteções:**
- ✅ **A01:2021 - Broken Access Control**: @PreAuthorize em nível de método
- ✅ Validação de que RESPONSAVEL só acessa suas próprias obrigações

---

### 3. Proteção contra Broken Authentication

**Arquivo:** `AuthController.java`

**Proteções Implementadas:**

#### 3.1. Validação de Usuário Inativo
```java
if (!usuario.getAtivo()) {
  throw new BusinessValidationException("Usuário inativo...");
}
```

#### 3.2. Information Exposure Prevention
```java
catch (BadCredentialsException ex) {
  // NÃO revela se usuário existe ou senha está incorreta
  throw new BusinessValidationException("Email ou senha incorretos");
}
```

#### 3.3. Logging Seguro
- ✅ **NUNCA** loga senhas
- ✅ Loga tentativas de login falhadas (detecção de brute force)
- ✅ Loga logins bem-sucedidos (auditoria)

---

### 4. Validação de Entrada (Input Validation)

**Arquivos:** `LoginRequest.java`, todos os DTOs

**Proteções:**
```java
public record LoginRequest(
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    String email,

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter pelo menos 6 caracteres")
    String senha
) {}
```

**Proteções:**
- ✅ **A03:2021 - Injection**: `jakarta.validation` previne injeção
- ✅ **A04:2021 - Insecure Design**: Validação fail-fast
- ✅ JPA parametrizado previne SQL Injection

---

### 5. Senha Hashing com BCrypt

**Arquivo:** `SecurityConfig.java`

```java
@Bean
public PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder();
}
```

**Proteções:**
- ✅ **A02:2021 - Cryptographic Failures**: BCrypt (adaptive hashing)
- ✅ Salt automático por senha
- ✅ Custo computacional alto (proteção contra brute force)

---

### 6. CORS Configuração Segura

**Arquivo:** `SecurityConfig.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
  configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
  configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
  configuration.setAllowCredentials(true);
  ...
}
```

**Proteções:**
- ✅ **A05:2021 - Security Misconfiguration**: CORS restritivo
- ✅ Apenas origens permitidas
- ✅ Métodos HTTP explícitos

---

### 7. Security Headers (OWASP Secure Headers Project)

**Arquivo:** `SecurityConfig.java`

```java
.headers(headers -> headers
    .frameOptions(frameOptions -> frameOptions.deny()) // X-Frame-Options: DENY
    .contentTypeOptions(contentType -> contentType.disable()) // X-Content-Type-Options
    .httpStrictTransportSecurity(hsts -> hsts
        .includeSubDomains(true)
        .maxAgeInSeconds(31536000)) // HSTS
)
```

**Proteções:**
- ✅ **A03:2021 - Injection**: X-Frame-Options previne Clickjacking
- ✅ **HSTS**: Force HTTPS por 1 ano
- ✅ Content-Type sniffing desabilitado

---

### 8. Exception Handling Seguro

**Arquivo:** `JwtAuthenticationEntryPoint.java`

**Proteções:**
- ✅ Retorno padronizado de erros (ErrorResponse)
- ✅ Não expõe stack traces em produção
- ✅ Mensagens de erro genéricas

**Exemplo de Resposta (401 Unauthorized):**
```json
{
  "timestamp": "2025-11-14T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Acesso não autorizado. Token JWT inválido ou ausente.",
  "path": "/api/v1/obrigacoes"
}
```

---

### 9. CSRF Protection Desabilitado (Stateless API)

```java
.csrf(AbstractHttpConfigurer::disable)
```

**Justificativa:**
- API stateless com JWT não requer CSRF protection
- Tokens não são armazenados em cookies
- Frontend Angular envia token no header `Authorization`

**Se usar cookies:** Habilitar CSRF protection!

---

### 10. Session Management Stateless

```java
.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
```

**Proteções:**
- ✅ **A07:2021 - Identification and Authentication Failures**: Não cria sessões HTTP
- ✅ Escalabilidade horizontal (stateless)
- ✅ Previne session fixation attacks

---

## 🛡️ Checklist de Segurança OWASP Top 10 (2021)

| # | Vulnerabilidade | Status | Implementação |
|---|----------------|--------|---------------|
| A01 | Broken Access Control | ✅ | @PreAuthorize, roles, validação de ownership |
| A02 | Cryptographic Failures | ✅ | BCrypt, JWT HMAC-SHA256, HTTPS (HSTS) |
| A03 | Injection | ✅ | JPA parametrizado, jakarta.validation, headers |
| A04 | Insecure Design | ✅ | Fail-fast validation, stateless design |
| A05 | Security Misconfiguration | ✅ | CORS restritivo, headers de segurança |
| A06 | Vulnerable Components | ⚠️ | Dependabot/Snyk recomendado (CI/CD) |
| A07 | Identification and Authentication Failures | ✅ | JWT, BCrypt, validação de usuário inativo |
| A08 | Software and Data Integrity Failures | ✅ | JWT assinado, validação de issuer |
| A09 | Security Logging and Monitoring Failures | ✅ | Logging de login/logout, tentativas falhadas |
| A10 | Server-Side Request Forgery (SSRF) | ✅ | Validação de URLs em evidências tipo LINK |

---

## 🔧 Configurações de Produção Recomendadas

### 1. JWT Secret

⚠️ **CRÍTICO**: Altere o `jwt.secret` em produção para uma chave de 256+ bits!

```bash
# Gerar chave segura (Linux/Mac)
openssl rand -base64 64

# Configurar via variável de ambiente
export JWT_SECRET="sua-chave-super-segura-aqui"
```

### 2. Rate Limiting (Recomendado)

Adicione rate limiting ao endpoint de login para prevenir brute force:

```xml
<!-- pom.xml -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

### 3. Refresh Token (Recomendado)

Implemente refresh tokens para melhor UX:
- Token de acesso: 15 minutos
- Refresh token: 7 dias

### 4. Audit Logging (Implementado)

Logs de segurança já implementados:
- Login bem-sucedido: `logger.info(...)`
- Login falhado: `logger.warn(...)`
- Usuário inativo: `logger.warn(...)`

---

## 📚 Referências

- [OWASP Top 10 - 2021](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Data:** 2025-11-14
**Versão:** 1.0 (BMad v6 Refinado)
**Arquiteto:** Arquiteto de Soluções Sênior
