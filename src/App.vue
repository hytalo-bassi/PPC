<script setup lang="ts">
import SemestresHeading from "./components/SemestresHeading.vue";
import SemestersScreen from "./components/SemestersScreen.vue";
import { useSemestralizacaoGrafo } from "./composables/useDiscipline";
import { ref } from "vue";

/**
 * Componente raiz da aplicação de visualização de disciplinas.
 *
 * @component App
 * @description
 * Componente principal que gerencia a interface de busca e visualização de disciplinas
 * de cursos acadêmicos. Implementa:
 * - Campo de busca com validação de código do curso (4 dígitos)
 * - Estados de loading, erro e sucesso
 * - Feedback visual para cada estado da aplicação
 * - Integração com o composable useDisciplines para gerenciamento de dados
 *
 * **Estados da UI:**
 * - Loading inicial: Spinner e mensagem de carregamento
 * - Loading incremental: Spinner pequeno no campo de busca
 * - Sucesso: Checkmark verde e exibição dos semestres
 * - Erro: Card de erro com opção de retry
 */

const { codigoCurso, semestres, grafo, carregando, erro } =
  useSemestralizacaoGrafo(1905);
const inputValue = ref("1905");

/**
 * Manipula a entrada do usuário no campo de busca.
 *
 * @function handleInput
 * @returns {void}
 *
 * @description
 * Valida o valor digitado e, se atender aos critérios (4 dígitos numéricos),
 * atualiza o `codigoCurso` que dispara automaticamente o carregamento das
 * disciplinas através do watcher no composable.
 *
 * **Validação:**
 * - Regex: /^\d{4}$/ - Exatamente 4 dígitos numéricos
 * - Apenas valores válidos acionam o carregamento
 * - Valores inválidos são ignorados silenciosamente
 *
 * @example
 * // Entrada válida
 * inputValue.value = '1905'; // ✓ Aciona carregamento
 *
 * @example
 * // Entradas inválidas (ignoradas)
 * inputValue.value = '123';   // ✗ Menos de 4 dígitos
 * inputValue.value = '12345'; // ✗ Mais de 4 dígitos
 * inputValue.value = 'abcd';  // ✗ Não numérico
 */
const handleInput = (): void => {
  if (/^\d{4}$/.test(inputValue.value)) {
    codigoCurso.value = Number(inputValue.value);
    console.log("Codigo curso", inputValue.value);
  }
};
</script>

<template>
  <div
    id="app"
    class="bg-linear-65 from-blue-400 to-rose-500 w-full h-full px-24 overflow-auto pb-8"
  >
    <SemestresHeading
      :model-value="inputValue"
      :carregando="carregando"
      @update:model-value="
        (v: string) => {
          inputValue = v;
          handleInput();
        }
      "
    />

    <!--
      Transition entre os estados de loading, erro e sucesso.
      O modo "out-in" garante que o elemento saindo complete sua animação
      antes do próximo entrar, evitando sobreposição visual.
      @see https://vuejs.org/guide/built-ins/transition.html
    -->
    <Transition name="fade" mode="out-in">
      <div
        v-if="carregando"
        key="loading"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mb-4"
        ></div>
        <p class="text-white text-xl font-semibold">
          Carregando disciplinas...
        </p>
      </div>

      <div
        v-else-if="erro"
        key="erro"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="bg-red-500/20 border-2 border-red-300 rounded-lg p-8 max-w-md"
        >
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-white text-2xl font-bold mb-2">
            Erro ao carregar dados
          </h2>
          <p class="text-red-100 mb-4">
            {{
              erro.message ||
              "Não foi possível carregar as disciplinas do curso."
            }}
          </p>

          <button
            @click="
              () => {
                inputValue = '1905';
                handleInput();
              }
            "
            class="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Tentar novamente com código padrão
          </button>
        </div>
      </div>

      <div v-else key="conteudo">
        <SemestersScreen :semestres="semestres" :grafo="grafo" />
        <div class="Line"></div>
      </div>
    </Transition>
  </div>
</template>
