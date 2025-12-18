import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  pegarSemestralizacao,
  pegarDisciplinas,
  pegarSemestralizacaoLista,
  pegarGrafo,
} from "@/services/disciplines-api";
import { TipoCurso } from "@/models/discipline";

// Mock do fetch global
globalThis.fetch = vi.fn();

describe("API de Disciplinas", () => {
  // Dados mock completos para simular arquivo JSON real
  const dadosMockCompletos = [
    {
      Apelido: "Cálculo Diferencial e Integral I",
      CargaHorariaTeorico: 60,
      Id: 101,
      Tipo: "OBR",
      Semestre: 1,
      ListaPrequisitos: [{ Id: 101 }], // Auto-referência para satisfazer validação
    },
    {
      Apelido: "Introdução à Programação",
      CargaHorariaTeorico: 60,
      Id: 102,
      Tipo: "OBR",
      Semestre: 1,
      ListaPrequisitos: [{ Id: 102 }],
    },
    {
      Apelido: "Álgebra Linear",
      CargaHorariaTeorico: 60,
      Id: 103,
      Tipo: "OBR",
      Semestre: 1,
      ListaPrequisitos: [{ Id: 103 }],
    },
    {
      Apelido: "Cálculo Diferencial e Integral II",
      CargaHorariaTeorico: 60,
      Id: 201,
      Tipo: "OBR",
      Semestre: 2,
      ListaPrequisitos: [{ Id: 101 }],
    },
    {
      Apelido: "Estrutura de Dados",
      CargaHorariaTeorico: 60,
      Id: 202,
      Tipo: "OBR",
      Semestre: 2,
      ListaPrequisitos: [{ Id: 102 }],
    },
    {
      Apelido: "Programação Orientada a Objetos",
      CargaHorariaTeorico: 60,
      Id: 203,
      Tipo: "OBR",
      Semestre: 2,
      ListaPrequisitos: [{ Id: 102 }],
    },
    {
      Apelido: "Banco de Dados",
      CargaHorariaTeorico: 60,
      Id: 301,
      Tipo: "OBR",
      Semestre: 3,
      ListaPrequisitos: [{ Id: 202 }, { Id: 203 }],
    },
    {
      Apelido: "Engenharia de Software",
      CargaHorariaTeorico: 60,
      Id: 302,
      Tipo: "OBR",
      Semestre: 3,
      ListaPrequisitos: [{ Id: 203 }],
    },
    {
      Apelido: "Optativa I - Inteligência Artificial",
      CargaHorariaTeorico: 30,
      Id: 901,
      Tipo: "OPT",
      Semestre: 99,
      ListaPrequisitos: [{ Id: 202 }],
    },
    {
      Apelido: "Optativa II - Machine Learning",
      CargaHorariaTeorico: 30,
      Id: 902,
      Tipo: "OPT",
      Semestre: 99,
      ListaPrequisitos: [{ Id: 201 }, { Id: 202 }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("pegarSemestralizacao", () => {
    it("deve retornar matriz de disciplinas organizadas corretamente por semestre", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);

      expect(resultado).toHaveLength(3);
      expect(resultado[0]).toHaveLength(3); // 1º semestre: 3 disciplinas
      expect(resultado[1]).toHaveLength(3); // 2º semestre: 3 disciplinas
      expect(resultado[2]).toHaveLength(2); // 3º semestre: 2 disciplinas
    });

    it("deve excluir completamente disciplinas com semestre 99 da matriz", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);
      const todasDisciplinas = resultado.flat();

      const temOptativa901 = todasDisciplinas.some((d) => d.pegaId() === 901);
      const temOptativa902 = todasDisciplinas.some((d) => d.pegaId() === 902);

      expect(temOptativa901).toBe(false);
      expect(temOptativa902).toBe(false);
      expect(todasDisciplinas).toHaveLength(8); // 8 obrigatórias, sem as 2 optativas
    });

    it("deve formatar código com zeros à esquerda na URL", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await pegarSemestralizacao(15);
      expect(fetch).toHaveBeenCalledWith("/data/0015.json");

      vi.clearAllMocks();

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await pegarSemestralizacao(1905);
      expect(fetch).toHaveBeenCalledWith("/data/1905.json");
    });

    it("deve criar disciplinas com todas as propriedades corretas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);
      const calculoI = resultado[0]?.find((d) => d.pegaId() === 101);

      expect(calculoI).toBeDefined();
      expect(calculoI?.apelido).toBe("cálculo diferencial e integral i");
      expect(calculoI?.carga_horaria).toBe(60);
      expect(calculoI?.pegaId()).toBe(101);
      expect(calculoI?.tipo).toBe(TipoCurso.Obrigatoria);
      expect(calculoI?.semestre).toBe(1);
    });

    it("deve preservar relações de pré-requisitos corretamente", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);
      const bancoDados = resultado[2]?.find((d) => d.pegaId() === 301);

      expect(bancoDados?.pegaPreRequisitos()).toEqual([202, 203]);
      expect(bancoDados?.pegaPreRequisitos()).toHaveLength(2);
    });

    it("deve criar arrays vazios para semestres intermediários sem disciplinas", async () => {
      const dadosComSemestreVazio = [
        {
          Apelido: "Disciplina Semestre 1",
          CargaHorariaTeorico: 60,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 101 }],
        },
        {
          Apelido: "Disciplina Semestre 5",
          CargaHorariaTeorico: 60,
          Id: 501,
          Tipo: "OBR",
          Semestre: 5,
          ListaPrequisitos: [{ Id: 101 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosComSemestreVazio,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);

      expect(resultado).toHaveLength(5);
      expect(resultado[0]).toHaveLength(1); // 1º semestre: 1 disciplina
      expect(resultado[1]).toHaveLength(0); // 2º semestre: vazio
      expect(resultado[2]).toHaveLength(0); // 3º semestre: vazio
      expect(resultado[3]).toHaveLength(0); // 4º semestre: vazio
      expect(resultado[4]).toHaveLength(1); // 5º semestre: 1 disciplina
    });

    it("deve propagar erros de rede corretamente", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(
        new Error("Network request failed"),
      );

      await expect(pegarSemestralizacao(9999)).rejects.toThrow(
        "Network request failed",
      );
    });

    it("deve normalizar apelidos para lowercase", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);
      const todasDisciplinas = resultado.flat();

      todasDisciplinas.forEach((disciplina) => {
        expect(disciplina.apelido).toBe(disciplina.apelido.toLowerCase());
      });
    });
  });

  describe("pegarDisciplinas", () => {
    it("deve retornar lista completa incluindo todas as disciplinas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado).toHaveLength(10); // Todas as disciplinas
    });

    it("deve incluir disciplinas com semestre 99 (optativas livres)", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      const optativa901 = resultado.find((d) => d.pegaId() === 901);
      const optativa902 = resultado.find((d) => d.pegaId() === 902);

      expect(optativa901).toBeDefined();
      expect(optativa901?.semestre).toBe(99);
      expect(optativa902).toBeDefined();
      expect(optativa902?.semestre).toBe(99);
    });

    it("deve preservar lista de pré-requisitos para todas as disciplinas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      const calculoII = resultado.find((d) => d.pegaId() === 201);
      const bancoDados = resultado.find((d) => d.pegaId() === 301);
      const mlOptativa = resultado.find((d) => d.pegaId() === 902);

      expect(calculoII?.pegaPreRequisitos()).toEqual([101]);
      expect(bancoDados?.pegaPreRequisitos()).toEqual([202, 203]);
      expect(mlOptativa?.pegaPreRequisitos()).toEqual([201, 202]);
    });

    it("deve distinguir corretamente entre disciplinas obrigatórias e optativas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      const obrigatorias = resultado.filter(
        (d) => d.tipo === TipoCurso.Obrigatoria,
      );
      const optativas = resultado.filter((d) => d.tipo === TipoCurso.Optativa);

      expect(obrigatorias).toHaveLength(8);
      expect(optativas).toHaveLength(2);
    });

    it("deve manter ordem original do arquivo JSON", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado[0]?.pegaId()).toBe(101);
      expect(resultado[1]?.pegaId()).toBe(102);
      expect(resultado[8]?.pegaId()).toBe(901);
      expect(resultado[9]?.pegaId()).toBe(902);
    });

    it("deve processar corretamente cargas horárias variadas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      const disciplinas60h = resultado.filter((d) => d.carga_horaria === 60);
      const disciplinas30h = resultado.filter((d) => d.carga_horaria === 30);

      expect(disciplinas60h).toHaveLength(8);
      expect(disciplinas30h).toHaveLength(2);
    });
  });

  describe("pegarSemestralizacaoLista", () => {
    it("deve retornar objeto com ambas propriedades semestres e disciplinas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      expect(resultado).toHaveProperty("semestres");
      expect(resultado).toHaveProperty("disciplinas");
      expect(Array.isArray(resultado.semestres)).toBe(true);
      expect(Array.isArray(resultado.disciplinas)).toBe(true);
    });

    it("deve ter mais disciplinas na lista do que na matriz devido ao semestre 99", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      const totalNaMatriz = resultado.semestres.flat().length;
      const totalNaLista = resultado.disciplinas.length;

      expect(totalNaLista).toBeGreaterThan(totalNaMatriz);
      expect(totalNaLista).toBe(10);
      expect(totalNaMatriz).toBe(8);
    });

    it("deve fazer apenas uma requisição HTTP", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      await pegarSemestralizacaoLista(1905);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/data/1905.json");
    });

    it("deve manter consistência: todas disciplinas da matriz devem estar na lista", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      const idsNaMatriz = resultado.semestres.flat().map((d) => d.pegaId());
      const idsNaLista = resultado.disciplinas.map((d) => d.pegaId());

      idsNaMatriz.forEach((id) => {
        expect(idsNaLista).toContain(id);
      });
    });

    it("deve incluir optativas na lista mas não na matriz", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      const idsNaMatriz = resultado.semestres.flat().map((d) => d.pegaId());
      const optativasNaLista = resultado.disciplinas.filter(
        (d) => d.semestre === 99,
      );

      expect(optativasNaLista).toHaveLength(2);
      expect(idsNaMatriz).not.toContain(901);
      expect(idsNaMatriz).not.toContain(902);
    });

    it("deve organizar semestres corretamente enquanto mantém lista completa", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      expect(resultado.semestres).toHaveLength(3);
      expect(resultado.semestres[0]).toHaveLength(3);
      expect(resultado.semestres[1]).toHaveLength(3);
      expect(resultado.semestres[2]).toHaveLength(2);
      expect(resultado.disciplinas).toHaveLength(10);
    });

    it("deve preservar todas as propriedades em ambas estruturas", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const resultado = await pegarSemestralizacaoLista(1905);

      const disciplinaNaMatriz = resultado.semestres[0]?.[0];
      const disciplinaNaLista = resultado.disciplinas.find(
        (d) => d.pegaId() === disciplinaNaMatriz?.pegaId(),
      );

      expect(disciplinaNaLista?.apelido).toBe(disciplinaNaMatriz?.apelido);
      expect(disciplinaNaLista?.carga_horaria).toBe(
        disciplinaNaMatriz?.carga_horaria,
      );
      expect(disciplinaNaLista?.tipo).toBe(disciplinaNaMatriz?.tipo);
    });
  });

  describe("pegarGrafo", () => {
    it("deve retornar instância válida de DisciplinesGraph", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      expect(grafo).toBeDefined();
      expect(typeof grafo.getDiscipline).toBe("function");
      expect(typeof grafo.getPreRequisites).toBe("function");
      expect(typeof grafo.getNextDisciplines).toBe("function");
      expect(typeof grafo.buildGraph).toBe("function");
    });

    it("deve permitir recuperar qualquer disciplina por ID", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      const calculoI = grafo.getDiscipline(101);
      const estruturaDados = grafo.getDiscipline(202);
      const optativaIA = grafo.getDiscipline(901);

      expect(calculoI).toBeDefined();
      expect(calculoI?.apelido).toBe("cálculo diferencial e integral i");
      expect(estruturaDados).toBeDefined();
      expect(estruturaDados?.apelido).toBe("estrutura de dados");
      expect(optativaIA).toBeDefined();
      expect(optativaIA?.tipo).toBe(TipoCurso.Optativa);
    });

    it("deve construir corretamente relações de pré-requisitos simples", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      const preReqsCalculoII = grafo.getPreRequisites(201);
      const preReqsEstruturaDados = grafo.getPreRequisites(202);

      expect(preReqsCalculoII).toContain(101);
      expect(preReqsCalculoII).toHaveLength(1);
      expect(preReqsEstruturaDados).toContain(102);
      expect(preReqsEstruturaDados).toHaveLength(1);
    });

    it("deve construir corretamente relações de pré-requisitos múltiplos", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      const preReqsBancoDados = grafo.getPreRequisites(301);
      const preReqsML = grafo.getPreRequisites(902);

      expect(preReqsBancoDados).toHaveLength(2);
      expect(preReqsBancoDados).toContain(202);
      expect(preReqsBancoDados).toContain(203);
      expect(preReqsML).toHaveLength(2);
      expect(preReqsML).toContain(201);
      expect(preReqsML).toContain(202);
    });

    it("deve incluir todas as disciplinas do curso no grafo", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      // Verificar todas as 10 disciplinas
      for (let i = 0; i < dadosMockCompletos.length; i++) {
        const id = dadosMockCompletos[i]!.Id;
        const disciplina = grafo.getDiscipline(id);
        expect(disciplina).toBeDefined();
        expect(disciplina?.pegaId()).toBe(id);
      }
    });

    it("deve retornar undefined para IDs inexistentes", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      const inexistente1 = grafo.getDiscipline(9999);
      const inexistente2 = grafo.getDiscipline(0);
      const inexistente3 = grafo.getDiscipline(-1);

      expect(inexistente1).toBeUndefined();
      expect(inexistente2).toBeUndefined();
      expect(inexistente3).toBeUndefined();
    });

    it("deve incluir disciplinas optativas com semestre 99 no grafo", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosMockCompletos,
      } as Response);

      const grafo = await pegarGrafo(1905);

      const ia = grafo.getDiscipline(901);
      const ml = grafo.getDiscipline(902);

      expect(ia).toBeDefined();
      expect(ia?.semestre).toBe(99);
      expect(ml).toBeDefined();
      expect(ml?.semestre).toBe(99);
    });
  });

  describe("Tratamento de Erros e Validações", () => {
    it("deve lançar erro para JSON com sintaxe inválida", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token in JSON");
        },
      } as unknown as Response);

      await expect(pegarDisciplinas(1905)).rejects.toThrow(
        "Unexpected token in JSON",
      );
    });

    it("deve lançar erro para disciplinas sem propriedades obrigatórias", async () => {
      const dadosInvalidos = [
        {
          Apelido: "Disciplina Incompleta",
          // Faltando propriedades obrigatórias
          ListaPrequisitos: [{ Id: 1 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosInvalidos,
      } as Response);

      await expect(pegarDisciplinas(1905)).rejects.toThrow();
    });

    it("deve lançar erro para pré-requisitos sem ID", async () => {
      const dadosComPreReqInvalido = [
        {
          Apelido: "Disciplina",
          CargaHorariaTeorico: 60,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Nome: "Sem ID" }], // Falta ID
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosComPreReqInvalido,
      } as Response);

      await expect(pegarDisciplinas(1905)).rejects.toThrow(
        "Objeto fora de forma padrão",
      );
    });

    it("deve processar corretamente tipos diferentes de OBR como optativas", async () => {
      const dadosComTiposVariados = [
        {
          Apelido: "Obrigatória",
          CargaHorariaTeorico: 60,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 101 }],
        },
        {
          Apelido: "Optativa 1",
          CargaHorariaTeorico: 30,
          Id: 201,
          Tipo: "OPT",
          Semestre: 2,
          ListaPrequisitos: [{ Id: 101 }],
        },
        {
          Apelido: "Optativa 2",
          CargaHorariaTeorico: 30,
          Id: 202,
          Tipo: "OUTRO",
          Semestre: 2,
          ListaPrequisitos: [{ Id: 101 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosComTiposVariados,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado[0]?.tipo).toBe(TipoCurso.Obrigatoria);
      expect(resultado[1]?.tipo).toBe(TipoCurso.Optativa);
      expect(resultado[2]?.tipo).toBe(TipoCurso.Optativa);
    });

    it("deve converter corretamente números em strings para propriedades numéricas", async () => {
      const dadosComStrings = [
        {
          Apelido: "Teste",
          CargaHorariaTeorico: "60", // String
          Id: "101", // String
          Tipo: "OBR",
          Semestre: "1", // String
          ListaPrequisitos: [{ Id: 101 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosComStrings,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado[0]?.carga_horaria).toBe(60);
      expect(resultado[0]?.pegaId()).toBe(101);
      expect(resultado[0]?.semestre).toBe(1);
    });

    it("deve propagar erros HTTP corretamente", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("HTTP 404: Not Found"));

      await expect(pegarSemestralizacao(9999)).rejects.toThrow(
        "HTTP 404: Not Found",
      );
    });
  });

  describe("Casos Extremos (Edge Cases)", () => {
    it("deve lidar com curso com apenas uma disciplina", async () => {
      const dadosUnicaDisciplina = [
        {
          Apelido: "Única",
          CargaHorariaTeorico: 60,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 101 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosUnicaDisciplina,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);

      expect(resultado).toHaveLength(1);
      expect(resultado[0]).toHaveLength(1);
    });

    it("deve lidar com disciplinas em semestres muito altos", async () => {
      const dadosSemestreAlto = [
        {
          Apelido: "Disciplina Avançada",
          CargaHorariaTeorico: 60,
          Id: 1001,
          Tipo: "OBR",
          Semestre: 16,
          ListaPrequisitos: [{ Id: 1001 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosSemestreAlto,
      } as Response);

      const resultado = await pegarSemestralizacao(1905);

      expect(resultado).toHaveLength(16);
      expect(resultado[15]).toHaveLength(1);
    });

    it("deve lidar com apelidos muito longos", async () => {
      const apelidoLongo = "A".repeat(500);
      const dadosApelidoLongo = [
        {
          Apelido: apelidoLongo,
          CargaHorariaTeorico: 60,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 101 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosApelidoLongo,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado[0]?.apelido).toHaveLength(500);
      expect(resultado[0]?.apelido).toBe(apelidoLongo.toLowerCase());
    });

    it("deve lidar com cargas horárias extremas", async () => {
      const dadosCargasExtremas = [
        {
          Apelido: "Carga Mínima",
          CargaHorariaTeorico: 1,
          Id: 101,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 101 }],
        },
        {
          Apelido: "Carga Máxima",
          CargaHorariaTeorico: 999,
          Id: 102,
          Tipo: "OBR",
          Semestre: 1,
          ListaPrequisitos: [{ Id: 102 }],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dadosCargasExtremas,
      } as Response);

      const resultado = await pegarDisciplinas(1905);

      expect(resultado[0]?.carga_horaria).toBe(1);
      expect(resultado[1]?.carga_horaria).toBe(999);
    });
  });
});
