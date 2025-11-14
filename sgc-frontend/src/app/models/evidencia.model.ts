export enum TipoEvidencia {
  ARQUIVO = 'ARQUIVO',
  LINK = 'LINK',
  TEXTO = 'TEXTO'
}

export interface EvidenciaCreate {
  descricao?: string;
  urlExterna?: string;
  conteudoTexto?: string;
}

export interface EvidenciaResponse {
  evidenciaId: number;
  tipo: TipoEvidencia;
  descricao?: string;
  nomeArquivoOriginal?: string;
  caminhoArquivo?: string;
  tamanhoBytes?: number;
  mimeType?: string;
  urlExterna?: string;
  conteudoTexto?: string;
  dataSubmissao: string;
  ativo: boolean;
}
