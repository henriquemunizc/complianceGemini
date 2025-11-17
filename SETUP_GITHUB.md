# 🚀 Setup GitHub - Windows

## Pré-requisitos
- Git instalado: https://git-scm.com/download/win
- Conta no GitHub: https://github.com

## Passo 1: Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `complianceGemini` (ou outro nome)
3. Tipo: Private ou Public
4. **NÃO** marque "Initialize with README"
5. Clique em "Create repository"
6. **Copie a URL** que aparece (exemplo: `https://github.com/SEU_USUARIO/complianceGemini.git`)

## Passo 2: Baixar o código deste ambiente

Você tem 2 opções:

### Opção A: Clone direto (se tiver acesso ao repositório atual)
```bash
git clone http://127.0.0.1:44323/git/henriquemunizc/complianceGemini
cd complianceGemini
```

### Opção B: Baixar como ZIP
Peça para o desenvolvedor criar um arquivo ZIP com todo o código.

## Passo 3: Configurar Git no Windows

Abra o **Git Bash** (instalado com o Git) ou **PowerShell**:

```bash
# Configure seu nome e email
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"

# Navegue até a pasta do projeto
cd complianceGemini

# Remova o remote antigo (se existir)
git remote remove origin

# Adicione seu GitHub como remote
git remote add origin https://github.com/SEU_USUARIO/complianceGemini.git

# Faça push de todos os commits
git push -u origin claude/sgc-compliance-architecture-011UUToY3HcCQUZ82L5Pouag

# Ou se preferir usar a branch main:
# git checkout -b main
# git push -u origin main
```

## Passo 4: Clone no seu Windows

Agora você pode clonar em qualquer lugar:

```bash
git clone https://github.com/SEU_USUARIO/complianceGemini.git
cd complianceGemini
```

---

**Próximo passo**: Veja o arquivo `INSTALACAO_WINDOWS.md` para instalar as dependências.
