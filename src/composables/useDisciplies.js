import { ref, watch } from 'vue';
import { getDisciplines, getDisciplinesV2 } from '../services/api.js';

/**
 * Composable Vue para gerenciamento de disciplinas de cursos.
 * 
 * @param {string} [initialCode='1905'] - Código inicial do curso (formato: 4 dígitos numéricos).
 * @returns {Object} Objeto contendo refs reativos e estados do composable.
 * @returns {import('vue').Ref<string>} return.courseCode - Código do curso atual (reativo).
 * @returns {import('vue').Ref<Array<Array<Discipline>>>} return.semesters - Array bidimensional de disciplinas organizadas por semestre.
 * @returns {import('vue').Ref<boolean>} return.loading - Indica se há uma requisição em andamento.
 * @returns {import('vue').Ref<Error|null>} return.error - Armazena o último erro ocorrido ou null se não houver erros.
 * 
 * @description
 * Este composable implementa o padrão de composição do Vue 3 para encapsular a lógica de:
 * 1. Carregamento de disciplinas de um curso específico
 * 2. Gerenciamento de estados de loading e erro
 * 3. Reatividade automática às mudanças no código do curso
 * 4. Validação do formato do código do curso
 * 
 * **Comportamento:**
 * - Ao ser inicializado, carrega automaticamente as disciplinas do código fornecido (immediate: true)
 * - Monitora mudanças no `courseCode` e recarrega as disciplinas automaticamente
 * - Valida se o código possui exatamente 4 dígitos numéricos antes de fazer a requisição
 * - Gerencia estados de loading e erro de forma reativa
 * - Em caso de erro, mantém os dados anteriores em `semesters` e armazena o erro em `error`
 * 
 * **Validação:**
 * - Apenas códigos com formato válido (4 dígitos) acionam o carregamento
 * - Códigos inválidos são ignorados silenciosamente (sem requisição, sem erro)
 * 
 * **Estados:**
 * - `loading`: true durante a requisição, false após conclusão (sucesso ou erro)
 * - `error`: null em caso de sucesso, contém o objeto Error em caso de falha
 * - `semesters`: mantém dados anteriores até que novos sejam carregados com sucesso
 * 
 * @example
 * // Uso básico em um componente Vue
 * import { useDisciplines } from '@/composables/useDisciplines';
 * 
 * export default {
 *   setup() {
 *     const { courseCode, semesters, loading, error } = useDisciplines('1905');
 *     
 *     // Os dados são carregados automaticamente
 *     // Para mudar de curso, basta atualizar courseCode
 *     const changeCourse = (newCode) => {
 *       courseCode.value = newCode;
 *     };
 *     
 *     return { courseCode, semesters, loading, error, changeCourse };
 *   }
 * };
 * 
 * @example
 * // Uso em template
 * <template>
 *   <div>
 *     <input v-model="courseCode" placeholder="Digite o código do curso" />
 *     
 *     <div v-if="loading">Carregando...</div>
 *     <div v-else-if="error">Erro ao carregar: {{ error.message }}</div>
 *     
 *     <div v-else>
 *       <div v-for="(semester, index) in semesters" :key="index">
 *         <h3>Semestre {{ index + 1 }}</h3>
 *         <ul>
 *           <li v-for="discipline in semester" :key="discipline.Id">
 *             {{ discipline.Apelido }}
 *           </li>
 *         </ul>
 *       </div>
 *     </div>
 *   </div>
 * </template>
 * 
 * @example
 * // Uso sem código inicial (usa '1905' como padrão)
 * const { courseCode, semesters } = useDisciplines();
 * 
 * @throws {Error} Erros de rede ou parsing são capturados e armazenados em `error.value`
 * 
 * @see {@link getDisciplines} - Função de serviço utilizada para carregar os dados
 */
export function useDisciplines(initialCode = '1905') {
  const courseCode = ref(initialCode);
  const semesters = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  /**
   * Carrega as disciplinas de um curso específico.
   * 
   * @private
   * @async
   * @param {string} code - Código do curso a ser carregado (deve ter 4 dígitos).
   * @returns {Promise<void>}
   * 
   * @description
   * Função auxiliar que:
   * 1. Ativa o estado de loading
   * 2. Limpa erros anteriores
   * 3. Tenta carregar as disciplinas via getDisciplines
   * 4. Atualiza o estado de semesters em caso de sucesso
   * 5. Captura e armazena erros em caso de falha
   * 6. Desativa o estado de loading ao finalizar
   */
  const load = async (code) => {
    loading.value = true;
    error.value = null;
    
    try {
      semesters.value = await getDisciplinesV2(code);
    } catch (e) {
      console.error("Erro ao carregar disciplinas!", e);
      error.value = e;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Watcher que monitora mudanças no código do curso.
   * 
   * @description
   * - Executa automaticamente quando courseCode é alterado
   * - Valida se o novo código possui exatamente 4 dígitos numéricos
   * - Chama a função load() apenas se o código for válido
   * - Opção `immediate: true` executa o carregamento inicial imediatamente
   * 
   * **Regex de validação:** /^\d{4}$/
   * - ^ : início da string
   * - \d{4} : exatamente 4 dígitos
   * - $ : fim da string
   */
  watch(courseCode, (newCode) => {
    if (/^\d{4}$/.test(newCode)) {
      load(newCode);
    }
  }, { immediate: true });
  
  return { courseCode, semesters, loading, error };
}
