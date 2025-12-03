import { Discipline, TipoCurso } from "../models/discipline.js";
import DisciplinesGraph from "../core/disciplines-graph.js";

/**
 * Carrega um arquivo JSON contendo dados de disciplinas a partir do código fornecido.
 *
 * @private
 * @async
 * @param {number} code - Código identificador de 4 dígitos do arquivo JSON a ser carregado (sem extensão)
 * @returns {Promise<Array<Record<string, unknown>>>} Promise que resolve para um array de objetos representando disciplinas no formato bruto do JSON
 * @throws {Error} Lança erro se o arquivo não for encontrado (HTTP 404) ou se houver falha na conexão de rede
 * @throws {SyntaxError} Lança erro se o conteúdo do arquivo não for um JSON válido
 *
 * @description
 * Função auxiliar interna que busca e interpreta arquivos JSON localizados em `/data/${code}.json`.
 * Esta função não deve ser utilizada diretamente fora deste módulo - use as funções públicas exportadas.
 * O código é transformado em uma String e completada com 0s. Exemplo: code: 15 -> '0015'.
 *
 * **Estrutura esperada do JSON:**
 * Array de objetos com propriedades: `Apelido`, `CargaHorariaTeorico`, `Id`, `Tipo`, `Semestre`, `ListaPrequisitos`
 *
 * @returns {Object} obj - Objeto contendo os dados da disciplina no formato do JSON
 * @returns {string} obj.Apelido - Nome ou sigla da disciplina
 * @returns {number} obj.CargaHorariaTeorico - Carga horária teórica em horas
 * @returns {number} obj.Id - Identificador único da disciplina
 * @returns {string} obj.Tipo - Tipo da disciplina ("OBR" ou "OPT")
 * @returns {number} obj.Semestre - Número do semestre (1-N ou 99 para sem período fixo)
 * @returns {Array<Object>} obj.ListaPrequisitos - Array de objetos representando pré-requisitos
 *
 * **Caminho do arquivo:**
 * - Base: `/data/`
 * - Formato: `${code}.json`
 * - Exemplo: código `1905` → `/data/1905.json`
 *
 * @example
 * // Uso interno apenas
 * const dadosBrutos = await load_json(1905);
 * console.log(dadosBrutos[0].Apelido); // Nome da primeira disciplina
 */
async function load_json(
  code: number,
): Promise<Array<Record<string, unknown>>> {
  const res = await fetch(`/data/${String(code).padStart(4)}.json`);
  const data = await res.json();
  return data;
}

/**
 * Converte uma string de tipo de disciplina para o enum TipoCurso.
 *
 * @private
 * @param {string} tipo - String representando o tipo da disciplina ("OBR" para obrigatória, qualquer outro valor para optativa)
 * @returns {TipoCurso} Enum correspondente ao tipo da disciplina
 *
 * @description
 * Função auxiliar de conversão que mapeia strings do formato JSON para valores do enum `TipoCurso`.
 *
 * **Mapeamento:**
 * - `"OBR"` → `TipoCurso.Obrigatoria` (valor 0)
 * - Qualquer outro valor → `TipoCurso.Optativa` (valor 1)
 *
 * **Comportamento:**
 * A comparação é case-sensitive. Valores como "obr" ou "Obr" serão tratados como optativas.
 *
 * @example
 * tipoParaEnum("OBR"); // TipoCurso.Obrigatoria (0)
 * tipoParaEnum("OPT"); // TipoCurso.Optativa (1)
 * tipoParaEnum("qualquer coisa"); // TipoCurso.Optativa (1)
 */
function tipoParaEnum(tipo: unknown): TipoCurso {
  return tipo === "OBR" ? TipoCurso.Obrigatoria : TipoCurso.Optativa;
}

/**
 * Extrai uma lista de IDs de disciplinas a partir de uma lista de objetos.
 *
 * @private
 * @param {Array<Record<string, unknown>>} listaObjeto - Array de objetos onde cada objeto deve conter a propriedade `Id`
 * @returns {Array<number>} Array contendo apenas os IDs extraídos dos objetos
 * @throws {Error} Lança erro se algum objeto no array não contiver a propriedade `Id`
 *
 * @description
 * Função auxiliar que transforma uma lista de objetos de disciplinas em uma lista simplificada
 * contendo apenas seus identificadores numéricos. Utilizada principalmente para processar
 * listas de pré-requisitos do formato JSON.
 *
 * **Validação:**
 * Verifica a existência da propriedade `Id` em cada objeto e lança exceção se não encontrada,
 * garantindo integridade dos dados antes do processamento.
 *
 * **Formato esperado dos objetos:**
 * ```javascript
 * { Id: number, ...outrasPropriedades }
 * ```
 *
 * @example
 * const objetos = [
 *   { Id: 101, Apelido: "Cálculo I" },
 *   { Id: 102, Apelido: "Cálculo II" }
 * ];
 * const ids = expandirListaParaIds(objetos);
 * console.log(ids); // [101, 102]
 */
