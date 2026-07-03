# AGENTS.md — Guia para Assistentes de IA

Este documento fornece contexto essencial e diretrizes para assistentes de IA trabalhando neste projeto. Seguir estas instruções garante código consistente, de alta qualidade e alinhado com as convenções estabelecidas.

## Visão Geral do Projeto

**Nome**: Sistema de Semestralização UFMS  
**Propósito**: Aplicação web para auxiliar estudantes da UFMS na escolha e planejamento de disciplinas por semestre  
**Repositório**: https://github.com/hytalo-bassi/PPC

### Stack Tecnológico Principal

- **Framework**: Vue 3 (Composition API com `<script setup>`)
- **Build Tool**: Vite 7.x
- **Linguagem**: TypeScript (configuração strictest)
- **Estilização**: Tailwind CSS v4.x
- **Gerenciamento de Estado**: Pinia 3.x
- **Testes**: Vitest + @testing-library/vue + happy-dom
- **Formatação**: Prettier (configuração padrão em `.prettierrc`)
- **Linting**: ESLint (configuração flat em `eslint.config.mts`)
- **Controle de Qualidade**: Husky + lint-staged (pré-commit hooks)

## Comandos Críticos de Verificação

**IMPORTANTE**: Execute SEMPRE antes de considerar uma tarefa completa:

```bash
npm run lint          # ESLint — deve passar sem erros
npm run format        # Prettier — formata automaticamente
npm run test:run      # Vitest — todos os testes devem passar
```

Para desenvolvimento:

```bash
npm run dev           # Servidor de desenvolvimento (localhost:8000)
npm run build         # Build de produção (inclui prettier check + vue-tsc)
npm run test          # Testes em modo watch
npm run test:coverage # Cobertura de testes
```

**NOTA**: Os hooks de pré-commit executam automaticamente `lint` e `test:run` em cada commit. Isso adiciona 2-8 segundos ao tempo de commit, mas é obrigatório e intencional.

## Convenção de Linguagem (CRÍTICO)

### Português Brasileiro é PRIORITÁRIO

Use **português brasileiro** para:

- ✅ Nomes de variáveis, funções, componentes
- ✅ Nomes de classes CSS e identificadores
- ✅ Comentários no código
- ✅ Mensagens de commit
- ✅ Strings de interface do usuário
- ✅ Nomes de arquivos (quando aplicável)

**Exemplos corretos**:

```typescript
// ✅ BOM
const listaDisciplinas = ref<Disciplina[]>([])
const carregandoDados = ref(false)
const mensagemErro = computed(() => `Erro ao carregar: ${erro.value}`)

// ❌ ERRADO
const disciplineList = ref<Discipline[]>([])
const loadingData = ref(false)
const errorMessage = computed(() => `Error loading: ${error.value}`)
```

```vue
<!-- ✅ BOM -->
<script setup lang="ts">
const buscarCursos = async () => {
  carregando.value = true
  try {
    const resposta = await fetch(`/data/${codigoCurso.value}.json`)
    dados.value = await resposta.json()
  } catch (erro) {
    mensagemErro.value = 'Falha ao carregar dados do curso'
  } finally {
    carregando.value = false
  }
}
</script>
```

### Exceções Permitidas (Inglês)

Use inglês APENAS para:

- Termos técnicos consagrados: `loading`, `error`, `handler`, `payload`, `middleware`
- Props e eventos do Vue: `props`, `emit`, `setup`, `computed`, `ref`, `reactive`
- APIs de bibliotecas: `fetch`, `router`, `store`, `pinia`
- Nomes de tipos/interfaces quando interfaceiam com libs externas

**Regra prática**: Se há dúvida, use pt-BR. Use inglês apenas quando o termo for universalmente reconhecido no ecossistema Vue/TypeScript.

## Estrutura de Arquivos

```
src/
├── __tests__/          # Testes unitários e de integração
├── components/         # Componentes Vue reutilizáveis
├── composables/        # Composables Vue (lógica reutilizável)
├── core/              # Lógica de negócio central
├── models/            # Tipos TypeScript e interfaces de dados
├── services/          # Serviços (API calls, data fetching)
├── assets/            # Estilos, imagens, recursos estáticos
│   └── styles/        # CSS customizado (além do Tailwind)
├── App.vue            # Componente raiz
└── index.ts           # Entry point da aplicação
```

## Convenções de Código TypeScript

### Configuração TypeScript STRICTEST

O projeto usa `@tsconfig/strictest` com regras adicionais:

