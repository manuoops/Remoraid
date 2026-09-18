# REMORAID


<h3 align="center">API - Tratamento de Dados Públicos de Bombas de Combustível</h3>

---

## 🎯 DESAFIO 

Analisar os dados públicos de verificações e fiscalizações do IPEM-SP (Instituto de Pesos e Medidas do Estado de São Paulo) relacionados exclusivamente a Bombas Medidoras de Combustível, utilizando informações do Portal de Serviços do Inmetro nos Estados (PSIE) e do Portal de Dados Abertos do IPEM-SP. O desafio envolve tratar, limpar e normalizar bases de dados heterogêneas (geográfica e temporalmente), além de identificar padrões de conformidade e não conformidade nas medições, tornando essas informações acessíveis e compreensíveis para a sociedade.


## 📌 OBJETIVO 

Desenvolver um pipeline documentado em Python e uma aplicação web interativa (dashboard) que permitam consultar rapidamente a conformidade das bombas de combustível fiscalizadas pelo IPEM-SP. O projeto contempla três etapas principais:

- Limpeza e Normalização de Dados (Google Colab) — tratamento da base de bombas de combustível, padronização geográfica e temporal, e sanitização de colunas de medição (erros em mL, status de aprovação/reprovação/interdição); <br>
- Análise Exploratória (Google Colab) — identificação de taxas regionais de conformidade, principais motivos de reprovação e ranking de municípios/regiões auditadas;
- Aplicação Web — construção de um dashboard com filtros por município/região, cards de KPI (Total de Bombas Periciadas, % de Aprovação, Total de Autuações) e gráficos interativos.

---

## 🗂️ DOCUMENTAÇÃO DO PROJETO

## 📊 Backlog do Produto <a name="backlog"></a>

### SPRINT 1 - Tratamento dos Dados

| Rank | Prioridade | User Story                                                                                                                          | Story Points | Sprint | Status |
|------| --- |--------------------------------------------------------------------------------------------------------------------------------------------------------| --- | --- | --- |
| 1    | Alta | Como desenvolvedor do projeto, quero identificar as fontes oficiais para acessar todos os dados necessários para cumprir com as exigências do cliente | 3 | 1 | ✅ |
| 2    | Alta | Como responsável do IPEM-SP, quero que o pipeline seja todo documentado para que haja fácil rastreamento e padronização definida previamente          | 5 | 1 | ✅ |
| 3    | Alta | Como responsável do IPEM-SP, quero sanitizar as colunas de medição, para que a análise exploratória use dados confiáveis                              | 3 | 1 | ✅ |
| 4    | Alta | Como responsável do IPEM-SP, quero que sejam identificadas todas as irregularidades de escrita no preenchimento dos dados obtidos, a fim de padronizar e facilitar a pesquisa dos dados, retirando abreviações ou formas diferentes de se escrever um mesmo dado                                                                           | 3 | 1 | ✅ |
| 5    | Alta | Como responsável do IPEM-SP, quero que sejam definidas as regiões que cada município encontrado pertence, para que nas sprints futuras, sejam mostrados um conjunto de dados referentes às regiões definidas                                                                                                                                 | 3 | 1 | ✅ |
| 6    | Alta | Como responsável do IPEM-SP, quero que as datas das fiscalizações estejam em um padrão único, para comparar os resultados ao longo do tempo           | 3 | 1 | ✅ |
| 7    | Alta | Como responsável do IPEM-SP, quero que as unidades e valores dos erros de medição estejam padronizados em mL, para que os resultados das medições possam ser comparados futuramente                                                                                                                                                           | 5 | 1 | ✅ |
| 8    | Alta | Como responsável do IPEM-SP, quero que os resultados das fiscalizações sejam classificados de forma padronizada, para calcular corretamente aprovação, reprovação e interdição.                                                                                                                                                           | 1 | 1 | ✅ |
| 9    | Alta | Como responsável do IPEM-SP, quero que seja formada uma base de dados robusta e tratada, com dados ‘limpos’, para que seja a base das próximas sprints| 1 | 1 | ✅ |

