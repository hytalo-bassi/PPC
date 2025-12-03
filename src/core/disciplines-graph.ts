import { Discipline } from "../models/discipline";

/**
 * Classe que representa um grafo de dependências entre disciplinas acadêmicas.
 *
 * @class
 * @description
 * Implementa uma estrutura de grafo direcionado acíclico (DAG) para modelar as relações
 * de pré-requisitos entre disciplinas de um curso. Permite consultas eficientes sobre
 * dependências diretas e indiretas entre disciplinas.
 *
 * **Estrutura de dados:**
 * - `beforeList`: Mapeia cada disciplina para suas dependências (pré-requisitos)
 * - `afterList`: Mapeia cada disciplina para as disciplinas que dependem dela
 * - `idToDiscipline`: Índice para acesso rápido às disciplinas por ID
 *
 * **Características principais:**
 * - Estrutura bidirecional para navegação eficiente no grafo
 *
 * @example
 * const graph = new DisciplinesGraph();
 * const disciplinas = [
 *   new Discipline('Cálculo I', 60, 101, TipoCurso.Obrigatoria, 1, []),
 *   new Discipline('Cálculo II', 60, 102, TipoCurso.Obrigatoria, 2, [101])
 * ];
 *
 * graph.buildGraph(disciplinas);
 * console.log(graph.getPreRequisites(102)); // [101]
 * console.log(graph.getNextDisciplines(101)); // [102]
 */
export default class DisciplinesGraph {
  /**
   * Mapa de disciplinas para seus pré-requisitos (dependências anteriores).
   *
   * @type {Map<number, Array<number>>}
   * @private
   * @description
   * Chave: ID da disciplina
   * Valor: Array de IDs das disciplinas que são pré-requisitos
   */
  beforeList: Map<number, Array<number>> = new Map<number, Array<number>>();

  /**
   * Mapa de disciplinas para as disciplinas que dependem dela (dependências posteriores).
   *
   * @type {Map<number, Array<number>>}
   * @private
   * @description
   * Chave: ID da disciplina
   * Valor: Array de IDs das disciplinas que têm esta disciplina como pré-requisito
   */
  afterList: Map<number, Array<number>> = new Map<number, Array<number>>();

  /**
   * Índice para acesso rápido às instâncias de disciplinas por ID.
   *
   * @type {Map<number, Discipline>}
   * @private
   * @description
   * Permite recuperar a disciplina completa a partir de seu ID em tempo constante O(1)
   */
  idToDiscipline: Map<number, Discipline> = new Map<number, Discipline>();

  /**
   * Retorna uma disciplina pelo seu ID.
   *
   * @param {number} id - Identificador único da disciplina
   * @returns {Discipline|undefined} A disciplina correspondente ou `undefined` se não encontrada
   *
   * @description
   * Método de consulta para recuperar a instância completa de uma disciplina.
   * Retorna `undefined` se o ID não existir no grafo.
   *
   * @example
   * const calculo = graph.getDiscipline(101);
   * if (calculo) {
   *   console.log(calculo.apelido); // 'cálculo i'
   * }
   */
  getDiscipline(id: number): Discipline | undefined {
    return this.idToDiscipline.get(id);
  }

  /**
   * Retorna a lista de pré-requisitos de uma disciplina pelo seu ID.
   *
   * @param {number} id - Identificador da disciplina
   * @returns {Array<number>} Array de IDs das disciplinas que são pré-requisitos (cópia defensiva)
   *
   * @description
   * Retorna uma cópia defensiva do array de pré-requisitos para evitar modificações acidentais
   * da estrutura interna do grafo. Se a disciplina não tiver pré-requisitos ou não existir,
   * retorna um array vazio.
   *
   * @example
   * const preReqs = graph.getPreRequisites(102);
   * console.log(preReqs); // [101] - Cálculo II requer Cálculo I
   */
  getPreRequisites(id: number): Array<number> {
    return [...(this.beforeList.get(id) ?? [])];
  }

  /**
   * Retorna a lista de disciplinas que dependem de uma disciplina específica.
   *
   * @param {number} id - Identificador da disciplina base
   * @param {boolean} [recursivo=false] - Define o tipo de busca:
   *   - `false`: Retorna apenas dependentes diretos (imediatos)
   *   - `true`: Retorna todos os dependentes diretos, indiretos e transitivos
   * @returns {Array<number>} Array de IDs das disciplinas dependentes (sem duplicatas)
   *
   * @description
   * **Modo não-recursivo (padrão):**
   * Retorna apenas as disciplinas que têm a disciplina especificada como pré-requisito direto.
   *
   * **Modo recursivo:**
   * Retorna todas as disciplinas na cadeia de dependências, incluindo:
   * - Dependentes diretos (disciplinas do próximo semestre)
   * - Dependentes secundários (disciplinas que dependem dos dependentes diretos)
   * - E assim sucessivamente até o fim da cadeia
   *
   * **Comportamento especial:**
   * - Utiliza `Set` internamente para garantir que não haja IDs duplicados
   * - Se a disciplina não existir ou não tiver dependentes, retorna array vazio
   *
   *
   * @example
   * // Considerando: Cálculo I -> Cálculo II -> Cálculo III
   *
   * // Busca não-recursiva (apenas imediatos)
   * const imediatos = graph.getNextDisciplines(101, false);
   * console.log(imediatos); // [102] - apenas Cálculo II
   *
   * // Busca recursiva (toda a cadeia)
   * const todos = graph.getNextDisciplines(101, true);
   * console.log(todos); // [102, 103] - Cálculo II e Cálculo III
   */
  getNextDisciplines(id: number, recursivo: boolean = false): Array<number> {
    const afterListUnique: Set<number> = new Set(this.afterList.get(id) ?? []);

    if (recursivo) {
      for (const idImediato of afterListUnique.entries()) {
        this.getNextDisciplines(idImediato[1], recursivo).forEach(
          (idSecundario: number) => afterListUnique.add(idSecundario),
        );
      }
    }

    return [...afterListUnique];
  }

  /**
   * Limpa todos os dados armazenados no grafo.
   *
   * @returns {void}
   *
   * @description
   * Remove todas as disciplinas e suas relações, reinicializando as estruturas internas.
   * Útil para reconstruir o grafo com um novo conjunto de disciplinas ou liberar memória.
   *
   * **Uso típico:**
   * - Antes de reconstruir o grafo com novos dados
   * - Ao trocar de curso ou período letivo
   * - Para liberar recursos quando o grafo não é mais necessário
   *
   * @example
   * graph.clear();
   * console.log(graph.getDiscipline(101)); // undefined
   */
  clear(): void {
    this.beforeList = new Map();
    this.afterList = new Map();
    this.idToDiscipline = new Map();
  }

  /**
   * Constrói o grafo de dependências a partir de uma lista de disciplinas.
   *
   * @param {Array<Discipline>} listDisciplines - Array contendo todas as disciplinas do curso
   * @returns {void}
   *
   * @description
   * Processa a lista de disciplinas e constrói a estrutura de grafo bidirecional,
   * estabelecendo todas as relações de pré-requisitos (beforeList) e dependências (afterList).
   *
   * **Processo de construção:**
   * 1. Limpa qualquer dado anterior do grafo
   * 2. Indexa todas as disciplinas por ID para acesso rápido
   * 3. Mapeia os pré-requisitos de cada disciplina (beforeList)
   * 4. Constrói o mapa reverso de dependentes (afterList)
   *
   * **Comportamento importante:**
   * - Sempre limpa o grafo antes de reconstruir (chama `clear()` internamente)
   * - Garante consistência bidirecional: se A é pré-requisito de B, então B é dependente de A
   * - Ignora disciplinas com array de pré-requisitos nulo ou indefinido
   *
   * **Validações recomendadas (não implementadas):**
   * - Verificar se todos os IDs de pré-requisitos existem na lista
   * - Detectar ciclos no grafo (dependências circulares)
   * - Validar IDs duplicados
   *
   * @example
   * const disciplinas = [
   *   new Discipline('Programação I', 60, 201, TipoCurso.Obrigatoria, 1, []),
   *   new Discipline('Programação II', 60, 202, TipoCurso.Obrigatoria, 2, [201]),
   *   new Discipline('Estrutura de Dados', 60, 203, TipoCurso.Obrigatoria, 3, [202])
   * ];
   *
   * const graph = new DisciplinesGraph();
   * graph.buildGraph(disciplinas);
   *
   * // Agora é possível consultar as relações
   * console.log(graph.getPreRequisites(203)); // [202]
   * console.log(graph.getNextDisciplines(201, true)); // [202, 203]
   */
  buildGraph(listDisciplines: any): void {
    this.clear();
    for (const discipline of listDisciplines) {
      const id = discipline.id_curso;
      this.idToDiscipline.set(id, discipline);
      this.beforeList.set(id, discipline.pre_requisitos);

      for (const preRequisite of discipline.pre_requisitos ?? []) {
        const newAfterList = [...this.getNextDisciplines(preRequisite), id];
        this.afterList.set(preRequisite, newAfterList);
      }
    }
  }
}
