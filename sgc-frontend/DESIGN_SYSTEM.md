# Design System SGC - Implementação Completa

## Resumo

Design System profissional implementado para o SGC (Sistema de Gestão de Compliance), inspirado em sistemas enterprise como Atlassian Design System, IBM Carbon e Material Design.

---

## Arquivos Criados

### 1. Design Tokens e Estilos

#### `/src/styles/design-tokens.css`
Sistema de tokens de design com:
- Paleta de cores profissional (Primary #0052CC, Success, Warning, Danger, etc.)
- Escala de cinzas (Neutral 50-1000)
- Tipografia (Font Inter, tamanhos de 12px a 48px)
- Espaçamentos (4px a 64px)
- Border radius (4px a 16px)
- Shadows estilo Material Design
- Z-index para camadas (dropdown, modal, toast, tooltip)
- Classes utilitárias

#### `/src/styles/theme-overrides.scss`
Customização completa do PrimeNG:
- Botões com hover effects e shadows
- Cards com elevação
- Tables estilo enterprise
- Inputs profissionais com focus ring
- Dialogs com backdrop blur
- Toast messages coloridas
- Dropdowns e selects customizados
- Menus e menubar
- Pagination
- Chips e badges
- Progress bar
- Tabs e Accordion
- Panels
- Tooltips

#### `/src/styles.css` (Atualizado)
- Import da fonte Inter (Google Fonts)
- Import dos design tokens
- Import dos theme overrides
- Reset global e base styles
- Customização de scrollbar
- Classes de acessibilidade
- Animações (fadeIn, slideInUp, slideInDown)
- Print styles

---

### 2. Componentes Reutilizáveis

#### `/src/app/shared/components/empty-state.component.ts`
Estado vazio para listas e tabelas
- Input: icon, title, message, actionLabel, actionIcon
- Output: onAction
- Design: ícone grande circular, título, mensagem, botão opcional

#### `/src/app/shared/components/page-header.component.ts`
Cabeçalho de página profissional
- Input: title, subtitle, breadcrumbs
- Content projection para actions (botões)
- Breadcrumbs integrado
- Responsive

#### `/src/app/shared/components/stats-card.component.ts`
Card de estatísticas/métricas
- Input: label, value, icon, color, trend
- 6 cores disponíveis (primary, success, warning, danger, info, secondary)
- Indicador de tendência (up/down) com percentual
- Hover effect com elevação

#### `/src/app/shared/components/status-badge.component.ts`
Badge de status com mapeamento automático
- Input: status, size
- 3 tamanhos (small, medium, large)
- Mapeamento de 20+ status pré-definidos
- Ponto colorido + texto uppercase

Status suportados:
- Obrigações: PENDENTE, EM_ANDAMENTO, CONCLUIDO, ATRASADO, CANCELADO
- Genéricos: ATIVO, INATIVO, APROVADO, REPROVADO, EM_ANALISE, AGUARDANDO
- Documentos: ENVIADO, PROCESSANDO, ERRO, REJEITADO
- Prioridade: BAIXA, MEDIA, ALTA, CRITICA

#### `/src/app/shared/components/confirm-dialog.component.ts`
Dialog de confirmação customizado
- Service: ConfirmDialogService (injectable)
- Config: severity, icon, title, message, acceptLabel, rejectLabel, accept, reject
- Design: ícone grande circular, título centralizado, botões coloridos
- Animação de entrada/saída suave
- 4 severity types: info, warning, danger, success

#### `/src/app/shared/components/search-bar.component.ts`
Barra de pesquisa com autocomplete
- Input: placeholder, suggestions, debounceTime, showClearButton
- Output: onSearch
- Debounce configurável (300ms padrão)
- Autocomplete opcional com sugestões
- Botão de limpar pesquisa
- Ícone de lupa

#### `/src/app/shared/components/breadcrumb.component.ts`
Breadcrumb de navegação
- Input: items, separatorIcon
- BreadcrumbItem: label, route, icon, queryParams
- Home icon automático
- Último item não-clicável
- Separador customizável

---

### 3. Diretivas

#### `/src/app/shared/directives/skeleton-loader.directive.ts`
Skeleton loading state
- Input: appSkeletonLoader (boolean), skeletonHeight, skeletonWidth, skeletonType, skeletonLines
- 3 tipos: text, circle, rectangle
- Animação shimmer
- Auto-inject de estilos CSS

---

### 4. Utilitários e Documentação

#### `/src/app/shared/components/index.ts`
Barrel export de todos os componentes

#### `/src/app/shared/directives/index.ts`
Barrel export de todas as diretivas

#### `/src/app/shared/components/README.md`
Documentação completa:
- Descrição de cada componente
- Props e eventos
- Exemplos de uso
- Design tokens
- Guidelines de acessibilidade
- Guia de manutenção

#### `/src/app/shared/components/design-system-showcase.component.ts`
Componente de demonstração:
- Showcase de todos os componentes
- Exemplos interativos
- Paleta de cores
- Variações de botões
- Grid de stats cards
- Útil para testes e documentação viva

---

## Características do Design System

### Acessibilidade (WCAG 2.1)
- Labels ARIA em todos os componentes
- Navegação por teclado
- Focus indicators visíveis
- Contraste de cores adequado
- Suporte a screen readers
- Classe `.sr-only` para conteúdo oculto visualmente

### Responsividade
- Breakpoints: xs, sm (576px), md (768px), lg (992px), xl (1200px), xxl (1400px)
- Grid PrimeFlex integrado
- Mobile-first approach
- Componentes adaptáveis

### Performance
- Componentes standalone (lazy loading)
- CSS variables (performance superior)
- Debounce em pesquisas
- Animações otimizadas (transform e opacity)

### Consistência
- Design tokens centralizados
- Nomenclatura padronizada
- Espaçamentos consistentes
- Cores semânticas
- Tipografia hierárquica

### Manutenibilidade
- TypeScript strict mode
- Documentação inline
- Exemplos de uso
- Barrel exports
- Componentes desacoplados

---

## Como Usar

### 1. Importar Componentes

```typescript
import {
  EmptyStateComponent,
  PageHeaderComponent,
  StatsCardComponent,
  StatusBadgeComponent
} from '@shared/components';

@Component({
  standalone: true,
  imports: [
    EmptyStateComponent,
    PageHeaderComponent,
    StatsCardComponent,
    StatusBadgeComponent
  ]
})
```

### 2. Usar Design Tokens no CSS

```css
.meu-componente {
  color: var(--color-primary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-size: var(--font-size-base);
}
```

### 3. Exemplo Completo - Dashboard

```html
<app-page-header
  title="Dashboard Compliance"
  subtitle="Visão geral do sistema"
  [breadcrumbs]="breadcrumbs">
  <div actions>
    <button pButton label="Exportar" icon="pi-download" class="p-button-outlined"></button>
  </div>
</app-page-header>

<div class="grid">
  <div class="col-12 md:col-6 lg:col-3">
    <app-stats-card
      label="Total de Obrigações"
      [value]="142"
      icon="pi-file-check"
      color="primary"
      [trend]="{ value: 12, direction: 'up' }">
    </app-stats-card>
  </div>
  <!-- mais stats cards -->
</div>
```

---

## Paleta de Cores

### Primary (Azul Profissional - Atlassian Style)
- Primary: `#0052CC`
- Primary Dark: `#0747A6`
- Primary Light: `#4C9AFF`

### Semantic Colors
- Success: `#00875A` (Verde)
- Warning: `#FF991F` (Laranja)
- Danger: `#DE350B` (Vermelho)
- Info: `#0065FF` (Azul Claro)
- Secondary: `#6554C0` (Roxo)

### Neutral (Escala de Cinzas)
- Neutral 1000: `#091E42` (Mais escuro)
- Neutral 900: `#172B4D`
- Neutral 800: `#344563`
- Neutral 700: `#505F79`
- Neutral 600: `#7A869A`
- Neutral 500: `#A5ADBA`
- Neutral 400: `#C1C7D0`
- Neutral 300: `#DFE1E6`
- Neutral 200: `#EBECF0`
- Neutral 100: `#F4F5F7`
- Neutral 50: `#FAFBFC` (Mais claro)

---

## Tipografia

### Font Family
- Primary: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Mono: `'JetBrains Mono', 'Courier New', monospace`

### Font Sizes
- xs: 12px
- sm: 14px
- base: 16px
- lg: 20px
- xl: 24px
- 2xl: 32px
- 3xl: 40px
- 4xl: 48px

### Font Weights
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Próximos Passos

1. **Testar Componentes**: Use o `DesignSystemShowcaseComponent` para ver todos os componentes em ação
2. **Integrar no App**: Importe os componentes nas páginas existentes
3. **Customizar**: Ajuste os design tokens conforme necessário
4. **Expandir**: Adicione novos componentes seguindo os padrões estabelecidos
5. **Documentar**: Mantenha o README atualizado com novos componentes

---

## Suporte e Manutenção

Para adicionar novos componentes:
1. Crie em `/src/app/shared/components/`
2. Use os design tokens
3. Faça standalone
4. Exporte no `index.ts`
5. Documente no `README.md`
6. Adicione exemplo no `design-system-showcase.component.ts`

---

## Tecnologias

- Angular 17 (Standalone Components)
- PrimeNG 17
- PrimeFlex
- TypeScript
- SCSS + CSS Variables
- Google Fonts (Inter)

---

## Status

✅ Design Tokens: Completo
✅ Theme Overrides: Completo
✅ Componentes Core: 7 componentes implementados
✅ Diretivas: 1 diretiva implementada
✅ Documentação: Completa
✅ Showcase: Completo
✅ Acessibilidade: Implementada
✅ Responsividade: Implementada

**O Design System está 100% funcional e pronto para uso!**