---
---

### SPRINT 2 - "Brincando" com dados

| Rank | Prioridade | User Story | Story Points | Sprint | Status |
|------|------------|------------|--------------|--------|--------|
| 10   | Alta       | Como responsável do IPEM-SP, quero visualizar a taxa de aprovação das bombas de combustível filtradas na outra sprint, para entender o nível geral de conformidade encontrado nas fiscalizações| 3            | 2 | ⏰ |
| 11  | Alta       | Como responsável do IPEM-SP, quero visualizar a taxa de reprovação das bombas de combustível filtradas na outra sprint, para entender o nível geral de inconformidade encontrado nas fiscalizações| 1            | 2 | ⏰ |
| 12  | Média      | Como responsável do IPEM-SP, quero visualizar as bombas que foram interditadas, para verificar os casos mais graves encontrados nas fiscalizações| 1            | 2 | ⏰ |
| 13  | Média      | Como responsável do IPEM-SP, quero entender quais foram os principais motivos de interdição nas bombas aferidas, com objetivo de entender quais irregularidades surgem com mais frequência| 1            | 2 | ⏰ |
| 14  | Alta       | Como responsável do IPEM-SP, quero visualizar o ranking de municípios com mais ou menos índices de conformidade com as regras de aferição| 3            | 2 | ⏰ |
| 15  | Alta       | Como responsável do IPEM-SP, quero comparar os índices gerados entre diferentes regiões, para ajudar a direcionar as equipes de fiscalização| 2            | 2 | ⏰ |
| 16  | Alta       | Como responsável do IPEM-SP, quero poder analisar os resultados obtidos ao longo do tempo, para verificar evoluções ou pioras nos índices apurados| 2            | 2 | ⏰ |
| 17  | Média      | Como responsável do IPEM-SP, quero visualizar o número exato de bombas apuradas por município e por região, para compreender a abrangência das ações de fiscalização| 3            | 2 | ⏰ |
| 18  | Média      | Como responsável do IPEM-SP, quero poder validar os indicadores apresentados, para que se mantenha um processo coerente com a base de dados fonte da pesquisa| 2 | 2 | ⏰ |

---

### SPRINT 3 - Aplicação visual, prática e didática ⏰

Em desenvolvimento... 🚧

---

## 📋 DEFINIÇÕES DE QUALIDADE

### DoR - Definition of Ready ✅

- User Stories no formato "Como [personagem], quero [algo] para que [objetivo]"
- As User Stories contêm critérios de aceitação
- Priorização atribuída (Alta, Média, Baixa)
- Story Points estimados

### DoD - Definition of Done 🏁

- Código revisado via Pull Request
- Funcionalidade implementada e testada
- Documentação atualizada

---

## 💻 Tecnologias

### Tecnologias usadas

Em desenvolvimento... 🚧
 
---

## 🛠️ Instalação e uso

Em desenvolvimento... 🚧

---

## 📅 Sprints

#### 🛠️ Sprint 1 - Tratamento dos Dados

- **Status**: ✅ Concluída
- **Objetivo Principal**: Coletar os dados do IPEM-SP, tratar e documentar esses dados colhidos.

---

## 👨‍💻 Equipe

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
    </tr><tr>
      <td>Eduardo Felipe</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Eduardo-Felipe9231"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr><tr>
      <td>Nicolas Anderson</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Slot148"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr><tr>
      <td>Nicolas Pacheco</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Nocholas0"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr><tr>
      <td>Pedro Maciel</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/MaciellCB"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr><tr>
      <td>Vinícius Morais</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/oViniciusMorais"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
    </tr>
  </table>
</div>

---

## 📢 Suporte
Se você tiver dúvidas, sugestões, encontrou algum problema ou deseja contribuir com este projeto, sinta-se à vontade para abrir uma issue neste repositório. Se necessário, entre em contato com os membros da equipe.
