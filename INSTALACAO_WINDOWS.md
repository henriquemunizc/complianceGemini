# 🪟 Guia de Instalação Completo - Windows

## ✅ Pré-requisitos

### 1. Node.js 18+ (obrigatório)
- **Download**: https://nodejs.org/
- Escolha a versão **LTS** (Long Term Support)
- Durante a instalação:
  - ✅ Marque "Automatically install necessary tools"
  - ✅ Adicione ao PATH (marcado por padrão)
- **Verificar**: Abra PowerShell e rode:
  ```powershell
  node --version
  npm --version
  ```
  Deve mostrar algo como `v18.x.x` ou `v20.x.x`

### 2. Java 21 (obrigatório)
- **Download**: https://adoptium.net/temurin/releases/?version=21
- Escolha:
  - Operating System: **Windows**
  - Architecture: **x64** (ou x86 se seu Windows for 32-bit)
  - Package Type: **MSI**
- Durante a instalação:
  - ✅ Marque "Set JAVA_HOME variable"
  - ✅ Marque "Add to PATH"
- **Verificar**:
  ```powershell
  java --version
  ```
  Deve mostrar `openjdk 21.x.x`

### 3. Maven 3.9+ (obrigatório)
- **Download**: https://maven.apache.org/download.cgi
- Baixe o arquivo `apache-maven-3.9.x-bin.zip`
- Extraia para `C:\Program Files\Apache\maven`
- **Configure o PATH**:
  1. Pesquise "Variáveis de ambiente" no menu Iniciar
  2. Clique em "Editar as variáveis de ambiente do sistema"
  3. Clique em "Variáveis de Ambiente"
  4. Em "Variáveis do sistema", encontre `Path` e clique em "Editar"
  5. Clique em "Novo" e adicione: `C:\Program Files\Apache\maven\bin`
  6. Clique em "OK" em todas as janelas
- **Feche e abra o PowerShell novamente**
- **Verificar**:
  ```powershell
  mvn --version
  ```

### 4. SQL Server (obrigatório)

**Opção A: SQL Server Express (Grátis)**
- **Download**: https://www.microsoft.com/sql-server/sql-server-downloads
- Clique em "Download agora" na seção "Express"
- Execute o instalador e escolha **Basic**
- Anote a string de conexão mostrada ao final

**Opção B: SQL Server Developer (Grátis, mais recursos)**
- Mesmo link acima, escolha "Developer"

**Instalar SQL Server Management Studio (SSMS)**:
- **Download**: https://aka.ms/ssmsfullsetup
- Use para gerenciar o banco de dados visualmente

### 5. Git (obrigatório)
- **Download**: https://git-scm.com/download/win
- Durante a instalação, aceite as opções padrão
- **Verificar**:
  ```powershell
  git --version
  ```

---

## 📦 Instalação do Projeto

### Passo 1: Clone o repositório

```powershell
# Crie uma pasta para seus projetos
mkdir C:\projetos
cd C:\projetos

# Clone o repositório (substitua pela SUA URL do GitHub)
git clone https://github.com/SEU_USUARIO/complianceGemini.git
cd complianceGemini
```

### Passo 2: Configure o Banco de Dados

**2.1. Crie o banco de dados**

Abra o **SSMS** (SQL Server Management Studio):
- Connect to: `localhost` ou `.\SQLEXPRESS`
- Execute:
  ```sql
  CREATE DATABASE sgc_db;
  ```

**2.2. Configure a conexão**

Edite o arquivo: `sgc-backend\src\main\resources\application.properties`

```properties
# SQL Server Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=sgc_db;encrypt=false;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=SUA_SENHA_AQUI
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true

# Flyway Migration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
spring.flyway.locations=classpath:db/migration
spring.flyway.validate-on-migrate=true

# Server Port
server.port=8080

# JWT Configuration (altere o secret para algo seguro)
jwt.secret=sua_chave_secreta_muito_segura_aqui_minimo_256_bits
jwt.expiration=86400000

# Logging
logging.level.com.compliance.sgc=INFO
logging.level.org.springframework.web=INFO
```

**Se usar SQL Server Express**, a URL pode ser:
```properties
spring.datasource.url=jdbc:sqlserver://localhost\\SQLEXPRESS:1433;databaseName=sgc_db;encrypt=false;trustServerCertificate=true
```

### Passo 3: Instale as dependências do Backend

```powershell
cd sgc-backend

# Baixar todas as dependências e compilar
mvn clean install -DskipTests

# Executar as migrations do banco de dados
mvn flyway:migrate
```

