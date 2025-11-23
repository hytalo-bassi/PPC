import { Discipline, TipoCurso } from "../models/discipline.js";

/**
 * Carrega um arquivo JSON contendo dados de disciplinas a partir do código fornecido.
 * 
 * @private
 * @async
 * @param {string} code - Código identificador de 4 dígitos do arquivo JSON a ser carregado (sem extensão).
 * @returns {Promise<Array<Object>>} Promise que resolve para um array de objetos representando disciplinas.
 * @throws {Error} Pode lançar erro se o arquivo não for encontrado (404) ou se houver falha na conexão de rede.
 * @throws {SyntaxError} Pode lançar erro se o JSON retornado for inválido.
 * 
 * @description
 * Busca e interpreta um arquivo JSON localizado em `/data/${code}.json`.
 * Esta função é auxiliar e não deve ser utilizada diretamente fora deste módulo.
 * 
 * @example
 * const data = await load_json('1905');
 */
async function load_json(code) {
  const res = await fetch(`/data/${code}.json`);
  const data = await res.json();
  return data;
}

/**
 * Obtém e processa as disciplinas de um curso específico, organizando-as por semestre.
 * 
 * @async
 * @param {string} codigo - Código identificador do curso (ex: '1905', '1904').
 * @returns {Promise<Array<Array<Discipline>>>} Promise que resolve para um array bidimensional onde cada 
 *          índice representa um semestre (0-indexed) contendo um array de objetos Discipline.
 * @throws {Error} Pode lançar erro se houver falha ao carregar o arquivo JSON.
 * @throws {SyntaxError} Pode lançar erro se o formato do JSON for inválido.
 * @throws {TypeError} Pode lançar erro se os dados do JSON não corresponderem à estrutura esperada.
 * 
 * @description
 * Esta função é responsável por:
 * 1. Carregar os dados brutos das disciplinas a partir de um arquivo JSON
 * 2. Transformar cada objeto JSON em uma instância da classe Discipline
 * 3. Organizar as disciplinas em um array bidimensional por semestre
 * 4. Processar os pré-requisitos de cada disciplina
 * 5. Classificar as disciplinas entre obrigatórias e optativas
 * 
 * **Estrutura esperada do JSON:**
 * Cada objeto no array deve conter:
 * - `Apelido` {string}: Nome/sigla da disciplina
 * - `CargaHorariaTeorico` {number}: Carga horária teórica em horas
 * - `Id` {string|number}: Identificador único da disciplina
 * - `Tipo` {string}: Tipo da disciplina ('OBR' para obrigatória, outros valores para optativa)
 * - `Semestre` {number}: Número do semestre (1-N para disciplinas regulares, 99 para optativas sem semestre fixo)
 * - `ListaPrequisitos` {Array<Object>}: Array de objetos contendo pré-requisitos, cada um com propriedade `Id`
 * 
 * **Comportamento especial:**
 * - Disciplinas com `Semestre === 99` são consideradas optativas sem período fixo e não são incluídas no array de semestres
 * - O array de semestres é expandido dinamicamente conforme necessário
 * - Os índices do array retornado correspondem aos semestres menos 1 (Semestre 1 = índice 0)
 * 
 * @example
 * // Obter disciplinas do curso de Engenharia da Computação
 * const semestres = await getDisciplines('1905');
 * 
 * // Acessar disciplinas do primeiro semestre
 * const primeiroSemestre = semestres[0];
 * 
 * // Iterar sobre todos os semestres
 * semestres.forEach((disciplinas, indice) => {
 *   console.log(`Semestre ${indice + 1}:`, disciplinas);
 * });
 */
export async function getDisciplines(codigo) {
  let semesters = [];
  let mapIdDisciplinas = {};
  
  const data = await load_json(codigo);
  
  for (const disciplina_obj of data) {
    // Determina o tipo da disciplina (obrigatória ou optativa)
    const tipo = disciplina_obj.Tipo === "OBR" 
      ? TipoCurso.Obrigatoria 
      : TipoCurso.Optativa;
    
    const lista_pre_requisitos = disciplina_obj.ListaPrequisitos.map((sub_disciplina_obj) => {
      return sub_disciplina_obj.Id;
    });
    
    const disciplina = new Discipline(
      disciplina_obj.Apelido,
      disciplina_obj.CargaHorariaTeorico,
      disciplina_obj.Id,
      tipo,
      disciplina_obj.Semestre,
      lista_pre_requisitos
    );
    
    // Disciplinas com Semestre === 99 são ignoradas nesta expansão
    if (disciplina_obj.Semestre !== 99 && semesters.length < disciplina_obj.Semestre) {
      for (let i = 0; i < disciplina_obj.Semestre - semesters.length; i++) {
        semesters.push([]);
      }
    }
    
    if (disciplina_obj.Semestre !== 99) {
      semesters[disciplina_obj.Semestre - 1].push(disciplina);
    }
    
    mapIdDisciplinas[disciplina_obj.Id] = disciplina;
  }
  
  return semesters;
}
