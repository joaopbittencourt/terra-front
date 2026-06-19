# 🚀 Quick Start Guide - Services com API Remota

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Verificar Serviços
Os 4 serviços estão em:
```
src/app/shared/services/
├── paciente.service.ts
├── modalidade.service.ts
├── terapia.service.ts
└── terapeuta.service.ts
```

### 2️⃣ Configurar Backend (URL Padrão)
**URL Base:** `http://localhost:3000/api`

Se sua API estiver em outro lugar, edite cada service:
```typescript
// Exemplo: para porta 8080
private apiUrl = 'http://localhost:8080/api/pacientes';
```

### 3️⃣ Usar nos Componentes
```typescript
import { PacienteService } from '@shared/services/paciente.service';

export class MeuComponente {
  pacientes$ = this.service.getAll();
  loading$ = this.service.loading$;
  error$ = this.service.error$;

  constructor(private service: PacienteService) {}
}
```

### 4️⃣ No Template
```html
<div *ngIf="(loading$ | async)">⏳ Carregando...</div>
<div *ngIf="(error$ | async) as error" class="error">
  ❌ {{ error }}
</div>
<mat-table [dataSource]="pacientes$ | async">
  <!-- Colunas -->
</mat-table>
```

---

## 🌐 Endpoints Principais

### Pacientes
```
GET    /api/pacientes              → Listar todos
POST   /api/pacientes              → Criar
PUT    /api/pacientes/123          → Atualizar
DELETE /api/pacientes/123          → Deletar
```

### Modalidades
```
GET    /api/modalidades            → Listar todos
POST   /api/modalidades            → Criar
PUT    /api/modalidades/123        → Atualizar
DELETE /api/modalidades/123        → Deletar
```

### Terapias
```
GET    /api/terapias               → Listar todos
POST   /api/terapias               → Criar
PUT    /api/terapias/123           → Atualizar
DELETE /api/terapias/123           → Deletar
POST   /api/terapias/123/valores   → Adicionar valor
DELETE /api/terapias/123/valores/1 → Remover valor
```

### Terapeutas
```
GET    /api/terapeutas                    → Listar todos
POST   /api/terapeutas                    → Criar
PUT    /api/terapeutas/123                → Atualizar
DELETE /api/terapeutas/123                → Deletar
POST   /api/terapeutas/123/terapias       → Adicionar terapia
DELETE /api/terapeutas/123/terapias/456   → Remover terapia
```

---

## 🧪 Testar sem Backend

### Opção 1: Usar Mock Interceptor
```bash
# Já existe em: src/app/shared/interceptors/mock-http.interceptor.ts
# Retorna dados simulados com delay de 500ms
```

### Opção 2: JSON Server (Rápido!)
```bash
npm install -g json-server

# Crie um arquivo db.json:
{
  "pacientes": [
    { "id": "1", "nome": "João", "cpf": "123.456.789-00" }
  ],
  "modalidades": [
    { "id": "1", "modality": "Fisioterapia", "ativo": true }
  ],
  "terapias": [
    { "id": "1", "nome": "Fisiologia Geral", "ativo": true }
  ],
  "terapeutas": [
    { "id": "1", "nome": "Ana", "ativo": true }
  ]
}

# Rode o server:
json-server --watch db.json --port 3000
```

---

## 📊 Estados Observáveis

Cada service expõe 3 observables principais:

### 1. Dados (Cache)
```typescript
this.service.pacientes$.subscribe(dados => console.log(dados));
```

### 2. Loading
```typescript
this.service.loading$.subscribe(isLoading => {
  if (isLoading) console.log('Carregando...');
});
```

### 3. Erro
```typescript
this.service.error$.subscribe(erro => {
  if (erro) console.error(erro);
});
```

---

## 💾 Operações CRUD

### Criar
```typescript
const novoPaciente = {
  nome: 'João',
  cpf: '123.456.789-00',
  email: 'joao@example.com'
};

this.service.create(novoPaciente).subscribe(resultado => {
  console.log('Criado:', resultado);
});
```

