import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    {
        path: 'landing',
        component: LandingPageComponent,
    },
    {
        path: 'login',
        component: LoginPageComponent,
    },
];
