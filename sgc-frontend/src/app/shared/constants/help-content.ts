export interface HelpContent {
  short: string;
  long: string;
}

export const HELP_CONTENT: Record<string, HelpContent> = {
  // Obrigações
  'obrigacao-titulo': {
    short: 'Título da obrigação',
    long: 'Nome identificador da obrigação de compliance. Use um título claro e descritivo (ex: "Relatório Trimestral LGPD", "Auditoria ISO 27001").'
  },
  'obrigacao-descricao': {
    short: 'Descrição detalhada',
    long: 'Informações adicionais sobre a obrigação: o que deve ser feito, como deve ser feito, requisitos específicos, etc. Seja o mais detalhado possível para facilitar o cumprimento.'
  },
  'obrigacao-prazo': {
    short: 'Prazo limite para cumprimento',
    long: 'Data até a qual a obrigação deve ser cumprida. O sistema enviará lembretes automáticos 7 dias, 3 dias e 1 dia antes do vencimento. Após o prazo, a obrigação aparecerá como VENCIDA no dashboard.'
  },
  'obrigacao-status': {
    short: 'Status atual da obrigação',
    long: `<b>PENDENTE</b>: Aguardando início do cumprimento<br>
           <b>EM_ANDAMENTO</b>: Sendo trabalhada atualmente<br>
           <b>CONCLUIDA</b>: Cumprida com sucesso<br>
           <b>VENCIDA</b>: Prazo expirado sem conclusão<br>
           <b>CANCELADA</b>: Obrigação cancelada ou não mais aplicável`
  },
  'obrigacao-responsavel': {
    short: 'Pessoa responsável pelo cumprimento',
    long: 'Usuário designado para garantir o cumprimento da obrigação. O responsável receberá notificações de lembretes e terá permissões especiais para gerenciar a obrigação e suas evidências.'
  },
  'obrigacao-norma': {
    short: 'Norma regulatória associada',
    long: 'Vincule a obrigação a uma ou mais normas (LGPD, ISO 27001, SOX, etc.). Isso facilita relatórios de compliance por norma e garante rastreabilidade completa.'
  },
  'obrigacao-periodicidade': {
    short: 'Frequência de recorrência',
    long: 'Define se a obrigação se repete automaticamente. Opções: UNICA (não se repete), MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL. Ao concluir uma obrigação recorrente, o sistema criará automaticamente a próxima ocorrência.'
  },

  // Evidências
  'evidencia-tipos': {
    short: '3 tipos de evidência disponíveis',
    long: `<b>ARQUIVO</b>: Upload de documentos (PDF, DOCX, XLSX, imagens, etc.). Ideal para relatórios, planilhas, fotos, certificados.<br><br>
           <b>LINK</b>: URL externa para evidências hospedadas em outros sistemas (SharePoint, Google Drive, sistemas corporativos).<br><br>
           <b>TEXTO</b>: Descrição textual livre. Útil para explicações, observações, declarações.`
  },
  'evidencia-upload': {
    short: 'Upload de arquivos',
    long: 'Arraste e solte arquivos ou clique para selecionar. Tamanho máximo: 10MB por arquivo. Formatos aceitos: PDF, DOCX, XLSX, PPTX, JPG, PNG, GIF, TXT, CSV, ZIP.'
  },
  'evidencia-validacao': {
    short: 'Validação de evidências',
    long: 'Evidências podem ser <b>VALIDADAS</b> (aprovadas), <b>REJEITADAS</b> (precisam ser refeitas) ou <b>PENDENTES</b> (aguardando análise). Apenas responsáveis e admins podem validar/rejeitar evidências.'
  },
  'evidencia-descricao': {
    short: 'Descrição da evidência',
    long: 'Explique o conteúdo da evidência: o que está sendo comprovado, contexto, observações importantes. Uma boa descrição facilita auditorias futuras.'
  },

  // Normas
  'norma-nome': {
    short: 'Nome da norma regulatória',
    long: 'Nome oficial da norma (ex: "LGPD - Lei Geral de Proteção de Dados", "ISO 27001:2013", "SOX - Sarbanes-Oxley").'
  },
  'norma-descricao': {
    short: 'Descrição da norma',
    long: 'Resumo do escopo e objetivos da norma. Explique o que ela regula e por que é importante para a organização.'
  },
  'norma-orgao': {
    short: 'Órgão emissor',
    long: 'Entidade que emitiu ou regula a norma (ex: "ANPD", "ISO", "CVM", "BACEN", "ABNT").'
  },
  'norma-link': {
    short: 'Link para documentação oficial',
    long: 'URL para o texto completo da norma ou site oficial. Facilita consultas e mantém a equipe atualizada.'
  },

  // Dashboard
  'dashboard-total': {
    short: 'Total de obrigações cadastradas',
    long: 'Número total de obrigações de compliance no sistema, independente do status.'
  },
  'dashboard-abertas': {
    short: 'Obrigações em aberto',
    long: 'Obrigações com status PENDENTE ou EM_ANDAMENTO. Requerem atenção para serem cumpridas dentro do prazo.'
  },
  'dashboard-vencidas': {
    short: 'Obrigações vencidas',
    long: 'Obrigações que ultrapassaram o prazo sem conclusão. ATENÇÃO: Estas obrigações precisam de ação imediata para minimizar riscos de compliance.'
  },
  'dashboard-taxa': {
    short: 'Taxa de compliance',
    long: 'Percentual de obrigações concluídas no prazo. Calculado como: (Concluídas / Total não canceladas) × 100. Meta recomendada: acima de 90%.'
  },

  // Filtros
  'filtro-status': {
    short: 'Filtrar por status',
    long: 'Selecione um ou mais status para filtrar a lista. Deixe vazio para ver todas as obrigações.'
  },
  'filtro-responsavel': {
    short: 'Filtrar por responsável',
    long: 'Veja apenas obrigações designadas a um usuário específico. Útil para acompanhar trabalho de membros da equipe.'
  },
  'filtro-norma': {
    short: 'Filtrar por norma',
    long: 'Exibe apenas obrigações vinculadas a uma norma específica. Ideal para auditorias por norma (ex: ver todas as obrigações da LGPD).'
  },
  'filtro-prazo': {
    short: 'Filtrar por intervalo de prazo',
    long: 'Selecione data inicial e final para ver obrigações com vencimento nesse período. Útil para planejamento semanal/mensal.'
  },

  // Usuários e Permissões
  'usuario-role': {
    short: 'Perfil de acesso',
    long: `<b>ADMIN</b>: Acesso total ao sistema, gerencia usuários e configurações<br>
           <b>COMPLIANCE_OFFICER</b>: Cria e gerencia obrigações, valida evidências<br>
           <b>RESPONSAVEL</b>: Atualiza obrigações designadas, adiciona evidências<br>
           <b>VISUALIZADOR</b>: Apenas consulta informações, sem edição`
  },

  // Geral
  'busca-global': {
    short: 'Busca global no sistema',
    long: 'Atalho: <kbd>Ctrl+K</kbd> ou <kbd>Cmd+K</kbd>. Busca em obrigações, normas, evidências e usuários. Use para encontrar rapidamente qualquer item.'
  },
  'atalhos-teclado': {
    short: 'Atalhos de teclado disponíveis',
    long: 'Pressione <kbd>?</kbd> ou <kbd>Ctrl+/</kbd> para ver a lista completa de atalhos de teclado e aumentar sua produtividade.'
  },
  'exportar-dados': {
    short: 'Exportar dados',
    long: 'Exporte relatórios em PDF ou XLSX com filtros aplicados. Ideal para auditorias, apresentações e backups.'
  }
};