function expandirListaParaIds(
  listaObjeto: Record<string, unknown>[],
): Array<number> {
  return listaObjeto.map((sub_disciplina_obj) => {
    if (!sub_disciplina_obj["Id"]) {
      throw new Error(
        `Objeto fora de forma padrão! Objeto recebido: ${JSON.stringify(sub_disciplina_obj)}`,
      );
    }

    return sub_disciplina_obj["Id"] as number;
  });
}

/**
 * Transforma um objeto no formato JSON padrão em uma instância de Discipline.
 *
 * @private
 * @param {Record<string, unknown>} obj - Objeto contendo os dados da disciplina no formato do JSON
 * @param {unknown} obj.Apelido - Nome ou sigla da disciplina. Tipo esperado: string
 * @param {unknown} obj.CargaHorariaTeorico - Carga horária teórica em horas. Tipo esperado: number
 * @param {unknown} obj.Id - Identificador único da disciplina. Tipo esperado: number
 * @param {unknown} obj.Tipo - Tipo da disciplina ("OBR" ou "OPT"). Tipo esperado: number
 * @param {unknown} obj.Semestre - Número do semestre (1-N ou 99 para sem período fixo). Tipo esperado: number
 * @param {Array<Record<string, unknown>>} obj.ListaPrequisitos - Array de objetos representando pré-requisitos
 * @returns {Discipline} Nova instância de Discipline com os dados processados
 * @throws {Error} Lança erro se alguma propriedade obrigatória estiver ausente no objeto
 *
 * @description
 * Função de conversão que transforma objetos no formato bruto do JSON em instâncias
 * tipadas da classe `Discipline`. Realiza validação, conversão de tipos e processamento
 * de estruturas aninhadas (como lista de pré-requisitos).
 *
 * **Processo de transformação:**
 * 1. Desestrutura e valida todas as propriedades obrigatórias
 * 2. Converte a string de tipo para enum usando `tipoParaEnum()`
 * 3. Expande a lista de objetos de pré-requisitos para array de IDs
 * 4. Instancia e retorna novo objeto `Discipline`
 *
 * **Validação de entrada:**
 * Verifica se todas as propriedades obrigatórias existem antes do processamento.
 * A ausência de qualquer propriedade resulta em erro explícito.
 *
 * **Formato esperado do objeto:**
 * ```javascript
 * {
 *   Apelido: "Cálculo I",
 *   CargaHorariaTeorico: 60,
 *   Id: 101,
 *   Tipo: "OBR",
 *   Semestre: 1,
 *   ListaPrequisitos: [{ Id: 100 }]
 * }
 * ```
 *
 * @example
 * const objJson = {
 *   Apelido: "Algoritmos",
 *   CargaHorariaTeorico: 60,
 *   Id: 201,
 *   Tipo: "OBR",
 *   Semestre: 2,
 *   ListaPrequisitos: []
 * };
 * const disciplina = transformarEmDisciplina(objJson);
 * console.log(disciplina.apelido); // "algoritmos" (normalizado)
 */
function transformarEmDisciplina(obj: Record<string, unknown>): Discipline {
  const { Apelido, CargaHorariaTeorico, Id, Tipo, Semestre, ListaPrequisitos } =
    obj;

  if (
    !Apelido ||
    !CargaHorariaTeorico ||
    !Id ||
    !Tipo ||
    !Semestre ||
    !Array.isArray(ListaPrequisitos) ||
    ListaPrequisitos.length === 0
  ) {
    throw new Error("Objeto fora da forma padrão! Objeto recebido: ", obj);
  }

  const tipo = tipoParaEnum(Tipo);

  const lista_pre_requisitos = expandirListaParaIds(ListaPrequisitos);

  return new Discipline(
    String(Apelido),
    Number(CargaHorariaTeorico),
    Number(Id),
    tipo,
    Number(Semestre),
    lista_pre_requisitos,
  );
}

