# Como usar e entregar a demonstração

## Antes de enviar

1. Abra `index.html` no seu navegador e faça o **Tour guiado**. Na primeira abertura, ele aparece automaticamente; depois, pode ser repetido pelo botão no topo.
2. Ao final do tour, confira os campos extraídos do XML fictício, marque **Conferi os dados com o documento de origem** e clique em **Registrar nota conferida**.
3. Veja a pendência criada para confirmar o vencimento e o responsável escolhido.
4. Volte a **Notas fiscais** e clique em **Testar XML divergente**. A verificação deve apontar o mesmo fornecedor e número com CNPJ diferente. Se tentar registrar após conferir, o registro será bloqueado e uma pendência será aberta.
5. Veja o **Histórico de decisões** e a seção **Como funciona**. Para recomeçar, clique em **Restaurar dados fictícios**.
6. Para mostrar o upload real, selecione um dos arquivos da pasta `exemplos` no campo **Arquivo XML**. Não substitua os dados de exemplo por notas reais ou dados de pacientes.

## O que enviar ao responsável pela vaga

Envie o endereço https://apresentacao-isa.vercel.app/ e uma mensagem curta. O código também está em https://github.com/vinivmartins/Apresenta-o-ISA. Se preferir uma demonstração sem internet, use a pasta compactada `radar-administrativo-isa.zip` e abra `index.html`. Não apresente o protótipo como sistema implantado no ISA.

### Modelo de mensagem

> Olá! Preparei uma demonstração de uma rotina administrativa inspirada na vaga: entrada de nota fiscal por XML, verificação de duplicidade e CNPJ, atribuição de responsável e acompanhamento de pendências. Ela usa apenas dados fictícios e tem um tour guiado: https://apresentacao-isa.vercel.app/. Gostaria de mostrar em alguns minutos como eu validaria esse processo com a equipe antes de propor um piloto real.

Adapte a mensagem à sua voz. A resposta obrigatória da candidatura sobre uma automação que **você já realizou** deve relatar sua experiência verdadeira; este protótipo é um complemento.

## Roteiro presencial de aproximadamente 3 minutos

1. **20 segundos — contexto:** “Escolhi a conferência de notas porque a vaga a cita diretamente. Não conheço o processo interno do ISA; este é um ponto de partida.”
2. **1 minuto — fluxo normal:** selecionar o XML fictício, mostrar a extração imediata, as verificações e o vencimento ausente; registrar com responsável.
3. **1 minuto — conflito:** selecionar o XML de CNPJ divergente e mostrar o bloqueio, a pendência e o histórico.
4. **40 segundos — continuidade:** mostrar a documentação e explicar como mediria tempo e correções em um piloto de duas semanas.

## O que dizer se perguntarem “onde está a IA?”

“O XML já é estruturado, então esta versão lê os campos diretamente, sem IA. Isso evita exigir que alguém copie o PDF e cole texto. IA poderia apoiar documentos sem estrutura e exceções, depois de entendermos o processo e aprovarmos o tratamento dos dados. A conferência humana continua obrigatória.”

Essa resposta mostra entendimento técnico sem afirmar que a versão atual possui uma integração que não existe.
