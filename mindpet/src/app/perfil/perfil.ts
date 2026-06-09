import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // 👈 Se agregó Validators
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {

  private location = inject(Location);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  preview: any = null; // 🔥 SOLO PARA MOSTRAR IMAGEN

perfilForm: FormGroup = this.fb.group({
  nombre: ['', [Validators.required]] // 👈 Le agregamos Validators.required
});

  // 👈 Se agregaron las validaciones solicitadas aquí
  passwordForm: FormGroup = this.fb.group({
    actual: ['', [Validators.required]],
    nueva: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/(?=.*[A-Z])/)
    ]]
  });

  constructor(private router: Router) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user')!);

    if (user) {
      this.perfilForm.patchValue({
        nombre: user.nombre
      });

      this.preview = user.fotoPerfil;
    }
  }

  actualizarPerfil() {

    if (this.perfilForm.invalid) {
    this.perfilForm.markAllAsTouched();
    return;
  }
    const user = JSON.parse(localStorage.getItem('user')!);

    this.authService.actualizarPerfil(user.id, this.perfilForm.value)
      .subscribe({
        next: (res: any) => {

          // 🔥 mantener foto actual
          res.fotoPerfil = this.preview;

          localStorage.setItem('user', JSON.stringify(res));

          Swal.fire({
            icon: 'success',
            title: 'Perfil actualizado',
            timer: 1500,
            showConfirmButton: false
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar perfil'
          });
        }
      });
  }

  cambiarPassword() {
    // 👈 Detiene la ejecución si el formulario no cumple las reglas
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const user = JSON.parse(localStorage.getItem('user')!);

    this.authService.cambiarPassword(user.id, this.passwordForm.value)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            timer: 1500,
            showConfirmButton: false
          });
          this.passwordForm.reset(); // 🔥 Limpia el formulario tras el éxito
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Error al cambiar contraseña'
          });
        }
      });
  }

volver() {
  if (window.history.length > 1) {
    this.location.back();
  } else {
    this.router.navigate(['/home']);
  }
} 

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem('user')!);

    // 👁 preview (NO se guarda en BD)
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result;
    };
    reader.readAsDataURL(file);

    // 📤 subir imagen real
    this.authService.subirFoto(user.id, file).subscribe({
      next: (res: any) => {

        this.preview = res.fotoPerfil; // 🔥 ahora sí URL real

        user.fotoPerfil = res.fotoPerfil;
        localStorage.setItem('user', JSON.stringify(user));

        Swal.fire({
          icon: 'success',
          title: 'Foto actualizada',
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error al subir imagen'
        });
      }
    });
  }
}