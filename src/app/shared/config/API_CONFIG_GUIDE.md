# 🔧 Guia de Configuração da API Parametrizada

## 📋 Visão Geral

A `apiUrl` foi **parametrizada** e centralizada em um arquivo de configuração único. Isso permite mudar a URL da API em um único lugar sem precisar editar vários arquivos.

---

## 📁 Arquivo de Configuração

**Localização:** `src/app/shared/config/api.config.ts`

### Estrutura

```typescript
export const API_CONFIG = {
  // Base URL da API
  baseUrl: 'http://localhost:3000/api',
  
  // Endpoints específicos
  endpoints: {
    pacientes: '/pacientes',
    modalidades: '/modalidades',
    terapias: '/terapias',
    terapeutas: '/terapeutas'
  },
  
  // Timeouts (em ms)
  requestTimeout: 30000,
  
  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Cache configuration
  cacheExpiry: 5 * 60 * 1000 // 5 minutos
};
```

---

## 🔗 Funções Disponíveis

### 1. `getApiUrl(endpoint)`

Retorna a URL completa para um endpoint específico.

**Uso:**
```typescript
import { getApiUrl } from '@shared/config/api.config';

const urlPacientes = getApiUrl('pacientes');
// Resultado: 'http://localhost:3000/api/pacientes'

const urlModalidades = getApiUrl('modalidades');
// Resultado: 'http://localhost:3000/api/modalidades'
```

### 2. `getApiUrlWithPath(endpoint, path)`

Retorna a URL com um caminho adicional.

**Uso:**
```typescript
import { getApiUrlWithPath } from '@shared/config/api.config';

// Para buscar um paciente específico
const url = getApiUrlWithPath('pacientes', '/123');
// Resultado: 'http://localhost:3000/api/pacientes/123'

// Para um valor de terapia
const url = getApiUrlWithPath('terapias', '/1/valores');
// Resultado: 'http://localhost:3000/api/terapias/1/valores'
```

### 3. `getApiUrlWithFilter(endpoint, filter, value)`

Retorna a URL com filtros.

**Uso:**
```typescript
import { getApiUrlWithFilter } from '@shared/config/api.config';

// Filtro sem valor (ex: /pacientes/filtro/ativos)
const urlAtivos = getApiUrlWithFilter('pacientes', 'ativos');
// Resultado: 'http://localhost:3000/api/pacientes/filtro/ativos'

// Filtro com valor (ex: /pacientes/cpf/123.456.789-00)
const urlCPF = getApiUrlWithFilter('pacientes', 'cpf', '123.456.789-00');
// Resultado: 'http://localhost:3000/api/pacientes/cpf/123.456.789-00'

// Filtro com convenio
const urlConvenio = getApiUrlWithFilter('pacientes', 'convenio', 'Unimed');
// Resultado: 'http://localhost:3000/api/pacientes/convenio/Unimed'
```

---

## 🎯 Como Usar nos Services

Todos os serviços foram atualizados para usar as funções de configuração:

### Exemplo: PacienteService

```typescript
import { getApiUrl, getApiUrlWithFilter } from '@shared/config/api.config';

@Injectable()
export class PacienteService {
  // Na inicialização
  private apiUrl = getApiUrl('pacientes');
  
  // Para endpoints GET básicos
  getAll(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }
  
  // Para filtros
  getAtivos(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(getApiUrlWithFilter('pacientes', 'ativos'));
  }
  
  // Para busca específica
  getByCPF(cpf: string): Observable<Paciente | null> {
    return this.http.get<Paciente>(getApiUrlWithFilter('pacientes', 'cpf', cpf));
  }
}
```

### Exemplo: TerapiaService

```typescript
import { getApiUrl, getApiUrlWithPath } from '@shared/config/api.config';

@Injectable()
export class TerapiaService {
  private apiUrl = getApiUrl('terapias');
  
  // Para operações em subitems
  addValor(terapiaId: string, valor: TerapiaValor) {
    return this.http.post(
      getApiUrlWithPath('terapias', `/${terapiaId}/valores`),
      valor
    );
  }
  
  removeValor(terapiaId: string, modalidade: string) {
    return this.http.delete(
      getApiUrlWithPath('terapias', `/${terapiaId}/valores/${modalidade}`)
    );
  }
}
```

---

## 🔄 Como Mudar a URL da API

### Opção 1: Mudar o `baseUrl`

**Arquivo:** `src/app/shared/config/api.config.ts`

```typescript
// Desenvolvimento Local
baseUrl: 'http://localhost:3000/api'

// Ambiente de Teste
baseUrl: 'https://api-test.terra.com/api'

// Produção
baseUrl: 'https://api.terra.com/api'
```

