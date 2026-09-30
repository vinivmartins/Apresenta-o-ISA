# Radar Administrativo ISA

Protótipo local para apresentar uma proposta de organização da conferência de notas fiscais. **Todos os dados e fornecedores são fictícios.** O ISA não participou da definição do fluxo; as necessidades foram inferidas da descrição da vaga e de informações públicas.

## Abrir

Abra `index.html` em um navegador moderno. Na primeira abertura, o **Tour guiado** aparece automaticamente; o botão no topo permite repeti-lo. Não há instalação, conta, servidor nem conexão com serviços externos. Os registros criados ficam apenas no armazenamento local do navegador. Use **Como funciona → Restaurar dados fictícios** para voltar ao estado inicial.

## Demonstração em 3 minutos

1. Em **Visão do dia**, mostre as próximas ações e o responsável por cada uma.
2. Em **Notas fiscais**, clique em **Usar XML fictício** ou selecione `exemplos/nfe-normal-ficticia.xml`. Os campos são preenchidos automaticamente; o vencimento virá vazio de propósito.
3. Confira os campos com o texto, marque a confirmação e registre. A aplicação cria uma pendência para confirmar o vencimento.
4. Volte a **Notas fiscais**, clique em **Testar XML divergente** ou selecione `exemplos/nfe-cnpj-divergente-ficticia.xml`. Mostre o bloqueio para o mesmo fornecedor e número com outro CNPJ.
5. Em **Pendências**, mostre prazo e responsável. Em **Notas fiscais**, mostre o histórico e a exportação CSV.
6. Em **Como funciona**, mostre o procedimento documentado.

Para demonstrar o alerta de duplicidade, carregue novamente o mesmo XML depois de registrá-lo e tente salvar. O registro será bloqueado.

## O que é funcional

- Leitura local de XML de NF-e (modelo comum) e NFS-e padrão nacional, com extração de campos estruturados. A entrada por texto permanece como alternativa.
- Revisão obrigatória antes do registro.
- Validação de campos essenciais, valor positivo, datas, identidade do fornecedor e duplicidade por número e emitente.
- Bloqueio de CNPJ divergente; a exceção abre uma pendência sem duplicá-la a cada tentativa.
- Responsável por nota, criação e conclusão de pendências e histórico das decisões.
- Exportação CSV compatível com planilhas.
- Persistência local no navegador e restauração da amostra.

## Limite da simulação

O XML é interpretado no navegador, sem envio à internet. O botão **Analisar texto** usa expressões regulares locais como entrada alternativa. O protótipo não faz OCR, não lê PDF, não chama um modelo, não valida assinatura digital nem autorização fiscal e não acessa sistemas do ISA. A NFS-e varia conforme o padrão municipal; esta leitura cobre apenas campos do padrão nacional previstos no protótipo. Campos ausentes ficam vazios para conferência, sem preenchimento inventado.

Antes de qualquer piloto com documentos reais, seria necessário mapear o processo com a equipe, decidir quais dados podem ser processados, aprovar a ferramenta e definir controles de acesso. A aplicação não deve receber dados de pacientes.

## Estrutura

- `index.html`: telas e conteúdo.
- `style.css`: layout responsivo e identidade visual da demonstração.
- `app.js`: regras locais, dados fictícios, validações e exportação.
- `xml-reader.js`: leitura de campos estruturados de XML.
- `exemplos/`: dois arquivos XML fictícios para testar a seleção de arquivo.
- `APRESENTACAO.md`: roteiro de fala e proposta de piloto.
- `GUIA-DE-ENTREGA.md`: instruções para praticar e enviar a demonstração.
- `tour.js`: orientação interativa com destaque por etapa.
- `PROMPT-IA.md`: exemplo de instrução para testar leitura assistida apenas com documento fictício.
- `ARQUITETURA-PILOTO.md`: proposta de automação ponta a ponta para discutir com o ISA.

## Fontes para o contexto

- Site do ISA: https://www.institutodesaudeassistida.com.br/
- Centro de Terapia Assistida: https://www.institutodesaudeassistida.com.br/imuno/
- Parceiros, incluindo faturamento: https://www.institutodesaudeassistida.com.br/parceiros/
- Cadastro CNES: https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=5208703184285

