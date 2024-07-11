interface AuthenticatedUser {
    uid: string; // identificador único del usuario en Firebase
    email: string; // correo electrónico del usuario
    especialistaId?: string; // id del especialista asociado, opcional
    // puedes agregar más propiedades según sea necesario
  }
  