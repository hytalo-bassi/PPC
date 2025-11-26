<script setup>
import { ref } from 'vue';
import DisciplineCard from './DisciplineCard.vue';

/**
 * Componente de visualização de semestres e disciplinas.
 * 
 * @component SemestersScreen
 * @description
 * Componente responsável por renderizar a grade de disciplinas organizadas por semestre,
 * implementando funcionalidade interativa de destaque de pré-requisitos em cadeia.
 * 
 * **Funcionalidades principais:**
 * 1. Exibição horizontal de semestres com scroll
 * 2. Cards de disciplinas organizados verticalmente dentro de cada semestre
 * 3. Sistema de foco interativo que destaca disciplinas e seus pré-requisitos
 * 4. Modo grayscale para desfoque de disciplinas não relacionadas
 * 5. Rastreamento recursivo de dependências (pré-requisitos de pré-requisitos)
 * 
 * **Comportamento de foco:**
 * - Ao passar o mouse sobre uma disciplina, ela e todos os seus pré-requisitos são destacados
 * - Pré-requisitos indiretos também são destacados (cadeia completa de dependências)
 * - Demais disciplinas ficam em grayscale para melhor contraste visual
 * - Ao remover o mouse, o estado normal é restaurado
 */

/**
 * Props do componente.
 * 
 * @property {Array<Array<Discipline>>} semestres - Array bidimensional contendo disciplinas organizadas por semestre.
 *           Cada índice representa um semestre (0-indexed) com um array de objetos Discipline.
 * 
 * @property {DisciplinesGraph} grafo - Representa um grafo de relações entre as matérias.
 * @example
 * // Estrutura esperada de semestres
 * [
 *   [ // Semestre 1
 *     { id_curso: '12345', apelido: 'algoritmos', pre_requisitos: [], ... },
 *     { id_curso: '54321', apelido: 'cálculo i', pre_requisitos: [], ... }
 *   ],
 *   [ // Semestre 2
 *     { id_curso: '...', apelido: 'estruturas', pre_requisitos: ['12345'], ... }
 *   ]
 * ]
 */
const props = defineProps({
  semestres: {
    default: []
  },
  grafo: {
    default: null
  },
});

const elementRefsById = ref({});
const grayScaleMode = ref(false);
const proximasDisciplinas = ref(false);

const TEMPO_DE_EFEITO_CASCATA_EM_MS = 75;

function focoCascataDisciplinas({ id, foco = true, recursivo = true, sub = true, proximas = false }) {
  grayScaleMode.value = foco;
  if (!props.grafo) return;
  
  const listaRecursiva = proximas ?
    props.grafo.getNextDisciplines(id) : props.grafo.getPreRequisites(id);

  if (listaRecursiva.length === 0) return;

  for (const idImediato of listaRecursiva) {
    const el = elementRefsById.value[idImediato];
    
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
            id: discipline.id_curso
          })"
          @outFocus="focoCascataDisciplinas({
            id: discipline.id_curso,
            foco: false
          })"
          @onClick="focoCascataDisciplinas({
            id: discipline.id_curso,
            proximas: true,
          })"
          @offClick="focoCascataDisciplinas({
            id: discipline.id_curso,
            foco: false,
            proximas: true,
          })"
          :key="discipline.id_curso"
          :ref="el => elementRefsById[discipline.id_curso] = el"
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
