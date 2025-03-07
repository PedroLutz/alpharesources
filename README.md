**PROJETO: Alpha Management**

LINGUAGEM: Javascript (Next.js, Mongoose)

BANCO DE DADOS: MongoDB

HOSTEAMENTO: Vercel

**PARA EXECUTAR:**
- Instale as dependências (npm install)
- No terminal, execute "npm run dev".

**SOBRE MIM E O PROJETO:**
Olá! Meu nome é Pedro Guilherme e eu sou o desenvolvedor deste código. Atualmente (2025) estou estudando Engenharia da Computação na UFSC, e buscando por oportunidades de emprego.
Desenvolvi o aplicativo Alpha Management durante minha participação como competidor do torneio F1 in Schools, na equipe Alpha. 
O sistema foi idealizado como um facilitador dos processos de Gestão de Projetos (uma das áreas avaliadas na competição) sob o padrão do PMI e do F1 in Schools.
Para tanto, não apenas estudei programação, como estudei os processos de gerenciamento de projetos pelo PMBOK.
O site todo está em inglês, pois é a língua obrigatória utilizada para participação na competição.

**FUNCIONALIDADES:**
A base do aplicativo é a organização das áreas da equipe em uma WBS (Work Breakdown Structure, ou em português, EAP, ou Estrutura Analítica de Projeto). 
O usuário cadastra no site todas as áreas e subáreas (que o site trata com itens), sendo esses dados a base por trás de todo o funcionamento do site, já que o MongoDB é um banco de dados não relacional.
A partir do cadastro da WBS, o usuário pode fazer diversas coisas.
Na rota "Timeline Management", o usuário pode preparar um cronograma para cada subárea (com data de início e término e dependências) e monitorar em tempo real a execução dessas subáreas, com o site gerando tabelas comparativas e gráficos de Gantt para melhor visualização.
Na rota "Roles & Responsibilities", o usuário registra cada integrante da equipe e suas habilidades, posteriormente podendo distribuir responsabilidades para cada subárea dentro de uma matriz RACI.
Na rota "Budget & Resources", o usuário pode registrar os recursos a serem adquiridos, planejar as suas aquisições e registrar os movimentos financeiros no decorrer da competição.
Na rota "Risk Management", o usuário identifica os riscos da competição e os analisa de diversas formas.
Na rota "Communication Management", o usuário identifica os Stakeholders, além de registrar individualmente suas necessidades para monitoramento da comunicação.
Por último, na rota "Report Generator", o site gera um relatório de Status do mês selecionado, incluindo informações de cronograma e riscos e campos para que o usuário insira análises externas de KPIs e problemas encontrados.

Pedro Lutz
2025
