import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-formulario-especialista',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterOutlet, NgIf, AsyncPipe, FormsModule],
  templateUrl: './formulario-especialista.component.html',
  styleUrl: './formulario-especialista.component.css'
})
export class FormularioEspecialistaComponent {

}
