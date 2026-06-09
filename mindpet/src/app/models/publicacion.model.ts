export interface Publicacion {
    id?: number;
    contenido: string;
    fechaCreacion?: string;
    usuario: {
        id: number;
        nombre?: string;
        correo?:string;
        fotoPerfil?:string;
        username?: string;
    };

    totalLikes?:  number;
    leDioLike?: boolean;

    comentarios?: Comentario[];
    nuevoComentarioTexto?: string;

    imagenSeleccionada?:File;
    previsualizacionUrl?:string;
    comentarioPreviewUrl?:string;
}

export interface Comentario {
    id?: number ;
    contenido: string;
    fechaCreacion?:string;
    usuario: {
        id:number;
        nombre?:string;
        fotoPerfil?:string;
    };
    publicacion:{id:number};
    totalLikes?: number;
    leDioLike?:boolean;

    editando?:boolean;
    contenidoEditado?:string;
    imagenSeleccionada?:File;
    previsualizacionUrl?:string;
    comentarioPreviewUrl?:string;

}