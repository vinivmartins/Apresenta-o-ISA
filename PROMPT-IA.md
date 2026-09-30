# Exemplo de instrução para leitura assistida

Use apenas com a nota **fictícia** da demonstração. Em um piloto real, a ferramenta e o tratamento dos documentos precisam ser aprovados pelo ISA.

> Extraia do texto abaixo: fornecedor, CNPJ, número da nota, data de emissão, valor total e vencimento. Responda somente em JSON com essas seis chaves. Se o campo não estiver explícito, use null. Não deduza vencimento ou valor. Acrescente uma chave `alertas` com dúvidas ou inconsistências observadas. O resultado será conferido por uma pessoa antes de qualquer registro.
>
> NOTA FISCAL DE SERVIÇOS — EXEMPLO FICTÍCIO
> Fornecedor: Suprimentos Cerrado Ltda
> CNPJ: 00.111.222/0001-33
> Nota: 2482
> Emissão: 30/09/2026
> Valor total: R$ 1.245,90
> Vencimento: não informado

Resultado esperado: `vencimento: null` e um alerta para confirmar o prazo com o fornecedor.