**Impacto:** Todos os 4 serviços usarão a nova URL automaticamente.

### Opção 2: Usar Variáveis de Ambiente

Crie um arquivo de configuração por ambiente:

**`src/app/shared/config/api.config.dev.ts`**
```typescript
export const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  // ... resto da config
};
```

**`src/app/shared/config/api.config.prod.ts`**
```typescript
export const API_CONFIG = {
  baseUrl: 'https://api.terra.com/api',
  // ... resto da config
};
```

**`src/app/shared/config/api.config.ts`**
```typescript
import { environment } from '@env/environment';

export const API_CONFIG = environment.apiConfig;
```

### Opção 3: Configuração Dinâmica

Para definir a URL em runtime:

```typescript
// service-config.ts
let API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  // ... resto
};

export function setApiUrl(newUrl: string) {
  API_CONFIG.baseUrl = newUrl;
}

export function getApiConfig() {
  return API_CONFIG;
}
```

**Uso:**
```typescript
// main.ts ou app.config.ts
import { setApiUrl } from '@shared/config/service-config';

setApiUrl('https://api.terra.com/api');
```

---

## 📊 Estrutura dos Services Atualizados

### Services Usando `getApiUrl`
- ✅ PacienteService
- ✅ ModalidadeService
- ✅ TerapiaService
- ✅ TerapeutaService

### Todos com:
- `getApiUrl()` - URL base
- `getApiUrlWithFilter()` - URLs com filtros
- `getApiUrlWithPath()` - URLs com caminhos adicionais

---

## 🚀 Exemplos de Uso Completo

### Exemplo 1: Listar Todos os Pacientes

```typescript
import { getApiUrl } from '@shared/config/api.config';

// No service:
private apiUrl = getApiUrl('pacientes');

getAll(): Observable<Paciente[]> {
  return this.http.get<Paciente[]>(this.apiUrl);
}

// No componente:
export class PacientesComponent {
  pacientes$ = this.service.getAll();
}
```

**URL Resultante:** `http://localhost:3000/api/pacientes`

### Exemplo 2: Buscar Paciente por CPF

```typescript
import { getApiUrlWithFilter } from '@shared/config/api.config';

getByCPF(cpf: string): Observable<Paciente | null> {
  return this.http.get<Paciente>(getApiUrlWithFilter('pacientes', 'cpf', cpf));
}

// Uso
this.service.getByCPF('123.456.789-00');
```

**URL Resultante:** `http://localhost:3000/api/pacientes/cpf/123.456.789-00`

### Exemplo 3: Adicionar Valor a Terapia

```typescript
import { getApiUrlWithPath } from '@shared/config/api.config';

addValor(terapiaId: string, valor: TerapiaValor): Observable<Terapia> {
  return this.http.post<Terapia>(
    getApiUrlWithPath('terapias', `/${terapiaId}/valores`),
    valor
  );
}

// Uso
this.service.addValor('1', { modalidade: 'Fisioterapia', valor: 150 });
```

**URL Resultante:** `http://localhost:3000/api/terapias/1/valores`

---

## 🔍 Debugging

### Ver a URL Sendo Usada

```typescript
import { getApiUrl } from '@shared/config/api.config';

const url = getApiUrl('pacientes');
console.log('URL:', url);
// Output: URL: http://localhost:3000/api/pacientes
```

### Ver Todas as Configurações

```typescript
import { API_CONFIG } from '@shared/config/api.config';

console.log('API Config:', API_CONFIG);
// Output completo da configuração
```

---

## ✅ Benefícios da Parametrização

| Benefício | Descrição |
|-----------|-----------|
| **Centralizado** | Uma única fonte de verdade para URLs |
| **Fácil Manutenção** | Mude em um lugar, afeta todos os services |
| **Ambiente-Específico** | Diferentes URLs por dev/test/prod |
| **Type-Safe** | Autocomplete no TypeScript |
| **Reusável** | Compartilhado entre todos os services |
| **Testável** | Fácil mockar em testes |

---

## 📝 Próximos Passos

1. **Adicionar Configuração de Ambientes**
   - Criar arquivos para dev, test, prod

2. **Implementar Environment Variables**
   - Usar `environment.ts` do Angular

3. **Adicionar Logging**
   - Log de todas as URLs sendo chamadas

4. **Implementar Retry Logic**
   - Usar `retryAttempts` da configuração

5. **Implementar Caching**
   - Usar `cacheExpiry` da configuração

---

## 📚 Referências

- [Angular HttpClient Docs](https://angular.io/guide/http)
- [Angular Environments](https://angular.io/guide/build)
- [Configuration Management](https://angular.io/guide/config)

---

**Criado em:** 20 de novembro de 2025  
**Status:** ✅ Parametrização Completa
