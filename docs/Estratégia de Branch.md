ESTRATÉGIA DE BRANCH:

O projeto adota uma estratégia de desenvolvimento baseada em commits diretos na branch main, que é a branch principal do repositório. 

Essa abordagem dispensa a criação de branches individuais para cada funcionalidade, correção ou alteração, mantendo o fluxo de trabalho centralizado na branch principal.

JUSTIFICATIVA:

A escolha por essa estratégia se deve às características e à escala do projeto, considerando os seguintes fatores:

- Baixa complexidade do projeto, já que possui um escopo relativamente limitado, não demandando um fluxo de desenvolvimento com múltiplas branches para gerenciamento de funcionalidades.
- Equipe reduzida. A quantidade de colaboradores é pequena, facilitando a comunicação, o alinhamento das alterações e a identificação de conflitos.
- Agilidade no desenvolvimento, onde a realização de commits diretamente na `main` reduz etapas operacionais, tornando o processo de desenvolvimento mais simples, rápido e eficiente.
- Centralização do histórico. Ao mantermos as alterações em uma única branch, o acompanhamento da evolução do projeto e a consulta ao histórico de modificações se torna mais fácil.
- Ausência de necessidade de manutenção de versões paralelas. O projeto não exige, neste momento, o gerenciamento simultâneo de diferentes versões, ambientes de produção ou linhas de desenvolvimento.

CONCLUSÃO:

A adoção do fluxo de commits diretos na branch `main` representa uma decisão alinhada às necessidades atuais do projeto, priorizando simplicidade, agilidade e facilidade de gerenciamento.
Embora estratégias mais estruturadas, como Git Flow ou o uso de branches para funcionalidades, sejam recomendadas para projetos de maior escala ou com equipes mais numerosas, sua implementação neste contexto poderia introduzir uma complexidade operacional desnecessária.