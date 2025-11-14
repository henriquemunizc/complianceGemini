export enum PerfilUsuario {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_COMPLIANCE = 'ROLE_COMPLIANCE',
  ROLE_RESPONSAVEL = 'ROLE_RESPONSAVEL',
  ROLE_VISUALIZADOR = 'ROLE_VISUALIZADOR'
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
}

export interface UsuarioResponse {
  usuarioId: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}
