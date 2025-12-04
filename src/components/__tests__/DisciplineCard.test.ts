import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DisciplineCard from "@/components/DisciplineCard.vue";
import { Discipline, TipoCurso } from "@/models/discipline";

describe("DisciplineCard", () => {
  const mockDiscipline = new Discipline(
    "ALGPROG I",
    60,
    123,
    TipoCurso.Obrigatoria,
    1,
    [],
  );

  const createWrapper = (props = {}) => {
    return mount(DisciplineCard, {
      props: {
        discipline: mockDiscipline,
        grayScaleMode: false,
        ...props,
      },
    });
  };

  describe("Renderizando", () => {
    it("renderiza o nome da disciplina corretamente", () => {
      const wrapper = createWrapper();
      expect(wrapper.find("h1").text()).toBe(mockDiscipline.pegaApelido());
    });

    it("renderiza a carga horária da disciplina corretamente", () => {
      const wrapper = createWrapper();
      expect(wrapper.find("p").text()).toBe(
        `CH: ${mockDiscipline.pegaCarga()} horas`,
      );
    });

    it("aplica a classe padrão discipline quando não focada", () => {
      const wrapper = createWrapper();
      expect(wrapper.find("div").classes()).toContain("discipline");
      expect(wrapper.find("div").classes()).not.toContain("discipline-focused");
    });
  });

  describe("Gerenciamento do Estado de Foco", () => {
    it("alterna para classe focada quando mouse passar por cima", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("mouseenter");

      expect(wrapper.find("div").classes()).toContain("discipline-focused");
      expect(wrapper.find("div").classes()).not.toContain("discipline");
    });

    it("alterna de volta para classe padrão quando mouse sair", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("mouseenter");
      await wrapper.find("div").trigger("mouseleave");

      expect(wrapper.find("div").classes()).toContain("discipline");
      expect(wrapper.find("div").classes()).not.toContain("discipline-focused");
    });

    it("configura o foco programaticamente", async () => {
      const wrapper = createWrapper();

      wrapper.vm.focusDiscipline(true);
      await wrapper.vm.$nextTick();

      expect(wrapper.find("div").classes()).toContain("discipline-focused");

      wrapper.vm.focusDiscipline(false);
      await wrapper.vm.$nextTick();

      expect(wrapper.find("div").classes()).toContain("discipline");
    });
  });

  describe("Gerenciamento do Estado de Click", () => {
    it("mantém estado focado depois do click", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");

      expect(wrapper.find("div").classes()).toContain("discipline-focused");
    });

    it("mantém o foco depois do mouse clickar e sair", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");
      await wrapper.find("div").trigger("mouseleave");

      expect(wrapper.find("div").classes()).toContain("discipline-focused");
    });

    it("remove o foco no segundo click", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");
      await wrapper.find("div").trigger("click");

      expect(wrapper.find("div").classes()).toContain("discipline");
    });

    it("previne mouseenter de mudar o foco de elemento clickado", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");

      const emitCountBefore = wrapper.emitted("inFocus")?.length || 0;
      await wrapper.find("div").trigger("mouseenter");
      const emitCountAfter = wrapper.emitted("inFocus")?.length || 0;

      expect(emitCountAfter).toBe(emitCountBefore);
    });

    it("configura o estado de click programaticamente", async () => {
      const wrapper = createWrapper();

      wrapper.vm.disciplineClicked(true);
      await wrapper.vm.$nextTick();

      expect(wrapper.find("div").classes()).toContain("discipline-focused");

      await wrapper.find("div").trigger("mouseenter");
      expect(wrapper.find("div").classes()).toContain("discipline-focused");

      wrapper.vm.disciplineClicked(false);
      await wrapper.vm.$nextTick();

      expect(wrapper.find("div").classes()).toContain("discipline");
    });
  });

  describe("Emissão de Eventos", () => {
    it("emite inFocus quando mouse entra", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("mouseenter");

      expect(wrapper.emitted("inFocus")).toBeTruthy();
      expect(wrapper.emitted("inFocus")).toHaveLength(1);
    });

    it("emite outFocus quando mouse sai", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("mouseenter");
      await wrapper.find("div").trigger("mouseleave");

      expect(wrapper.emitted("outFocus")).toBeTruthy();
      expect(wrapper.emitted("outFocus")).toHaveLength(1);
    });

    it("emite onClick quando mouse clicka", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");

      expect(wrapper.emitted("onClick")).toBeTruthy();
      expect(wrapper.emitted("onClick")).toHaveLength(1);
    });

    it("emite onClick quando mouse clicka duas vezes", async () => {
      const wrapper = createWrapper();
      await wrapper.find("div").trigger("click");
      await wrapper.find("div").trigger("click");

      expect(wrapper.emitted("offClick")).toBeTruthy();
      expect(wrapper.emitted("offClick")).toHaveLength(1);
    });
  });

  describe("Modo grayscale", () => {
    it("aplica classe de grayscale quando em modo grayscale e disciplina não está focada", () => {
      const wrapper = createWrapper({ grayScaleMode: true });

      expect(wrapper.find("div").classes()).toContain("grayscale");
      expect(wrapper.find("div").classes()).toContain("opacity-50");
    });

    it("remove classe de grayscale quando em modo grayscale e disciplina está focada", async () => {
      const wrapper = createWrapper({ grayScaleMode: true });
      await wrapper.find("div").trigger("mouseenter");

      expect(wrapper.find("div").classes()).not.toContain("grayscale");
      expect(wrapper.find("div").classes()).not.toContain("opacity-50");
    });

    it("não aplica classes de grayscale quando modo não está ativo", () => {
      const wrapper = createWrapper({ grayScaleMode: false });

      expect(wrapper.find("div").classes()).not.toContain("grayscale");
      expect(wrapper.find("div").classes()).not.toContain("opacity-50");
    });
  });

  describe("Métodos expostos", () => {
    it("expõe focusDiscipline método corretamente", () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.focusDiscipline).toBeDefined();
      expect(typeof wrapper.vm.focusDiscipline).toBe("function");
    });

    it("expõe disciplineClicked método corretamente", () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.disciplineClicked).toBeDefined();
      expect(typeof wrapper.vm.disciplineClicked).toBe("function");
    });

    it("expõe getDiscipline método que retorna disciplina", () => {
      const wrapper = createWrapper();
      expect(wrapper.vm.getDiscipline).toBeDefined();
      expect(wrapper.vm.getDiscipline()).toStrictEqual(mockDiscipline);
    });
  });

  describe("Cenário de Integração", () => {
    it("gerencia completa iteração de hover", async () => {
      const wrapper = createWrapper();

      expect(wrapper.find("div").classes()).toContain("discipline");

      await wrapper.find("div").trigger("mouseenter");
      expect(wrapper.find("div").classes()).toContain("discipline-focused");
      expect(wrapper.emitted("inFocus")).toHaveLength(1);

      await wrapper.find("div").trigger("mouseleave");
      expect(wrapper.find("div").classes()).toContain("discipline");
      expect(wrapper.emitted("outFocus")).toHaveLength(1);
    });

    it("gerencia completa iteração de click", async () => {
      const wrapper = createWrapper();

      await wrapper.find("div").trigger("click");
      expect(wrapper.find("div").classes()).toContain("discipline-focused");
      expect(wrapper.emitted("onClick")).toHaveLength(1);

      await wrapper.find("div").trigger("mouseenter");
      await wrapper.find("div").trigger("mouseleave");
      expect(wrapper.find("div").classes()).toContain("discipline-focused");

      await wrapper.find("div").trigger("click");
      expect(wrapper.find("div").classes()).toContain("discipline");
      expect(wrapper.emitted("offClick")).toHaveLength(1);
    });

    it("gerencia interação programática e de usuário juntas", async () => {
      const wrapper = createWrapper();

      wrapper.vm.focusDiscipline(true);
      await wrapper.vm.$nextTick();
      expect(wrapper.find("div").classes()).toContain("discipline-focused");

      await wrapper.find("div").trigger("click");

      wrapper.vm.focusDiscipline(false);
      await wrapper.vm.$nextTick();

      wrapper.vm.disciplineClicked(false);
      await wrapper.vm.$nextTick();
      expect(wrapper.find("div").classes()).toContain("discipline");
    });
  });
});
