import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-title>Terra - Sistema de Gestão</mat-card-title>
        <mat-card-content>
          <p *ngIf="!isLoggedIn">Faça login com Keycloak para continuar</p>
          <p *ngIf="isLoggedIn" class="loading">
            <mat-spinner diameter="30"></mat-spinner>
            Redirecionando...
          </p>
        </mat-card-content>
        <mat-card-actions>
          <button
            *ngIf="!isLoggedIn"
            mat-raised-button
            color="primary"
            (click)="login()"
            class="login-button"
          >
            Login com Keycloak
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    mat-card-title {
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1.5rem;
      color: #333;
    }

    mat-card-content {
      text-align: center;
      margin-bottom: 1rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }

    .login-button {
      width: 100%;
      height: 50px;
      font-size: 1rem;
    }
  `]
})
export class LoginComponent implements OnInit {
  isLoggedIn = false;
  private readonly keycloak = inject(Keycloak);
  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  async checkLoginStatus(): Promise<void> {
    this.isLoggedIn = this.keycloak.authenticated

    if (this.isLoggedIn) {
      // Usuário já está logado, redirecionar para dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1500);
    }
  }

  login(): void {
    this.keycloak.login({
      redirectUri: window.location.origin
    });
  }
}
