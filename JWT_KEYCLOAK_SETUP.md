# JWT e Keycloak - Configuração Completa

## 📋 Visão Geral

Configuração completa de autenticação e autorização usando Keycloak como provedor de identidade e JWT para controle de acesso.

## 🔧 Componentes Implementados

### 1. **JwtService** (`src/app/services/jwt.service.ts`)

Serviço centralizado para gerenciamento de tokens JWT.

**Funcionalidades:**
- Obter token atual
- Decodificar token
- Verificar expiração
- Gerenciar roles do usuário
- Fazer logout

**Exemplo de uso:**
```typescript
constructor(private jwtService: JwtService) {}

ngOnInit() {
  const userId = this.jwtService.getUserId();
  const roles = this.jwtService.getUserRoles();
  const hasAdminRole = this.jwtService.hasRole('admin');
}
```

### 2. **JwtInterceptor** (`src/app/shared/interceptors/jwt.interceptor.ts`)

Interceptador HTTP que adiciona automaticamente o token JWT a todas as requisições.

**Funcionalidades:**
- Adiciona header `Authorization: Bearer <token>`
- Trata erros 401 automaticamente
- Faz refresh do token quando expirado
- Logout automático se refresh falhar

### 3. **AuthGuard** (`src/app/guard/auth.guard.ts`)

Guard de rota para proteger páginas que exigem autenticação.

**Uso em rotas:**
```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }
  }
];
```

### 4. **LoginComponent** (`src/app/pages/login/login.component.ts`)

Componente de login integrado com Keycloak.

## 🚀 Como Usar

### Proteger uma Rota

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] }
  }
];
```

### Obter Informações do Usuário

```typescript
import { JwtService } from './services/jwt.service';

@Component({...})
export class ProfileComponent {
  constructor(private jwtService: JwtService) {}

  ngOnInit() {
    const user = {
      id: this.jwtService.getUserId(),
      username: this.jwtService.getUsername(),
      email: this.jwtService.getEmail(),
      fullName: this.jwtService.getFullName(),
      roles: this.jwtService.getUserRoles()
    };
  }
}
```

### Verificar Permissões

```typescript
if (this.jwtService.hasRole('admin')) {
  // Mostrar painel administrativo
}

if (this.jwtService.hasAnyRole(['editor', 'publisher'])) {
  // Mostrar opções de publicação
}
```

### Token Expirado

O interceptor verifica automaticamente:
- Se o token está expirado
- Se uma requisição retorna 401
- Faz refresh automático

Se o refresh falhar, o usuário é desconectado automaticamente.

## 🔐 Configuração do Keycloak

### Variáveis de Ambiente

**Arquivo:** `keycloak.config.ts`

```typescript
{
  realm: 'terra-app',           // Nome do seu realm
  url: 'http://localhost:8280/keycloak/',  // URL do Keycloak
  clientId: 'terra-app'         // ID do seu cliente
}
```

### Resposta do Token (JWT)

O token contém:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "Usuário Nome",
  "given_name": "Usuário",
  "family_name": "Nome",
  "preferred_username": "username",
  "realm_access": {
    "roles": ["user", "admin"]
  },
  "resource_access": {
    "terra-app": {
      "roles": ["manage-account"]
    }
  },
  "iat": 1234567890,
  "exp": 1234571490
}
```

## 📝 Fluxo de Autenticação

1. **Login**: Usuário clica em "Login com Keycloak"
2. **Redirecionamento**: Redireciona para tela de login do Keycloak
3. **Autenticação**: Keycloak autentica o usuário
4. **Token**: Keycloak retorna um token JWT
5. **Armazenamento**: Token é armazenado
6. **Requisições**: JwtInterceptor adiciona token a cada requisição
7. **Refresh**: Se token expira, interceptor faz refresh automaticamente
8. **Logout**: Usuário é desconectado após falha de refresh

## 🛡️ Segurança

- ✅ Token sempre enviado no header `Authorization`
- ✅ Refresh automático de token
- ✅ Logout automático se refresh falhar
- ✅ Validação de roles em rotas
- ✅ Proteção contra CSRF
- ✅ Token não armazenado em localStorage (SessionStorage via Keycloak)

## 📚 Mais Recursos

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [keycloak-angular GitHub](https://github.com/mauriciovigolo/keycloak-angular)
- [JWT.io](https://jwt.io/)
