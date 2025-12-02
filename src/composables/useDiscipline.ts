import { ref, watch, type Ref } from 'vue';
import { pegarSemestralizacao, pegarSemestralizacaoLista } from '../services/disciplines-api';
import { Discipline } from '@/models/discipline.js';
import DisciplinesGraph from '../core/disciplines-graph';

/**
 * Objeto de refêrencias para busca de cursos, juntamente com sua semestralização e grafo de relacionamentos.
 * 
 * @interface SemestralizacaoGrafoI
 * @property {Ref<number>} codigoCurso - Referência sobre o número do curso para busca
 * @property {Ref<Array<Array<Discipline>>>} semestres - Referência da matriz bidimensional de semestres,
 *                                                       onde cada elemento é representa um semestre, e cada sub-elemento
 *                                                       são as disciplinas do semestre.
 * @property {DisciplinesGraph} grafo - Instância do grafo de relacionamento, ele se limpa e re-cria automaticamente.
 * @property {Ref<boolean>} carregando - Referência se está carregando o curso, se true os dados ainda estão
 *                                       sendo processados, se false significa que a requisição concluiu com
 *                                       sucesso ou erro.
 * @property {Ref<Error | null>} erro - Referência de erro, caso a requisição tenha falhado, ou null se tudo
 *                                      correu como esperado.
 */
interface SemestralizacaoGrafoI {
  codigoCurso: Ref<number>,
  semestres: Ref<Array<Array<Discipline>>>,
  grafo: DisciplinesGraph,
  carregando: Ref<boolean>,
  erro: Ref<Error | null>,
}

/**
 * Objeto de refêrencias para busca de cursos, juntamente com sua semestralização.
 * 
 * @interface SemestralizacaoGrafoI
 * @property {Ref<number>} codigoCurso - Referência sobre o número do curso para busca
 * @property {Ref<Array<Array<Discipline>>>} semestres - Referência da matriz bidimensional de semestres,
 *                                                       onde cada elemento é representa um semestre, e cada sub-elemento
 *                                                       são as disciplinas do semestre.
 * @property {Ref<boolean>} carregando - Referência se está carregando o curso, se true os dados ainda estão
 *                                       sendo processados, se false significa que a requisição concluiu com
 *                                       sucesso ou erro.
 * @property {Ref<Error | null>} erro - Referência de erro, caso a requisição tenha falhado, ou null se tudo
 *                                      correu como esperado.
 */
interface SemestralizacaoI {
  codigoCurso: Ref<number>,
  semestres: Ref<Array<Array<Discipline>>>,
  carregando: Ref<boolean>,
  erro: Ref<Error | null>,
}

/**
 * Composable Vue para gerenciamento de disciplinas de cursos.
 * 
 * @param {number} [codigo] - Código inicial do curso (formato: 4 dígitos numéricos).
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
 * - Monitora mudanças no `codigoCurso` e recarrega as disciplinas automaticamente
 * - Valida se o código possui exatamente 4 dígitos numéricos antes de fazer a requisição
 * - Gerencia estados de loading e erro de forma reativa
 * - Em caso de erro, mantém os dados anteriores em `semestres` e armazena o erro em `erro`
 * 
 * **Validação:**
 * - Apenas códigos com formato válido (4 dígitos) acionam o carregamento
 * - Códigos inválidos são ignorados silenciosamente (sem requisição, sem erro)
 * 
 * **Estados:**
 * - `carregando`: true durante a requisição, false após conclusão (sucesso ou erro)
 * - `erro`: null em caso de sucesso, contém o objeto Error em caso de falha
 * - `semestres`: mantém dados anteriores até que novos sejam carregados com sucesso
 * 
 * @throws {Error} Erros de rede ou parsing são capturados e armazenados em `erro.value`
 * 
 * @see {@link pegarSemestralizacao} - Função de serviço utilizada para carregar os dados
 */
