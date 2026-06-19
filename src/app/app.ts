import { Component, ViewChild, inject } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    HttpClientModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Terra';
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private auth = inject(AuthenticationService);
  private router = inject(Router);

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
  
  logout(): void {
    this.auth.logout();
    // Após logout, garante que volte para a home pública
    setTimeout(() => this.router.navigate(['/']), 200);
  }

  getUserName(): string {
    return this.auth.userName || '';
  }
}
