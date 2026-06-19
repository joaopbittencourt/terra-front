import { Component, Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root' // Garante que seja uma instância única para toda a aplicação
})
export class NotificationService {
  // Usando o inject() do Angular moderno (ou você pode usar o constructor tradicional)
  private snackBar = inject(MatSnackBar); 

  // Configuração padrão do SnackBar
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'bottom',
  };

  // Método para mensagens de sucesso
  showSuccess(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['snackbar-success'] // Classe CSS customizada
    });
  }

  // Método para mensagens de erro
  showError(message: string, action: string = 'OK'): void {
    this.snackBar.open(message, action, {
      ...this.defaultConfig,
      panelClass: ['snackbar-error'],
      duration: 5000 // Erros costumam ficar mais tempo na tela
    });
  }

  // Método genérico para mensagens informativas
  showInfo(message: string, action: string = 'Fechar'): void {
    this.snackBar.open(message, action, this.defaultConfig);
  }
}