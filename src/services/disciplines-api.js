import { Discipline, TipoCurso } from "../models/discipline.js";
import DisciplinesGraph from "../core/disciplines-graph.js";

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
 * Converte texto puro de tipo para um TipoCurso.
 * @private
 * @param {string} tipo 
 * @returns {TipoCurso}
 */
function tipoParaEnum(tipo) {
  return tipo === "OBR" 
    ? TipoCurso.Obrigatoria 
    : TipoCurso.Optativa;
}

/**
 * Expande uma lista de objetos com a estrutura de uma disciplina em uma lista de IDs
 * @private
 * @param {Array<Object>} listaObjeto
 * @throws {Error} Pode lançar erro caso algum elemento na lista não contenha o atributo 'Id'.
 * @returns {Array<number>} lista de IDs de cada disciplina.
 */
function expandirListaParaIds(listaObjeto) {
  return listaObjeto.map((sub_disciplina_obj) => {
    if (!sub_disciplina_obj.Id) throw new Error("Objeto fora de forma padrão! Objeto recebido:", sub_disciplina_obj);
    
    return sub_disciplina_obj.Id;
  });
}

/**
 * Transforma um objeto na forma padrão de disciplina em uma instância de Discipline.
 * @param {Object} obj o objeto na forma padrão
 * @private
 * @throws {Error} Pode lançar erros 
 * @returns {Discipline} a instância de Discipline.
 */
function transformarEmDisciplina(obj) {
  const {
    Apelido,
    CargaHorariaTeorico,
    Id,
    Tipo,
    Semestre,
    ListaPrequisitos
  } = obj;

  if (!Apelido || !CargaHorariaTeorico || !Id || !Tipo || !Semestre || !ListaPrequisitos) {
    throw new Error("Objeto fora da forma padrão! Objeto recebido: ", obj);
  }
  
  const tipo = tipoParaEnum(Tipo);
  
  const lista_pre_requisitos = expandirListaParaIds(ListaPrequisitos);
  
  return new Discipline(
    Apelido,
    CargaHorariaTeorico,
    Id,
    tipo,
    Semestre,
    lista_pre_requisitos
  );
}

/**
 * Retorna a semestralização de um curso dado seu código
 * @param {number} codigo -- Código do curso.
 * @async
 * @throws {Error} Pode lançar erro se o arquivo não for encontrado (404) ou se houver falha na conexão de rede ou se o JSON estar em forma diferente do esperado.
 * @throws {SyntaxError} Pode lançar erro se o JSON retornado for inválido.
 * @returns {Promise<Array<Array<Discipline>>} um array onde cada elemento é um array que representa um semestre com várias disciplinas.
 */
export async function pegarSemestralizacao(codigo) {
  let semestres = [];

  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj)

    if (disciplinaObj.Semestre !== 99 && semestres.length < disciplinaObj.Semestre) {
      semestres.length = disciplinaObj.Semestre;
      for (let i = 0; i < semestres.length; i++) {
        if (!semestres[i]) semestres[i] = [];
      }
    }

    if (disciplinaObj.Semestre !== 99) {
      semestres[disciplinaObj.Semestre - 1].push(disciplina);
    }
  }

  return semestres;
}

/**
 * Retorna a lista de disciplinas de um curso dado seu código
 * @param {number} codigo -- Código do curso.
 * @async
 * @throws {Error} Pode lançar erro se o arquivo não for encontrado (404) ou se houver falha na conexão de rede ou se o JSON estar em forma diferente do esperado.
 * @throws {SyntaxError} Pode lançar erro se o JSON retornado for inválido.
 * @returns {Promise<Array<Discipline>} um array onde cada elemento é uma disciplina.
 */
export async function pegarDisciplinas(codigo) {
  const disciplinas = [];
  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj)
    disciplinas.push(disciplina);
  }

  return disciplinas;
}

/**
 * Retorna a lista de disciplinas de um curso dado seu código junto de sua matriz de semestre.
 * @param {number} codigo -- Código do curso.
 * @async
 * @throws {Error} Pode lançar erro se o arquivo não for encontrado (404) ou se houver falha na conexão de rede ou se o JSON estar em forma diferente do esperado.
 * @throws {SyntaxError} Pode lançar erro se o JSON retornado for inválido.
 * @returns {Promise<Object>} Objeto contendo tanto a matriz de semestres e as disciplinas listadas.
 * @returns {Array<Array<Discipline>>} return.semestres matriz de disciplinas, onde cada elemento no array é um array de disciplinas do semestre i+1. 
 * @returns {Array<Discipline>} return.disciplinas lista de disciplinas não ordenadas.
*/
export async function pegarSemestralizacaoLista(codigo) {
  let semestres = [];
  let disciplinas = [];

  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj)

    if (disciplinaObj.Semestre !== 99 && semestres.length < disciplinaObj.Semestre) {
      semestres.length = disciplinaObj.Semestre;
      for (let i = 0; i < semestres.length; i++) {
        if (!semestres[i]) semestres[i] = [];
      }
    }

    if (disciplinaObj.Semestre !== 99) {
      semestres[disciplinaObj.Semestre - 1].push(disciplina);
    }

    disciplinas.push(disciplina);
  }

  return { semestres, disciplinas };
}

/**
 * Retorna um grafo de disciplinas de um curso pelo seu código.
 *  
 * @param {number} codigo -- Código do curso.
 * @async
 * @throws {Error} Pode lançar erro se o arquivo não for encontrado (404) ou se houver falha na conexão de rede ou se o JSON estar em forma diferente do esperado.
 * @throws {SyntaxError} Pode lançar erro se o JSON retornado for inválido.
 * @returns {Promise<DisciplinesGraph>} grafo de disciplinas.
 */
export async function pegarGrafo(codigo) {
  const grafo = new DisciplinesGraph();
  const disciplinas = await pegarDisciplinas(codigo);

  grafo.buildGraph(disciplinas);

  return grafo;
}
