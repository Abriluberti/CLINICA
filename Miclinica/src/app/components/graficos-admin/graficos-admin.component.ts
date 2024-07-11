import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  keyframes
} from '@angular/animations';
import { LowerCasePipe } from '../../pipe/lowercase.pipe';
import { RandomBackgroundDirective } from '../../directives/random-background.directive';
import { ChangeBackgroundHoverDirective } from '../../directives/change-background-hover.directive';

@Component({
  selector: 'app-graficos-admin',
  standalone: true,
  imports: [LowerCasePipe, RandomBackgroundDirective, ChangeBackgroundHoverDirective],
  templateUrl: './graficos-admin.component.html',
  styleUrl: './graficos-admin.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('0.5s ease-in-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in-out', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class GraficosAdminComponent {
  constructor(private router: Router) {}

  navigateTo(destination: string): void {
    switch (destination) {
      case 'log-ingresos':
        this.router.navigate(['/graficos-login']);
        break;
      case 'turnos-especialidad':
        this.router.navigate(['/Graficos']);
        break;
      case 'turnos-dia':
        this.router.navigate(['/graf']);
        break;
      case 'turnos-medico':
        this.router.navigate(['/go']);
        break;
      case 'turnos-finalizados':
        this.router.navigate(['/fin']);
        break;
      default:
        break;
    }
  }
}