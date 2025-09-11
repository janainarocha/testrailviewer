# 🔧 Setup Instructions for Monthly Automation Report

## 📋 **O que foi feito:**

✅ **Convertido o script para usar APIs diretas** (não precisa mais de MCP)  
✅ **Instalado axios** para fazer requests HTTP  
✅ **Criado arquivo .env.example** com configurações  
✅ **Atualizado batch file** para usar nova versão  

## 🚀 **Como configurar:**

### 1. **Copie o arquivo de configurações:**
```bash
copy .env.example .env
```

### 2. **Edite o arquivo .env com suas credenciais:**

#### **TestRail:**
- **TESTRAIL_USER**: Seu email do TestRail
- **TESTRAIL_API_KEY**: Vá em TestRail > User Profile > API Keys

#### **Jira:**
- **JIRA_EMAIL**: Seu email do Jira  
- **JIRA_API_TOKEN**: Vá em Jira > Account Settings > Security > API Tokens

### 3. **Teste o script:**
```bash
cd src\scripts
node monthly_automation_report_api.js
```

## 📊 **O que o script faz agora:**

1. **Conecta com TestRail real** 
   - Busca todos os casos do projeto iVision5 (ID: 19)
   - Conta por tipo: Automated, Manual, Not Required
   - Calcula percentual de automação

2. **Conecta com Jira real**
   - Busca epic OPR-3401 e todas as user stories
   - Conta por status: Done, To Do, PO Review, Declined
   - Calcula percentual de progresso

3. **Executa relatório TestRail**
   - Roda o "Ivision Automated Report" (ID: 3)

4. **Salva no banco SQLite**
   - Dados históricos para o dashboard

## 🔒 **Segurança:**
- O arquivo `.env` não vai para o git (já está no .gitignore)
- As credenciais ficam só no seu computador

## ✅ **Agora pode deletar:**
- `monthly_automation_report.js` (dados mockados) ❌
- **Manter:** `monthly_automation_report_api.js` (APIs reais) ✅

## 🧪 **Para testar:**
```bash
# Primeiro configure o .env, depois:
cd C:\Users\Nina\Documents\GitHub\testrailviewer\src\scripts
node monthly_automation_report_api.js
```

**Vai mostrar dados reais do TestRail e Jira!** 🎉