// FAQs organizadas por tópico
export interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export const FAQS: FAQ[] = [
  {
    category: 'Obrigações',
    question: 'Como criar uma obrigação recorrente?',
    answer: 'Ao criar uma obrigação, selecione a periodicidade desejada (Mensal, Trimestral, Semestral ou Anual). Quando você marcar a obrigação como CONCLUÍDA, o sistema criará automaticamente a próxima ocorrência com o prazo ajustado.'
  },
  {
    category: 'Obrigações',
    question: 'O que acontece quando uma obrigação vence?',
    answer: 'Obrigações vencidas mudam automaticamente para status VENCIDA e aparecem em destaque no dashboard. Responsáveis e admins recebem notificação. Você ainda pode concluir a obrigação após o vencimento, mas ela será marcada como "concluída com atraso".'
  },
  {
    category: 'Obrigações',
    question: 'Posso alterar o responsável de uma obrigação?',
    answer: 'Sim. Compliance Officers e Admins podem reatribuir obrigações a qualquer momento. O novo responsável receberá uma notificação da atribuição.'
  },
  {
    category: 'Evidências',
    question: 'Quantas evidências posso adicionar a uma obrigação?',
    answer: 'Não há limite. Você pode adicionar quantas evidências forem necessárias (arquivos, links, textos) para comprovar o cumprimento da obrigação.'
  },
  {
    category: 'Evidências',
    question: 'Quem pode validar evidências?',
    answer: 'Apenas usuários com perfil COMPLIANCE_OFFICER ou ADMIN podem validar ou rejeitar evidências. O responsável pela obrigação pode adicionar evidências mas não pode validá-las (segregação de funções).'
  },
  {
    category: 'Evidências',
    question: 'Posso excluir uma evidência depois de adicionada?',
    answer: 'Evidências PENDENTES podem ser excluídas pelo autor ou por admins. Evidências já VALIDADAS não podem ser excluídas, apenas inativadas (para manter auditoria).'
  },
  {
    category: 'Normas',
    question: 'Como associar uma norma a uma obrigação?',
    answer: 'Na tela de criar/editar obrigação, use o campo "Normas Associadas" para selecionar uma ou mais normas. Primeiro você precisa cadastrar as normas no menu "Normas".'
  },
  {
    category: 'Normas',
    question: 'Posso criar obrigações sem associar a uma norma?',
    answer: 'Sim, mas não é recomendado. Associar normas facilita relatórios de compliance, auditorias e rastreabilidade. Use normas customizadas para obrigações internas sem regulação externa.'
  },
  {
    category: 'Dashboard',
    question: 'Como melhorar minha taxa de compliance?',
    answer: 'Foque em concluir obrigações antes do prazo, configure lembretes adequados, distribua responsabilidades de forma balanceada e revise semanalmente as obrigações em aberto. Use o dashboard para monitorar tendências.'
  },
  {
    category: 'Dashboard',
    question: 'Com que frequência o dashboard é atualizado?',
    answer: 'Os dados são atualizados em tempo real. Cada ação (criar obrigação, concluir, adicionar evidência) reflete imediatamente nas métricas.'
  },
  {
    category: 'Geral',
    question: 'Como recebo notificações de lembretes?',
    answer: 'O sistema envia lembretes automáticos por email 7, 3 e 1 dia antes do vencimento. Certifique-se de que seu email está atualizado no perfil.'
  },
  {
    category: 'Geral',
    question: 'Posso usar o sistema no celular?',
    answer: 'Sim! O SGC é responsivo e funciona bem em tablets e smartphones. Algumas funcionalidades complexas são otimizadas para desktop.'
  }
];

