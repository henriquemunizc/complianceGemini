# 🚀 Script de Setup Automatizado - SGC Compliance
# Execute com: .\setup-windows.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SGC - Sistema de Gestão de Compliance" -ForegroundColor Cyan
Write-Host "   Setup Automatizado para Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se está rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  ATENÇÃO: Execute este script como Administrador para melhor experiência!" -ForegroundColor Yellow
    Write-Host "   (Clique direito no PowerShell e escolha 'Executar como Administrador')" -ForegroundColor Yellow
    Write-Host ""
}

# Função para verificar se um comando existe
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
}

# Função para exibir status
function Show-Status {
    param($Message, $Status)
    if ($Status) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

Write-Host "🔍 Verificando pré-requisitos..." -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
$hasNode = Test-Command "node"
Show-Status "Node.js instalado" $hasNode
if ($hasNode) {
    $nodeVersion = node --version
    Write-Host "   Versão: $nodeVersion" -ForegroundColor Gray
}

# Verificar npm
$hasNpm = Test-Command "npm"
Show-Status "npm instalado" $hasNpm
if ($hasNpm) {
    $npmVersion = npm --version
    Write-Host "   Versão: $npmVersion" -ForegroundColor Gray
}

# Verificar Java
$hasJava = Test-Command "java"
Show-Status "Java instalado" $hasJava
if ($hasJava) {
    $javaVersion = java --version 2>&1 | Select-Object -First 1
    Write-Host "   $javaVersion" -ForegroundColor Gray
}

# Verificar Maven
$hasMaven = Test-Command "mvn"
Show-Status "Maven instalado" $hasMaven
if ($hasMaven) {
    $mavenVersion = mvn --version | Select-Object -First 1
    Write-Host "   $mavenVersion" -ForegroundColor Gray
}

# Verificar Git
$hasGit = Test-Command "git"
Show-Status "Git instalado" $hasGit
if ($hasGit) {
    $gitVersion = git --version
    Write-Host "   $gitVersion" -ForegroundColor Gray
}

Write-Host ""

# Verificar se todos os pré-requisitos estão instalados
$allPrerequisites = $hasNode -and $hasNpm -and $hasJava -and $hasMaven -and $hasGit

if (-not $allPrerequisites) {
    Write-Host "⚠️  Alguns pré-requisitos não estão instalados!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, instale os seguintes componentes:" -ForegroundColor Yellow
    Write-Host ""

    if (-not $hasNode) {
        Write-Host "  - Node.js 18+: https://nodejs.org/" -ForegroundColor Yellow
    }
    if (-not $hasJava) {
        Write-Host "  - Java 21: https://adoptium.net/temurin/releases/?version=21" -ForegroundColor Yellow
    }
    if (-not $hasMaven) {
        Write-Host "  - Maven 3.9+: https://maven.apache.org/download.cgi" -ForegroundColor Yellow
    }
    if (-not $hasGit) {
        Write-Host "  - Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "📖 Consulte o arquivo INSTALACAO_WINDOWS.md para instruções detalhadas." -ForegroundColor Cyan
    Write-Host ""

    $continue = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($continue -ne "s" -and $continue -ne "S") {
        Write-Host "❌ Setup cancelado." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Iniciando Setup..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Perguntar sobre o banco de dados
Write-Host "🗄️  Configuração do Banco de Dados" -ForegroundColor Cyan
Write-Host ""
Write-Host "Certifique-se de que o SQL Server está instalado e rodando." -ForegroundColor Yellow
Write-Host ""

$dbConfigured = Read-Host "Você já criou o banco de dados 'sgc_db'? (s/N)"

if ($dbConfigured -ne "s" -and $dbConfigured -ne "S") {
    Write-Host ""
    Write-Host "Por favor, execute os seguintes comandos no SQL Server Management Studio (SSMS):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  CREATE DATABASE sgc_db;" -ForegroundColor White
    Write-Host ""
    Write-Host "Pressione qualquer tecla após criar o banco de dados..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

Write-Host ""
Write-Host "📝 Configurando application.properties..." -ForegroundColor Cyan

$dbServer = Read-Host "Servidor do SQL Server [localhost]"
if ([string]::IsNullOrWhiteSpace($dbServer)) { $dbServer = "localhost" }

$dbPort = Read-Host "Porta do SQL Server [1433]"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "1433" }

$dbUser = Read-Host "Usuário do SQL Server [sa]"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "sa" }

$dbPassword = Read-Host "Senha do SQL Server" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

Write-Host ""
Write-Host "🔧 Atualizando application.properties..." -ForegroundColor Cyan

$propsFile = ".\sgc-backend\src\main\resources\application.properties"
if (Test-Path $propsFile) {
    $propsContent = Get-Content $propsFile -Raw

    # Atualizar URL do banco
    $propsContent = $propsContent -replace "spring\.datasource\.url=.*", "spring.datasource.url=jdbc:sqlserver://${dbServer}:${dbPort};databaseName=sgc_db;encrypt=false;trustServerCertificate=true"

    # Atualizar usuário
    $propsContent = $propsContent -replace "spring\.datasource\.username=.*", "spring.datasource.username=$dbUser"

    # Atualizar senha
    $propsContent = $propsContent -replace "spring\.datasource\.password=.*", "spring.datasource.password=$dbPasswordPlain"

    Set-Content -Path $propsFile -Value $propsContent

    Write-Host "✅ application.properties atualizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Arquivo application.properties não encontrado!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Instalando Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($hasMaven) {
    Write-Host "📦 Instalando dependências do Backend (pode demorar alguns minutos)..." -ForegroundColor Cyan

    Push-Location ".\sgc-backend"

    Write-Host "   Executando: mvn clean install -DskipTests" -ForegroundColor Gray
    mvn clean install -DskipTests

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend compilado com sucesso!" -ForegroundColor Green

        Write-Host ""
        Write-Host "🗄️  Executando migrations do banco de dados..." -ForegroundColor Cyan
        Write-Host "   Executando: mvn flyway:migrate" -ForegroundColor Gray
        mvn flyway:migrate

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations executadas com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Erro ao executar migrations. Verifique a configuração do banco." -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erro ao compilar o backend!" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
} else {
    Write-Host "⚠️  Maven não encontrado. Pulando instalação do backend." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Instalando Frontend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($hasNpm) {
    Write-Host "📦 Instalando dependências do Frontend (pode demorar 2-5 minutos)..." -ForegroundColor Cyan

    Push-Location ".\sgc-frontend"

    Write-Host "   Executando: npm install" -ForegroundColor Gray
    npm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend instalado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao instalar o frontend!" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    Pop-Location
} else {
    Write-Host "⚠️  npm não encontrado. Pulando instalação do frontend." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 Setup Concluído!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Projeto configurado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Iniciar o Backend:" -ForegroundColor White
Write-Host "   cd sgc-backend" -ForegroundColor Gray
Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Iniciar o Frontend (em outro terminal):" -ForegroundColor White
Write-Host "   cd sgc-frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Acessar o sistema:" -ForegroundColor White
Write-Host "   http://localhost:4200" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Consulte INSTALACAO_WINDOWS.md para mais informações." -ForegroundColor Cyan
Write-Host ""

$startNow = Read-Host "Deseja iniciar o backend agora? (s/N)"
if ($startNow -eq "s" -or $startNow -eq "S") {
    Write-Host ""
    Write-Host "🚀 Iniciando o backend..." -ForegroundColor Cyan
    Write-Host "   (Pressione Ctrl+C para parar)" -ForegroundColor Gray
    Write-Host ""

    Push-Location ".\sgc-backend"
    mvn spring-boot:run
    Pop-Location
}

Write-Host ""
Write-Host "Até logo! 👋" -ForegroundColor Cyan
