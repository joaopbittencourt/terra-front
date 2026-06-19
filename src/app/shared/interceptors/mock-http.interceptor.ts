import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

/**
 * Mock HTTP Interceptor para desenvolvimento local
 * 
 * Ative este interceptor em app.config.ts ao invés do backend real:
 * provideHttpClient(withInterceptors([mockHttpInterceptor]))
 * 
 * Este interceptor simula respostas da API com dados de exemplo.
 * Remova quando o backend estiver pronto.
 */

const MOCK_PACIENTES = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    telefone: '(11) 98765-4321',
    dataNascimento: '1990-05-15',
    convenio: 'Unimed',
    ativo: true,
    endereco: {
      rua: 'Rua A',
      numero: '123',
      complemento: 'Apt 45',
      bairro: 'Vila Mariana',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04014-100'
    }
  }
];

const MOCK_MODALIDADES = [
  { id: '1', modality: 'Fisioterapia', ativo: true },
  { id: '2', modality: 'Fonoaudiologia', ativo: true },
  { id: '3', modality: 'Psicologia', ativo: true }
];

const MOCK_TERAPIAS = [
  {
    id: '1',
    nome: 'Fisioterapia Geral',
    descricao: 'Tratamento de lesões',
    valores: [{ modalidade: 'Fisioterapia', valor: 150 }],
    ativo: true
  }
];

const MOCK_TERAPEUTAS = [
  {
    id: '1',
    nome: 'Ana Silva',
    email: 'ana@example.com',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-1111',
    registroOrgao: 'CREFITO 3/123456',
    terapias: ['1'],
    ativo: true
  }
];

@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Pacientes
    if (request.url.includes('/api/pacientes') && request.method === 'GET' && !request.url.includes('/filtro')) {
      return of(new HttpResponse({ status: 200, body: MOCK_PACIENTES })).pipe(delay(500));
    }

    if (request.url.includes('/api/pacientes/filtro/ativos')) {
      return of(new HttpResponse({ status: 200, body: MOCK_PACIENTES.filter(p => p.ativo) })).pipe(delay(500));
    }

    // Modalidades
    if (request.url.includes('/api/modalidades') && request.method === 'GET' && !request.url.includes('/filtro')) {
      return of(new HttpResponse({ status: 200, body: MOCK_MODALIDADES })).pipe(delay(500));
    }

    if (request.url.includes('/api/modalidades/filtro/ativas')) {
      return of(new HttpResponse({ status: 200, body: MOCK_MODALIDADES.filter(m => m.ativo) })).pipe(delay(500));
    }

    // Terapias
    if (request.url.includes('/api/terapias') && request.method === 'GET' && !request.url.includes('/filtro')) {
      return of(new HttpResponse({ status: 200, body: MOCK_TERAPIAS })).pipe(delay(500));
    }

    if (request.url.includes('/api/terapias/filtro/ativas')) {
      return of(new HttpResponse({ status: 200, body: MOCK_TERAPIAS.filter(t => t.ativo) })).pipe(delay(500));
    }

    // Terapeutas
    if (request.url.includes('/api/terapeutas') && request.method === 'GET' && !request.url.includes('/filtro')) {
      return of(new HttpResponse({ status: 200, body: MOCK_TERAPEUTAS })).pipe(delay(500));
    }

    if (request.url.includes('/api/terapeutas/filtro/ativos')) {
      return of(new HttpResponse({ status: 200, body: MOCK_TERAPEUTAS.filter(t => t.ativo) })).pipe(delay(500));
    }

    // Para todas as outras requisições, use o handler normal
    return next.handle(request);
  }
}
