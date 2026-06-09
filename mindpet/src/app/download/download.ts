import { Component, OnInit } from '@angular/core'; // Añadimos OnInit
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { User } from '../models/usuarios.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-download',
  standalone: false,
  templateUrl: './download.html',
  styleUrl: './download.css',
})
export class Download implements OnInit { // Implementamos OnInit
  isMenuOpen = false;
  
  // 1. Tipamos la variable 'user' usando la interfaz. 
  // Esto hará que TS te avise si usas .email en lugar de .correo
   user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        // 2. Intentamos parsear el JSON
        const parsedData = JSON.parse(userData);
        
        // Verificamos que sea un objeto con la propiedad nombre
        if (typeof parsedData === 'object' && parsedData !== null) {
          this.user = parsedData;
        } else {
          // Si es solo un string (como "laura sofia"), creamos el objeto compatible
          this.user = { id: 0, nombre: userData, correo: 'Sin correo' };
        }
      } catch (e) {
        // 3. Si falla el parseo (texto plano), evitamos el error y asignamos el string
        this.user = { id: 0, nombre: userData, correo: 'Sin correo' };
      }
    } else {
      this.user = { id: 0, nombre: 'Invitado', correo: 'Inicia sesión' };
    }
  }

  onProfileClick() {
    this.isMenuOpen = !this.isMenuOpen;
    console.log('¿Menú abierto?:', this.isMenuOpen);
    console.log('Datos del usuario:', this.user);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

 onLogout() {
  // 1. Limpieza de datos
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.isMenuOpen = false;

  // 2. Alerta y Recarga
  Swal.fire({
    icon: 'success',
    title: '¡Hecho!',
    text: `Sesión cerrada correctamente`,
    timer: 1500,
    showConfirmButton: false
  }).then(() => {
    // 3. Forzar la recarga total a la página de login o inicio
    window.location.href = '/download'; 
    // O si prefieres quedarte en la misma pero limpia:
    // window.location.reload();
  });
}

  onDownload() {
    console.log('Token actual:', localStorage.getItem('token'));
  }
}