```json
{
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "strictNullChecks": true,
  "noImplicitOverride": true
}
```

**Implicações práticas**:

1. **Sempre trate acessos a arrays/objetos como potencialmente undefined**:

```typescript
// ❌ ERRADO
const primeira = semestres[0]
primeira.disciplinas.forEach(...)

// ✅ CORRETO
const primeira = semestres[0]
if (primeira) {
  primeira.disciplinas.forEach(...)
}

// OU usando optional chaining
semestres[0]?.disciplinas.forEach(...)
```

2. **Não use `any` — sempre tipifique corretamente**:

```typescript
// ❌ ERRADO
const processarDados = (dados: any) => { ... }

// ✅ CORRETO
interface DadosCurso {
  codigo: string
  nome: string
  disciplinas: Disciplina[]
}
const processarDados = (dados: DadosCurso) => { ... }
```

3. **Parâmetros não usados devem ser prefixados com `_`**:

```typescript
// ❌ ERRADO (noUnusedParameters)
const handler = (event, context) => { return event.data }

// ✅ CORRETO
const handler = (event, _context) => { return event.data }
```

## Padrões Vue 3 Composition API

### Estrutura de Componente

Use sempre `<script setup>` com TypeScript:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Disciplina } from '@/models/Disciplina'

interface Props {
  codigoCurso: string
  semestre?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selecionado: [disciplina: Disciplina]
  erro: [mensagem: string]
}>()

const disciplinas = ref<Disciplina[]>([])
const carregando = ref(false)

const disciplinasFiltradas = computed(() => {
  return disciplinas.value.filter(d => d.semestre === props.semestre)
})

const carregarDisciplinas = async () => {
  carregando.value = true
  try {
    const resposta = await fetch(`/data/${props.codigoCurso}.json`)
    if (!resposta.ok) throw new Error('Falha ao carregar')
    disciplinas.value = await resposta.json()
  } catch (erro) {
    emit('erro', erro instanceof Error ? erro.message : 'Erro desconhecido')
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  carregarDisciplinas()
})
</script>

<template>
  <div class="container">
    <div v-if="carregando">Carregando...</div>
    <div v-else>
      <div
        v-for="disciplina in disciplinasFiltradas"
        :key="disciplina.codigo"
        @click="emit('selecionado', disciplina)"
      >
        {{ disciplina.nome }}
      </div>
    </div>
  </template>
```

### Composables

Crie composables para lógica reutilizável (prefixo `use`):

```typescript
// composables/useBuscarCurso.ts
import { ref } from 'vue'
import type { DadosCurso } from '@/models/Curso'

