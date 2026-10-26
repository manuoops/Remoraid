<h1 align="center"> REMORAID</h1>
<p align="center">
  <img src="public/ChatGPT Image 29 de set. de 2026, 07_38_09 (1).png" alt="Logo do projeto" width="200"/>
</p>

<h3 align="center">API FATEC - Tratamento e Transparência de Dados Públicos de Bombas de Combustível (IPEM-SP)</h3>

<p align="center">
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/sprint%20atual-2-blue?style=for-the-badge" alt="Sprint atual">
  <img src="https://img.shields.io/badge/metodologia-Scrum-green?style=for-the-badge" alt="Scrum">
  <img src="https://img.shields.io/badge/Fatec-SJC-red?style=for-the-badge" alt="Fatec SJC">
</p>

---

## 📑 Sumário

1. [Desafio](#desafio)
2. [Objetivo](#objetivos)
3. [Backlog do Produto](#backlog)
4. [Definições de qualidade (DoR e DoD)](#qualidade)
5. [Tecnologias](#tecnologias)
6. [Instalação e uso](#instalacao)
7. [Sprints](#sprints)
8. [Equipe](#equipe)
9. [Suporte](#suporte)

---

## 🎯 DESAFIO <a name="desafio"></a>

Analisar os dados públicos de verificações e fiscalizações do IPEM-SP relacionados **exclusivamente a Bombas Medidoras de Combustível**, utilizando informações do **Portal de Serviços do Inmetro nos Estados (PSIE)** e do **Portal de Dados Abertos do IPEM-SP**.

O desafio envolve tratar, limpar e normalizar bases de dados heterogêneas (geográfica e temporalmente) e identificar padrões de conformidade e não conformidade nas medições.

---

## 📌 OBJETIVO <a name="objetivos"></a>

**Objetivo geral:** desenvolver um pipeline documentado em Python e uma aplicação web interativa que permitam consultar rapidamente a conformidade das bombas de combustível fiscalizadas pelo IPEM-SP. O projeto contempla três etapas principais:

| Etapa | Ambiente | Descrição |
|-------|----------|-----------|
| 1. Limpeza e Normalização | Google Colab | Tratamento da base, padronização geográfica (municípios e regionais) e temporal, e sanitização das colunas de medição (erros em mL; status de aprovação, reprovação ou interdição). |
| 2. Análise Exploratória | Google Colab | Taxas regionais de conformidade, principais motivos de reprovação/interdição e ranking de municípios e regiões auditadas. |
| 3. Aplicação Web | Web | Dashboard com filtros por município/região, cards de KPI (**Total de Bombas Periciadas**, **% de Aprovação**, **Total de Autuações**) e gráficos interativos. |

---

## 📊 Backlog do Produto <a name="backlog"></a>

**Resumo**

| Sprint | Tema | Stories | Status |
|--------|------|---------|--------|
| 1 | Tratamento dos Dados | #1 a #9 | ✅ Concluída |
| 2 | "Brincando" com dados (análise exploratória) | #10 a #18 | ✅ Concluída |
| 3 | Aplicação visual, prática e didática | #19 a #30 | ⏰ Planejada |

### SPRINT 1 - Tratamento dos Dados ✅

| Rank | Prioridade | User Story | Story Points | Status |
|------|------------|------------|--------------|--------|
| 1 | Alta | Como desenvolvedor do projeto, quero identificar as fontes oficiais para acessar todos os dados necessários para cumprir com as exigências do cliente | 3 | ✅ |
| 2 | Alta | Como responsável do IPEM-SP, quero que o pipeline seja todo documentado para que haja fácil rastreamento e padronização definida previamente | 5 | ✅ |
| 3 | Alta | Como responsável do IPEM-SP, quero sanitizar as colunas de medição, para que a análise exploratória use dados confiáveis | 3 | ✅ |
| 4 | Alta | Como responsável do IPEM-SP, quero que sejam identificadas todas as irregularidades de escrita no preenchimento dos dados obtidos, a fim de padronizar e facilitar a pesquisa dos dados, retirando abreviações ou formas diferentes de se escrever um mesmo dado | 3 | ✅ |
| 5 | Alta | Como responsável do IPEM-SP, quero que sejam definidas as regiões que cada município encontrado pertence, para que nas sprints futuras sejam mostrados um conjunto de dados referentes às regiões definidas | 3 | ✅ |
| 6 | Alta | Como responsável do IPEM-SP, quero que as datas das fiscalizações estejam em um padrão único, para comparar os resultados ao longo do tempo | 3 | ✅ |
| 7 | Alta | Como responsável do IPEM-SP, quero que as unidades e valores dos erros de medição estejam padronizados em mL, para que os resultados das medições possam ser comparados futuramente | 5 | ✅ |
| 8 | Alta | Como responsável do IPEM-SP, quero que os resultados das fiscalizações sejam classificados de forma padronizada, para calcular corretamente aprovação, reprovação e interdição | 1 | ✅ |
| 9 | Alta | Como responsável do IPEM-SP, quero que seja formada uma base de dados robusta e tratada, com dados "limpos", para que seja a base das próximas sprints | 1 | ✅ |

### SPRINT 2 - "Brincando" com dados ✅

| Rank | Prioridade | User Story | Story Points | Status |
|------|------------|------------|--------------|--------|
| 10 | Alta | Como responsável do IPEM-SP, quero visualizar a taxa de aprovação das bombas de combustível filtradas na outra sprint, para entender o nível geral de conformidade encontrado nas fiscalizações | 3 | ✅ |
| 11 | Alta | Como responsável do IPEM-SP, quero visualizar a taxa de reprovação das bombas de combustível filtradas na outra sprint, para entender o nível geral de inconformidade encontrado nas fiscalizações | 1 | ✅ |
| 12 | Média | Como responsável do IPEM-SP, quero visualizar as bombas que foram interditadas, para verificar os casos mais graves encontrados nas fiscalizações | 1 | ✅ |
| 13 | Média | Como responsável do IPEM-SP, quero entender quais foram os principais motivos de interdição nas bombas aferidas, com objetivo de entender quais irregularidades surgem com mais frequência | 1 | ✅ |
| 14 | Alta | Como responsável do IPEM-SP, quero visualizar o ranking de municípios com mais ou menos índices de conformidade com as regras de aferição | 3 | ✅ |
| 15 | Alta | Como responsável do IPEM-SP, quero comparar os índices gerados entre diferentes regiões, para ajudar a direcionar as equipes de fiscalização | 2 | ✅ |
| 16 | Alta | Como responsável do IPEM-SP, quero poder analisar os resultados obtidos ao longo do tempo, para verificar evoluções ou pioras nos índices apurados | 2 | ✅ |
| 17 | Média | Como responsável do IPEM-SP, quero visualizar o número exato de bombas apuradas por município e por região, para compreender a abrangência das ações de fiscalização | 3 | ✅ |
| 18 | Média | Como responsável do IPEM-SP, quero poder validar os indicadores apresentados, para que se mantenha um processo coerente com a base de dados fonte da pesquisa | 2 | ✅ |

### SPRINT 3 - Aplicação visual, prática e didática ⏰

> Sprint ainda não iniciada. Story Points serão definidos na Sprint Planning.

| Rank | Prioridade | User Story | Story Points | Status |
|------|------------|------------|--------------|--------|
| 19 | Alta | Como responsável do IPEM-SP, quero poder acessar os índices e dados obtidos em uma plataforma web, com o objetivo de deixar esses dados expostos de maneira prática, intuitiva, dinâmica e visual | - | ⏰ |
| 20 | Alta | Como usuário, quero poder visualizar o total de bombas fiscalizadas em um card de KPI, para compreender rapidamente o volume de fiscalizações realizadas | - | ⏰ |
| 21 | Alta | Como usuário, quero poder visualizar a porcentagem de bombas aprovadas em um card de KPI, para entender quantas bombas realmente estão em conformidade | - | ⏰ |
| 22 | Alta | Como usuário, quero poder visualizar o total de autuações em um card de KPI, para compreender rapidamente a quantidade de ocorrências efetuadas | - | ⏰ |
| 23 | Alta | Como usuário, quero poder visualizar a situação das bombas aferidas em um determinado município, com objetivo de entender facilmente a situação das bombas próximas a mim | - | ⏰ |
| 24 | Alta | Como usuário, quero poder visualizar a situação das bombas aferidas em uma determinada região, com objetivo de entender facilmente a situação das bombas próximas a mim | - | ⏰ |
| 25 | Alta | Como usuário, quero poder visualizar graficamente os filtros criados, com objetivo de tornar minha experiência no site mais interativa e prática | - | ⏰ |
| 26 | Alta | Como usuário, quero poder utilizar diferentes filtros para obter dados mais precisos, com objetivo de tornar minha experiência no site mais interativa | - | ⏰ |
| 27 | Média | Como usuário, quero poder visualizar um KPI dinâmico, que se atualize conforme eu selecione determinados filtros, com objetivo de tornar o processo mais visual e prático | - | ⏰ |
| 28 | Baixa | Como usuário, quero poder visualizar facilmente a fonte dos dados apresentados na plataforma, para poder verificar a sua veracidade | - | ⏰ |
| 29 | Média | Como usuário, quero poder visualizar a distribuição dos resultados por município ou por região, para comparar as diferentes localidades | - | ⏰ |
| 30 | Baixa | Como usuário, quero poder acessar recursos de acessibilidade em Libras na plataforma web, para que pessoas com determinadas limitações físicas também possam acessar os dados, já que eles são de interesse público | - | ⏰ |

---

## 📋 Definições de qualidade <a name="qualidade"></a>

### DoR - Definition of Ready ✅

Uma user story só entra na Sprint quando:

- [ ] Está no formato *"Como [personagem], quero [ação] para que [benefício]"*
- [ ] Contém critérios de aceitação
- [ ] Tem prioridade atribuída (Alta, Média ou Baixa)
- [ ] Tem Story Points estimados pelo time
- [ ] Cabe em uma única Sprint e não depende de outra User Story

### DoD - Definition of Done 🏁

Uma user story só é considerada concluída quando:

- [ ] Código revisado via Pull Request e aprovado por pelo menos 1 outro membro
- [ ] Todos os critérios de aceitação foram atendidos
- [ ] Funcionalidade implementada e testada
- [ ] Documentação no README está atualizada

---

## 💻 Tecnologias <a name="tecnologias"></a>

### Tecnologias usadas

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Google%20Colab-F9AB00?style=for-the-badge&logo=googlecolab&logoColor=white" alt="Google Colab">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
  <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
</p>

| Tecnologia | Uso no projeto |
|------------|----------------|
| Python | Pipeline de limpeza, normalização e análise exploratória dos dados |
| Google Colab | Ambiente de execução e documentação dos notebooks do pipeline |
| TypeScript | Implementação da aplicação (dashboard) |
| Git / GitHub | Versionamento, Pull Requests e revisão de código |

---

## 🛠️ Instalação e uso <a name="instalacao"></a>

  <p>
    Esta seção apresenta as instruções necessárias para configurar o ambiente de desenvolvimento e executar a aplicação web do <strong>Remoraid</strong>, projeto voltado à análise e à transparência dos dados públicos de fiscalização de bombas medidoras de combustível do IPEM-SP.
  </p>

  <h3>📋 Pré-requisitos</h3>

  <p>Antes de iniciar, certifique-se de possuir os seguintes recursos instalados:</p>

  <ul>
    <li><strong>Git:</strong> para clonar o repositório.</li>
    <li><strong>Node.js:</strong> ambiente necessário para executar as ferramentas de desenvolvimento da aplicação.</li>
    <li><strong>npm:</strong> gerenciador de pacotes utilizado para instalar as dependências do projeto. Ele é instalado junto com o Node.js.</li>
  </ul>

  <p>
    Recomenda-se utilizar o Node.js 22.12 ou superior, compatível com os requisitos das ferramentas utilizadas pelo projeto.
  </p>

  <h3>1. Clonar o repositório</h3>

  <p>Abra um terminal e execute o comando abaixo para baixar o código-fonte:</p>

  <pre><code>git clone https://github.com/manuoops/Remoraid.git</code></pre>

  <p>Em seguida, entre na pasta do projeto:</p>

  <pre><code>cd Remoraid</code></pre>

  <h3>2. Instalar as dependências</h3>

  <p>Na raiz do projeto, execute:</p>

  <pre><code>npm install</code></pre>

  <p>
    Esse comando instala as bibliotecas e ferramentas declaradas no arquivo <code>package.json</code>, incluindo React, TypeScript, Vite, PapaParse, Recharts e Lucide React.
  </p>

  <p>
    O arquivo <code>package-lock.json</code> registra as versões das dependências resolvidas durante a instalação.
  </p>

  <h3>3. Configurar a base de dados</h3>

  <p>
    A aplicação web utiliza um arquivo CSV para carregar os registros das fiscalizações.
  </p>

  <p>O arquivo esperado é:</p>

  <pre><code>public/
└── dados_bombas_tratados.csv</code></pre>

  <p>
    A aplicação procura esse arquivo automaticamente por meio do caminho <code>/dados_bombas_tratados.csv</code>, definido em <code>src/App.tsx</code>.
  </p>

  <p>
    Antes de executar o dashboard, verifique se o arquivo está presente no diretório <code>public/</code> e se contém os dados tratados necessários para a visualização.
  </p>

  <p>A base deve possuir cabeçalhos compatíveis com os campos utilizados pela aplicação, incluindo:</p>

  <ul>
    <li><code>MUNICIPIO</code></li>
    <li><code>BAIRRO</code></li>
    <li><code>PROPRIETARIO</code></li>
    <li><code>DESCRICAO</code></li>
    <li><code>MARCA</code></li>
    <li><code>MODELO</code></li>
    <li><code>NUMERO_INMETRO</code></li>
    <li><code>NUMERO_SERIE</code></li>
    <li><code>DATA_VERIFICACAO</code></li>
    <li><code>RESULTADO</code></li>
    <li><code>STATUS_CONSOLIDADO</code></li>
  </ul>

  <p>
    Os nomes das colunas devem corresponder aos esperados pelo código. A classificação das fiscalizações e os indicadores do dashboard dependem da consistência dessas informações.
  </p>

  <h3>4. Executar a aplicação em ambiente de desenvolvimento</h3>

  <p>
    Depois de instalar as dependências e verificar a disponibilidade da base de dados, inicie o servidor local:
  </p>

  <pre><code>npm run dev</code></pre>

  <p>
    O Vite exibirá no terminal o endereço local para acessar a aplicação. Normalmente, o endereço padrão é:
  </p>

  <pre><code>http://localhost:5173</code></pre>

  <p>Abra o endereço indicado pelo terminal em seu navegador.</p>

  <p>
    Durante o desenvolvimento, o servidor permite visualizar as alterações realizadas no código sem precisar gerar uma nova versão de produção a cada modificação.
  </p>

  <h3>5. Gerar a versão de produção</h3>

  <p>
    Para verificar a compilação do projeto e gerar os arquivos de produção, execute:
  </p>

  <pre><code>npm run build</code></pre>

  <p>
    Esse comando executa a verificação de tipos do TypeScript e, em seguida, gera a versão de produção da aplicação utilizando o Vite.
  </p>

  <p>
    Quando a compilação é concluída com sucesso, os arquivos gerados ficam no diretório <code>dist/</code>.
  </p>

  <h3>6. Visualizar a versão de produção localmente</h3>

  <p>
    Depois de gerar a versão de produção, execute:
  </p>

  <pre><code>npm run preview</code></pre>

  <p>
    O Vite disponibilizará um servidor local para visualizar os arquivos gerados.
  </p>

  <p>
    Utilize o endereço apresentado no terminal para acessar a aplicação pelo navegador.
  </p>

  <p>
    Esse procedimento serve para verificar a versão compilada localmente. Ele não publica a aplicação na internet.
  </p>

  <h3>7. Executar a análise estática do código</h3>

  <p>
    O projeto também disponibiliza um comando para analisar o código com o Oxlint:
  </p>

  <pre><code>npm run lint</code></pre>

  <p>
    Esse comando executa a ferramenta de análise estática configurada no projeto e ajuda a identificar possíveis problemas no código durante o desenvolvimento.
  </p>

  <h3>📁 Principais arquivos e diretórios</h3>

  <p>
    A estrutura abaixo apresenta os principais arquivos identificados durante a análise do projeto:
  </p>

  <pre><code>Remoraid/
├── public/
│   └── dados_bombas_tratados.csv   # Base esperada pela aplicação
├── src/
│   ├── App.tsx                     # Lógica e componentes do dashboard
│   ├── App.css                     # Estilos da aplicação
│   ├── index.css                   # Estilos globais
│   └── main.tsx                    # Ponto de entrada do React
├── index.html                      # Documento HTML principal
├── package.json                   # Dependências e comandos
├── package-lock.json              # Registro das dependências resolvidas
├── tsconfig.json                  # Configuração principal do TypeScript
├── tsconfig.app.json              # Configuração do TypeScript para a aplicação
├── tsconfig.node.json             # Configuração do TypeScript para ferramentas Node
└── vite.config.ts                 # Configuração do Vite</code></pre>

  <p>
    Essa lista destaca os arquivos centrais da aplicação web e não representa necessariamente todos os arquivos existentes no repositório.
  </p>

  <h3>⚠️ Solução de problemas</h3>

  <h4>O comando <code>npm</code> não é reconhecido</h4>

  <p>
    Verifique se o Node.js foi instalado corretamente. Feche e abra novamente o terminal e execute:
  </p>

  <pre><code>node -v
npm -v</code></pre>

  <p>
    Se os comandos não forem reconhecidos, confira a instalação do Node.js e a configuração do PATH do sistema.
  </p>

  <h4>O dashboard não carrega os dados</h4>

  <p>
    Verifique se o arquivo <code>dados_bombas_tratados.csv</code> está no diretório <code>public/</code> e se o nome corresponde exatamente ao caminho utilizado pela aplicação.
  </p>

  <p>
    Caso o arquivo esteja ausente ou inacessível, a aplicação poderá apresentar uma mensagem informando que não foi possível carregar os dados.
  </p>

  <h4>O comando <code>npm run build</code> apresenta erros</h4>

  <p>
    Confira se todas as dependências foram instaladas e se os arquivos necessários estão presentes. Para reinstalar as dependências declaradas no projeto, pode-se executar:
  </p>

  <pre><code>npm ci</code></pre>

  <p>
    Esse comando utiliza o <code>package-lock.json</code> para instalar as dependências registradas no arquivo de bloqueio.
  </p>

  <h4>A aplicação funciona localmente, mas não foi publicada na internet</h4>

  <p>
    Os comandos <code>npm run dev</code> e <code>npm run preview</code> disponibilizam servidores locais. Para disponibilizar o sistema publicamente, será necessário configurar uma plataforma de hospedagem compatível com aplicações web estáticas e garantir que a base de dados esteja incluída no processo de publicação.
  </p>

---

## 📅 Sprints <a name="sprints"></a>

#### 🛠️ Sprint 1 - Tratamento dos Dados

- **Status:** ✅ Concluída
- **Objetivo:** coletar os dados do IPEM-SP, tratar e documentar os dados coletados.
- **Entregas:** base tratada e pipeline documentado (stories #1 a #9).

#### 📈 Sprint 2 - "Brincando" com dados

- **Status:** ✅ Concluída
- **Objetivo:** realizar a análise exploratória e gerar os indicadores de conformidade (taxas, ranking, comparação regional e evolução temporal).
- **Entregas previstas:** notebooks de análise e indicadores validados (stories #10 a #18).

#### 🖥️ Sprint 3 - Aplicação visual, prática e didática

- **Status:** ⏰ Planejada
- **Objetivo:** construir a aplicação web com filtros, cards de KPI e gráficos interativos.
- **Entregas previstas:** dashboard funcional, manuais e documentação final (stories #19 a #30).

---

## 👨‍💻 Equipe <a name="equipe"></a>

<div align="center">
  <table>
    <tr>
      <th>Membro</th>
      <th>Função</th>
      <th>Github</th>
    </tr>
    <tr>
      <td>Vinícius Henrique</td>
      <td>Product Owner</td>
      <td><a href="https://github.com/ViniciusAmante"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Manuela Santos</td>
      <td>Scrum Master</td>
      <td><a href="https://github.com/manuoops"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Alex Gabriel</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/AlexGabrielll"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Eduardo Felipe</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Eduardo-Felipe9231"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Nicolas Anderson</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Slot148"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Nicolas Pacheco</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Nocholas0"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Pedro Maciel</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/MaciellCB"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Vinícius Morais</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/oViniciusMorais"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
  </table>
</div>

---

## 📢 Suporte <a name="suporte"></a>

Se você tiver dúvidas, sugestões, encontrou algum problema ou deseja contribuir com este projeto, sinta-se à vontade para abrir uma **issue** neste repositório. Se necessário, entre em contato com os membros da equipe.
