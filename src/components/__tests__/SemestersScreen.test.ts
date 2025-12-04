// Este código foi grandemente gerado pela LLM Claude Sonnet 4.5,
// apenas corrigido alguns erros e incoerências.
// O uso da IA para produzir scripts de teste se mostrou muito eficiente, ainda sendo
// necessário um conhecimento prévio das ferramentas e o seu funcionamento e, principalmente,
// entender o que está sendo feito. A LLM utilizada conseguiu, com poucos erros sútis, dar
// uma cobertura de 90%+ do componente SemestersScreen, algo que um programador experiente
// levaria questão de 30 minutos até 1 hora para fazer em um componente como este.
// Portanto, o uso consciente da IA como em scripts de teste se torna encorajado, sendo
// avaliado a solução gerada.

import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SemestersScreen from "@/components/SemestersScreen.vue";
import DisciplineCard from "@/components/DisciplineCard.vue";
import { Discipline, TipoCurso } from "@/models/discipline";
import DisciplinesGraph from "@/core/disciplines-graph";

describe("SemestersScreen", () => {
  const disciplina1 = new Discipline(
    "Cálculo I",
    60,
    1001,
    TipoCurso.Obrigatoria,
    1,
    [],
  );
  const disciplina2 = new Discipline(
    "Álgebra Linear",
    60,
    1002,
    TipoCurso.Obrigatoria,
    1,
    [],
  );
  const disciplina3 = new Discipline(
    "Cálculo II",
    60,
    2001,
    TipoCurso.Obrigatoria,
    1,
    [1001],
  );
  const disciplina4 = new Discipline(
    "Física I",
    60,
    2002,
    TipoCurso.Obrigatoria,
    1,
    [1001],
  );
  const disciplina5 = new Discipline(
    "Cálculo III",
    60,
    3001,
    TipoCurso.Obrigatoria,
    1,
    [2001],
  );

  let grafoMock: DisciplinesGraph;

  beforeEach(() => {
    grafoMock = {
      getPreRequisites: vi.fn((id: number) => {
        const prereqs: Record<number, number[]> = {
          2001: [1001], // Cálculo II depende de Cálculo I
          2002: [1001], // Física I depende de Cálculo I
          3001: [2001], // Cálculo III depende de Cálculo II
        };
        return prereqs[id] || [];
      }),
      getNextDisciplines: vi.fn((id: number) => {
        const proximas: Record<number, number[]> = {
          1001: [2001, 2002], // Cálculo I libera Cálculo II e Física I
          2001: [3001], // Cálculo II libera Cálculo III
        };
        return proximas[id] || [];
      }),
    } as unknown as DisciplinesGraph;
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const criarWrapper = (props = {}) => {
    return mount(SemestersScreen, {
      props: {
        semestres: [],
        grafo: grafoMock,
        ...props,
      },
      global: {
        stubs: {
          DisciplineCard: false,
        },
      },
    });
  };

  describe("Renderização", () => {
    it("renderiza mensagem quando não há disciplinas", () => {
      const wrapper = criarWrapper({ semestres: [] });

      expect(wrapper.find("h2").text()).toBe("Nenhuma matéria!");
    });

    it("renderiza o número correto de semestres", () => {
      const semestres = [
        [disciplina1, disciplina2],
        [disciplina3, disciplina4],
      ];
      const wrapper = criarWrapper({ semestres });

      const semestresDivs = wrapper.findAll(".flex-1.py-6");
      expect(semestresDivs).toHaveLength(2);
    });

    it("renderiza os números dos semestres corretamente", () => {
      const semestres = [[disciplina1], [disciplina2], [disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const numerosSpans = wrapper.findAll(".text-sm");

      expect(numerosSpans).toHaveLength(3);

      expect(numerosSpans[0]!.text()).toBe("1");
      expect(numerosSpans[1]!.text()).toBe("2");
      expect(numerosSpans[2]!.text()).toBe("3");
    });

    it("renderiza todas as disciplinas dentro de seus respectivos semestres", () => {
      const semestres = [[disciplina1, disciplina2], [disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      expect(cards).toHaveLength(3);
    });

    it("passa as props corretas para cada DisciplineCard", () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      expect(card.props("discipline")).toStrictEqual(disciplina1);
      expect(card.props("grayScaleMode")).toBe(false);
    });
  });

  describe("Modo Grayscale", () => {
    it("inicia com grayScaleMode desativado", () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      expect(card.props("grayScaleMode")).toBe(false);
    });

    it("ativa grayScaleMode quando disciplina recebe foco", async () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(card.props("grayScaleMode")).toBe(true);
    });

    it("desativa grayScaleMode quando disciplina perde foco", async () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("mouseenter");
      await wrapper.vm.$nextTick();
      await card.trigger("mouseleave");
      await wrapper.vm.$nextTick();

      expect(card.props("grayScaleMode")).toBe(false);
    });
  });

  describe("Sistema de Referências", () => {
    it("cria referências para todas as disciplinas renderizadas", () => {
      const semestres = [[disciplina1, disciplina2], [disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      expect(cards).toHaveLength(3);

      expect(cards[0]!.props("discipline")).toStrictEqual(disciplina1);
      expect(cards[1]!.props("discipline")).toStrictEqual(disciplina2);
      expect(cards[2]!.props("discipline")).toStrictEqual(disciplina3);
    });

    it("mantém referências corretas após atualização", async () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      let cards = wrapper.findAllComponents(DisciplineCard);
      expect(cards).toHaveLength(1);

      await wrapper.setProps({
        semestres: [[disciplina1, disciplina2]],
      });

      cards = wrapper.findAllComponents(DisciplineCard);

      expect(cards).toHaveLength(2);

      expect(cards[0]!.props("discipline")).toStrictEqual(disciplina1);
      expect(cards[1]!.props("discipline")).toStrictEqual(disciplina2);
    });
  });

  describe("Foco em Cascata - Pré-requisitos", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("destaca pré-requisito imediato ao focar disciplina", async () => {
      const semestres = [
        [disciplina1], // Cálculo I
        [disciplina3], // Cálculo II (depende de Cálculo I)
      ];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoII = cards.find(
        (c) => c.props("discipline")!.pegaId() === 2001,
      );

      await calculoII!.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).toHaveBeenCalledWith(2001);
    });

    it("propaga foco recursivamente através da cadeia de pré-requisitos", async () => {
      const semestres = [
        [disciplina1], // Cálculo I
        [disciplina3], // Cálculo II (depende de Cálculo I)
        [disciplina5], // Cálculo III (depende de Cálculo II)
      ];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoIII = cards.find(
        (c) => c.props("discipline")!.pegaId() === 3001,
      );

      await calculoIII!.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).toHaveBeenCalledWith(3001);

      vi.advanceTimersByTime(75);
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).toHaveBeenCalledWith(2001);
    });

    it("usa delay correto entre níveis de recursão", async () => {
      const semestres = [[disciplina1], [disciplina3], [disciplina5]];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoIII = cards.find(
        (c) => c.props("discipline")!.pegaId() === 3001,
      );

      await calculoIII!.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(74); // Menos que o delay
      await wrapper.vm.$nextTick();
      expect(grafoMock.getPreRequisites).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(1); // Completa os 75ms
      await wrapper.vm.$nextTick();
      expect(grafoMock.getPreRequisites).toHaveBeenCalledTimes(2);
    });
  });

  describe("Foco em Cascata - Próximas Disciplinas", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("destaca próximas disciplinas ao clicar", async () => {
      const semestres = [
        [disciplina1], // Cálculo I
        [disciplina3, disciplina4], // Cálculo II e Física I (dependem de Cálculo I)
      ];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoI = cards.find(
        (c) => c.props("discipline")!.pegaId() === 1001,
      );

      await calculoI!.trigger("click");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getNextDisciplines).toHaveBeenCalledWith(1001);
    });

    it("propaga foco para próximas disciplinas recursivamente", async () => {
      const semestres = [
        [disciplina1], // Cálculo I
        [disciplina3], // Cálculo II
        [disciplina5], // Cálculo III
      ];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoI = cards.find(
        (c) => c.props("discipline")!.pegaId() === 1001,
      );

      await calculoI!.trigger("click");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getNextDisciplines).toHaveBeenCalledWith(1001);

      vi.advanceTimersByTime(75);
      await wrapper.vm.$nextTick();

      expect(grafoMock.getNextDisciplines).toHaveBeenCalledWith(2001);
    });
  });

  describe("Tratamento de Erros", () => {
    it("loga erro quando elemento não é encontrado", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      grafoMock.getPreRequisites = vi.fn(() => [9999]);

      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Erro ao tentar focar em cascata"),
        9999,
      );

      consoleErrorSpy.mockRestore();
    });

    it("retorna sem executar quando grafo não está disponível", async () => {
      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres, grafo: null });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).not.toHaveBeenCalled();
    });

    it("lida corretamente com disciplina sem pré-requisitos", async () => {
      grafoMock.getPreRequisites = vi.fn(() => []);

      const semestres = [[disciplina1]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("mouseenter");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getPreRequisites).toHaveBeenCalledWith(1001);
    });

    it("lida corretamente com disciplina sem próximas disciplinas", async () => {
      grafoMock.getNextDisciplines = vi.fn(() => []);

      const semestres = [[disciplina5]];
      const wrapper = criarWrapper({ semestres });

      const card = wrapper.findComponent(DisciplineCard);
      await card.trigger("click");
      await wrapper.vm.$nextTick();

      expect(grafoMock.getNextDisciplines).toHaveBeenCalledWith(3001);
    });
  });

  describe("Cenários de Integração", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it("combina múltiplos semestres com cadeia de dependências completa", async () => {
      const semestres = [
        [disciplina1, disciplina2],
        [disciplina3, disciplina4],
        [disciplina5],
      ];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      expect(cards).toHaveLength(5);

      const disciplineIds = cards.map((c) => c.props("discipline")!.pegaId());
      expect(disciplineIds).toContain(1001);
      expect(disciplineIds).toContain(1002);
      expect(disciplineIds).toContain(2001);
      expect(disciplineIds).toContain(2002);
      expect(disciplineIds).toContain(3001);
    });

    it("alterna entre foco de pré-requisitos e próximas disciplinas", async () => {
      const semestres = [[disciplina1], [disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const cards = wrapper.findAllComponents(DisciplineCard);
      const calculoII = cards.find(
        (c) => c.props("discipline")!.pegaId() === 2001,
      );

      await calculoII!.trigger("mouseenter");
      await wrapper.vm.$nextTick();
      expect(grafoMock.getPreRequisites).toHaveBeenCalled();

      await calculoII!.trigger("mouseleave");
      await wrapper.vm.$nextTick();

      vi.clearAllMocks();

      const calculoI = cards.find(
        (c) => c.props("discipline")!.pegaId() === 1001,
      );
      await calculoI!.trigger("click");
      await wrapper.vm.$nextTick();
      expect(grafoMock.getNextDisciplines).toHaveBeenCalled();
    });
  });

  describe("Layout e Estrutura", () => {
    it("aplica classes CSS corretas no container principal", () => {
      const wrapper = criarWrapper();
      const container = wrapper.find(".flex.flex-row");

      expect(container.classes()).toContain("h-[500px]");
      expect(container.classes()).toContain("overflow-x-auto");
      expect(container.classes()).toContain("overflow-y-hidden");
      expect(container.classes()).toContain("space-x-12");
      expect(container.classes()).toContain("px-6");
    });

    it("renderiza semestres em layout horizontal", () => {
      const semestres = [[disciplina1], [disciplina2], [disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const container = wrapper.find(".flex.flex-row");
      const semestresDivs = container.findAll(".flex-1.py-6");

      expect(semestresDivs).toHaveLength(3);
    });

    it("renderiza disciplinas em layout vertical dentro de cada semestre", () => {
      const semestres = [[disciplina1, disciplina2, disciplina3]];
      const wrapper = criarWrapper({ semestres });

      const semestreContainer = wrapper.find(".flex.justify-around.flex-col");
      expect(semestreContainer.exists()).toBe(true);
    });
  });
});