/**
 * Retorna a matriz de semestralização de um curso dado seu código.
 *
 * @async
 * @param {number} codigo - Código identificador de 4 dígitos do curso (ex: 1905 para Engenharia da Computação)
 * @returns {Promise<Array<Array<Discipline>>>} Promise que resolve para uma matriz onde cada elemento é um array representando um semestre com suas disciplinas
 * @throws {Error} Lança erro se o arquivo não for encontrado (HTTP 404), se houver falha na conexão de rede, ou se o JSON estiver em formato inesperado
 * @throws {SyntaxError} Lança erro se o JSON retornado for inválido
 *
 * @description
 * Carrega e processa os dados de um curso, organizando as disciplinas em uma matriz bidimensional
 * onde cada posição representa um semestre específico do curso.
 *
 * **Estrutura do retorno:**
 * - `retorno[0]`: Array de disciplinas do 1º semestre
 * - `retorno[1]`: Array de disciplinas do 2º semestre
 * - `retorno[i]`: Array de disciplinas do (i+1)º semestre
 *
 * **Comportamento especial:**
 * - Disciplinas com `Semestre === 99` são excluídas da matriz (disciplinas sem período fixo/optativas livres)
 * - A matriz é dinamicamente redimensionada conforme necessário
 * - Disciplinas que não contenham o campo Semestres são ignoradas.
 * - Semestres sem disciplinas resultam em arrays vazios `[]`
 *
 * **Indexação:**
 * O índice do array é `semestre - 1` (primeiro semestre está em `[0]`)
 *
 * **Complexidade:**
 * O(n) onde n é o número total de disciplinas do curso
 *
 * @example
 * const semestres = await pegarSemestralizacao(1905);
 *
 * // Acessar disciplinas do primeiro semestre
 * console.log(semestres[0]); // [Discipline, Discipline, ...]
 *
 * // Contar disciplinas do terceiro semestre
 * console.log(semestres[2].length); // Quantidade de disciplinas
 *
 * // Iterar sobre todos os semestres
 * semestres.forEach((disciplinas, index) => {
 *   console.log(`${index + 1}º semestre: ${disciplinas.length} disciplinas`);
 * });
 */
export async function pegarSemestralizacao(
  codigo: number,
): Promise<Array<Array<Discipline>>> {
  const semestres: Array<Array<Discipline>> = [];

  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj);
    if (!disciplinaObj["Semestre"]) {
      console.info(
        `Dados da disciplina de ID ${disciplinaObj["Id"]} em formato inesperado (sem campo Semestres), ignorando...`,
      );
      continue;
    }

    disciplinaObj["Semestre"] = Number(disciplinaObj["Semestre"]);

    if (
      disciplinaObj["Semestre"] !== 99 &&
      semestres.length < (disciplinaObj["Semestre"] as number)
    ) {
      semestres.length = disciplinaObj["Semestre"] as number;
      for (let i = 0; i < semestres.length; i++) {
        if (!semestres[i]) semestres[i] = [];
      }
    }

    if ((disciplinaObj["Semestre"] as number) !== 99) {
      // O TSC irá reclamar se remover !, pois o item é um Array, possívelmente undefined.
      // No entanto, garantimos pelo código anterior que todos os items estejam definidos antes do acesso.
      semestres[(disciplinaObj["Semestre"] as number) - 1]!.push(disciplina);
    }
  }

  return semestres;
}

/**
 * Retorna a lista completa de disciplinas de um curso dado seu código.
 *
 * @async
 * @param {number} codigo - Código identificador de 4 dígitos do curso (ex: 1905 para Engenharia da Computação)
 * @returns {Promise<Array<Discipline>>} Promise que resolve para um array contendo todas as disciplinas do curso (sem ordenação específica)
 * @throws {Error} Lança erro se o arquivo não for encontrado (HTTP 404), se houver falha na conexão de rede, ou se o JSON estiver em formato inesperado
 * @throws {SyntaxError} Lança erro se o JSON retornado for inválido
 *
 * @description
 * Carrega e processa os dados de um curso, retornando uma lista linear de todas as disciplinas
 * sem organização por semestre. Inclui tanto disciplinas obrigatórias quanto optativas,
 * e também disciplinas sem período fixo (Semestre === 99).
 *
 * **Características:**
 * - Lista não ordenada (ordem do arquivo JSON original)
 * - Inclui TODAS as disciplinas, independente do semestre
 * - Disciplinas com `Semestre === 99` são incluídas
 * - Cada elemento é uma instância completa de `Discipline`
 *
 * **Diferença para `pegarSemestralizacao()`:**
 * - Esta função retorna array simples (1D)
 * - `pegarSemestralizacao()` retorna matriz (2D) organizada por semestres
 * - Esta função inclui disciplinas sem período fixo
 *
 * **Casos de uso:**
 * - Buscar uma disciplina específica por ID ou nome
 * - Calcular carga horária total do curso
 * - Construir grafos de dependências
 * - Listar todas as optativas disponíveis
 *
 * **Complexidade:**
 * O(n) onde n é o número total de disciplinas do curso
 *
 * @example
 * const disciplinas = await pegarDisciplinas(1905);
 *
 * // Buscar disciplina por nome
 * const calculo = disciplinas.find(d => d.apelido.includes('cálculo'));
 *
 * // Calcular carga horária total
 * const cargaTotal = disciplinas.reduce((sum, d) => sum + d.carga_horaria, 0);
 * console.log(`Carga horária total: ${cargaTotal}h`);
 *
 * // Filtrar apenas obrigatórias
 * const obrigatorias = disciplinas.filter(d => d.tipo === TipoCurso.Obrigatoria);
 * console.log(`${obrigatorias.length} disciplinas obrigatórias`);
 */
