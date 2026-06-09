import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './login/login';
import { Home } from './home/home';
import { Welcome } from './welcome/welcome';
import { Register } from './register/register';
import { Download } from './download/download';
import { Perfil } from './perfil/perfil';
import { Foro} from './foro/foro';


@NgModule({
  declarations: [
    App,
    Home,
    Login,
    Welcome,
    Register,
    Download,
    Perfil,
    Foro,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
  ],
  bootstrap: [App]
})
export class AppModule { }
