# Design System - Componentes Reutilizáveis

Este diretório contém os componentes do Design System do SGC, inspirados em sistemas enterprise como Atlassian, IBM Carbon e Material Design.

## Componentes Disponíveis

### 1. EmptyStateComponent

Componente para exibir estados vazios em listas, tabelas e pesquisas sem resultados.

**Uso:**
```typescript
import { EmptyStateComponent } from '@shared/components';

@Component({
  imports: [EmptyStateComponent]
})
```

**Exemplo:**
```html
<app-empty-state
  icon="pi-inbox"
  title="Nenhuma obrigação cadastrada"
  message="Comece criando sua primeira obrigação clicando no botão abaixo"
  actionLabel="Nova Obrigação"
  (onAction)="criarObrigacao()">
</app-empty-state>
```

**Props:**
- `icon` (string): Ícone PrimeIcons (ex: 'pi-inbox')
- `title` (string): Título principal
- `message` (string): Mensagem descritiva
- `actionLabel` (string, opcional): Label do botão de ação
- `actionIcon` (string, default: 'pi-plus'): Ícone do botão
- `onAction` (EventEmitter): Evento disparado ao clicar no botão

---

### 2. PageHeaderComponent

Cabeçalho de página com título, subtitle, breadcrumbs e área para ações.

**Uso:**
```typescript
import { PageHeaderComponent } from '@shared/components';

breadcrumbs = [
  { label: 'Compliance', route: '/compliance' },
  { label: 'Obrigações' }
];
```

**Exemplo:**
```html
<app-page-header
  title="Gestão de Obrigações"
  subtitle="Gerencie todas as obrigações fiscais da empresa"
  [breadcrumbs]="breadcrumbs">
  <div actions>
    <button pButton label="Exportar" icon="pi-download" class="p-button-outlined"></button>
    <button pButton label="Nova Obrigação" icon="pi-plus"></button>
  </div>
</app-page-header>
```

**Props:**
- `title` (string): Título da página
- `subtitle` (string, opcional): Subtítulo
- `breadcrumbs` (Breadcrumb[], opcional): Array de breadcrumbs

**Content Projection:**
- `[actions]`: Área para botões e ações no canto direito

---

### 3. StatsCardComponent

Card para exibir métricas e estatísticas com ícone, valor e indicador de tendência.

**Uso:**
```typescript
import { StatsCardComponent } from '@shared/components';
```

**Exemplo:**
```html
<app-stats-card
  label="Total de Obrigações"
  [value]="142"
  icon="pi-file-check"
  color="primary"
  [trend]="{ value: 12, direction: 'up' }">
</app-stats-card>
```

**Props:**
- `label` (string): Label/descrição
- `value` (number | string): Valor a exibir
- `icon` (string): Ícone PrimeIcons
- `color` ('primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'): Cor do tema
- `trend` (StatsTrend, opcional): `{ value: number, direction: 'up' | 'down' }`

---

### 4. StatusBadgeComponent

Badge de status com cores mapeadas automaticamente.

**Uso:**
```typescript
import { StatusBadgeComponent } from '@shared/components';
```

**Exemplo:**
```html
<app-status-badge status="PENDENTE" size="medium"></app-status-badge>
<app-status-badge status="CONCLUIDO" size="small"></app-status-badge>
```

**Props:**
- `status` (string): Status da obrigação
- `size` ('small' | 'medium' | 'large', default: 'medium'): Tamanho do badge

**Status Suportados:**
- Obrigações: PENDENTE, EM_ANDAMENTO, CONCLUIDO, ATRASADO, CANCELADO
- Genéricos: ATIVO, INATIVO, APROVADO, REPROVADO, EM_ANALISE, AGUARDANDO
- Documentos: ENVIADO, PROCESSANDO, ERRO, REJEITADO
- Prioridade: BAIXA, MEDIA, ALTA, CRITICA

---

### 5. ConfirmDialogComponent

Dialog de confirmação customizado com design profissional.

