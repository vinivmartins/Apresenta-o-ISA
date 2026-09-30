(function () {
  "use strict";

  var layer = document.getElementById("tour-layer");
  var spotlight = layer.querySelector(".tour-spotlight");
  var card = layer.querySelector(".tour-card");
  var title = document.getElementById("tour-title");
  var description = document.getElementById("tour-description");
  var count = document.getElementById("tour-count");
  var back = document.getElementById("tour-back");
  var next = document.getElementById("tour-next");
  var shell = document.querySelector(".app-shell");
  var seenKey = "isa-radar-tour-seen-v1";
  var active = false;
  var index = 0;
  var target = null;
  var positionQueued = false;

  var steps = [
    {
      view: "overview", selector: ".summary",
      title: "Comece pela visão do dia",
      text: "Aqui você vê quantas notas já foram registradas e quais pendências exigem acompanhamento. Os números desta demonstração são fictícios."
    },
    {
      view: "overview", selector: "#process-strip",
      title: "Entenda o processo completo",
      text: "O fluxo começa na entrada do documento, passa pela leitura e pelas verificações, exige conferência humana e termina em registro ou pendência."
    },
    {
      view: "overview", selector: ".start-panel .primary",
      title: "Abra a conferência",
      text: "Este botão leva ao fluxo principal. Ao avançar, o tour abrirá a tela de notas fiscais para você."
    },
    {
      view: "invoices", selector: "#xml-upload",
      title: "Receba o XML",
      text: "Selecione um arquivo .xml de NF-e ou NFS-e padrão nacional. A leitura ocorre no navegador, sem copiar e colar. Para praticar, use os arquivos fictícios da pasta exemplos."
    },
    {
      view: "invoices", selector: "#load-xml-sample",
      title: "Carregue o exemplo fictício",
      text: "Este botão simula a seleção de um XML de nota sem vencimento. Ao avançar, o sistema extrairá os campos automaticamente.",
      leave: function () { document.getElementById("load-xml-sample").click(); }
    },
    {
      view: "invoices", selector: "#xml-source-details",
      title: "Confira o documento de origem",
      text: "Você pode abrir o XML para comparar os dados extraídos. A leitura local não valida assinatura digital nem autorização fiscal."
    },
    {
      view: "invoices", selector: "#validation-box",
      title: "Veja as verificações automáticas",
      text: "O sistema verifica identificação, dados essenciais, responsável, duplicidade e prazo. O exemplo passa nas verificações principais e avisa que o vencimento está ausente."
    },
    {
      view: "invoices", selector: "#responsible",
      title: "Atribua a conferência",
      text: "Toda nota tem um responsável. Se o vencimento ficar vazio, a pendência automática será atribuída a essa pessoa ou equipe."
    },
    {
      view: "invoices", selector: "#invoice-form .button-row.end",
      title: "Confirme e registre",
      text: "Compare os dados com o documento, marque a declaração acima e registre. A nota sem vencimento entra como 'Com pendência'. O tour não salva a nota por você."
    },
    {
      view: "invoices", selector: "#load-xml-conflict",
      title: "Teste uma divergência de CNPJ",
      text: "Este segundo XML tem o mesmo fornecedor e número de uma nota já registrada, mas o último dígito do CNPJ é diferente. Ao avançar, o tour analisará esse caso.",
      leave: function () { document.getElementById("load-xml-conflict").click(); }
    },
    {
      view: "invoices", selector: "#validation-box",
      title: "O conflito bloqueia o registro",
      text: "A verificação reconhece o mesmo fornecedor e número com CNPJ divergente. A nota não deve ser salva até alguém conferir o documento original. Ao tentar registrar, a aplicação abre uma pendência de conferência."
    },
    {
      view: "pending", selector: "#pending-list",
      title: "Acompanhe a próxima ação",
      text: "Cada pendência tem assunto, responsável e prazo. O registro com vencimento ausente e a tentativa de registrar um conflito geram ações para a equipe."
    },
    {
      view: "invoices", selector: "#history-list",
      title: "Consulte o histórico",
      text: "As decisões importantes ficam registradas: nota salva, registro bloqueado e pendência concluída. Isso ajuda a explicar o que ocorreu depois."
    },
    {
      view: "invoices", selector: "#export-csv",
      title: "Leve o controle para a planilha",
      text: "Exporte as notas registradas em CSV. A equipe pode usar o arquivo como ponto de partida para seus controles."
    },
    {
      view: "invoices", selector: "#text-fallback",
      title: "Use o texto quando necessário",
      text: "A entrada por texto continua disponível como alternativa. Ela depende de um formato conhecido; o XML é a demonstração principal."
    },
    {
      view: "guide", selector: ".guide-step",
      title: "Deixe o processo documentado",
      text: "Esta tela documenta o processo para outra pessoa repetir. Ao concluir, você voltará ao exemplo normal para praticar a conferência e o registro."
    }
  ];

  function markSeen() {
    try { localStorage.setItem(seenKey, "1"); } catch (error) {}
  }

  function openView(name) {
    var button = document.querySelector('.nav-item[data-view="' + name + '"]');
    if (button) button.click();
  }

  function position() {
    positionQueued = false;
    if (!active || !target) return;
    var rect = target.getBoundingClientRect();
    var pad = 7;
    var left = Math.max(6, rect.left - pad);
    var top = Math.max(6, rect.top - pad);
    var width = Math.min(window.innerWidth - left - 6, rect.width + pad * 2);
    var height = Math.min(window.innerHeight - top - 6, rect.height + pad * 2);
    spotlight.style.left = left + "px";
    spotlight.style.top = top + "px";
    spotlight.style.width = Math.max(24, width) + "px";
    spotlight.style.height = Math.max(24, height) + "px";

    if (window.innerWidth <= 700) return;
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;
    var gap = 18;
    var cardLeft;
    var cardTop;
    if (rect.right + gap + cardWidth < window.innerWidth - 16) {
      cardLeft = rect.right + gap;
      cardTop = rect.top;
    } else if (rect.left - gap - cardWidth > 16) {
      cardLeft = rect.left - gap - cardWidth;
      cardTop = rect.top;
    } else if (rect.bottom + gap + cardHeight < window.innerHeight - 16) {
      cardLeft = rect.left;
      cardTop = rect.bottom + gap;
    } else if (rect.top - gap - cardHeight > 16) {
      cardLeft = rect.left;
      cardTop = rect.top - gap - cardHeight;
    } else {
      cardLeft = Math.max(16, window.innerWidth - cardWidth - 16);
      cardTop = Math.max(16, window.innerHeight - cardHeight - 16);
    }
    card.style.left = Math.max(16, Math.min(cardLeft, window.innerWidth - cardWidth - 16)) + "px";
    card.style.top = Math.max(16, Math.min(cardTop, window.innerHeight - cardHeight - 16)) + "px";
  }

  function schedulePosition() {
    if (!active || positionQueued) return;
    positionQueued = true;
    requestAnimationFrame(position);
  }

  function showStep() {
    var step = steps[index];
    openView(step.view);
    target = document.querySelector(step.selector);
    if (!target) { stop(false); return; }

    count.textContent = "Passo " + (index + 1) + " de " + steps.length;
    title.textContent = step.title;
    description.textContent = step.text;
    back.disabled = index === 0;
    next.textContent = index === steps.length - 1 ? "Praticar agora" : "Próximo";

    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    requestAnimationFrame(function () {
      position();
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    });
  }

  function start() {
    if (active) return;
    active = true;
    index = 0;
    layer.hidden = false;
    shell.setAttribute("aria-hidden", "true");
    document.body.classList.add("tour-open");
    showStep();
  }

  function stop(practice) {
    if (!active) return;
    active = false;
    markSeen();
    layer.hidden = true;
    shell.removeAttribute("aria-hidden");
    document.body.classList.remove("tour-open");
    target = null;
    if (practice) {
      openView("invoices");
      document.getElementById("load-xml-sample").click();
      document.getElementById("supplier").focus({ preventScroll: true });
    } else {
      document.getElementById("start-tour").focus({ preventScroll: true });
    }
  }

  function forward() {
    if (!active) return;
    if (index === steps.length - 1) { stop(true); return; }
    if (steps[index].leave) steps[index].leave();
    index += 1;
    showStep();
  }

  function backward() {
    if (!active || index === 0) return;
    index -= 1;
    showStep();
  }

  document.getElementById("start-tour").addEventListener("click", start);
  document.getElementById("tour-skip").addEventListener("click", function () { stop(false); });
  next.addEventListener("click", forward);
  back.addEventListener("click", backward);
  layer.querySelector(".tour-shield").addEventListener("click", function (event) { event.preventDefault(); });
  window.addEventListener("resize", schedulePosition);
  window.addEventListener("scroll", schedulePosition, true);
  document.addEventListener("keydown", function (event) {
    if (!active) return;
    if (event.key === "Escape") { event.preventDefault(); stop(false); }
    if (event.key === "ArrowRight") { event.preventDefault(); forward(); }
    if (event.key === "ArrowLeft") { event.preventDefault(); backward(); }
    if (event.key === "Tab") {
      var focusables = [document.getElementById("tour-skip"), back, next].filter(function (button) { return !button.disabled; });
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  try {
    if (!localStorage.getItem(seenKey)) requestAnimationFrame(start);
  } catch (error) {}
})();