export function useSemestralizacao(codigo: number): SemestralizacaoI {
  const codigoCurso = ref(codigo);
  const semestres: Ref<Array<Array<Discipline>>> = ref([]);
  const carregando = ref(false);
  const erro: Ref<Error|null> = ref(null);
  
  /**
   * Carrega as disciplinas de um curso específico.
   * 
   * @private
   * @async
   * @param {string} codigo - Código do curso a ser carregado (deve ter 4 dígitos).
   * @returns {Promise<void>}
   * 
   * @description
   * Função auxiliar que:
   * 1. Ativa o estado de loading
   * 2. Limpa erros anteriores
   * 3. Tenta carregar as disciplinas via pegarSemestralizacao
   * 4. Atualiza o estado de semestres em caso de sucesso
   * 5. Captura e armazena erros em caso de falha
   * 6. Desativa o estado de loading ao finalizar
   */
  const load = async (codigo: number): Promise<void> => {
    carregando.value = true;
    
    try {
      semestres.value = await pegarSemestralizacao(Number(codigo));
      erro.value = null;
    } catch (e) {
      console.error("Erro ao carregar disciplinas!", e);
      erro.value = e as Error;
    } finally {
      carregando.value = false;
    }
  };
  
  /**
   * Watcher que monitora mudanças no código do curso.
   * 
   * @description
   * - Executa automaticamente quando codigoCurso é alterado
   * - Valida se o novo código possui exatamente 4 dígitos numéricos
   * - Chama a função load() apenas se o código for válido
   * - Opção `immediate: true` executa o carregamento inicial imediatamente
   * 
   * **Regex de validação:** /^\d{4}$/
   * - ^ : início da string
   * - \d{4} : exatamente 4 dígitos
   * - $ : fim da string
   */
  watch(codigoCurso, (novoCodigo) => {
    if (/^\d{4}$/.test(String(novoCodigo))) {
      load(novoCodigo);
    }
  }, { immediate: true });

  return { codigoCurso, semestres, carregando, erro };
}

/**
 * Composable Vue para gerenciamento de disciplinas de cursos e grafo de relações.
 * 
 * **Estados:**
 * - `carregando`: true durante a requisição, false após conclusão (sucesso ou erro)
 * - `erro`: null em caso de sucesso, contém o objeto Error em caso de falha
 * - `semestres`: mantém dados anteriores até que novos sejam carregados com sucesso
 * 
 * @throws {Error} Erros de rede ou parsing são capturados e armazenados em `erro.value`
 * 
 * @see {@link pegarSemestralizacaoLista} - Função de serviço utilizada para carregar os dados
 */
export function useSemestralizacaoGrafo(codigo: number): SemestralizacaoGrafoI {
  const codigoCurso = ref(codigo);
  const grafo = new DisciplinesGraph();
  const semestres: Ref<Array<Array<Discipline>>> = ref([]);
  const carregando = ref(false);
  const erro: Ref<Error|null> = ref(null);
  
  /**
   * Carrega as disciplinas de um curso específico.
   * 
   * @private
   * @async
   * @param {string} codigo - Código do curso a ser carregado (deve ter 4 dígitos).
   * @returns {Promise<void>}
   * 
   * @description
   * Função auxiliar que:
   * 1. Ativa o estado de loading
   * 2. Limpa erros anteriores e o grafo anterior
   * 3. Tenta carregar as disciplinas via pegarSemestralizacao
   * 4. Atualiza o estado de semestres e grafo em caso de sucesso
   * 5. Captura e armazena erros em caso de falha
   * 6. Desativa o estado de loading ao finalizar
   */
  const load = async (codigo: number): Promise<void> => {
    carregando.value = true;
    
    try {
      const { semestres: _semestres, disciplinas } = await pegarSemestralizacaoLista(codigo) 
      semestres.value = _semestres;

      grafo.clear();
      grafo.buildGraph(disciplinas);

      erro.value = null;
    } catch (e) {
      console.error("Erro ao carregar disciplinas!", e);
      erro.value = e as Error;
    } finally {
      carregando.value = false;
    }
  };
  
  /**
   * Watcher que monitora mudanças no código do curso.
   * 
   * @description
   * - Executa automaticamente quando codigoCurso é alterado
   * - Valida se o novo código possui exatamente 4 dígitos numéricos
   * - Chama a função load() apenas se o código for válido
   * - Opção `immediate: true` executa o carregamento inicial imediatamente
   * 
   * **Regex de validação:** /^\d{4}$/
   * - ^ : início da string
   * - \d{4} : exatamente 4 dígitos
   * - $ : fim da string
   */
  watch(codigoCurso, (novoCodigo) => {
    if (/^\d{4}$/.test(String(novoCodigo))) {
      load(novoCodigo);
    }
  }, { immediate: true });

  return { codigoCurso, grafo, semestres, carregando, erro };
}
