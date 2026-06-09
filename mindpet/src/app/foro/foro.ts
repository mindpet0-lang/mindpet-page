import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ForoService } from '../services/foro';
import { Publicacion, Comentario } from '../models/publicacion.model';
import { Location } from '@angular/common';
import { User } from '../models/usuarios.model';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-foro',
  standalone: false,
  templateUrl: './foro.html',
  styleUrls: ['./foro.css']
})
export class Foro implements OnInit {
  // Arreglo donde se guardan las publicaciones
  publicaciones: Publicacion[] = [];
  
  // Variables para la creación de publicaciones
  nuevoContenido: string = '';
  idUsuarioLogueado: number = 1; 
  guardando: boolean = false; 

  // Variables para controlar la eliminación
  publicacionIdParaBorrar: number | null = null;

  // Variables para controlar la edición
  publicacionIdParaEditar: number | null = null;
  contenidoEditado: string = '';

  // Variables menu de perfil
  isMenuOpen = false;
  user: User | null = null;

  // Variables imagenes
  imagenSeleccionada: File | null = null;
  previsualizacionUrl: string | null = null;

  constructor(
    private foroService: ForoService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.cargarUsuarioSesion();
  }

  // Carga el perfil
  cargarUsuarioSesion(): void {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (typeof parsedData === 'object' && parsedData !== null) {
          this.user = parsedData;
          
          if (this.user && this.user.id) {
            this.idUsuarioLogueado = this.user.id; 
          }
        } else {
          this.idUsuarioLogueado = 1; 
        }
      } catch (e) {
        this.idUsuarioLogueado = 1;
      }
    } else {
      this.idUsuarioLogueado = 1;
    }
    
    this.cargarPublicaciones(); 
  }

  // Modulos Menu Perfil
  onProfileClick(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.cdr.detectChanges();
  }

  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isMenuOpen = false;

    Swal.fire({
      icon: 'success',
      title: '¡Hecho!',
      text: `Sesión cerrada correctamente`,
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      window.location.href = '/home';
    });
  }

  // Seleccionar imagen publicación nueva
  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      this.imagenSeleccionada = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        this.previsualizacionUrl = e.target.result;
        this.cdr.detectChanges(); 
      };
      
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  // Seleccionar imagen para comentarios o ediciones (Distingue si es nuevo comentario)
  onComentarioFileSelected(event: any, comOrPub: any, esNuevoComentario: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (esNuevoComentario) {
          (comOrPub as any).comentarioPreviewUrl = e.target.result; // Casteo a any para evitar quejas de TS
        } else {
          (comOrPub as any).previsualizacionUrl = e.target.result;
        }
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(archivo);
    }
  }

  limpiarImagenComentario(comOrPub: any, esNuevoComentario: boolean = false): void {
    if (esNuevoComentario) {
      (comOrPub as any).comentarioPreviewUrl = undefined;
    } else {
      (comOrPub as any).previsualizacionUrl = undefined;
    }
    this.cdr.detectChanges();
  }

  limpiarImagen(): void {
    this.imagenSeleccionada = null;
    this.previsualizacionUrl = null;
    this.cdr.detectChanges();
  }

  // 1. LISTAR PUBLICACIONES
  cargarPublicaciones(): void {
    this.publicaciones = []; 
    this.foroService.getPublicaciones(this.idUsuarioLogueado).subscribe({
      next: (data) => {
        this.publicaciones = data.sort((a, b) => (b.id || 0) - (a.id || 0));
        
        this.publicaciones.forEach(pub => {
          pub.comentarios = pub.comentarios || [];
          (pub as any).nuevoComentarioTexto = ''; 
          (pub as any).comentarioPreviewUrl = undefined; // Inicializado dinámicamente sin romper la interfaz
          if (pub.id) {
            this.foroService.getComentarios(pub.id, this.idUsuarioLogueado).subscribe(coms => {
              pub.comentarios = coms;
              this.cdr.detectChanges();
            });
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  // AGREGAR COMENTARIO
  agregarComentario(pub: any): void {
    if (!pub.nuevoComentarioTexto && !pub.comentarioPreviewUrl) return;

    let contenidoFinal = pub.nuevoComentarioTexto || '';
    if (pub.comentarioPreviewUrl) {
      contenidoFinal += ` [IMG]${pub.comentarioPreviewUrl}[/IMG]`;
    }

    const nuevoCom: Comentario = {
      contenido: contenidoFinal,
      publicacion: { id: pub.id },
      usuario: { id: this.idUsuarioLogueado }
    };

    this.foroService.crearComentario(nuevoCom).subscribe({
      next: (comentarioGuardado) => {
        comentarioGuardado.usuario = {
          id: this.idUsuarioLogueado,
          nombre: this.user?.nombre || 'Usuario Anónimo',
          fotoPerfil: this.user?.fotoPerfil
        };
        comentarioGuardado.totalLikes = 0;
        comentarioGuardado.leDioLike = false;

        if (!pub.comentarios) pub.comentarios = [];
        pub.comentarios.push(comentarioGuardado); 
        
        pub.nuevoComentarioTexto = '';
        pub.comentarioPreviewUrl = undefined; 
        this.cdr.detectChanges();
      }
    });
  }

  darLikeComentario(com: Comentario): void {
    if (!com.id) return;
    this.foroService.alternarLikeComentario(com.id, this.idUsuarioLogueado).subscribe({
      next: (nuevoTotal) => {
        com.totalLikes = nuevoTotal;
        com.leDioLike = !com.leDioLike;
        this.cdr.detectChanges();
      }
    });
  }

  // 2. CREAR (PUBLICAR ORIGINAL)
  publicar(): void {
    if (!this.nuevoContenido.trim() && !this.imagenSeleccionada) return;
    if (this.guardando) return;

    this.guardando = true;
    this.cdr.detectChanges();

    if (this.imagenSeleccionada) {
      this.foroService.subirImagenPublicacion(this.imagenSeleccionada).subscribe({
        next: (res) => {
          const contenidoFinal = `${this.nuevoContenido} [IMG]${res.fotoPerfil}[/IMG]`;
          this.enviarPublicacionAlBackend(contenidoFinal);
        },
        error: (err) => {
          console.error('Error al subir la imagen', err);
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.enviarPublicacionAlBackend(this.nuevoContenido);
    }
  }

  private enviarPublicacionAlBackend(contenido: string): void {
    const nuevaPub: Publicacion = {
      contenido: contenido,
      usuario: { id: this.idUsuarioLogueado }
    };

    this.foroService.crearPublicacion(nuevaPub).subscribe({
      next: (publicacionGuardada) => {
        this.nuevoContenido = '';
        this.limpiarImagen();
        this.guardando = false;

        publicacionGuardada.usuario = {
          id: this.idUsuarioLogueado,
          nombre: this.user?.nombre || 'Usuario Anónimo',
          fotoPerfil: this.user?.fotoPerfil
        };
        
        publicacionGuardada.totalLikes = 0;
        publicacionGuardada.leDioLike = false;

        this.publicaciones.unshift(publicacionGuardada);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al publicar', err);
        this.guardando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // MÉTODOS PARA EXTRACCIÓN DE TEXTO E IMÁGENES
  obtenerTextoLimpio(contenido: string): string {
    if (!contenido) return '';
    if (contenido.includes(' [IMG]')) {
      return contenido.split(' [IMG]')[0];
    }
    return contenido;
  }

  obtenerImagenUrl(contenido: string): string | null {
    if (!contenido) return null;
    // ✨ CORREGIDO: Cambiado 'content.includes' por 'contenido.includes'
    if (contenido.includes('[IMG]') && contenido.includes('[/IMG]')) {
      const inicio = contenido.indexOf('[IMG]') + 5;
      const fin = contenido.indexOf('[/IMG]');
      return contenido.substring(inicio, fin);
    }
    return null;
  }

  // 3. ELIMINAR
  solicitarEliminar(id?: number): void {
    if (!id) return;
    this.publicacionIdParaBorrar = id;
    this.cdr.detectChanges(); 
  }

  cancelarEliminar(): void {
    this.publicacionIdParaBorrar = null;
    this.cdr.detectChanges();
  }

  confirmarEliminar(): void {
    if (!this.publicacionIdParaBorrar) return;

    const idABorrar = this.publicacionIdParaBorrar;

    this.foroService.eliminarPublicacion(idABorrar).subscribe({
      next: () => {
        this.publicacionIdParaBorrar = null;
        this.publicaciones = this.publicaciones.filter(pub => pub.id !== idABorrar);
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al eliminar', err);
        this.publicacionIdParaBorrar = null;
        this.cdr.detectChanges();
      }
    });
  }

  // 4. EDICIÓN DE PUBLICACIONES
  activarEdicion(contenido: string, id?: number): void {
    if (!id) return;
    this.publicacionIdParaEditar = id;

    this.contenidoEditado = this.obtenerTextoLimpio(contenido);
    const pubActual = this.publicaciones.find(p => p.id === id);
    
    if (pubActual) {
      (pubActual as any).previsualizacionUrl = this.obtenerImagenUrl(contenido) || undefined;
    }
    this.cdr.detectChanges();
  }

  cancelarEdicion(): void {
    this.publicacionIdParaEditar = null;
    this.contenidoEditado = '';
    this.cdr.detectChanges();
  }

  guardarEdicion(pub: Publicacion): void {
    let contenidoFinal = this.contenidoEditado;
    
    if ((pub as any).previsualizacionUrl) {
      contenidoFinal += ` [IMG]${(pub as any).previsualizacionUrl}[/IMG]`;
    }

    pub.contenido = contenidoFinal;

    this.foroService.editarPublicacion(pub.id!, pub).subscribe({
      next: () => {
        this.publicacionIdParaEditar = null;
        (pub as any).previsualizacionUrl = undefined;
        this.cdr.detectChanges();
      }
    });
  }

  darLike(pub: Publicacion): void {
    if (!pub.id) return;

    this.foroService.alternarLike(pub.id, this.idUsuarioLogueado).subscribe({
      next: (nuevoTotal) => {
        pub.totalLikes = nuevoTotal;
        pub.leDioLike = !pub.leDioLike;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Error al procesar el like', err)
    });
  }

  // 5. EDICIÓN DE COMENTARIOS
  activarEdicionComentario(com: Comentario): void {
    com.editando = true;
    com.contenidoEditado = this.obtenerTextoLimpio(com.contenido);
    (com as any).previsualizacionUrl = this.obtenerImagenUrl(com.contenido) || undefined;
    this.cdr.detectChanges();
  }

  cancelarEdicionComentario(com: Comentario): void {
    com.editando = false;
    com.contenidoEditado = '';
    (com as any).previsualizacionUrl = undefined;
    this.cdr.detectChanges();
  }

  guardarEdicionComentario(com: Comentario): void {
    let contenidoFinal = com.contenidoEditado || '';
    
    if ((com as any).previsualizacionUrl) {
      contenidoFinal += ` [IMG]${(com as any).previsualizacionUrl}[/IMG]`;
    }

    com.contenido = contenidoFinal;

    this.http.put(`https://backendmindpet-production.up.railway.app/comentarios/${com.id}`, com).subscribe({
      next: () => {
        com.editando = false;
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Error al editar el comentario", err)
    });
  }

  volverAtras(): void {
    this.location.back();
  }
}