**Possíveis erros**:
- ❌ **"Connection refused"**: SQL Server não está rodando. Vá em Services (services.msc) e inicie "SQL Server (SQLEXPRESS)"
- ❌ **"Login failed"**: Usuário/senha incorretos no application.properties
- ❌ **"Database does not exist"**: Execute o `CREATE DATABASE sgc_db;` no SSMS

### Passo 4: Instale as dependências do Frontend

```powershell
cd ..\sgc-frontend

# Instalar todas as dependências (pode demorar 2-5 minutos)
npm install
```

**Se der erro de permissão**, execute o PowerShell como **Administrador** e rode:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
npm install
```

### Passo 5: Execute o Backend

```powershell
cd ..\sgc-backend

# Inicia o servidor Spring Boot
mvn spring-boot:run
```

**Aguarde até ver**:
```
Started SgcApplication in X.XXX seconds
```

O backend estará em: **http://localhost:8080**

**Teste**: Abra no navegador http://localhost:8080/actuator/health
- Deve retornar: `{"status":"UP"}`

### Passo 6: Execute o Frontend (em outro terminal)

Abra **outro PowerShell** (deixe o backend rodando):

```powershell
cd C:\projetos\complianceGemini\sgc-frontend

# Inicia o servidor de desenvolvimento Angular
npm start
```

**Aguarde até ver**:
```
✔ Compiled successfully.
```

O frontend estará em: **http://localhost:4200**

---

## 🎯 Acessando o Sistema

1. Abra o navegador em: **http://localhost:4200**
2. Você verá a tela de login

### Criar o primeiro usuário

**Opção A: Via API**

Use o **Postman** ou **Insomnia**:
```http
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "nome": "Admin",
  "email": "admin@sgc.com",
  "senha": "Admin@123",
  "role": "ADMIN"
}
```

**Opção B: Via SQL**

Abra o SSMS e execute:
```sql
USE sgc_db;

-- Senha é: Admin@123 (BCrypt hash)
INSERT INTO TBL_USUARIOS (nome, email, senha, role, ativo, criado_em, atualizado_em)
VALUES (
  'Admin Sistema',
  'admin@sgc.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye7jtC9d3qjxLH4bJ3wGv8qZqnqKXZHEC',
  'ADMIN',
  1,
  GETDATE(),
  GETDATE()
);
```

### Fazer Login

- **Email**: admin@sgc.com
- **Senha**: Admin@123

---

## 🎨 Explorando as Novas Features

Após logar, explore:

### 1. Dashboard Avançado
- **URL**: http://localhost:4200/dashboard
- 6 cards de métricas com tendências
- 3 gráficos interativos (Chart.js)
- Filtros por período (7d, 30d, 90d, 1y)

### 2. Busca Global (Spotlight)
- Pressione **Ctrl+K** (ou Cmd+K no Mac)
- Busca em tempo real em todas as entidades
- Histórico de buscas
- Navegação por teclado (↑↓Enter)

### 3. Atalhos de Teclado
- Pressione **Ctrl+/** para ver todos os atalhos
- Principais:
  - `Ctrl+K`: Busca global
  - `Ctrl+H`: Dashboard
  - `Ctrl+N`: Nova obrigação
  - `G → D`: Go to dashboard
  - `G → N`: Go to normas
  - `G → O`: Go to obrigações

### 4. Filtros Avançados
- Vá em **Obrigações** ou **Normas**
- Clique em "Filtros Avançados" (sidebar)
- Salve combinações de filtros
- Chips de filtros ativos

### 5. Exportação
- Em qualquer lista, clique em "Exportar"
- Escolha: Excel, CSV ou PDF
- Selecione as colunas desejadas

### 6. Notificações
- Ícone de sino no navbar (canto superior direito)
- Badge com quantidade não lidas
- Polling automático a cada 30s

### 7. Comentários
- Abra uma obrigação
- Seção de comentários na parte inferior
- Suporta @mentions e threading

### 8. Auditoria
- Abra uma obrigação
- Aba "Histórico de Auditoria"
- Visualize todas as mudanças com diff

### 9. Product Tours
- Clique no botão de ajuda (? no canto inferior direito)
- Escolha "Ver Tour"
- 4 tours interativos com Shepherd.js

### 10. Help System
- Botão de ajuda (? no canto inferior direito)
- FAQs por categoria
- Vídeos tutoriais
- Documentação inline

---

## 🔥 Comandos Úteis

### Backend (sgc-backend)

```powershell
# Iniciar
mvn spring-boot:run

