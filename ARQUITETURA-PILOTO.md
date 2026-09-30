# Proposta de automação ponta a ponta para um piloto

Esta é uma **proposta de processo**, não um retrato dos sistemas internos do ISA. A demonstração local cobre seleção de XML, leitura de campos estruturados, verificações, conferência, pendências, histórico e CSV com dados inventados.

## Fluxo pretendido

`Receber documento → extrair campos → validar regras → conferir exceções → registrar no sistema aprovado → acompanhar pendências → medir resultados`

| Etapa | No protótipo | Em um piloto real |
|---|---|---|
| Entrada | Arquivo XML ou exemplo fictício; texto como alternativa | Definir canal de recebimento e formatos: XML, PDF, e-mail ou pasta autorizada |
| Leitura | Leitor local de NF-e e NFS-e nacional; regras locais para texto | Ampliar layouts, validar documentos e avaliar OCR/IA aprovada para formatos menos padronizados |
| Validação | Campos, valor, datas, CNPJ, fornecedor e número | Acrescentar cadastro oficial de fornecedores, regras contábeis e integrações existentes |
| Decisão | Pessoa confirma a nota; conflito bloqueia | Definir quais casos podem seguir sem intervenção e quais exigem aprovação |
| Encaminhamento | Pendência com responsável e prazo | Alertas pelo canal já usado pela equipe e escalonamento acordado |
| Registro | Controle local e exportação CSV | Integração ou importação no sistema administrativo já adotado |
| Rastreabilidade | Histórico local das decisões | Log com usuário, horário, origem do dado e política de retenção |

## Regras demonstradas

1. O mesmo **CNPJ + número da nota** é tratado como possível duplicidade.
2. O mesmo **fornecedor + número**, com CNPJ diferente, é bloqueado como divergência de identidade.
3. O mesmo nome de fornecedor com outro CNPJ, ou o mesmo CNPJ com outro nome, exige revisão.
4. CNPJ alterado depois da leitura pede uma confirmação específica do documento original.
5. Vencimento ausente não é inventado: a nota fica com pendência atribuída ao responsável.
6. Uma tentativa repetida do mesmo conflito não deve abrir várias pendências iguais.

Essas regras são pontos de partida. O ISA precisaria validá-las, inclusive para casos legítimos de fornecedores com nomes semelhantes, filiais e notas com numeração coincidente de emitentes diferentes.

## Primeiro piloto sugerido

- **Mapear:** acompanhar alguns documentos do recebimento até o lançamento e identificar sistemas, pessoas, exceções e volume.
- **Medir a linha de base:** tempo de conferência, campos corrigidos, duplicidades e pendências vencidas.
- **Executar em paralelo:** usar a automação com documentos autorizados, sem desligar o processo atual.
- **Revisar:** conferir todas as sugestões e ajustar regras de identidade antes de permitir qualquer registro automático.
- **Integrar:** somente após aprovação das regras e da ferramenta, conectar ao sistema usado pela clínica.

Automação ponta a ponta significa que o trabalho rotineiro flui com menos digitação e acompanhamento manual. Conflitos de identidade, dados ausentes e decisões financeiras continuam com uma pessoa responsável. A versão atual não faz OCR, não chama IA externa, não acessa e-mail e não lança dados em um sistema do ISA.
