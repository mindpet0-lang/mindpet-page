import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Welcome } from './welcome/welcome';
import { Register } from './register/register';
import { Download } from './download/download';
import { Perfil } from './perfil/perfil';

// 1. Importamos el guard desde la carpeta services
import { authGuard } from './services/auth.guard';
import { Foro } from './foro/foro';

const routes: Routes = [
  { path: "", component: Home },
  { path: 'login', component: Login },
  { path: 'welcome', component: Welcome },
  { path: 'register', component: Register },
  {path: 'perfil',component: Perfil},
  {path: 'foro',component:Foro,canActivate:[authGuard]},

{
  path: 'download',
    component: Download,
      canActivate: [authGuard]
},

{ path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }