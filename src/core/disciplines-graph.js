import { Discipline } from "../models/discipline";

/**
 * Representa o grafo de relações entre Disciplinas.
 */
export default class DisciplinesGraph {
  beforeList = new Map();
  afterList  = new Map();
  idToDiscipline  = new Map();

  /**
   * Retorna uma disciplina pelo seu ID
   * @param {number} id
   * @returns {Discipline|undefined}
   */
  getDiscipline(id) {
    return this.idToDiscipline.get(id);
  }

  /**
   * Retorna a lista de pre-requisitos de uma disciplina pelo seu ID
   * @param {number} id 
   * @returns {Array<number>}
   */
  getPreRequisites(id) {
    return [...(this.beforeList.get(id) ?? [])]
  }

  /**
   * Retorna a lista de matérias que precisam de uma disciplina pelo seu ID
   * @param {number} id da matéria
   * @param {boolean} recursivo se False, retorna uma lista de matérias imediatas que precisam de 
   *                            uma disciplina, caso contrário retorna uma lista que recursivamente
   *                            lista as matérias imediatas, secundárias e assim por diante.
   * @returns {Array<number>}
   */
  getNextDisciplines(id, recursivo = false) {
    const afterListUnique = new Set(this.afterList.get(id) ?? []);

    if (recursivo) {
      for (const idImediato of afterListUnique.entries()) {
        afterListUnique.add(...this.getNextDisciplines(idImediato, recursivo));
      }
    }

    return [...afterListUnique];
  }

  /**
   * Limpa dados antigos no Grafo
   */
  clear() {
    this.beforeList = new Map();
    this.afterList  = new Map();
    this.idToDiscipline  = new Map();
  }

  /**
   * Cria um grafo das disciplinas a partir da lista de disciplinas.
   * @param {Array<Discipline>} listDisciplines 
   */
  buildGraph(listDisciplines) {
    this.clear();
    for (const discipline of listDisciplines) {
      const id = discipline.id_curso
      this.idToDiscipline.set(id, discipline);
      this.beforeList.set(id, discipline.pre_requisitos);

      for (const preRequisite of (discipline.pre_requisitos ?? [])) {
        const newAfterList = [...this.getNextDisciplines(preRequisite), id];
        this.afterList.set(preRequisite, newAfterList);
      }
    }
  }
}
