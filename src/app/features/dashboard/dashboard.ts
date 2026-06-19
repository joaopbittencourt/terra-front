import { Component, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification/notification';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private notificationsService = inject(NotificationService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      
      if (params['error'] === 'accessDenied') {
        this.notificationsService.showError('Acesso negado. Você não tem permissão para acessar este recurso.');
      }
    });
  }

}
