<script setup lang="ts">
import { ref, type Ref } from 'vue';
import DisciplineCard from './DisciplineCard.vue';
import DisciplinesGraph from '@/core/disciplines-graph';
import { Discipline } from '@/models/discipline';

/** Tipo de referência para a instância do DisciplineCard */
type DisciplineCardType = InstanceType<typeof DisciplineCard>

/**
 * Objeto de configuração para o controle da animação de foco em cascata.
 * Define como o algoritmo de travessia do grafo deve se comportar visualmente.
 * @interface FocoCascataDisciplinasOpcoes
 * @property {number} id - Identificador único da disciplina raiz da operação.
 * @property {boolean} [foco=true] - Define o estado visual da disciplina. Se foco for:
 * - `true`: Aplica o destaque (remove grayscale, aplica classe correta).
 * - `false`: Remove o destaque ou restaura o estado padrão.
 * @property {boolean} [recursivo=true] - Controla a propagação do efeito.
 *                                        Se `true`, a função continuará buscando nós adjacentes
 *                                        (pré-requisitos ou próximas) e aplicará o efeito com um
 *                                        delay (`TEMPO_DE_EFEITO_CASCATA_EM_MS`).
 * @property {boolean} [sub=true] - Flag auxiliar para indicar se a execução atual
 *                                  é uma sub-chamada (parte de uma cadeia) ou a interação inicial do usuário.
 * @property {boolean} [proximas=false] - Determina a direção da travessia no grafo. Se proximas for:
 * - `false` (Padrão): Percorre para trás (busca **Pré-requisitos**).
 * - `true`: Percorre para frente (busca disciplinas que **libera** / Próximas).
 */
interface FocoCascataDisciplinasOpcoes {
  id: number,
  foco?: boolean,
  recursivo?: boolean,
  sub?: boolean,
  proximas?: boolean,
}

/**
 * Componente de visualização de semestres e disciplinas.
 * 
 * @component SemestersScreen
 * @description
 * Componente responsável por renderizar a grade de disciplinas organizadas por semestre,
 * implementando funcionalidade interativa de destaque de pré-requisitos em cadeia e próximas matérias.
 * 
 * **Funcionalidades principais:**
 * 1. Exibição horizontal de semestres com scroll
 * 2. Cards de disciplinas organizados verticalmente dentro de cada semestre
 * 3. Sistema de foco interativo que destaca disciplinas e seus pré-requisitos
 * 4. Modo grayscale para desfoque de disciplinas não relacionadas
 * 5. Rastreamento recursivo de dependências (pré-requisitos de pré-requisitos)
 * 6. Rastreamento recursivo de matérias que são pré-requisitos de outras.
 * 
 * **Comportamento de foco:**
 * - Ao passar o mouse sobre uma disciplina, ela e todos os seus pré-requisitos são destacados
 * - Pré-requisitos indiretos também são destacados (cadeia completa de dependências)
 * - Demais disciplinas ficam em grayscale para melhor contraste visual
 * - Ao remover o mouse, o estado normal é restaurado
 * - Caso a matéria seja clicada, ela e todas as matérias que precisam dela como pré-requisito são
 *   destacadas, funciona de maneira inversa ao foco por hover.
 */

/**
 * Props do componente.
 * 
 * @property {Array<Array<Discipline>>} semestres - Matriz bidimensional contendo disciplinas
 *                                                organizadas por semestre.
 *                                                Cada índice representa um semestre (0-indexed) 
 *                                                com um array de objetos Discipline.
 * 
 * @property {DisciplinesGraph} grafo - Representa um grafo de relações entre as matérias.
 * @example
 * // Estrutura esperada de semestres
 * [
 *   [ // Semestre 1
 *     Discipline(0001),
 *     Discipline(0002),
 *     ...
 *   ],
 *   [ // Semestre 2
 *     Discipline(0011)
 *   ]
 * ]
 */
const props = defineProps({
  semestres: {
    type: Array<Array<Discipline>>,
    default: []
  },
  grafo: {
    type: DisciplinesGraph,
    default: null
  },
});

const elementRefsById: Ref<Record<number, DisciplineCardType>> = ref({});
const grayScaleMode = ref(false);

