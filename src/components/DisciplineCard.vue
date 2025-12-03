<script setup lang="ts">
import { Discipline } from "@/models/discipline";
import { ref } from "vue";

/**
 * Componente de card de disciplina interativo.
 *
 * @component DisciplineCard
 * @description
 * Componente responsável por renderizar um card individual de disciplina com
 * interatividade de hover e sistema de foco para destaque de pré-requisitos e matérias
 * que a disciplina tranca.
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
 * - Focado: classe 'discipline-focused' (hover, click ou foco programático)
 * - Desfocado: 'grayscale opacity-50' (quando outras disciplinas estão em foco)
 */

const focused = ref(false);
const clicked = ref(false);

/**
 * Props do componente.
 *
 * @property {Discipline} discipline - Objeto contendo os dados da disciplina.
 * @property {boolean} grayScaleMode - Indica se o modo grayscale global está ativo.
 *
 * @example
 * <DisciplineCard
 *   :discipline="new Discipline(1234, 'algoritmos', ...)"
 *   :gray-scale-mode="false"
 * />
 */
const props = defineProps({
  discipline: {
    type: Discipline,
  },
  grayScaleMode: {
    type: Boolean,
  },
});

/**
 * Eventos emitidos pelo componente.
 *
 * @event inFocus - Emitido quando o mouse entra no card (mouseenter).
 * @event outFocus - Emitido quando o mouse sai do card (mouseleave).
 * @event onClick - Emitido quando houver um click no card (click).
 * @event offClick - Emitido quando o card já estava 'clicado' e foi clicado novamente (click).
 *
 * @description
 * Estes eventos são capturados pelo componente pai (SemestersScreen) para
 * acionar o sistema de destaque recursivo de pré-requisitos ou matérias que vêm depois.
 *
 * @example
 * // No componente pai
 * <DisciplineCard
 *   @inFocus="focoCascata(...)"
 *   @outFocus="focoCascata(...)"
 *   ...
 * />
 */
const emits = defineEmits(["inFocus", "outFocus", "onClick", "offClick"]);

/**
 * Define o estado de foco da disciplina programaticamente.
 *
 * @function focusDiscipline
 * @param {boolean} bool - Se true, ativa o foco; se false, desativa o foco.
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
 * // ... cardRef referenciando o componente
 * cardRef.value.focusDiscipline(true); // Ativa foco
 * cardRef.value.focusDiscipline(false); // Desativa foco
 */
const focusDiscipline = (bool: boolean): void => {
  focused.value = bool;
};

/**
 * Define o estado de 'click' do card programaticamente.
 *
 * @param {boolean} bool - Se true, o card age como se tivesse sido clickado ativando o foco, se false volta ao normal.
 * @returns {void}
 *
 * @description
 * Método exposto publicamente que permite o componente pai controlar
 * o estado de click da card, alterando o foco e o estado de click programaticamente.
 *
 * @example
 * // Chamado pelo componente pai via ref
 * const refElem = ref(null);
 * refElem.value.disciplineClicked(true)  // força um click falso
 * refElem.value.disciplineClicked(false) // tira o click
 */
const disciplineClicked = (bool: boolean): void => {
  clicked.value = bool;
  focusDiscipline(bool);
};

/**
 * Manipula eventos de foco acionados por interação do mouse.
 *
 * @function handleFocus
 * @param {'inFocus'|'outFocus'|'onClick'|'offClick'} signal - Nome do evento a ser emitido
 *                                                            ('inFocus', 'outFocus', 'onClick' ou 'offClick').
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
function handleFocus(signal: "inFocus" | "outFocus"): void {
  if (clicked.value) return;

  // Emite evento para componente pai
  emits(signal);

  // Atualiza estado interno baseado no tipo de sinal
  if (signal === "inFocus") {
    focused.value = true;
  } else {
    focused.value = false;
  }
}

/**
 * Manipula o estado de click do componente.
 *
 * @function handleClick
 *
 * @returns {void}
 * @description
 *
 * Função centralizada que:
 * 1. Alterna o estado de click (!clicked),
 * 2. Define o estado de foco de acordo com o click,
 * 3. Emite ao componente pai o evento "onClick", se o componente
 *    estiver clicado, ou "offClick", caso contrário.
 */
function handleClick(): void {
  clicked.value = !clicked.value;
  focused.value = clicked.value;

  if (clicked.value) emits("onClick");
  else emits("offClick");
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
 * @method disciplineClicked
 * @param {boolean} bool - Estado de click desejado
 * @description Ativa/desativa o visual clickado desta disciplina
 *
 * @example
 * // No componente pai
 * ... cardRef definido para a disciplina
 *
 * // Acessar métodos expostos
 * cardRef.value.focusDiscipline(true);
 * const discipline = cardRef.value.getDiscipline();
 * console.log(discipline.pre_requisitos);
 */
defineExpose({
  focusDiscipline,
  disciplineClicked,
  getDiscipline: () => props.discipline,
});
</script>

<template>
  <div
    @mouseenter="handleFocus('inFocus')"
    @mouseleave="handleFocus('outFocus')"
    @click="handleClick()"
    :class="{
      discipline: !focused,
      'discipline-focused': focused,
      'grayscale opacity-50': grayScaleMode && !focused,
    }"
  >
    <h1>{{ discipline!.pegaApelido() }}</h1>
    <p>CH: {{ discipline!.pegaCarga() }} horas</p>
  </div>
</template>
