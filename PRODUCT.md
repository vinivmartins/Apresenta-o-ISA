# Radar Administrativo ISA

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
HTML, CSS e JavaScript estáticos, abrindo diretamente no navegador, conforme escolha do usuário.

## Users
Pessoa candidata à vaga administrativa apresenta o protótipo ao responsável pela contratação. Na hipótese de uso real, o usuário principal seria a equipe administrativa do ISA.

## Product Purpose
Demonstrar, com dados inteiramente fictícios, como receber e conferir notas fiscais, identificar campos faltantes, duplicidades e divergências entre fornecedor e CNPJ, e transformar exceções em pendências com responsável e prazo. A apresentação deve permitir demonstrar o fluxo em poucos minutos.

## Positioning
Protótipo de processo administrativo verificável: cada sugestão de extração exige conferência humana e cada pendência mostra uma próxima ação. O objetivo não é simular faturamento clínico.

## Operating Context
O ISA informa publicamente que atua em endoscopia e terapia assistida em Goiânia. A vaga cita conferência de notas, fornecedores, planilhas e convênios. A rotina interna exata, sistemas e volumes não são conhecidos. Os dados da demonstração são inventados.

## Capabilities and Constraints
- Caso principal confirmado: notas fiscais; pendências de convênios são apoio.
- Demonstração local, sem instalação e sem necessidade de servidor ou login.
- Não usar dados de pacientes nem documentos reais da clínica.
- Não apresentar economia de tempo como resultado medido.
- A leitura de XML é local e funcional para campos definidos de NF-e e NFS-e padrão nacional; a entrada alternativa por texto usa regras locais. Um piloto real exigiria validação fiscal, revisão dos layouts recebidos e aprovação da clínica.
- O registro de uma nota exige responsável, validação de identidade e confirmação humana. Conflitos bloqueiam o registro e geram pendência; as decisões ficam no histórico local.
- O tour guiado deve acompanhar toda função relevante para a apresentação.

## Evidence on Hand
Descrição da vaga fornecida pelo usuário e informações públicas no site do ISA, no CNES e na página de parceiros. Não há acesso a processos, planilhas ou sistemas internos.

## Product Principles
- Conferir antes de registrar.
- Expor exceções e próximos passos.
- Mostrar o que foi automatizado e o que segue humano.
- Permitir que outra pessoa repita o processo.
