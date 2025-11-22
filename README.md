# Sistema de Semestralização UFMS

Solução web desenvolvida para facilitar o processo de semestralização dos cursos da Universidade Federal de Mato Grosso do Sul (UFMS), auxiliando estudantes na escolha de disciplinas de forma intuitiva e organizada.


## Funcionalidades

- **Seleção de Cursos**: Interface para escolha do curso desejado
- **Visualização de Disciplinas**: Exibição clara das matérias disponíveis
- **Planejamento Semestral**: Organização das disciplinas por período

## Como Executar

### Executando a Aplicação

Para iniciar o servidor local e visualizar o projeto:

```bash
python -m http.server 8000
```

Após executar o comando, acesse `http://localhost:8000` no seu navegador.

### Atualizando os Dados

Para fazer o download dos dados mais recentes dos cursos:

```bash
npm run dev
```

## Tecnologias Utilizadas

- HTML/CSS/JavaScript
- Vue.js + Vite
- Tailwind CSS
- Python (para coleta de dados)
