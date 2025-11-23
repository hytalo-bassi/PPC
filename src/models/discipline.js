/**
 * Enumeração imutável que define os tipos de disciplina em um curso.
 * 
 * @readonly
 * @enum {number}
 * @property {number} Obrigatoria - Disciplina obrigatória (valor: 0)
 * @property {number} Optativa - Disciplina optativa (valor: 1)
 * 
 * @description
 * Objeto congelado (immutable) que representa os tipos possíveis de disciplinas.
 * O uso de `Object.freeze()` garante que os valores não possam ser modificados acidentalmente.
 * 
 * **Convenção de valores:**
 * - 0: Disciplina obrigatória para conclusão do curso
 * - 1: Disciplina optativa/eletiva
 * 
 * @example
 * // Uso correto
 * const tipo = TipoCurso.Obrigatoria; // 0
 */
export const TipoCurso = Object.freeze({
  Obrigatoria: 0,
  Optativa: 1,
});

/**
 * Classe que representa uma disciplina de um curso acadêmico.
 * 
 * @class
 * @property {string} apelido - Nome/sigla da disciplina em letras minúsculas.
 * @property {number} carga_horaria - Carga horária teórica da disciplina em horas.
 * @property {string|number} id_curso - Identificador único da disciplina.
 * @property {number} tipo - Tipo da disciplina (0: Obrigatória, 1: Optativa).
 * @property {number} semestre - Número do semestre em que a disciplina é oferecida.
 * @property {Array<string|number>} pre_requisitos - Array de IDs das disciplinas que são pré-requisitos.
 * @property {Array<string|number>} requisitoDe - Array de IDs das disciplinas que têm esta como pré-requisito.
 * 
 * @description
 * Classe modelo para representar disciplinas acadêmicas, incluindo suas relações de dependência
 * (pré-requisitos e disciplinas dependentes). Implementa valores padrão para todos os parâmetros
 * opcionais e normaliza o nome da disciplina para minúsculas.
 * 
 * **Valores padrão automáticos:**
 * - `id_curso`: Gerado aleatoriamente (1 a 1.000.000) se não fornecido
 * - `tipo`: `TipoCurso.Obrigatoria` (0) se não fornecido
 * - `pre_requisitos`: Array vazio se não fornecido
 * - `requisitoDe`: Array vazio se não fornecido
 * 
 * **Comportamento especial:**
 * - O apelido é sempre convertido para minúsculas para padronização
 * - ID aleatório é gerado se não fornecido (útil para criação de disciplinas temporárias/mockadas)
 * 
 * **Estrutura de dependências:**
 * - `pre_requisitos`: Disciplinas que devem ser cursadas ANTES desta
 * - `requisitoDe`: Disciplinas que requerem esta como pré-requisito (relação inversa)
 */
export class Discipline {
  /**
   * Cria uma nova instância de Discipline.
   * 
   * @constructor
   * @param {string} apelido - Nome ou sigla da disciplina (será convertido para minúsculas).
   * @param {number} carga_horaria - Carga horária teórica em horas.
   * @param {string|number} [id_curso] - Identificador único da disciplina. Se não fornecido, gera um ID aleatório entre 1 e 1.000.000.
   * @param {number} [tipo] - Tipo da disciplina (use TipoCurso.Obrigatoria ou TipoCurso.Optativa). Padrão: TipoCurso.Obrigatoria (0).
   * @param {number} semestre - Número do semestre (1-N para semestres regulares, 99 para disciplinas sem período fixo).
   * @param {Array<string|number>} [pre_requisitos] - Array de IDs das disciplinas que são pré-requisitos. Padrão: [].
   * @param {Array<string|number>} [requisitoDe] - Array de IDs das disciplinas que dependem desta. Padrão: [].
   * 
   * @example
   * // Acesso às propriedades
   * console.log(algoritmos.apelido); // 'algoritmos ii' (em minúsculas)
   * console.log(algoritmos.tipo === TipoCurso.Obrigatoria); // true
   * console.log(algoritmos.pre_requisitos); // [id de algoritmos i]
   */
  constructor(apelido, carga_horaria, id_curso, tipo, semestre, pre_requisitos, requisitoDe) {
    this.apelido = apelido.toLowerCase();
    
    this.carga_horaria = carga_horaria;
    
    this.id_curso = id_curso;
    if (!id_curso) {
      this.id_curso = Math.floor(Math.random() * 10**6) + 1;
    }
    
    this.tipo = tipo;
    if (!tipo && tipo !== 0) { // Verifica explicitamente para evitar problema com tipo = 0
      this.tipo = TipoCurso.Obrigatoria;
    }
    
    this.semestre = semestre;
    
    this.pre_requisitos = pre_requisitos;
    if (!pre_requisitos) {
      this.pre_requisitos = [];
    }
    
    this.requisitoDe = requisitoDe;
    if (!requisitoDe) {
      this.requisitoDe = [];
    }
  }
}