**Uso:**
```typescript
import { ConfirmDialogComponent, ConfirmDialogService } from '@shared/components';

// No app.component.ts (ou no root)
@Component({
  imports: [ConfirmDialogComponent]
})

// No seu componente
constructor(private confirmDialogService: ConfirmDialogService) {}

confirmarExclusao() {
  this.confirmDialogService.confirm({
    severity: 'danger',
    icon: 'pi-trash',
    title: 'Confirmar Exclusão',
    message: 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
    acceptLabel: 'Sim, excluir',
    rejectLabel: 'Cancelar',
    accept: () => {
      this.excluir();
    }
  });
}
```

**Template:**
```html
<!-- No app.component.html ou root template -->
<app-confirm-dialog></app-confirm-dialog>
```

**Config:**
- `severity` ('info' | 'warning' | 'danger' | 'success'): Tipo de alerta
- `icon` (string): Ícone PrimeIcons
- `title` (string): Título do dialog
- `message` (string): Mensagem
- `acceptLabel` (string): Label do botão de confirmação
- `rejectLabel` (string): Label do botão de cancelar
- `accept` (function): Callback ao confirmar
- `reject` (function, opcional): Callback ao cancelar

---

### 6. SearchBarComponent

Barra de pesquisa com autocomplete e debounce.

**Uso:**
```typescript
import { SearchBarComponent } from '@shared/components';

sugestoes = ['SPED Fiscal', 'DCTF', 'EFD-Contribuições'];
```

**Exemplo:**
```html
<app-search-bar
  placeholder="Buscar obrigações..."
  [suggestions]="sugestoes"
  [debounceTime]="300"
  (onSearch)="buscar($event)">
</app-search-bar>
```

**Props:**
- `placeholder` (string, default: 'Buscar...'): Placeholder do input
- `suggestions` (string[], opcional): Sugestões para autocomplete
- `debounceTime` (number, default: 300): Tempo de debounce em ms
- `showClearButton` (boolean, default: true): Exibir botão de limpar
- `onSearch` (EventEmitter<string>): Evento disparado na pesquisa

---

### 7. BreadcrumbComponent

Breadcrumb de navegação customizado.

**Uso:**
```typescript
import { BreadcrumbComponent } from '@shared/components';

breadcrumbItems = [
  { label: 'Compliance', route: '/compliance' },
  { label: 'Obrigações', route: '/compliance/obrigacoes' },
  { label: 'Detalhes' }
];
```

**Exemplo:**
```html
<app-breadcrumb [items]="breadcrumbItems"></app-breadcrumb>
```

**Props:**
- `items` (BreadcrumbItem[]): Array de itens do breadcrumb
- `separatorIcon` (string, default: 'pi-angle-right'): Ícone do separador

**BreadcrumbItem:**
```typescript
interface BreadcrumbItem {
  label: string;
  route?: string;
  icon?: string;
  queryParams?: any;
}
```

---

## Diretivas

### SkeletonLoaderDirective

Diretiva para exibir skeleton loading.

**Uso:**
```typescript
import { SkeletonLoaderDirective } from '@shared/directives';

@Component({
  imports: [SkeletonLoaderDirective]
})
```

**Exemplo:**
```html
<div [appSkeletonLoader]="carregando" skeletonHeight="200px">
  <p>Conteúdo real aqui</p>
</div>

<!-- Para texto com múltiplas linhas -->
<div [appSkeletonLoader]="carregando" skeletonType="text" [skeletonLines]="3">
  <h1>Título</h1>
  <p>Parágrafo 1</p>
  <p>Parágrafo 2</p>
</div>

<!-- Para círculo (avatar) -->
<div [appSkeletonLoader]="carregando" skeletonType="circle">
  <img src="avatar.jpg" alt="Avatar">
</div>
```

**Props:**
- `appSkeletonLoader` (boolean): Se true, mostra skeleton
- `skeletonHeight` (string, opcional): Altura do skeleton
- `skeletonWidth` (string, default: '100%'): Largura
- `skeletonType` ('text' | 'circle' | 'rectangle', default: 'rectangle'): Tipo
- `skeletonLines` (number, default: 1): Número de linhas (para tipo text)

