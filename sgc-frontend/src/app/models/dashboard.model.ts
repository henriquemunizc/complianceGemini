export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean;
}

export interface ObrigacaoAtrasada {
  obrigacaoId: number;
  titulo: string;
  responsavelNome: string;
  prazoExecucao: string;
  diasAtraso: number;
  status: string;
}

export interface Atividade {
  id: number;
  tipo: 'CRIACAO' | 'SUBMISSAO' | 'APROVACAO' | 'REJEICAO';
  descricao: string;
  usuarioNome: string;
  usuarioAvatar?: string;
  timestamp: string;
  obrigacaoId?: number;
  obrigacaoTitulo?: string;
}

export interface StatusCount {
  status: string;
  count: number;
  color: string;
}

export interface ResponsavelCount {
  responsavelNome: string;
  pendentes: number;
  submetidas: number;
  aprovadas: number;
  rejeitadas: number;
  total: number;
}

export interface TendenciaData {
  data: string;
  criadas: number;
  aprovadas: number;
  rejeitadas: number;
  submetidas: number;
}

export type PeriodoFiltro = 'HOJE' | 'ULTIMOS_7_DIAS' | 'ULTIMOS_30_DIAS' | 'ESTE_MES';
