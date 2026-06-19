# 🔍 Guia de DEBUG - Token Bearer não está sendo adicionado

## ✅ O que foi implementado:

### 1. **URLs Relativas Suportadas** (app.config.ts, linha 19-27)
- Adicionado suporte para URLs relativas (`/api/...`)
- Adicionado suporte para URLs absolutas (`http://localhost:3000` e `http://localhost:4200`)
- Adicionados métodos HTTP faltantes: PUT, DELETE, PATCH

### 2. **Debug Interceptor** (shared/interceptors/debug-bearer.interceptor.ts)
- Registra TODAS as requisições HTTP no console
- Mostra se cada requisição tem o header `Authorization`
- Mostra a URL completa e se é relativa ou absoluta

### 3. **Force Token Interceptor** (shared/interceptors/force-token.interceptor.ts)
- Interceptor alternativo mais agressivo
- Força token em TODAS as requisições `/api/`
- Use apenas se o interceptor padrão não funcionar

---

## 🧪 Como Debugar:

### Passo 1: Abra o DevTools (F12)
1. Acesse seu aplicação em `http://localhost:4200`
2. Pressione `F12` para abrir Developer Tools
3. Vá para a aba **Console**

### Passo 2: Procure pelos logs de DEBUG
- Procure por mensagens com 🔍 emoji (ex: "🔍 DEBUG: GET /api/pacientes")
- Veja se aparece "❌ SEM TOKEN" ou "✅ Authorization Header"

### Passo 3: Verifique as requisições na Network Tab
1. Abra **Network** tab no DevTools
2. Faça uma requisição de API
3. Clique na requisição e vá para **Headers**
4. Procure por `Authorization` na seção **Request Headers**

---

## 🔧 Cenários Possíveis e Soluções:

### ❌ Cenário 1: "❌ SEM TOKEN" no console
**Causa**: Token não está sendo adicionado
**Soluções**:
1. Verifique se está autenticado no Keycloak
2. Verifique se o Keycloak está retornando um token válido
3. Teste o interceptor alternativo (force-token.interceptor)

### ❌ Cenário 2: URL está "relativa" mas ainda sem token
**Causa**: A regex pode ainda estar com problema
**Solução**:
1. Descomente a linha do `forceTokenInterceptor` em app.config.ts (linha 36)
2. Comente a linha do `includeBearerTokenInterceptor` (linha 34)
3. Recarregue a aplicação

### ❌ Cenário 3: Token aparece no console mas não na Network Tab
**Causa**: Outro interceptor pode estar removendo ou sobrescrevendo
**Soluções**:
1. Verifique se há outro interceptor conflitante
2. Confira a ordem dos interceptadores em app.config.ts

### ✅ Cenário 4: Token aparece na Network Tab
**Status**: ✅ SUCESSO! Token está sendo adicionado corretamente
**Ação**: Remova os interceptadores de debug (linhas 33-36 em app.config.ts)

---

## 📝 Próximos Passos:

### Se o token ESTÁ sendo adicionado:
1. Remove { debugBearerInterceptor } de provideHttpClient()
2. Remove { forceTokenInterceptor } (se está usando)
3. Commit das mudanças

### Se o token NÃO está sendo adicionado:
1. Teste com `forceTokenInterceptor` descomentado
2. Verifique os logs no console do browser
3. Verifique se Keycloak está retornando token válido
4. Teste manualmente em curl:
   ```bash
   curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:3000/api/pacientes
   ```

---

## 🐛 Possíveis Problemas Adicionais:

1. **Keycloak não está inicializado corretamente**
   - Verifique em console: `keycloak` deve estar definido
   - Verifique se `keycloak.authenticated` retorna `true`

2. **Token expirou**
   - O `AutoRefreshTokenService` deve renovar automaticamente
   - Mas o token pode ter expirado DURANTE a requisição

3. **CORS bloqueando**
   - Verifique erro CORS no console
   - Pode ser necessário configurar CORS no backend

4. **Proxy.conf.json interferindo**
   - O proxy redireciona `/api/**` para `localhost:3000`
   - Mas a URL enviada ao interceptor pode ser diferente

---

## 📊 Checklist de Verificação:

- [ ] DevTools Console aberto (F12)
- [ ] Está autenticado no Keycloak
- [ ] Vê logs 🔍 DEBUG no console
- [ ] Vê "Authorization Header:" com valor (não "❌ SEM TOKEN")
- [ ] Network Tab mostra header Authorization
- [ ] Network Tab mostra status 200 (não 401/403)
- [ ] Backend recebe e valida o token corretamente
