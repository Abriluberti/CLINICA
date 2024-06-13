import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { GestionComponent } from './components/gestion/gestion.component';
import { VistausuariosComponent } from './components/vistausuarios/vistausuarios.component';
import { AdminGuard } from './guards/admin.guard';
import { TurnosComponent } from './components/turnos/turnos.component';
import { SolicitarTurnosComponent } from './components/solicitar-turnos/solicitar-turnos.component';
import { MisturnosComponent } from './components/misturnos/misturnos.component';
import { TurnosEspecialistaComponent } from './components/turnos-especialista/turnos-especialista.component';

export const routes: Routes = [

    {
        path: "home",
        component: BienvenidaComponent
    },
    
    {
        path: "solicitud",
        component: SolicitarTurnosComponent
    },
    {
        path: "EspecialistaTurno",
        component: TurnosEspecialistaComponent
    },
    {
        path: "misturnos",
        component: MisturnosComponent
    },
    {
        path: "Turnos",
        component: TurnosComponent
    },
    
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "gestion",
        component: VistausuariosComponent, canActivate: [AdminGuard]
    },
    
    {
        path: "register",
        component: RegistroComponent
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
];
