<script setup lang="ts">
import { ref, type Ref } from "vue";
import DisciplineCard from "./DisciplineCard.vue";
import DisciplinesGraph from "@/core/disciplines-graph";
import { Discipline } from "@/models/discipline";

/** Tipo de referência para a instância do DisciplineCard */
type DisciplineCardType = InstanceType<typeof DisciplineCard>;

/**
 * Objeto de configuração para o controle da animação de foco em cascata.
 * Define como o algoritmo de travessia do grafo deve se comportar visualmente.
 * @interface FocoCascataDisciplinasOpcoes
 * @property {number} id - Identificador único da disciplina raiz da operação.
 * @property {boolean} [foco=true] - Define o estado visual da disciplina. Se foco for:
 * - `true`: Aplica o destaque (remove grayscale, aplica classe correta).
 * - `false`: Remove o destaque ou restaura o estado padrão.
 * @property {boolean} [proximas=false] - Determina a direção da travessia no grafo. Se proximas for:
 * - `false` (Padrão): Percorre para trás (busca **Pré-requisitos**).
 * - `true`: Percorre para frente (busca disciplinas que **libera** / Próximas).
 */
interface FocoCascataDisciplinasOpcoes {
  id: number;
  foco?: boolean;
  proximas?: boolean;
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
    default: [],
  },
  grafo: {
    type: DisciplinesGraph,
    default: null,
  },
});

const elementRefsById: Ref<Record<number, DisciplineCardType>> = ref({});
const grayScaleMode = ref(false);
const scrollContainer: Ref<HTMLElement | null> = ref(null);

const zoom = ref(1);
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.1;

// Sensibilidade do wheel: multiplicador direto sobre deltaY, sem múltiplicar por ZOOM_STEP
const WHEEL_SENSITIVITY = 0.0015;

const getCascadeDelay = (): number => {
  if (typeof window !== "undefined") {
    const style = getComputedStyle(document.documentElement);
    const duration = style.getPropertyValue("--duration-cascade").trim();
    if (duration.endsWith("ms")) return parseFloat(duration) || 75;
    if (duration.endsWith("s")) return (parseFloat(duration) || 0.075) * 1000;
  }
  return 75;
};

/**
 * Gerencia a lógica de propagação visual de foco através do grafo de disciplinas.
 *
 * @param {FocoCascataDisciplinasOpcoes} opcoes - Objeto desestruturado contendo os parâmetros de controle.
 * @param {number} opcoes.id - ID da disciplina atual no loop de recursão.
 * @param {boolean} [opcoes.foco] - Estado desejado (ativar ou desativar foco).
 * @param {boolean} [opcoes.proximas] - Direção do grafo (trás/pré-requisitos ou frente/próximas).
 *
 * @description
 * Executa uma travessia (traversal) no grafo de dependências, acionando métodos nos
 * componentes filhos (`DisciplineCard`) para criar uma animação escalonada via CSS transition-delay.
 *
 * **Fluxo de Execução:**
 * 1. Ativa/Desativa o modo `grayScaleMode` globalmente.
 * 2. Usa BFS no grafo para obter profundidade de cada nó alcançável.
 * 3. Aplica `transition-delay` proporcional à profundidade em cada card.
 * 4. Aciona o método de destaque no componente filho:
 *  - `disciplineClicked()` se estiver buscando disciplinas futuras (`proximas: true`).
 *  - `focusDiscipline()` se estiver buscando pré-requisitos (`proximas: false`).
 *
 * @see {@link DisciplinesGraph.getNextDisciplines} - Função do grafo de relacionamentos que pega
 *                                                    as matérias que precisam.
 */
function focoCascataDisciplinas({
  id,
  foco = true,
  proximas = false,
}: FocoCascataDisciplinasOpcoes) {
  grayScaleMode.value = foco;
  if (!props.grafo) return;

  const direction = proximas ? "after" : "before";
  const depths = props.grafo.getDepths(id, direction);

  if (depths.size === 0) return;

  for (const [depId, depth] of depths) {
    const el = elementRefsById.value[depId];

    if (!el) {
      console.error(
        "Erro ao tentar focar em cascata. Elemento desconhecido (possivelmente uma optativa) de ID:",
        depId,
      );
      continue;
    }

    el.$el.style.transitionDelay = foco ? `${depth * getCascadeDelay()}ms` : "0ms";

    if (proximas) {
      el.disciplineClicked(foco);
    } else {
      el.focusDiscipline(foco);
    }
  }
}