export async function pegarDisciplinas(
  codigo: number,
): Promise<Array<Discipline>> {
  const disciplinas = [];
  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj);
    disciplinas.push(disciplina);
  }

  return disciplinas;
}

/**
 * Retorna tanto a matriz de semestralização quanto a lista completa de disciplinas de um curso.
 *
 * @async
 * @param {number} codigo - Código identificador de 4 dígitos do curso (ex: 1905 para Engenharia da Computação)
 * @returns {Promise<Object>} Promise que resolve para um objeto contendo duas propriedades:
 * @returns {Array<Array<Discipline>>} return.semestres - Matriz de disciplinas organizadas por semestre
 * @returns {Array<Discipline>} return.disciplinas - Lista completa de todas as disciplinas sem ordenação
 * @throws {Error} Lança erro se o arquivo não for encontrado (HTTP 404), se houver falha na conexão de rede, ou se o JSON estiver em formato inesperado
 * @throws {SyntaxError} Lança erro se o JSON retornado for inválido
 *
 * @description
 * Função otimizada que combina as funcionalidades de `pegarSemestralizacao()` e `pegarDisciplinas()`
 * em uma única operação, evitando dupla leitura do arquivo JSON. Retorna ambas as estruturas
 * simultaneamente para casos onde se precisa da matriz semestral E da lista completa.
 *
 * **Estrutura do retorno:**
 * ```javascript
 * {
 *   semestres: [
 *     [Discipline, Discipline], // 1º semestre
 *     [Discipline, Discipline], // 2º semestre
 *     ...
 *   ],
 *   disciplinas: [Discipline, Discipline, ...] // Todas as disciplinas
 * }
 * ```
 *
 * **Diferenças entre as duas propriedades:**
 * - `semestres[i]`: Contém apenas disciplinas do semestre (i+1), excluindo as com `Semestre === 99`
 * - `disciplinas`: Contém TODAS as disciplinas, incluindo as sem período fixo (`Semestre === 99`)
 *
 * **Vantagem de performance:**
 * Processa o arquivo JSON uma única vez ao invés de fazer duas requisições separadas,
 * reduzindo latência de rede e processamento duplicado.
 *
 * **Casos de uso:**
 * - Renderizar grade curricular (usa `semestres`) com opção de busca (usa `disciplinas`)
 * - Construir visualizações que precisam de ambas as perspectivas
 * - Dashboards que mostram tanto progresso semestral quanto visão geral
 * - Validação de currículo que precisa verificar semestralização e lista completa
 *
 * **Complexidade:**
 * O(n) onde n é o número total de disciplinas do curso (mesma complexidade das funções individuais)
 *
 * @example
 * const { semestres, disciplinas } = await pegarSemestralizacaoLista(1905);
 *
 * // Usar matriz de semestres para renderizar grade
 * semestres.forEach((disciplinasSemestre, index) => {
 *   console.log(`${index + 1}º Semestre:`);
 *   disciplinasSemestre.forEach(d => console.log(`  - ${d.apelido}`));
 * });
 *
 * // Usar lista completa para busca
 * const resultado = disciplinas.filter(d =>
 *   d.apelido.includes('programação')
 * );
 *
 * // Comparar quantidades
 * const totalSemestres = semestres.flat().length;
 * const totalGeral = disciplinas.length;
 * console.log(`Optativas livres: ${totalGeral - totalSemestres}`);
 */
