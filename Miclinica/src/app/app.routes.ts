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
import { FondoRegistroComponent } from './components/fondo-registro/fondo-registro.component';
import { RegistroEspecialistaComponent } from './components/registro-especialista/registro-especialista.component';
import { MiperfilComponent } from './components/miperfil/miperfil.component';
import { EncuestaComponent } from './components/encuesta/encuesta.component';
import { HistoriaClinica } from './clases/historia-clinica';
import { PacientesComponent } from './components/pacientes/pacientes.component';
import { GraficosComponent } from './components/graficos/graficos.component';
import { LogIngresosComponentComponent } from './components/log-ingresos-component/log-ingresos-component.component';
import { GraficoTurnosPorDiaComponentComponent } from './components/grafico-turnos-por-dia-component/grafico-turnos-por-dia-component.component';
import { GraficoTurnosPorMedicoComponent } from './grafico-turnos-por-medico/grafico-turnos-por-medico.component';
import { GraficoTurnossPorMedicoComponent } from './components/grafico-turnoss-por-medico/grafico-turnoss-por-medico.component';
import { GraficoTurnosFinalizadosComponent } from './components/grafico-turnos-finalizados/grafico-turnos-finalizados.component';
import { GraficosAdminComponent } from './components/graficos-admin/graficos-admin.component';
import { PacientesEspecialistasComponent } from './components/pacientes-especialistas/pacientes-especialistas.component';


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
        path: "go",
        component: GraficoTurnossPorMedicoComponent
    },
    {
        path: "go",
        component: GraficoTurnossPorMedicoComponent
    },
    {
        path: "fin",
        component: GraficoTurnosFinalizadosComponent
    },
    {
        path: "EspecialistaTurno",
        component: TurnosEspecialistaComponent
    },
    {
        path: "HistoriaClinica",
        component: HistoriaClinica
    },
    {
        path: "Graficoss",
        component: GraficosAdminComponent
    },
    {
        path: "graf",
        component: GraficoTurnosPorDiaComponentComponent
    },
    {
        path: "graficos-login",
        component: LogIngresosComponentComponent
    },
    {
        path: "Graficos",
        component: GraficosComponent
    },
    {
        path: "pacientes",
        component: PacientesEspecialistasComponent
    },
  
    {
        path: "encuesta",
        component: EncuestaComponent
    },
    {
        path: "regis",
        component: FondoRegistroComponent
    },
    {
        path: "miperfil",
        component: MiperfilComponent
    },
    {
        path: "regespecialista",
        component: RegistroEspecialistaComponent
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
