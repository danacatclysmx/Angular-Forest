import { Routes } from '@angular/router';
import { EstilosBaseComponent } from './components/estilos-base/estilos-base.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

export const routes: Routes = [
    {path:'estilos-base',component: EstilosBaseComponent},
    {path:'landing',component: LandingPageComponent},
    {path:'',redirectTo: 'landing', pathMatch: 'full'}, 
];
