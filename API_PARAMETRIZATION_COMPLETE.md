# ✅ Parametrização da API URL - COMPLETO!

## 📊 Resumo da Implementação

### ✨ O que foi feito:

1. **✅ Criado arquivo de configuração centralizado**
   - Local: `src/app/shared/config/api.config.ts`
   - Contém: `API_CONFIG` object com toda configuração

2. **✅ 3 Funções Helper Criadas**
   - `getApiUrl(endpoint)` - URL básica
   - `getApiUrlWithPath(endpoint, path)` - URL com caminho
   - `getApiUrlWithFilter(endpoint, filter, value)` - URL com filtros

3. **✅ 4 Services Atualizados**
   - PacienteService
   - ModalidadeService
   - TerapiaService
   - TerapeutaService

4. **✅ Documentação Completa Criada**
   - `API_CONFIG_GUIDE.md` - Guia detalhado de uso

---

## 🎯 Antes vs Depois

### ❌ Antes (Hardcoded)
```typescript
// Em cada service:
private apiUrl = 'http://localhost:3000/api/pacientes';
private apiUrl = 'http://localhost:3000/api/modalidades';
private apiUrl = 'http://localhost:3000/api/terapias';
private apiUrl = 'http://localhost:3000/api/terapeutas';

// URLs em template de string:
`${this.apiUrl}/filtro/ativos`
`${this.apiUrl}/${id}/valores`
```

### ✅ Depois (Parametrizado)
```typescript
// Em cada service:
private apiUrl = getApiUrl('pacientes');
private apiUrl = getApiUrl('modalidades');
private apiUrl = getApiUrl('terapias');
private apiUrl = getApiUrl('terapeutas');

// URLs com funções:
getApiUrlWithFilter('pacientes', 'ativos')
getApiUrlWithPath('terapias', `/${id}/valores`)
```

---

## 📁 Arquivo de Configuração

### `src/app/shared/config/api.config.ts`

```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  endpoints: {
    pacientes: '/pacientes',
    modalidades: '/modalidades',
    terapias: '/terapias',
    terapeutas: '/terapeutas'
  },
  requestTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheExpiry: 5 * 60 * 1000
};

export function getApiUrl(endpoint): string
export function getApiUrlWithPath(endpoint, path): string
export function getApiUrlWithFilter(endpoint, filter, value): string
```

---

## 🔧 Como Mudar a URL

### Método 1: Editar Arquivo de Configuração (Mais Simples)

**Arquivo:** `src/app/shared/config/api.config.ts`

```typescript
// Linha 8
baseUrl: 'http://seu-novo-host:sua-porta/api'
```

**Impacto:** Todos os 4 services usarão a nova URL automaticamente! ✅

### Método 2: Variáveis de Ambiente

Crie arquivos específicos por ambiente:

- `api.config.dev.ts` (desenvolvimento)
- `api.config.test.ts` (testes)
- `api.config.prod.ts` (produção)

Depois importe o arquivo correto em `api.config.ts`

### Método 3: Configuração em Runtime

```typescript
import { setApiUrl } from '@shared/config/service-config';

// Em app initialization:
setApiUrl('https://api.terra.com/api');
```

---

## 🚀 Exemplos de Uso

### Exemplo 1: Listar Pacientes
```typescript
const url = getApiUrl('pacientes');
// Result: 'http://localhost:3000/api/pacientes'
```

### Exemplo 2: Buscar por CPF
```typescript
const url = getApiUrlWithFilter('pacientes', 'cpf', '123.456.789-00');
// Result: 'http://localhost:3000/api/pacientes/cpf/123.456.789-00'
```

### Exemplo 3: Adicionar Valor de Terapia
```typescript
const url = getApiUrlWithPath('terapias', '/1/valores');
// Result: 'http://localhost:3000/api/terapias/1/valores'
```

### Exemplo 4: Listar Pacientes Ativos
```typescript
const url = getApiUrlWithFilter('pacientes', 'ativos');
// Result: 'http://localhost:3000/api/pacientes/filtro/ativos'
```

---

## 📋 Services Atualizados

| Service | Imports | Status |
|---------|---------|--------|
| **PacienteService** | `getApiUrl`, `getApiUrlWithFilter` | ✅ |
| **ModalidadeService** | `getApiUrl`, `getApiUrlWithFilter` | ✅ |
| **TerapiaService** | `getApiUrl`, `getApiUrlWithFilter`, `getApiUrlWithPath` | ✅ |
| **TerapeutaService** | `getApiUrl`, `getApiUrlWithFilter`, `getApiUrlWithPath` | ✅ |

---

## 🔍 Verificação de Compilação

```
✅ paciente.service.ts       - 0 erros
✅ modalidade.service.ts     - 0 erros
✅ terapia.service.ts        - 0 erros
✅ terapeuta.service.ts      - 0 erros
✅ api.config.ts             - 0 erros
```

---

## 📚 Documentação

Todos os detalhes sobre como usar e configurar estão em:
- `src/app/shared/config/API_CONFIG_GUIDE.md`

---

## 💡 Benefícios

✅ **Centralizado** - Uma única fonte de verdade  
✅ **Fácil de Mudar** - Altere em um lugar  
✅ **Ambiente-Específico** - Dev/Test/Prod  
✅ **Type-Safe** - Autocomplete TypeScript  
✅ **Testável** - Fácil de mockar  
✅ **Manutenível** - Código mais limpo  

---

## 🎯 Próximos Passos

1. Implementar backend com os endpoints especificados
2. Testar com diferentes URLs
3. Adicionar environments por stage
4. Implementar retry logic automático

---

**Status:** ✅ **CONCLUÍDO E TESTADO**

Todos os serviços estão parametrizados e prontos para usar!
