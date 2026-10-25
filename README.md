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

- [ ] Está no formato *"Como [personagem], quero [algo] para que [objetivo]"*
- [ ] Contém critérios de aceitação
- [ ] Tem prioridade atribuída (Alta, Média ou Baixa)
- [ ] Tem Story Points estimados

### DoD - Definition of Done 🏁

Uma user story só é considerada concluída quando:

- [ ] Código revisado via Pull Request
- [ ] Funcionalidade implementada e testada
- [ ] Documentação atualizada

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

Em desenvolvimento... 🚧

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
