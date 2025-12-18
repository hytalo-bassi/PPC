import { describe, it, expect, vi, beforeEach } from "vitest";
import { fakeDiscipline } from "@/tests/fakes/discipline.fake";

vi.mock("@/services/disciplines-api", () => ({
  pegarSemestralizacao: vi.fn(),
  pegarSemestralizacaoLista: vi.fn(),
}));

import { useSemestralizacao, useSemestralizacaoGrafo } from "../useDiscipline";
import * as disciplinesApi from "@/services/disciplines-api";

describe("useDiscipline", () => {
  let disciplinasPrimeiroSemestre: ReturnType<typeof fakeDiscipline>;

  beforeEach(() => {
    vi.clearAllMocks();

    disciplinasPrimeiroSemestre = fakeDiscipline(4, {
      override: {
        semestre: 1,
      },
    });

    vi.mocked(disciplinesApi.pegarSemestralizacao).mockImplementation(
      async (codigo: number) => {
        if (codigo === 1905) {
          return [disciplinasPrimeiroSemestre, fakeDiscipline(3)];
        }

        throw new Error("Arquivo não encontrado!");
      },
    );

    vi.mocked(disciplinesApi.pegarSemestralizacaoLista).mockImplementation(
      async (codigo: number) => {
        if (codigo === 1905) {
          return {
            semestres: [disciplinasPrimeiroSemestre],
            disciplinas: disciplinasPrimeiroSemestre,
          };
        }

        throw new Error("Arquivo não encontrado!");
      },
    );
  });

  describe("useSemestralizacao", () => {
    it("retorna semestralização corretamente para curso válido", async () => {
      const { semestres, carregando, erro } = useSemestralizacao(1905);

      await vi.waitFor(() => {
        expect(carregando.value).toBeFalsy();
      });

      expect(semestres.value).toHaveLength(2);
      expect(erro.value).toBeNull();
    });

    it("lida corretamente com um código de curso inexistente", async () => {
      const { semestres, carregando, erro } = useSemestralizacao(9999);

      await vi.waitFor(() => {
        expect(carregando.value).toBeFalsy();
      });

      expect(semestres.value).toHaveLength(0);
      expect(erro.value).not.toBeNull();
    });
  });

  describe("useSemestralizacaoGrafo", () => {
    it("retorna semestralização e grafo corretamente para curso válido", async () => {
      const { grafo, semestres, carregando, erro } =
        useSemestralizacaoGrafo(1905);

      await vi.waitFor(() => {
        expect(carregando.value).toBeFalsy();
      });

      const primeiraDisciplina = disciplinasPrimeiroSemestre[0];

      expect(grafo.getDiscipline(primeiraDisciplina!.pegaId())).toEqual(
        primeiraDisciplina,
      );
      expect(semestres.value.length).toBeGreaterThan(0);
      expect(erro.value).toBeNull();
    });

    it("lida corretamente com um código de curso inexistente", async () => {
      const { grafo, semestres, carregando, erro } =
        useSemestralizacaoGrafo(9999);

      await vi.waitFor(() => {
        expect(carregando.value).toBeFalsy();
      });

      const primeiraDisciplina = disciplinasPrimeiroSemestre[0];

      expect(grafo.getDiscipline(primeiraDisciplina!.pegaId())).toBeUndefined();
      expect(semestres.value.length).toBe(0);
      expect(erro.value).not.toBeNull();
    });
  });
});
