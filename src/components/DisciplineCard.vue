<script setup>
import { ref } from 'vue';

/**
 * Componente de card de disciplina interativo.
 * 
 * @component DisciplineCard
 * @description
 * Componente responsável por renderizar um card individual de disciplina com
 * interatividade de hover e sistema de foco para destaque de pré-requisitos.
 * 
 * **Funcionalidades principais:**
 * 1. Exibição das informações básicas da disciplina (nome e carga horária)
 * 2. Estado de foco controlado internamente e externamente
 * 3. Emissão de eventos para comunicação com componente pai
 * 4. Suporte a modo grayscale para desfoque visual
 * 5. Exposição de métodos públicos via defineExpose
 * 
 * **Hierarquia de estados visuais:**
 * - Normal: classe 'discipline' (estado padrão)
 * - Focado: classe 'discipline-focused' (hover ou foco programático)
 * - Desfocado: 'grayscale opacity-50' (quando outras disciplinas estão em foco)
 */
const focused = ref(false);

/**
 * Props do componente.
 * 
 * @property {Discipline} discipline - Objeto contendo os dados da disciplina.
 * @property {boolean} grayScaleMode - Indica se o modo grayscale global está ativo.
 * 
 * @typedef {Object} Discipline
 * @property {string} apelido - Nome/sigla da disciplina em minúsculas.
 * @property {number} carga_horaria - Carga horária teórica em horas.
 * @property {string|number} id_curso - Identificador único da disciplina.
 * @property {number} tipo - Tipo da disciplina (0: Obrigatória, 1: Optativa).
 * @property {number} semestre - Número do semestre.
 * @property {Array<string|number>} pre_requisitos - IDs dos pré-requisitos.
 * @property {Array<string|number>} requisitoDe - IDs das disciplinas dependentes.
 * 
 * @example
 * <DisciplineCard
 *   :discipline="{ apelido: 'algoritmos', carga_horaria: 60, ... }"
 *   :gray-scale-mode="false"
 * />
 */
const props = defineProps(['discipline', 'grayScaleMode']);

/**
 * Eventos emitidos pelo componente.
 * 
 * @event inFocus - Emitido quando o mouse entra no card (mouseenter).
 * @event outFocus - Emitido quando o mouse sai do card (mouseleave).
 * 
 * @description
 * Estes eventos são capturados pelo componente pai (SemestersScreen) para
 * acionar o sistema de destaque recursivo de pré-requisitos.
 * 
 * @example
 * // No componente pai
 * <DisciplineCard
 *   @inFocus="focusPreRequisites(discipline.pre_requisitos)"
 *   @outFocus="focusPreRequisites(discipline.pre_requisitos, false)"
 * />
 */
const emits = defineEmits(['inFocus', 'outFocus']);

/**
 * Define o estado de foco da disciplina programaticamente.
 * 
 * @function focusDiscipline
 * @param {boolean} b - Se true, ativa o foco; se false, desativa o foco.
 * @returns {void}
 * 
 * @description
 * Método exposto publicamente que permite ao componente pai controlar
 * o estado de foco desta disciplina de forma programática.
 * 
 * **Uso típico:**
 * Chamado pelo componente pai quando esta disciplina é um pré-requisito
 * de outra disciplina que está sendo "hovered", criando o efeito em cascata
 * de destaque da cadeia de dependências.
 * 
 * @example
 * // Chamado pelo componente pai via ref
 * const cardRef = ref(null);
 * cardRef.value.focusDiscipline(true); // Ativa foco
 * cardRef.value.focusDiscipline(false); // Desativa foco
 */
const focusDiscipline = (b) => {
  focused.value = b;
};

/**
 * Manipula eventos de foco acionados por interação do mouse.
 * 
 * @function handleFocus
 * @param {'inFocus'|'outFocus'} signal - Nome do evento a ser emitido ('inFocus' ou 'outFocus').
 * @returns {void}
 * 
 * @description
 * Função centralizada que:
 * 1. Emite o evento apropriado para o componente pai
 * 2. Atualiza o estado interno de foco baseado no tipo de evento
 * 
 * **Fluxo de execução:**
 * 1. Usuário move mouse sobre o card → mouseenter
 * 2. handleFocus('inFocus') é chamado
 * 3. Emite evento 'inFocus' para o pai
 * 4. Define focused.value = true
 * 5. Pai processa evento e destaca pré-requisitos
 * 6. Pré-requisitos chamam focusDiscipline(true) externamente
 * 
 * **Simetria:**
 * - mouseenter → 'inFocus' → focused = true
 * - mouseleave → 'outFocus' → focused = false
 * 
 * @example
 * // Uso interno no template
 * <div @mouseenter="handleFocus('inFocus')">...</div>
 */
function handleFocus(signal) {
  // Emite evento para componente pai
  emits(signal);
  
  // Atualiza estado interno baseado no tipo de sinal
  if (signal === 'inFocus') {
    focused.value = true;
  } else {
    focused.value = false;
  }
}

/**
 * Métodos e propriedades expostos publicamente.
 * 
 * @expose focusDiscipline - Método para controlar foco programaticamente
 * @expose getDiscipline - Getter que retorna o objeto discipline completo
 * 
 * @description
 * Estes métodos são acessíveis via template refs no componente pai,
 * permitindo comunicação bidirecional entre pai e filho.
 * 
 * **Métodos expostos:**
 * 
 * @method focusDiscipline
 * @param {boolean} b - Estado de foco desejado
 * @description Ativa/desativa o foco visual desta disciplina
 * 
 * @method getDiscipline
 * @returns {Discipline} Objeto completo da disciplina
 * @description Retorna os dados da disciplina para acesso pelo componente pai
 * 
 * @example
 * // No componente pai
 * const cardRef = ref(null);
 * 
 * // Acessar métodos expostos
 * cardRef.value.focusDiscipline(true);
 * const discipline = cardRef.value.getDiscipline();
 * console.log(discipline.pre_requisitos);
 */
defineExpose({
  focusDiscipline,
  getDiscipline: () => props.discipline
});
</script>

<template>
  <div
    @mouseenter="handleFocus('inFocus')"
    @mouseleave="handleFocus('outFocus')"
    :class="{ 
      discipline: !focused,
      'discipline-focused': focused, 
      'grayscale opacity-50': grayScaleMode && !focused 
    }">
    <h1>{{ discipline.apelido }}</h1>
    <p>CH: {{ discipline.carga_horaria }} horas</p>
  </div>
</template>