/** Define o tempo que a animação recursiva de foco vai levar para mostrar níveis mais profundos */
const TEMPO_DE_EFEITO_CASCATA_EM_MS = 75;

/**
 * Gerencia a lógica de propagação visual de foco através do grafo de disciplinas.
 * 
 * @param {FocoCascataDisciplinasOpcoes} opcoes - Objeto desestruturado contendo os parâmetros de controle.
 * @param {number} opcoes.id - ID da disciplina atual no loop de recursão.
 * @param {boolean} [opcoes.foco] - Estado desejado (ativar ou desativar foco).
 * @param {boolean} [opcoes.recursivo] - Se deve continuar propagando para o próximo nível.
 * @param {boolean} [opcoes.proximas] - Direção do grafo (trás/pré-requisitos ou frente/próximas).
 * 
 * @description
 * Executa uma travessia (traversal) no grafo de dependências, acionando métodos nos
 * componentes filhos (`DisciplineCard`) para criar uma animação sequencial.
 * 
 * **Fluxo de Execução:**
 * 1. Ativa/Desativa o modo `grayScaleMode` globalmente.
 * 2. Consulta o grafo (`props.grafo`) para obter os IDs relacionados (pais ou filhos).
 * 3. Localiza a referência do componente da disciplina correspondente via `elementRefsById`.
 * 4. Aciona o método de destaque no componente filho:
 *  - `disciplineClicked()` se estiver buscando disciplinas futuras (`proximas: true`).
 *  - `focusDiscipline()` se estiver buscando pré-requisitos (`proximas: false`).
 * 5. Se `recursivo` for true, agenda a próxima execução com para criar o efeito visual de "cascata".
 * 
 * @see {@link DisciplinesGraph.getNextDisciplines} - Função do grafo de relacionamentos que pega
 *                                                    as matérias que precisam.
 */
function focoCascataDisciplinas({
  id,
  foco = true,
  recursivo = true,
  sub = true,
  proximas = false 
} : FocoCascataDisciplinasOpcoes) {
  grayScaleMode.value = foco;
  if (!props.grafo) return;
  
  const listaRecursiva = proximas ?
    props.grafo.getNextDisciplines(id) : props.grafo.getPreRequisites(id);

  if (listaRecursiva.length === 0) return;

  for (const idImediato of listaRecursiva) {
    const el = elementRefsById.value[idImediato];
    
    if (!el) {
      console.error("Erro ao tentar focar em cascata. Elemento desconhecido (possivelmente uma optativa) de ID:", idImediato);
      return;
    }

    if (proximas) {
      el.disciplineClicked(foco);
    } else {
      el.focusDiscipline(foco);
    }
    
    if (recursivo) {
      setTimeout(
        () => focoCascataDisciplinas({
          id: idImediato,
          foco,
          recursivo,
          sub,
          proximas,
        }),
        TEMPO_DE_EFEITO_CASCATA_EM_MS
      );
    }
  }
}
</script>

<template>
  <div class="flex flex-row h-[500px] overflow-x-auto overflow-y-hidden space-x-12 px-6">
    <div class="flex-1 py-6" v-for="i in semestres.length" :key="i">
      <div class="rounded-full text-center border border-white/50 bg-black/20 h-6 mb-2">
        <span class="text-sm">{{ i }}</span>
      </div>
      <div class="flex justify-around flex-col h-full">
        <DisciplineCard
          v-for="discipline in semestres[i - 1]"
          @inFocus="focoCascataDisciplinas({
            id: discipline.pegaId()
          })"
          @outFocus="focoCascataDisciplinas({
            id: discipline.pegaId(),
            foco: false
          })"
          @onClick="focoCascataDisciplinas({
            id: discipline.pegaId(),
            proximas: true,
          })"
          @offClick="focoCascataDisciplinas({
            id: discipline.pegaId(),
            foco: false,
            proximas: true,
          })"
          :key="discipline.pegaId()"
          :ref="el => elementRefsById[discipline.pegaId()] = (el as DisciplineCardType)"
          :discipline="discipline"
          :gray-scale-mode="grayScaleMode"
        />
      </div>
    </div>
    <div v-if="semestres.length === 0" class="flex justify-center items-center flex-1 h-full">
      <h2 class="text-4xl font-extrabold">Nenhuma matéria!</h2>
    </div>
  </div>
</template>
