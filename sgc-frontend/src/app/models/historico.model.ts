import { StatusObrigacao } from './obrigacao.model';

export interface HistoricoResponse {
  historicoId: number;
  statusAnterior?: StatusObrigacao;
  statusNovo: StatusObrigacao;
  dataMudanca: string;
  usuarioNome?: string;
  observacoes?: string;
}
