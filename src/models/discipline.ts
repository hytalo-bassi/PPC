/**
 * Enumeração que define os tipos de disciplina em um curso.
 *
 * @readonly
 * @enum {number}
 * @property {number} Obrigatoria - Disciplina obrigatória (valor: 0)
 * @property {number} Optativa - Disciplina optativa (valor: 1)
 *
 * @description
 * Enumeração que representa os tipos possíveis de disciplinas.
 *
 * **Convenção de valores:**
 * - 0: Disciplina obrigatória para conclusão do curso
 * - 1: Disciplina optativa/eletiva
 *
 * @example
 * // Uso correto
 * const tipo = TipoCurso.Obrigatoria; // 0
 */
export enum TipoCurso {
  Obrigatoria = 0,
  Optativa = 1,
}

/**
 * Classe que representa uma disciplina de um curso acadêmico.
 *
 * @class
 * @property {string} apelido - Nome/sigla da disciplina em letras minúsculas.
 * @property {number} carga_horaria - Carga horária teórica da disciplina em horas.
 * @property {number} id_curso - Identificador único da disciplina.
 * @property {TipoCurso} tipo - Tipo da disciplina (0: Obrigatória, 1: Optativa).
 * @property {number} semestre - Número do semestre em que a disciplina é oferecida.
 * @property {Array<number>} pre_requisitos - Array de IDs das disciplinas que são pré-requisitos.
 *
 * @description
 * Classe modelo para representar disciplinas acadêmicas, incluindo suas relações de dependência
 * (pré-requisitos). Implementa valores padrão para todos os parâmetros
 * opcionais e normaliza o nome da disciplina para minúsculas.
 *
 * **Valores padrão automáticos:**
 * - `id_curso`: Gerado aleatoriamente (1 a 1.000.000) se não fornecido
 * - `tipo`: `TipoCurso.Obrigatoria` (0) se não fornecido
 * - `pre_requisitos`: Array vazio se não fornecido
 *
 * **Comportamento especial:**
 * - O apelido é sempre convertido para minúsculas para padronização
 * - ID aleatório é gerado se não fornecido (útil para criação de disciplinas temporárias/mockadas)
 *
 * **Estrutura de dependências:**
 * - `pre_requisitos`: Disciplinas que devem ser cursadas ANTES desta
 */
export class Discipline {
  apelido: string;
  carga_horaria: number;
  id_curso: number;
  tipo: TipoCurso;
  semestre: number;
  pre_requisitos: Array<number>;

  /**
   * Cria uma nova instância de Discipline.
   *
   * @constructor
   * @param {string} apelido - Nome ou sigla da disciplina (será convertido para minúsculas).
   * @param {number} carga_horaria - Carga horária teórica em horas.
   * @param {string | number} [id_curso] - Identificador único da disciplina. Se não fornecido, gera um ID aleatório entre 1 e 1.000.000.
   * @param {number} [tipo] - Tipo da disciplina (use TipoCurso.Obrigatoria ou TipoCurso.Optativa). Padrão: TipoCurso.Obrigatoria (0).
   * @param {number} semestre - Número do semestre (1-N para semestres regulares, 99 para disciplinas sem período fixo) começando por 1.
   * @param {Array<number>} [pre_requisitos] - Array de IDs das disciplinas que são pré-requisitos. Padrão: [].
   *
   * @example
   * // Criando uma disciplina obrigatória com pré-requisito
   * const algoritmos1 = new Discipline('Algoritmos I', 60, 101, TipoCurso.Obrigatoria, 1, []);
   * const algoritmos2 = new Discipline('Algoritmos II', 60, 102, TipoCurso.Obrigatoria, 2, [101]);
   *
   * console.log(algoritmos2.pegaPreRequisitos()); // [101]
   * console.log(algoritmos.tipo === TipoCurso.Obrigatoria); // true
   * console.log(algoritmos2.apelido); // 'algoritmos ii' (normalizado)
   */
  constructor(
    apelido: string,
    carga_horaria: number,
    id_curso: string | number,
    tipo: TipoCurso,
    semestre: number,
    pre_requisitos: Array<number>,
  ) {
    this.apelido = apelido.toLowerCase();

    this.carga_horaria = carga_horaria;

    this.id_curso = Number(id_curso);
    if (!id_curso) {
      this.id_curso = Math.floor(Math.random() * 10 ** 6) + 1;
    }

    this.tipo = tipo;
    if (!tipo && tipo !== 0) {
      // Verifica explicitamente para evitar problema com tipo = 0
      this.tipo = TipoCurso.Obrigatoria;
    }

    this.semestre = semestre;

    this.pre_requisitos = pre_requisitos;
    if (!pre_requisitos) {
      this.pre_requisitos = [];
    }
  }

  /**
   * Retorna o ID da disciplina.
   *
   * @returns {number} o ID da disciplina
   */
  pegaId(): number {
    return this.id_curso;
  }

  /**
   * Retorna a carga horária teórica da disciplina.
   *
   * @returns {number} a carga horária teórica da disciplina
   */
  pegaCarga(): number {
    return this.carga_horaria;
  }

  /**
   * Retorna o tipo da disciplina.
   *
   * @returns {TipoCurso} o tipo da disciplina
   */
  pegaTipo(): TipoCurso {
    return this.tipo;
  }

  /**
   * Retorna o semestre esperado para cursar a disciplina começando por 1.
   *
   * @returns {number} o semestre esperado
   */
  pegaSemestre(): number {
    return this.semestre;
  }

  /**
   * Retorna o apelido da disciplina.
   *
   * @returns {string} o apelido da disciplina
   */
  pegaApelido(): string {
    return this.apelido;
  }

  /**
   * Retorna uma lista contendo os IDs das disciplinas que são pré-requisitos desta disciplina.
   *
   * @returns {Array[number]} cópia defensiva da lista de pré-requisitos
   */
  pegaPreRequisitos(): number[] {
    return [...this.pre_requisitos];
  }
}
