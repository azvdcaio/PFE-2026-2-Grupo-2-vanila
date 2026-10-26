# Sprint 01

**Período:** 14/10 a 20/10
**Sprint Goal:** Fechar o HTML das páginas do site e alinhar os padrões visuais compartilhados (header, footer e hero) para iniciar a estilização em CSS.

## Contexto de entrada

- AP1 recebeu nota 8.5 (Danilo, 14/10). Segundo a Ester, o professor disse que a nota pode ser revista se o grupo entregar tudo até a AP2 (conversa de 13/10): documentação com `scrum.md`, AHT corrigida e Figma.
- Páginas já em HTML no início da sprint: Hub, PKZ Lab, One To One, Contato PKZ (Pedro, 13/10), Contato One To One (Vitor, 13/10) e Agendamento PKZ e One To One (Danilo, 12/10).
- Login e Cadastro foram substituídos pelo Agendamento (Danilo, 11/10); a AHT foi ajustada pelo Vitor em 13/10.

## Sprint Backlog

- [x] Definir reaproveitamento de código entre as páginas de contato e de agendamento: muda só header e footer, com o mesmo nome de classe para estilizar as páginas juntas (Pedro, 14/10)
- [x] Padronizar header, main e footer entre as páginas, mudando apenas as cores por empresa (Danilo, Ester e Pedro, 17/10 a 19/10)
- [x] Iniciar o CSS da PKZ Lab, com classes reutilizáveis como `cabecalho` (Ester, a partir de 17/10)
- [x] Corrigir header com fundo cinza e links do nav na mesma cor, que ficavam invisíveis (Ester corrigiu no header dela, 18/10)
- [x] Decidir o footer padronizado: mesmo conteúdo em todas as páginas (logo do Hub como link para o `index.html`, descrição breve e redes sociais), mudando só as cores (consenso de Danilo, Ester, Caio, Pedro e Vitor, 20/10)
- [ ] Trocar as imagens da hero da PKZ e da One To One por versões sem texto, com `h1` e parágrafo por cima, e atualizar o Figma (acordado por Ester e Danilo em 18/10; a conclusão não aparece no chat)
- [ ] Entender como implementar o modal de agendamento (dúvida levantada pela Ester em 15/10; sem resposta registrada no chat)
- [ ] Aplicar o menu hambúrguer para mobile (código do professor já disponível na pasta `js` desde 13/10; não iniciado)

## Resultado da Sprint Review

- Footer único definido para todas as páginas. O professor confirmou que o footer pode ser padronizado ou individual, porque o cliente não especificou (Ester, 20/10).
- Pedro deixou pronto um footer para a página de contato da PKZ, oferecido como base (20/10).
- CSS da PKZ iniciado e uma seção estilizada, aguardando validação do Danilo (Ester, 18/10).
- Caio sugeriu reutilizar seções para reduzir linhas de CSS, já que há páginas idênticas ou quase (18/10). A ideia orientou as sprints seguintes.
- Feedback do professor sobre a hero (relatado pela Ester em 13/10): título que não seja o nome da página, subtítulo em parágrafo e CTA centralizado, no estilo do Hub, padronizado nas três landing pages.

## Retrospectiva

- **O que funcionou bem:** as decisões de padronização (header, footer, classes compartilhadas) saíram rápido e com concordância de todos.
- **O que pode melhorar:** o problema do header cinza com links cinza só foi percebido durante a estilização. A atividade do grupo foi baixa entre 14/10 e 16/10, com ausência da Ester na aula de 16/10 e Danilo avisando que só olharia o código à noite.
- **Ações para a próxima sprint (sugeridas a partir do chat; confirmar com a equipe):**
  - Combinar quem edita cada arquivo de CSS e avisar no grupo antes de mexer.
  - Fechar a decisão sobre a hero sem texto e atualizar o Figma.
