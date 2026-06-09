import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRegister } from '../models/usuarios.model';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/usuarios.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private API_URL = 'https://backendmindpet-production.up.railway.app/usuarios';


  constructor(private http: HttpClient) { }

  register(userData: UserRegister): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        // Guardamos el token en el almacenamiento local del navegador
        localStorage.setItem('token', res.token);
        
        const userData = {
        id: res.id,
        nombre: res.nombre,
        correo: res.correo,
        fotoPerfil: res.fotoPerfil
      };

        localStorage.setItem('user', JSON.stringify(userData));
      })
    );
  }

  // Método extra para saber si está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  actualizarPerfil(id: number, data: any) {
  return this.http.put(`${this.API_URL}/${id}/perfil`, data);
}

cambiarPassword(id: number, data: any) {
  return this.http.put(`${this.API_URL}/${id}/password`, data);
}

subirFoto(id: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return this.http.post(`https://backendmindpet-production.up.railway.app/usuarios/${id}/foto`, formData);
}

}
