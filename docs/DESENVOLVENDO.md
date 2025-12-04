# Guia de Desenvolvimento do PPC

Este documento estabelece as diretrizes oficiais de desenvolvimento do projeto PPC. O objetivo é garantir consistência, qualidade, manutenibilidade e uma boa experiência para toda a equipe.

### Tecnologias Principais

O projeto é construído com o seguinte stack:

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Build tool**: Vite
- **Gerenciador de pacotes**: NPM (scripts padrão no `package.json`)
- **Estilização**: TailwindCSS (v3.x) + configuração personalizada no `tailwind.config.js`

### Ferramentas de Qualidade e Padronização de Código

Para manter o código limpo, legível e livre de erros comuns, utilizamos:

- **Vitest** – Responsável por testar o projeto.
- **Prettier** – Formatação automática do código (configurado em `.prettierrc` e `.prettierignore`).
- **ESLint** – Análise estática com regras específicas do projeto (arquivo `eslint.config.mts`). Inclui regras do Vue e boas práticas de acessibilidade e performance.
- **Husky + lint-staged** – Hooks de Git que executam automaticamente:

  ```bash
  npm run lint      # eslint src/
  npm run test:run  # npx vitest run
  ```

  Esses comandos são disparados em todo `git commit`.  
  Isso garante que **nenhum commit** seja feito com código que viole as regras de lint ou formatação.

  **Observação importante**: o hook pré-commit pode adicionar de 2 a 8 segundos ao tempo do commit (dependendo do tamanho das alterações). Esse pequeno atraso é intencional e obrigatório – ele evita problemas futuros e mantém o repositório sempre saudável.

### Convenções de Linguagem (pt-BR prioritário)

A linguagem padrão do projeto é **português brasileiro**:

- Comentários
- Mensagens de commit
- Nomes de variáveis, componentes, classes CSS e mensagens de log
- Textos exibidos na interface (quando aplicável)

Exemplos corretos:

```js
// Bom – comentário em pt-BR
const listaDeUsuarios = ref([])

// Bom – nome de componente
components/ListaPedidos.vue

// Bom – classe Tailwind com nome semântico em pt-BR
class="bg-fundo-padrao text-texto-primario"
```

**Exceções permitidas (inglês)**:

- Palavras ou termos já consagrados na comunidade/tech que ficariam estranhos ou menos claros em português:
  - `loading`, `error`, `placeholder`, `handler`, `payload`, `middleware`, `setup`, `props`, `emit` etc.
- Nomes de bibliotecas, APIs externas ou termos técnicos padrão (ex: `fetch`, `router`, `store`, `pinia`).
- Quando o termo em inglês transmitir melhor o conceito ou for amplamente usado pela equipe.

Regra prática: se houver dúvida, use pt-BR. Se o termo em inglês for claramente mais compreensível ou padrão no ecossistema Vue/Tailwind, ele é aceito.

### Scripts NPM Mais Usados

```bash
npm run dev                 # Vite dev server
npm run build               # Build de produção
npm run preview             # Preview do build local
npm run lint                # Executa ESLint
npm run format              # Executa Prettier
npm run test                # Testa projeto
npm run test:coverage:html  # Cria um html mostrando o tanto do projeto que está sendo testado
npm run prepare             # Instala Husky (executar uma vez após clone)
```

### Fluxo Recomendado de Trabalho

1. `git pull` (sempre atualizado)
2. Crie sua branch: `feature/nome-da-funcionalidade` ou `fix/descricao-do-bug`
3. Desenvolva normalmente
4. Ao terminar: `git add .`
5. `git commit` → o Husky vai rodar lint + format + testes automaticamente
   - Se houver erros, corrija-os e tente commitar novamente
6. Push e abra o Pull Request

Seguindo rigorosamente essas diretrizes, mantemos o projeto PPC organizado, escalável e com qualidade profissional consistente. Qualquer dúvida sobre as regras, abra uma issue ou pergunte no canal da equipe.

## Atualizando os Dados

Como não podemos utilizar diretamente o site da UFMS (protegido por CORS), é necessário que baixemos o contéudo importante do site e deixemos disponível para uso interno. 

Para fazer o download dos dados mais recentes dos cursos, rode este comando na raíz do projeto:

```bash
python scripts/data_scraper.py
```

## Sobre o uso de IAs

As Large-Language-Models (LLM) se mostraram muito eficientes para fazerem uma míriade de diferentes tarefas, com uma eficácia muitas vezes além de simplesmente "profissional". No entanto, alguns cuidados devem ser tomados ao se utilizar de IAs para a produção deste projeto:

- Não confiar na IA como um profissional qualificado.
- Deter conhecimento signficativo da tarefa que foi solicitada para a IA.
- Testar e analisar a solução da IA e sua aplicabilidade no contexto.
- Descobrir possíveis outras soluções e escolher a mais adequada.
- Garantir que todas as outras recomendações deste projeto sejam respeitadas.
