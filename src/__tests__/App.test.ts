import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import App from "@/App.vue";

const mockUseSemestralizacaoGrafo = vi.fn();

vi.mock("@/composables/useDiscipline", () => ({
  useSemestralizacaoGrafo: (...args: unknown[]) =>
    mockUseSemestralizacaoGrafo(...args),
}));

vi.mock("@/components/SemestersScreen.vue", () => ({
  default: {
    name: "SemestersScreen",
    template: "<div data-testid='semestres-screen'>Semestres Screen</div>",
    props: ["semestres", "grafo"],
  },
}));

describe("App.vue", () => {
  let wrapper: VueWrapper<unknown>;

  const criaEstadoMock = (overrides = {}) => ({
    codigoCurso: ref(1905),
    semestres: ref([
      [
        {
          pegaId: () => 101,
          apelido: "Cálculo I",
          carga_horaria: 60,
          tipo: 0,
          semestre: 1,
        },
      ],
      [
        {
          pegaId: () => 201,
          apelido: "Cálculo II",
          carga_horaria: 60,
          tipo: 0,
          semestre: 2,
        },
      ],
    ]),
    grafo: ref({
      getDiscipline: vi.fn(),
      getPreRequisites: vi.fn(),
      getNextDisciplines: vi.fn(),
    }),
    carregando: ref(false),
    erro: ref(null),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Renderização Inicial", () => {
    it("deve renderizar o componente corretamente", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      expect(wrapper.exists()).toBe(true);
      expect(wrapper.find("#app").exists()).toBe(true);
    });

    it("deve exibir o título principal", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const titulo = wrapper.find("h1");
      expect(titulo.exists()).toBe(true);
      expect(titulo.text()).toBe("hytalo-bassi/PPC");
    });

    it("deve renderizar o campo de busca", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const input = wrapper.find("input");
      expect(input.exists()).toBe(true);
      expect(input.attributes("type")).toBe("text");
      expect(input.attributes("placeholder")).toBe("0000");
    });

    it("deve inicializar o input com o valor padrão '1905'", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const input = wrapper.find("input");
      expect(input.element.value).toBe("1905");
    });

    it("deve ter atributos de acessibilidade corretos no input", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const input = wrapper.find("input");
      expect(input.attributes("inputmode")).toBe("numeric");
      expect(input.attributes("pattern")).toBe("\\d{4}");
      expect(input.attributes("maxlength")).toBe("4");
      expect(input.attributes("required")).toBeDefined();
      expect(input.attributes("aria-describedby")).toBe("hint codeError");
    });
  });

  describe("Validação de Input", () => {
    it("deve aceitar código válido de 4 dígitos", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("1234");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(1234);
    });

    it("deve ignorar códigos com menos de 4 dígitos", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("123");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(1905); // Mantém valor original
    });

    it("deve ignorar códigos com mais de 4 dígitos", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("12345");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(1905); // Mantém valor original
    });

    it("deve ignorar entrada não numérica", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("abcd");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(1905); // Mantém valor original
    });

    it("deve ignorar entrada alfanumérica mista", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("19ab");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(1905); // Mantém valor original
    });

    it("deve aceitar zeros à esquerda", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("0015");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(15);
    });

    it("deve aceitar código com todos zeros", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("0000");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(0);
    });
  });

  describe("Estado de Carregamento", () => {
    it("deve exibir spinner quando estiver carregando", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(true) }),
      );

      wrapper = mount(App);

      const spinnerPrincipal = wrapper.find(".animate-spin.h-12");
      const mensagemCarregamento = wrapper.find("p");

      expect(spinnerPrincipal.exists()).toBe(true);
      expect(mensagemCarregamento.text()).toBe("Carregando disciplinas...");
    });

    it("deve exibir spinner pequeno no campo de busca durante carregamento", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(true) }),
      );

      wrapper = mount(App);

      const spinnerInput = wrapper.find(".animate-spin");
      expect(spinnerInput.exists()).toBe(true);
    });

    it("não deve exibir SemestersScreen durante carregamento", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(true) }),
      );

      wrapper = mount(App);

      const semestresScreen = wrapper.find("[data-testid='semestres-screen']");
      expect(semestresScreen.exists()).toBe(false);
    });

    it("não deve exibir checkmark durante carregamento", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(true) }),
      );

      wrapper = mount(App);

      const checkmark = wrapper.find(".text-green-300");
      expect(checkmark.exists()).toBe(false);
    });
  });

  describe("Estado de Erro", () => {
    it("deve exibir mensagem de erro quando houver erro", () => {
      const erroMock = new Error("Arquivo não encontrado");
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref(erroMock), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const mensagemErro = wrapper.find(".text-red-100");
      expect(mensagemErro.text()).toBe("Arquivo não encontrado");
    });

    it("deve exibir ícone de aviso no estado de erro", () => {
      const erroMock = new Error("Erro genérico");
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref(erroMock), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const iconeErro = wrapper.find(".text-6xl");
      expect(iconeErro.text()).toBe("⚠️");
    });

    it("deve exibir título de erro", () => {
      const erroMock = new Error("Erro");
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref(erroMock), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const tituloErro = wrapper.find("h2");
      expect(tituloErro.text()).toBe("Erro ao carregar dados");
    });

    it("deve exibir mensagem padrão quando erro não tem message", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref({}), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const mensagemErro = wrapper.find(".text-red-100");
      expect(mensagemErro.text()).toBe(
        "Não foi possível carregar as disciplinas do curso.",
      );
    });

    it("deve exibir botão de retry no estado de erro", () => {
      const erroMock = new Error("Erro");
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref(erroMock), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const botaoRetry = wrapper.find("button");
      expect(botaoRetry.exists()).toBe(true);
      expect(botaoRetry.text()).toBe("Tentar novamente com código padrão");
    });

    it("deve resetar para código padrão ao clicar no botão de retry", async () => {
      const mockState = criaEstadoMock({
        erro: ref(new Error("Erro")),
        carregando: ref(false),
      });
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("9999");
      await nextTick();

      const botaoRetry = wrapper.find("button");
      await botaoRetry.trigger("click");
      await nextTick();

      expect(input.element.value).toBe("1905");
      expect(mockState.codigoCurso.value).toBe(1905);
    });

    it("não deve exibir SemestersScreen no estado de erro", () => {
      const erroMock = new Error("Erro");
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ erro: ref(erroMock), carregando: ref(false) }),
      );

      wrapper = mount(App);

      const semestresScreen = wrapper.find("[data-testid='semestres-screen']");
      expect(semestresScreen.exists()).toBe(false);
    });
  });

  describe("Estado de Sucesso", () => {
    it("deve exibir checkmark quando código for válido e não estiver carregando", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(false) }),
      );

      wrapper = mount(App);

      const checkmark = wrapper.find(".text-green-300");
      expect(checkmark.exists()).toBe(true);
      expect(checkmark.text()).toBe("✓");
    });

    it("deve renderizar SemestersScreen com dados corretos", () => {
      const mockState = criaEstadoMock({ carregando: ref(false) });
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);

      const semestresScreen = wrapper.find("[data-testid='semestres-screen']");
      expect(semestresScreen.exists()).toBe(true);
    });

    it("deve passar props corretas para SemestersScreen", () => {
      const mockState = criaEstadoMock({ carregando: ref(false) });
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);

      const semestresScreen = wrapper.findComponent({
        name: "SemestersScreen",
      });

      expect(semestresScreen.exists()).toBe(true);
      expect(semestresScreen.props("semestres")).toEqual(
        mockState.semestres.value,
      );
      expect(semestresScreen.props("grafo")).toEqual(mockState.grafo.value);
    });

    it("não deve exibir spinner no estado de sucesso", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(false) }),
      );

      wrapper = mount(App);

      const spinnerPrincipal = wrapper.find(".animate-spin.h-12");
      expect(spinnerPrincipal.exists()).toBe(false);
    });

    it("não deve exibir mensagem de erro no estado de sucesso", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(false), erro: ref(null) }),
      );

      wrapper = mount(App);

      const cardErro = wrapper.find(".bg-red-500\\/20");
      expect(cardErro.exists()).toBe(false);
    });
  });

  describe("Interações do Usuário", () => {
    it("deve responder a evento @input no campo de busca", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.trigger("input");
      await nextTick();

      expect(input.element.value).toBeDefined();
    });

    it("deve permitir múltiplas mudanças de código", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("1234");
      await nextTick();
      expect(mockState.codigoCurso.value).toBe(1234);

      await input.setValue("5678");
      await nextTick();
      expect(mockState.codigoCurso.value).toBe(5678);

      await input.setValue("9999");
      await nextTick();
      expect(mockState.codigoCurso.value).toBe(9999);
    });

    it("deve manter foco no input após entrada válida", async () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App, {
        attachTo: globalThis.document.body,
      });

      const input = wrapper.find("input");
      input.element.focus();

      await input.setValue("1234");
      await nextTick();

      expect(globalThis.document.activeElement).toBe(input.element);

      wrapper.unmount();
    });
  });

  describe("Edge Cases e Cenários Especiais", () => {
    it("deve lidar com dados vazios em semestres", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({
          semestres: ref([]),
          carregando: ref(false),
        }),
      );

      wrapper = mount(App);

      const semestresScreen = wrapper.find("[data-testid='semestres-screen']");
      expect(semestresScreen.exists()).toBe(true);
    });

    it("deve lidar com grafo vazio", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({
          grafo: ref(null),
          carregando: ref(false),
        }),
      );

      wrapper = mount(App);

      const semestresScreen = wrapper.find("[data-testid='semestres-screen']");
      expect(semestresScreen.exists()).toBe(true);
    });

    it("deve chamar o composable com código inicial correto", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      expect(mockUseSemestralizacaoGrafo).toHaveBeenCalledWith(1905);
    });

    it("deve permitir colagem de código no input", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("7890");
      await input.trigger("input");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(7890);
    });

    it("não deve exibir checkmark para código inválido", async () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(
        criaEstadoMock({ carregando: ref(false) }),
      );

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("123");
      await nextTick();

      const checkmark = wrapper.find(".text-green-300");
      expect(checkmark.exists()).toBe(false);
    });

    it("deve manter estado consistente após múltiplas operações", async () => {
      const mockState = criaEstadoMock();
      mockUseSemestralizacaoGrafo.mockReturnValue(mockState);

      wrapper = mount(App);
      const input = wrapper.find("input");

      await input.setValue("1111");
      await nextTick();

      await input.setValue("abc");
      await nextTick();

      await input.setValue("2222");
      await nextTick();

      expect(mockState.codigoCurso.value).toBe(2222);
    });
  });

  describe("Acessibilidade", () => {
    it("deve ter estrutura semântica adequada", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      expect(wrapper.find("header").exists()).toBe(true);
      expect(wrapper.find("h1").exists()).toBe(true);
    });

    it("deve ter label visual para o campo de busca", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const label = wrapper.find("span");
      expect(label.text()).toBe("Curso");
    });

    it("deve ter pattern para validação HTML5", () => {
      mockUseSemestralizacaoGrafo.mockReturnValue(criaEstadoMock());

      wrapper = mount(App);

      const input = wrapper.find("input");
      expect(input.attributes("pattern")).toBe("\\d{4}");
    });
  });
});