---

## Design Tokens

Todos os componentes utilizam as variáveis CSS definidas em `/src/styles/design-tokens.css`.

### Cores

```css
var(--color-primary)      /* #0052CC - Azul profissional */
var(--color-secondary)    /* #6554C0 - Roxo */
var(--color-success)      /* #00875A - Verde */
var(--color-warning)      /* #FF991F - Laranja */
var(--color-danger)       /* #DE350B - Vermelho */
var(--color-info)         /* #0065FF - Azul claro */
```

### Espaçamentos

```css
var(--spacing-xs)   /* 4px */
var(--spacing-sm)   /* 8px */
var(--spacing-md)   /* 12px */
var(--spacing-lg)   /* 16px */
var(--spacing-xl)   /* 24px */
var(--spacing-2xl)  /* 32px */
var(--spacing-3xl)  /* 48px */
var(--spacing-4xl)  /* 64px */
```

### Tipografia

```css
var(--font-size-xs)    /* 12px */
var(--font-size-sm)    /* 14px */
var(--font-size-base)  /* 16px */
var(--font-size-lg)    /* 20px */
var(--font-size-xl)    /* 24px */
var(--font-size-2xl)   /* 32px */
```

### Shadows

```css
var(--shadow-sm)   /* Shadow pequena */
var(--shadow-md)   /* Shadow média */
var(--shadow-lg)   /* Shadow grande */
var(--shadow-xl)   /* Shadow extra grande */
```

---

## Exemplos de Uso Completo

### Dashboard com Stats Cards

```html
<app-page-header
  title="Dashboard"
  subtitle="Visão geral do sistema de compliance">
  <div actions>
    <button pButton label="Exportar Relatório" icon="pi-download" class="p-button-outlined"></button>
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

  <div class="col-12 md:col-6 lg:col-3">
    <app-stats-card
      label="Concluídas"
      [value]="98"
      icon="pi-check-circle"
      color="success"
      [trend]="{ value: 8, direction: 'up' }">
    </app-stats-card>
  </div>

  <div class="col-12 md:col-6 lg:col-3">
    <app-stats-card
      label="Pendentes"
      [value]="32"
      icon="pi-clock"
      color="warning">
    </app-stats-card>
  </div>

  <div class="col-12 md:col-6 lg:col-3">
    <app-stats-card
      label="Atrasadas"
      [value]="12"
      icon="pi-exclamation-triangle"
      color="danger"
      [trend]="{ value: 5, direction: 'down' }">
    </app-stats-card>
  </div>
</div>
```

### Lista com Empty State

```html
<app-page-header title="Obrigações Fiscais">
  <div actions>
    <app-search-bar
      placeholder="Buscar obrigações..."
      (onSearch)="buscar($event)">
    </app-search-bar>
    <button pButton label="Nova Obrigação" icon="pi-plus"></button>
  </div>
</app-page-header>

<div *ngIf="obrigacoes.length === 0">
  <app-empty-state
    icon="pi-inbox"
    title="Nenhuma obrigação encontrada"
    message="Não há obrigações cadastradas ou nenhuma obrigação corresponde aos filtros aplicados"
    actionLabel="Nova Obrigação"
    (onAction)="criarObrigacao()">
  </app-empty-state>
</div>

<div *ngIf="obrigacoes.length > 0">
  <!-- Lista de obrigações -->
</div>
```

---

## Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1:

- Labels ARIA apropriados
- Navegação por teclado
- Focus indicators visíveis
- Contraste de cores adequado
- Suporte a screen readers

---

## Manutenção

Para adicionar novos componentes ao Design System:

1. Crie o componente em `src/app/shared/components/`
2. Use os design tokens do arquivo `design-tokens.css`
3. Faça o componente standalone
4. Exporte no arquivo `index.ts`
5. Documente neste README
