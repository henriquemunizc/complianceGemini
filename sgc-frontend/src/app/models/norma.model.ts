export interface NormaCreate {
  tipo: string;
  numero: string;
  ano: number;
  ementa: string;
  dataPublicacao: string;
  dataRevogacao?: string;
  linkOficial?: string;
}

export interface NormaUpdate {
  ementa?: string;
  dataPublicacao?: string;
  dataRevogacao?: string;
  linkOficial?: string;
}

export interface NormaResponse {
  normaId: number;
  tipo: string;
  numero: string;
  ano: number;
  ementa: string;
  dataPublicacao: string;
  dataRevogacao?: string;
  linkOficial?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}
