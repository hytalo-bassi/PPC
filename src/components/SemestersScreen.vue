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
 * @property {Array<Array<Discipline>>} semesters - Array bidimensional contendo disciplinas organizadas por semestre.
 *           Cada índice representa um semestre (0-indexed) com um array de objetos Discipline.
 * 
 * @example
 * // Estrutura esperada
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
defineProps(['semesters']);

const elementRefsById = ref({});

const grayScaleMode = ref(false);

/**
 * Foca recursivamente uma disciplina e todos os seus pré-requisitos.
 * 
 * @function focusPreRequisites
 * @param {Array<string|number>} pre_requisites_id - Array de IDs das disciplinas a serem focadas.
 * @param {boolean} [b=true] - Se true, ativa o foco; se false, desativa o foco.
 * @param {boolean} [full=true] - Se true, processa pré-requisitos recursivamente (cadeia completa);
 *                                se false, processa apenas o nível direto.
 * @returns {void}
 * 
 * @description
 * Implementa o sistema de destaque visual de dependências entre disciplinas.
 * Percorre recursivamente a árvore de pré-requisitos, ativando o modo de foco
 * em cada disciplina encontrada.
 * 
 * **Algoritmo:**
 * 1. Ativa/desativa o modo grayscale global
 * 2. Para cada ID de pré-requisito:
 *    a. Busca a referência do componente no mapa
 *    b. Recupera os pré-requisitos da disciplina
 *    c. Ativa/desativa o foco visual no componente
 *    d. Se `full=true` e há sub-pré-requisitos, chama recursivamente
 * 
 * **Recursão:**
 * - Profundidade ilimitada (segue toda a cadeia de dependências)
 * - Pode processar árvores complexas de pré-requisitos
 * - Exemplo: A → B → C → D (todos destacados quando hover em A)
 * 
 * **Casos de uso:**
 * - Hover sobre disciplina: `focusPreRequisites(ids, true, true)` - destaca cadeia completa
 * - Mouse sai da disciplina: `focusPreRequisites(ids, false, true)` - remove destaque
 * - Foco parcial: `focusPreRequisites(ids, true, false)` - apenas pré-requisitos diretos
 * 
 * @throws {TypeError} Pode lançar erro se `elementRefsById` não contiver o ID procurado
 *                     ou se o componente não implementar os métodos esperados.
 */
function focusPreRequisites(pre_requisites_id, b = true, full = true) {
  grayScaleMode.value = b;
  
  for (const id of pre_requisites_id) {
    const el = elementRefsById.value[id];
    
    const subPreRequisites = el.getDiscipline().pre_requisitos;
    
    el.focusDiscipline(b);
    
    // Se modo recursivo ativo e há sub-pré-requisitos, processa recursivamente
    if (full && subPreRequisites.length > 0) {
      focusPreRequisites(subPreRequisites, b, full);
    }
  }
}
</script>

<template>
  <div class="flex flex-row h-[500px] overflow-x-auto overflow-y-hidden space-x-12 px-6">
    <div class="flex-1 py-6" v-for="i in semesters.length" :key="i">
      <div class="rounded-full text-center border border-white/50 bg-black/20 h-6 mb-2">
        <span class="text-sm">{{ i }}</span>
      </div>
      <div class="flex justify-around flex-col h-full">
        <DisciplineCard
          v-for="discipline in semesters[i - 1]"
          @inFocus="focusPreRequisites(discipline.pre_requisitos)"
          @outFocus="focusPreRequisites(discipline.pre_requisitos, false)"
          :key="discipline.id_curso"
          :ref="el => elementRefsById[discipline.id_curso] = el"
          :discipline="discipline"
          :gray-scale-mode="grayScaleMode"
        />
      </div>
    </div>
  </div>
</template>
