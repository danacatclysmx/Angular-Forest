// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TecnicoComponent } from './components/tecnico/tecnico.component';
import { JefeComponent } from './components/jefe/jefe.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'tecnico', component: TecnicoComponent },
  { path: 'jefe', component: JefeComponent },
  { path: '**', redirectTo: '' } // Manejo de rutas no encontradas
];