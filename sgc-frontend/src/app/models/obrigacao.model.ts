export enum StatusObrigacao {
  PENDENTE = 'PENDENTE',
  SUBMETIDA = 'SUBMETIDA',
  APROVADA = 'APROVADA',
  REJEITADA = 'REJEITADA'
}

export interface VinculoHierarquia {
  normaId?: number;
  artigoId?: number;
  incisoId?: number;
  alineaId?: number;
}

export interface ObrigacaoCreate {
  titulo: string;
  descricao?: string;
  prazoExecucao: string; // ISO date string
  responsavelId: number;
  vinculosHierarquia: VinculoHierarquia[];
}

export interface ObrigacaoUpdate {
  titulo?: string;
  descricao?: string;
  prazoExecucao?: string;
  responsavelId?: number;
}

export interface ObrigacaoResponse {
  obrigacaoId: number;
  titulo: string;
  descricao?: string;
  status: StatusObrigacao;
  prazoExecucao: string;
  dataSubmissao?: string;
  dataAprovacao?: string;
  responsavelId: number;
  responsavelNome: string;
  aprovadorId?: number;
  aprovadorNome?: string;
  motivoAprovacao?: string;
  motivoRejeicao?: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface AprovarObrigacao {
  motivoAprovacao?: string;
}

export interface RejeitarObrigacao {
  motivoRejeicao: string;
}