export const useBuscarCurso = () => {
  const dados = ref<DadosCurso | null>(null)
  const carregando = ref(false)
  const erro = ref<string | null>(null)

  const buscar = async (codigo: string) => {
    carregando.value = true
    erro.value = null

    try {
      const resposta = await fetch(`/data/${codigo}.json`)
      if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`)
      dados.value = await resposta.json()
    } catch (e) {
      erro.value = e instanceof Error ? e.message : 'Erro desconhecido'
    } finally {
      carregando.value = false
    }
  }

  return { dados, carregando, erro, buscar }
}
```

## Estilização com Tailwind CSS

### Tailwind v4.x

O projeto usa Tailwind CSS v4 com `@tailwindcss/vite`:

- Use classes utilitárias do Tailwind sempre que possível
- CSS customizado vai em `src/assets/styles/`
- Tailwind v4 suporta `@theme` e `@apply` (ESLint configurado para permitir)

**Responsividade**:

```vue
<template>
  <!-- ✅ BOM: design mobile-first com breakpoints -->
  <div class="px-4 md:px-12 lg:px-24">
    <h1 class="text-lg sm:text-xl md:text-2xl">Título</h1>
  </div>
</template>
```

**Classes customizadas** (quando necessário):

```css
/* src/assets/styles/PPC.css */
@theme {
  --duration-focus: 200ms;
}

.disciplina {
  @apply rounded-lg border border-gray-300 p-4 transition-all;
}
```

## Testes com Vitest

### Estrutura de Teste

```typescript
// src/__tests__/components/ListaDisciplinas.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import ListaDisciplinas from '@/components/ListaDisciplinas.vue'

describe('ListaDisciplinas', () => {
  it('deve renderizar lista de disciplinas', () => {
    const disciplinas = [
      { codigo: 'MAT001', nome: 'Cálculo I', semestre: 1 },
      { codigo: 'FIS001', nome: 'Física I', semestre: 1 },
    ]

    render(ListaDisciplinas, {
      props: { disciplinas },
    })

    expect(screen.getByText('Cálculo I')).toBeInTheDocument()
    expect(screen.getByText('Física I')).toBeInTheDocument()
  })

  it('deve exibir mensagem quando não há disciplinas', () => {
    render(ListaDisciplinas, {
      props: { disciplinas: [] },
    })

    expect(screen.getByText(/nenhuma disciplina/i)).toBeInTheDocument()
  })
})
```

**Regras de teste**:

1. Todo novo componente/função deve ter testes
2. Testes devem ser legíveis e documentar comportamento esperado
3. Use `describe` para agrupar testes relacionados
4. Nomes de testes em português: `'deve renderizar...'`, `'deve exibir erro quando...'`

## Segurança e Boas Práticas

### Dados Sensíveis

- ❌ NUNCA commite secrets, tokens, API keys
- ❌ NUNCA faça log de dados sensíveis do usuário
- ✅ Use variáveis de ambiente para configurações sensíveis

### Validação de Entrada

```typescript
// ✅ BOM: valide entradas de usuário
const validarCodigoCurso = (codigo: string): boolean => {
  return /^\d{4}$/.test(codigo)
}

const buscarCurso = async (codigo: string) => {
  if (!validarCodigoCurso(codigo)) {
    throw new Error('Código de curso inválido')
  }
  // ... prosseguir com busca
}
```

### Tratamento de Erros

```typescript
// ✅ BOM: sempre trate erros de forma granular
try {
  const resposta = await fetch(url)
  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`)
  }
  const dados = await resposta.json()
  return dados
} catch (erro) {
  if (erro instanceof TypeError) {
    console.error('Erro de rede:', erro)
    throw new Error('Falha na conexão. Verifique sua internet.')
  }
  throw erro
}
```

## Fluxo de Trabalho Git

### Branches

```bash
# Feature
git checkout -b feature/adicionar-filtro-disciplinas

# Bugfix
git checkout -b fix/corrigir-carregamento-curso
```

### Commits

Mensagens em português, descritivas:

```bash
git commit -m "adiciona filtro por período nas disciplinas"
git commit -m "corrige erro ao carregar dados de cursos sem pré-requisitos"
git commit -m "refatora componente de seleção para usar composable"
```

**IMPORTANTE**: O hook de pré-commit executará automaticamente:
- `npm run lint` — código deve passar sem erros
- `npm run test:run` — todos os testes devem passar

Se houver falhas, corrija antes de tentar commitar novamente.

## Checklist para Código de Qualidade

Antes de considerar uma tarefa completa:

- [ ] Código usa **português brasileiro** para nomes (exceto termos técnicos consagrados)
- [ ] **TypeScript strict** sem erros: `vue-tsc -b` passa sem avisos
- [ ] **ESLint** passa: `npm run lint` sem erros
- [ ] **Prettier** aplicado: `npm run format` executado
- [ ] **Testes** criados e passando: `npm run test:run` sem falhas
- [ ] **Componentes Vue** seguem Composition API com `<script setup lang="ts">`
- [ ] **Acessos a arrays/objetos** tratam valores potencialmente undefined
- [ ] **Tratamento de erros** apropriado em chamadas assíncronas
- [ ] **Responsividade** considerada (mobile-first com Tailwind)
- [ ] **Sem console.log** em produção (usar apenas em `if (import.meta.env.DEV)`)
- [ ] **Sem dados sensíveis** commitados

## Recursos Adicionais

- **Guia de Desenvolvimento Completo**: `docs/DESENVOLVENDO.md`
- **TODOs do Projeto**: `TODO.md`
- **Configuração ESLint**: `eslint.config.mts`
- **Configuração TypeScript**: `tsconfig.json`

## Princípios para IA

Ao trabalhar neste projeto:

1. **Não confie cegamente**: Revise e teste toda solução gerada
2. **Contexto primeiro**: Leia código existente antes de adicionar novo código
3. **Siga padrões**: Imite estilo, convenções e bibliotecas já em uso
4. **Teste rigorosamente**: Execute lint, typecheck e testes antes de finalizar
5. **Seja conservador**: Não adicione bibliotecas/abstrações desnecessárias
6. **Documente decisões**: Use comentários (em pt-BR) para lógica não-óbvia
7. **Priorize legibilidade**: Código claro > código "inteligente"

---

**Última atualização**: 2026-07-03  
**Versão do documento**: 1.0.0
