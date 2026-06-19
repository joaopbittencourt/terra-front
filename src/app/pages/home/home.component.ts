import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import Keycloak from 'keycloak-js';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="home-container">
      <div class="home-card">
        <h1>Bem-vindo ao Terra</h1>
        <p>Para acessar a aplicação é necessário efetuar login.</p>
        <button mat-raised-button color="primary" (click)="login()">Login com Keycloak</button>
      </div>
    </div>
  `,
  styles: [
    `
    .home-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0a0f1a;
      color: #fff;
      background-image: radial-gradient(ellipse at center, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('/logo-foguete.png');
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      background-attachment: fixed;
    }

    .home-card {
      text-align: center;
      padding: 2rem;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      max-width: 420px;
      width: 90%;
    }

    h1 { margin: 0 0 1rem 0; font-size: 1.6rem; }
    p { margin: 0 0 1.5rem 0; }
    button { min-width: 200px; }
    `
  ]
})
export class HomeComponent implements OnInit {
  private readonly keycloak = inject(Keycloak);
  authenticationService = inject(AuthenticationService);
  constructor(private router: Router) {}

  login(): void {
    this.authenticationService.redirectToLoginPage();
  }

  ngOnInit(): void {
  
    if (this.authenticationService.isLoggedIn()) {
      // Já está autenticado: redireciona para dashboard
      this.router.navigate(['/dashboard']);
    }
  }
}
