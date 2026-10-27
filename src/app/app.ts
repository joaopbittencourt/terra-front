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
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ProfileDialogComponent } from './shared/profile-dialog/profile-dialog';

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
    MatCardModule,
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
  private dialog = inject(MatDialog);

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
  
  hasRoles(roles: string[]): boolean {
    return this.auth.hasRoles(roles);
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }
  
  logout(): void {
    this.auth.logout();
    // Após logout, garante que volte para a home pública
    setTimeout(() => this.router.navigate(['/']), 200);
  }

  getUserName(): string {
    return this.auth.name || this.auth.userName || '';
  }

  openProfile(): void {
    this.dialog.open(ProfileDialogComponent, {
      width: '400px',
      maxWidth: 'calc(100vw - 32px)',
      data: { name: this.auth.name || this.auth.userName, email: this.auth.email }
    }).afterClosed().subscribe(result => {
      if (result === 'logout') this.logout();
    });
  }
}