function setZoom(valor: number) {
  const zoomClamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, valor));
  const container = scrollContainer.value;

  if (!container || zoomClamped === zoom.value) {
    zoom.value = zoomClamped;
    return;
  }

  const zoomAnterior = zoom.value;
  const centroX = container.scrollLeft + container.clientWidth / 2;
  const centroY = container.scrollTop + container.clientHeight / 2;
  const pontoConteudoX = centroX / zoomAnterior;
  const pontoConteudoY = centroY / zoomAnterior;

  zoom.value = zoomClamped;

  const aplicarScroll = () => {
    if (!scrollContainer.value) return;
    scrollContainer.value.scrollLeft =
      pontoConteudoX * zoomClamped - scrollContainer.value.clientWidth / 2;
    scrollContainer.value.scrollTop =
      pontoConteudoY * zoomClamped - scrollContainer.value.clientHeight / 2;
  };

  const conteudo = container.firstElementChild as HTMLElement | null;
  if (conteudo) {
    const onEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== "transform") return;
      conteudo.removeEventListener("transitionend", onEnd);
      aplicarScroll();
    };
    conteudo.addEventListener("transitionend", onEnd);
  } else {
    requestAnimationFrame(aplicarScroll);
  }
}

function zoomIn() {
  setZoom(zoom.value + ZOOM_STEP);
}

function zoomOut() {
  setZoom(zoom.value - ZOOM_STEP);
}


/**
 * Detecta Ctrl+wheel (Windows/Linux) e Cmd+wheel (Mac) para aplicar zoom.
 * O preventDefault evita o zoom nativo do navegador na página inteira.
 */
function handleWheel(e: WheelEvent) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  setZoom(zoom.value * (1 - e.deltaY * WHEEL_SENSITIVITY));
}

/** Estado do gesto de pinch (touch) para zoom em dispositivos móveis. */
let pinchStartDist = 0;
let pinchStartZoom = 1;

function getPinchDist(touches: TouchList): number {
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    pinchStartDist = getPinchDist(e.touches);
    pinchStartZoom = zoom.value;
  }
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length !== 2) return;
  e.preventDefault();
  const dist = getPinchDist(e.touches);
  setZoom(pinchStartZoom * (dist / pinchStartDist));
}
</script>

<template>
  <div
    class="flex-1 overflow-auto lg:px-6"
    ref="scrollContainer"
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <div
      :style="{
        transform: `scale(${zoom})`,
        width: `${zoom * 100}%`,
        height: `${zoom * 100}%`,
      }"
    >
      <div class="flex items-center flex-row gap-4 lg:gap-12 px-6 py-4 origin-center transition-transform duration-100">
        <div class="w-full lg:w-52 shrink-0" v-for="i in semestres.length" :key="i">
          <div
            class="semestre-span"
          >
            <span class="text-sm" data-test-semester-label="true">{{ i }}</span>
          </div>
          <!--
            TransitionGroup anima a entrada dos cards ao carregar dados de um novo curso.
            O tag "div" preserva o layout flex existente; cada card recebe o delay
            de profundidade definido em focoCascataDisciplinas via el.$el.style.transitionDelay.
            @see https://vuejs.org/guide/built-ins/transition-group.html
          -->
          <TransitionGroup name="card" tag="div" class="flex flex-col gap-2">
            <DisciplineCard
              v-for="discipline in semestres[i - 1]"
              @inFocus="
                focoCascataDisciplinas({
                  id: discipline.pegaId(),
                })
              "
              @outFocus="
                focoCascataDisciplinas({
                  id: discipline.pegaId(),
                  foco: false,
                })
              "
              @onClick="
                focoCascataDisciplinas({
                  id: discipline.pegaId(),
                  proximas: true,
                })
              "
              @offClick="
                focoCascataDisciplinas({
                  id: discipline.pegaId(),
                  foco: false,
                  proximas: true,
                })
              "
              :key="discipline.pegaId()"
              :ref="
                (el) =>
                  (elementRefsById[discipline.pegaId()] = el as DisciplineCardType)
              "
              :discipline="discipline"
              :gray-scale-mode="grayScaleMode"
            />
          </TransitionGroup>
        </div>
      </div>
      <div
        v-if="semestres.length === 0"
        class="flex justify-center items-center w-full py-20"
      >
        <h2 class="text-4xl font-extrabold">Nenhuma matéria!</h2>
      </div>
    </div>

    <!-- Controle de zoom flutuante -->
    <div
      class="fixed bottom-6 right-6 flex items-center gap-2 border border-secondary shadow-secondary/30 shadow-md backdrop-blur rounded-full px-3 py-1.5 select-none z-10 transition-transform"
    >
      <button
        @click="zoomOut"
        class="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label="Diminuir zoom"
      >
        -
      </button>
      <span class="text-sm w-10 text-center tabular-nums">{{ Math.round(zoom * 100) }}%</span>
      <button
        @click="zoomIn"
        class="w-8 h-8 lg:w-6 lg:h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
        aria-label="Aumentar zoom"
      >
        +
      </button>
    </div>
  </div>
</template>