# Compilar
mvn clean install

# Executar testes
mvn test

# Gerar JAR de produção
mvn clean package -DskipTests
# JAR estará em: target\sgc-backend-0.0.1-SNAPSHOT.jar

# Executar o JAR
java -jar target\sgc-backend-0.0.1-SNAPSHOT.jar

# Executar migrations manualmente
mvn flyway:migrate

# Limpar banco e recriar
mvn flyway:clean
mvn flyway:migrate
```

### Frontend (sgc-frontend)

```powershell
# Iniciar servidor de desenvolvimento
npm start

# Build de produção
npm run build
# Arquivos estarão em: dist\sgc-frontend

# Executar testes
npm test

# Executar linter
npm run lint

# Verificar TypeScript
npm run type-check
```

---

## ⚠️ Problemas Comuns

### 1. Porta 8080 já está em uso

**Erro**: `Port 8080 is already in use`

**Solução**:
```powershell
# Encontrar o processo
netstat -ano | findstr :8080

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F

# Ou mude a porta no application.properties:
server.port=8081
```

### 2. Porta 4200 já está em uso

**Erro**: `Port 4200 is already in use`

**Solução**:
```powershell
# Durante npm start, ele perguntará se quer usar outra porta
# Digite: y (yes)
```

### 3. JAVA_HOME não configurado

**Erro**: `JAVA_HOME is not set`

**Solução**:
1. Painel de Controle → Sistema → Configurações avançadas do sistema
2. Variáveis de Ambiente
3. Em "Variáveis do sistema", clique em "Novo"
   - Nome: `JAVA_HOME`
   - Valor: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot` (ajuste conforme sua instalação)
4. Edite a variável `Path` e adicione: `%JAVA_HOME%\bin`
5. Clique em "OK" e **feche e abra o PowerShell**

### 4. Erro de conexão SQL Server

**Erro**: `Connection refused` ou `Login failed`

**Solução**:
- Verifique se o SQL Server está rodando:
  ```powershell
  # Abrir Services
  services.msc
  # Procurar "SQL Server (MSSQLSERVER)" ou "SQL Server (SQLEXPRESS)"
  # Status deve ser "Running"
  ```
- Teste a conexão no SSMS primeiro
- Verifique usuário/senha no application.properties

### 5. npm install falha

**Erro**: Vários erros durante `npm install`

**Solução**:
```powershell
# Execute PowerShell como Administrador
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Limpe o cache
npm cache clean --force

# Tente novamente
npm install
```

### 6. Migrations não executam

**Erro**: Flyway não cria as tabelas

**Solução**:
```powershell
# Execute manualmente
cd sgc-backend
mvn flyway:clean
mvn flyway:migrate

# Verifique no SSMS se as tabelas foram criadas
```

### 7. Frontend não compila

**Erro**: TypeScript errors

**Solução**:
```powershell
# Reinstale as dependências
rm -r node_modules
rm package-lock.json
npm install

# Se persistir, limpe o cache do Angular
rm -r .angular
npm start
```

---

## 🚀 Build de Produção

### Backend

```powershell
cd sgc-backend
mvn clean package -DskipTests

# JAR estará em: target\sgc-backend-0.0.1-SNAPSHOT.jar
# Para executar:
java -jar target\sgc-backend-0.0.1-SNAPSHOT.jar
```

### Frontend

```powershell
cd sgc-frontend
npm run build

# Arquivos otimizados estarão em: dist\sgc-frontend
# Para servir:
# 1. Instale um servidor HTTP simples:
npm install -g http-server

# 2. Sirva os arquivos:
cd dist\sgc-frontend
http-server -p 4200
```

### Deploy

Para produção, você pode:
- **Backend**: Deploy do JAR em um servidor (Tomcat, AWS, Azure, etc.)
- **Frontend**: Hospedar os arquivos em Nginx, IIS, Vercel, Netlify, etc.

---

## 📚 Documentação Adicional

- **Design System**: Veja `sgc-frontend\DESIGN_SYSTEM.md`
- **Integração**: Veja `sgc-frontend\INTEGRATION_EXAMPLE.md`
- **API Docs**: http://localhost:8080/swagger-ui.html (se habilitado)

---

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs do backend no console
2. Abra o DevTools do navegador (F12) e veja o Console
3. Verifique se todas as dependências foram instaladas corretamente
4. Consulte a seção "Problemas Comuns" acima

---

**Boa sorte! 🎉**