// Vídeos tutoriais (embeds do YouTube)
export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  youtubeId: string; // ID do vídeo no YouTube
  duration: string;
  category: string;
}

export const VIDEO_TUTORIALS: VideoTutorial[] = [
  {
    id: 'intro-sgc',
    title: 'Introdução ao SGC',
    description: 'Visão geral do sistema e principais funcionalidades',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder - substituir por vídeo real
    duration: '5:30',
    category: 'Início'
  },
  {
    id: 'criar-obrigacao',
    title: 'Como Criar uma Obrigação',
    description: 'Passo a passo para cadastrar obrigações de compliance',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '3:45',
    category: 'Obrigações'
  },
  {
    id: 'adicionar-evidencias',
    title: 'Adicionar e Validar Evidências',
    description: 'Aprenda a anexar evidências e validar cumprimento',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '4:15',
    category: 'Evidências'
  },
  {
    id: 'dashboard-metricas',
    title: 'Entendendo o Dashboard',
    description: 'Interpretação das métricas e KPIs de compliance',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '6:00',
    category: 'Dashboard'
  },
  {
    id: 'relatorios',
    title: 'Gerar Relatórios',
    description: 'Como exportar dados e criar relatórios customizados',
    youtubeId: 'dQw4w9WgXcQ',
    duration: '5:20',
    category: 'Relatórios'
  }
];