export async function pegarSemestralizacaoLista(codigo: number): Promise<{
  semestres: Array<Array<Discipline>>;
  disciplinas: Array<Discipline>;
}> {
  const semestres: Array<Array<Discipline>> = [];
  const disciplinas: Array<Discipline> = [];

  const dados = await load_json(codigo);

  for (const disciplinaObj of dados) {
    const disciplina = transformarEmDisciplina(disciplinaObj);

    if (!disciplinaObj["Semestre"]) {
      console.info(
        `Dados da disciplina de ID ${disciplinaObj["Id"]} em formato inesperado (sem campo Semestres), ignorando...`,
      );
      continue;
    }

    disciplinaObj["Semestre"] = Number(disciplinaObj["Semestre"]);
    if (
      disciplinaObj["Semestre"] !== 99 &&
      semestres.length < (disciplinaObj["Semestre"] as number)
    ) {
      semestres.length = disciplinaObj["Semestre"] as number;
      for (let i = 0; i < semestres.length; i++) {
        if (!semestres[i]) semestres[i] = [];
      }
    }

    if (disciplinaObj["Semestre"] !== 99) {
      // O TSC irá reclamar se remover !, pois o item é um Array, possívelmente undefined.
      // No entanto, garantimos pelo código anterior que todos os items estejam definidos antes do acesso.
      semestres[(disciplinaObj["Semestre"] as number) - 1]!.push(disciplina);
    }

    disciplinas.push(disciplina);
  }

  return { semestres, disciplinas };
}

/**
 * Retorna um grafo de dependências das disciplinas de um curso dado seu código.
 *
 * @async
 * @param {number} codigo - Código identificador de 4 dígitos do curso (ex: 1905 para Engenharia da Computação)
 * @returns {Promise<DisciplinesGraph>} Promise que resolve para uma instância de `DisciplinesGraph` com todas as disciplinas e suas relações de dependência
 * @throws {Error} Lança erro se o arquivo não for encontrado (HTTP 404), se houver falha na conexão de rede, ou se o JSON estiver em formato inesperado
 * @throws {SyntaxError} Lança erro se o JSON retornado for inválido
 *
 * @description
 * Carrega as disciplinas de um curso e constrói automaticamente um grafo bidirecional
 * de dependências, permitindo consultas eficientes sobre pré-requisitos e disciplinas dependentes.
 *
 * **Processo de construção:**
 * 1. Carrega todas as disciplinas do curso usando `pegarDisciplinas()`
 * 2. Cria uma nova instância de `DisciplinesGraph`
 * 3. Constrói o grafo através de `buildGraph()`, estabelecendo todas as relações
 *
 * **Funcionalidades do grafo retornado:**
 * - `getDiscipline(id)`: Recupera disciplina por ID
 * - `getPreRequisites(id)`: Lista pré-requisitos de uma disciplina
 * - `getNextDisciplines(id, recursivo)`: Lista disciplinas que dependem de outra
 *
 * **Casos de uso:**
 * - Validar se um aluno pode cursar uma disciplina (verificar pré-requisitos)
 * - Calcular quais disciplinas ficarão travadas se reprovar em uma
 * - Determinar caminho crítico do curso
 * - Visualizar árvore de dependências
 * - Sugerir ordem de matrícula otimizada
 *
 * **Vantagens sobre lista simples:**
 * - Consultas de dependência em O(1) ao invés de O(n)
 * - Navegação bidirecional (frente e trás)
 * - Detecção de ciclos e inconsistências
 *
 *
 * @example
 * const grafo = await pegarGrafo(1905);
 *
 * // Verificar pré-requisitos de uma disciplina
 * const preReqs = grafo.getPreRequisites(302); // Ex: Estrutura de Dados
 * console.log(`Pré-requisitos: ${preReqs}`); // [201, 202]
 *
 * // Ver quais disciplinas serão travadas
 * const travadas = grafo.getNextDisciplines(201, true); // recursivo
 * console.log(`Se reprovar em 201, trava: ${travadas.length} disciplinas`);
 *
 * // Buscar informações completas de uma disciplina
 * const disciplina = grafo.getDiscipline(201);
 * if (disciplina) {
 *   console.log(`${disciplina.apelido} - ${disciplina.carga_horaria}h`);
 * }
 *
 * // Validar se aluno pode cursar (exemplo simplificado)
 * function podeMatricular(idDisciplina: number, idsAprovadas: number[]) {
 *   const preReqs = grafo.getPreRequisites(idDisciplina);
 *   return preReqs.every(id => idsAprovadas.includes(id));
 * }
 */
export async function pegarGrafo(codigo: number): Promise<DisciplinesGraph> {
  const grafo = new DisciplinesGraph();
  const disciplinas = await pegarDisciplinas(codigo);

  grafo.buildGraph(disciplinas);

  return grafo;
}
