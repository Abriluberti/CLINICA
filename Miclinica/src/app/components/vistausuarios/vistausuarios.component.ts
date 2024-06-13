import { Component } from '@angular/core';
import { UsuariosComponent } from "../usuarios/usuarios.component";
import { GestionComponent } from "../gestion/gestion.component";
import { EspecialistasComponent } from "../especialistas/especialistas.component";

@Component({
    selector: 'app-vistausuarios',
    standalone: true,
    templateUrl: './vistausuarios.component.html',
    styleUrl: './vistausuarios.component.css',
    imports: [UsuariosComponent, GestionComponent, EspecialistasComponent]
})
export class VistausuariosComponent {

}