### Ler
```typescript
// Um item
this.service.getById('123').subscribe(paciente => {
  console.log(paciente);
});

// Todos
this.service.getAll().subscribe(todos => {
  console.log(todos);
});
```

### Atualizar
```typescript
const atualizacoes = { nome: 'João Silva' };

this.service.update('123', atualizacoes).subscribe(atualizado => {
  console.log('Atualizado:', atualizado);
});
```

### Deletar
```typescript
this.service.delete('123').subscribe(sucesso => {
  if (sucesso) console.log('Deletado!');
});
```

---

## 🔍 Filtros Especiais

### Pacientes Ativos
```typescript
this.service.getAtivos().subscribe(pacientes => {
  console.log(pacientes);
});
```

### Por CPF
```typescript
this.service.getByCPF('123.456.789-00').subscribe(paciente => {
  console.log(paciente);
});
```

### Por Convênio
```typescript
this.service.getByConvenio('Unimed').subscribe(pacientes => {
  console.log(pacientes);
});
```

---

## ⚙️ Configuração

### Se mudar a porta:
```typescript
// Em cada service
private apiUrl = 'http://localhost:8080/api/pacientes';
```

### Se a API tem prefixo:
```typescript
// Para: http://localhost:3000/api/v1/pacientes
private apiUrl = 'http://localhost:3000/api/v1/pacientes';
```

### Se resposta tem envoltório:
```typescript
// Resposta: { "data": [...], "status": "ok" }
this.http.get<{ data: Paciente[] }>(url).pipe(
  map(response => response.data),
  // ...
)
```

---

## 🐛 Debugging

### Ver todos os dados em cache
```typescript
this.service.getAll().subscribe(dados => {
  console.log('Dados em cache:', dados);
});
```

### Ver estado de loading
```typescript
this.service.loading$.subscribe(isLoading => {
  console.log('Loading:', isLoading);
});
```

### Ver erros
```typescript
this.service.error$.subscribe(erro => {
  if (erro) console.error('Erro:', erro);
});
```

### DevTools do Chrome
1. Abra: `Chrome DevTools → Network`
2. Faça uma ação (criar, atualizar, etc)
3. Procure a requisição para `localhost:3000`
4. Verifique Response e Status

---

## ✅ Checklist

- [ ] Backend rodando em `http://localhost:3000`
- [ ] Endpoints implementados conforme documentação
- [ ] CORS configurado para aceitar `http://localhost:4200`
- [ ] Token JWT incluído nas requisições (se necessário)
- [ ] Services importados nos componentes
- [ ] Observables usados com async pipe no template

---

## 📚 Documentação Completa

Para mais detalhes:
- **API Endpoints:** `src/app/shared/services/API_DOCUMENTATION.md`
- **Guia de Uso:** `src/app/shared/services/SERVICES_SUMMARY.md`
- **Implementação:** `IMPLEMENTATION_COMPLETE.md`

---

## 🚀 Próximos Passos

1. **Conectar no componentes**
   ```bash
   # Abra cada componente e substitua dados hardcoded
   # Injete o service
   # Use async pipe no template
   ```

2. **Testar fluxos**
   - Criar novo item
   - Listar itens
   - Atualizar item
   - Deletar item

3. **Tratar erros**
   - Mostrar toast/snackbar em caso de erro
   - Permitir retry
   - Log de erros

---

## 💡 Dicas

✨ **Use OnPush Change Detection** para melhor performance
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

✨ **Combine múltiplos observables**
```typescript
combined$ = combineLatest([
  this.service.getAll(),
  this.route.params
]);
```

✨ **Unsubscribe automático**
```typescript
export class Component implements OnDestroy {
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

---

**Status:** ✅ PRONTO PARA USAR

Todos os 4 serviços compilam sem erros e estão prontos para consumir sua API remota!
