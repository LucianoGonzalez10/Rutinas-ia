import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { FormularioDatosComponent } from './pages/formulario/formulario-datos.component';
import { EjecucionRutinaComponent } from './pages/ejecucion-rutina/ejecucion-rutina.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { TerminosPoliticasComponent } from './pages/terminos-politicas/terminos-politicas.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'home', component: HomeComponent },
    { path: 'formulario', component: FormularioDatosComponent },
    { path: 'ejecucion', component: EjecucionRutinaComponent },
    { path: 'historial', component: HistorialComponent },
    { path: 'terminos-politicas', component: TerminosPoliticasComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
