export interface UserRegister {
  nombre: string;
  correo: string;
  contrasena: string;
  fechaNacimiento: string;
  terminos: boolean;
}


export interface LoginRequest {
  correo: string;
  contrasena: string;
}


export interface LoginResponse {
  token: string;
  id: number;
  nombre: string;
  correo: string;
  fotoPerfil?:string;
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  fotoPerfil?: string;
}