import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion,Comentario } from '../models/publicacion.model';

@Injectable({
  providedIn: 'root'
})
export class ForoService {
  private apiUrl = 'https://backendmindpet-production.up.railway.app/api/publicaciones';

  constructor(private http: HttpClient) { }

  getPublicaciones(usuarioId: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}?usuarioIdActual=${usuarioId}`);
  }

  crearPublicacion(publicacion: Publicacion): Observable<Publicacion> {
    return this.http.post<Publicacion>(this.apiUrl, publicacion);
  }
  
  eliminarPublicacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  editarPublicacion(id: number, publicacion: Publicacion): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion);
  }

  alternarLike(publicacionId: number, usuarioId: number): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/${publicacionId}/like?usuarioId=${usuarioId}`, {});
  }

  subirImagenPublicacion(file: File): Observable<{ fotoPerfil: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Usamos el endpoint existente de subir fotos que ya tienes configurado en tu backend
    return this.http.post<{ fotoPerfil: string }>(`https://backendmindpet-production.up.railway.app/usuarios/1/foto`, formData);
  }

  //conexion comentarios

  getComentarios(pubId: number, usuarioId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`https://backendmindpet-production.up.railway.app/comentarios/publicacion/${pubId}?usuarioId=${usuarioId}`);
  }

  crearComentario(comentario: Comentario): Observable<Comentario> {
    return this.http.post<Comentario>(`https://backendmindpet-production.up.railway.app/comentarios`, comentario);
  }

  alternarLikeComentario(comentarioId: number, usuarioId: number): Observable<number> {
    return this.http.post<number>(`https://backendmindpet-production.up.railway.app/comentarios/${comentarioId}/like?usuarioId=${usuarioId}`, {});
  }
  
}