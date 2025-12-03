import { describe, it, expect, beforeEach } from "vitest";
import disciplinasgrafo from "../disciplines-graph";
import { Discipline, TipoCurso } from "../../models/discipline";

describe("Grafo de Relações", () => {
  let grafo: disciplinasgrafo;
  let disciplinas: Discipline[];

  beforeEach(() => {
    grafo = new disciplinasgrafo();

    // apenas dados de teste, não existem na grade nem foram tirados dela
    disciplinas = [
      new Discipline("Algoritmos I", 60, 1, TipoCurso.Obrigatoria, 1, []),
      new Discipline("Algoritmos II", 60, 2, TipoCurso.Obrigatoria, 2, [1]),
      new Discipline(
        "Estruturas de Dados",
        60,
        3,
        TipoCurso.Obrigatoria,
        3,
        [2],
      ),
    ];
  });

  describe("Construção de Grafo", () => {
    it("deve construir o grafo a partir da lista de disciplinas", () => {
      grafo.buildGraph(disciplinas);

      expect(grafo.getDiscipline(1)).toBeDefined();
      expect(grafo.getDiscipline(2)).toBeDefined();
      expect(grafo.getDiscipline(3)).toBeDefined();
    });

    it("deve mapear corretamente os pré-requisitos", () => {
      grafo.buildGraph(disciplinas);

      expect(grafo.getPreRequisites(1)).toEqual([]);
      expect(grafo.getPreRequisites(2)).toEqual([1]);
      expect(grafo.getPreRequisites(3)).toEqual([2]);
    });

    it("deve mapear corretamente as próximas matérias", () => {
      grafo.buildGraph(disciplinas);

      expect(grafo.getNextDisciplines(1)).toContain(2);
      expect(grafo.getNextDisciplines(2)).toContain(3);
      expect(grafo.getNextDisciplines(3)).toEqual([]);
    });

    it("deve mapear de forma recursiva corretamente as próximas matérias", () => {
      grafo.buildGraph(disciplinas);

      expect(grafo.getNextDisciplines(1, true)).toEqual([2, 3]);
      expect(grafo.getNextDisciplines(2, true)).toContain(3);
      expect(grafo.getNextDisciplines(3, true)).toEqual([]);
    });
  });

  describe("clear", () => {
    it("deve limpar todos os dados do grafo", () => {
      grafo.buildGraph(disciplinas);
      grafo.clear();

      expect(grafo.getDiscipline(1)).toBeUndefined();
      expect(grafo.getPreRequisites(1)).toEqual([]);
    });
  });

  describe("getDiscipline", () => {
    it("deve retornar a disciplina pelo seu ID", () => {
      grafo.buildGraph(disciplinas);
      const disciplina = grafo.getDiscipline(1);

      expect(disciplina).not.toBeNull();
      expect(disciplina!.apelido).toBe("algoritmos i");
      expect(disciplina!.id_curso).toBe(1);
    });

    it("deve retornar undefined para disciplina com ID inexistente", () => {
      grafo.buildGraph(disciplinas);
      expect(grafo.getDiscipline(999)).toBeUndefined();
    });
  });
});
