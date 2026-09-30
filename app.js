(function () {
  "use strict";
  var key = "isa-radar-demo-v1";
  var now = new Date();
  var todayISO = localISO(now);
  var sampleText = [
    "NOTA FISCAL DE SERVIÇOS — EXEMPLO FICTÍCIO",
    "Fornecedor: Suprimentos Cerrado Ltda",
    "CNPJ: 00.111.222/0001-33",
    "Nota: 2482",
    "Emissão: " + formatDate(todayISO),
    "Valor total: R$ 1.245,90",
    "Vencimento: não informado",
    "Descrição: materiais administrativos de demonstração"
  ].join("\n");
  var conflictText = [
    "NOTA FISCAL DE SERVIÇOS — CENÁRIO FICTÍCIO DE DIVERGÊNCIA",
    "Fornecedor: Suprimentos Cerrado Ltda",
    "CNPJ: 00.111.222/0001-32",
    "Nota: 2481",
    "Emissão: " + formatDate(todayISO),
    "Valor total: R$ 890,50",
    "Vencimento: " + formatDate(shiftDays(10))
  ].join("\n");
  function demoXml(number, cnpj, amount, due) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<!-- DOCUMENTO FICTÍCIO. SEM VALIDADE FISCAL. -->\n' +
      '<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe versao="4.00">' +
      '<ide><nNF>' + number + '</nNF><dhEmi>' + todayISO + 'T10:00:00-03:00</dhEmi></ide>' +
      '<emit><CNPJ>' + cnpj + '</CNPJ><xNome>Suprimentos Cerrado Ltda</xNome></emit>' +
      '<total><ICMSTot><vNF>' + amount + '</vNF></ICMSTot></total>' +
      (due ? '<cobr><dup><nDup>001</nDup><dVenc>' + due + '</dVenc><vDup>' + amount + '</vDup></dup></cobr>' : '') +
      '</infNFe></NFe>';
  }
  var sourceSuggestion = null;

  function localISO(date) {
    var d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 10);
  }
  function shiftDays(days) {
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
    return localISO(d);
  }
  function formatDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }
  function parseDate(br) {
    var m = (br || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return m ? m[3] + "-" + m[2] + "-" + m[1] : "";
  }
  function money(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
  }
  function parseMoney(text) {
    var n = String(text || "").replace(/[^\d,.-]/g, "");
    if (n.includes(",")) n = n.replace(/\./g, "").replace(",", ".");
    else if (!/\.\d{2}$/.test(n)) n = n.replace(/\./g, "");
    return Number(n);
  }
  function safe(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function digits(value) { return String(value || "").replace(/\D/g, ""); }
  function supplierKey(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }
  function numberKey(value) { return String(value || "").trim().toUpperCase().replace(/^0+(?=\d)/, ""); }
  function seed() {
    return {
      invoices: [
        { id: 1, supplier: "Suprimentos Cerrado Ltda", cnpj: "00.111.222/0001-33", number: "2481", issued: shiftDays(-4), amount: 890.50, due: shiftDays(12), responsible: "Administrativo", status: "Conferida" },
        { id: 2, supplier: "Serviços Horizonte Ltda", cnpj: "00.333.444/0001-55", number: "1197", issued: shiftDays(-6), amount: 420.00, due: shiftDays(8), responsible: "Administrativo", status: "Conferida" }
      ],
      pending: [
        { id: 1, title: "Confirmar prazo da NF 2481 com fornecedor", owner: "Administrativo", due: shiftDays(1), done: false, kind: "Fornecedor" },
        { id: 2, title: "Conferir documento pendente do convênio", owner: "Convênios", due: shiftDays(3), done: false, kind: "Convênio" },
        { id: 3, title: "Padronizar nome dos arquivos recebidos", owner: "Administrativo", due: shiftDays(-1), done: true, kind: "Processo" }
      ],
      events: [{ id: 1, at: new Date().toISOString(), title: "Demonstração iniciada", detail: "Base fictícia carregada para apresentação." }]
    };
  }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(key));
      if (saved && Array.isArray(saved.invoices) && Array.isArray(saved.pending)) {
        if (!Array.isArray(saved.events)) saved.events = [];
        saved.invoices.forEach(function (invoice) { if (!invoice.responsible) invoice.responsible = "Administrativo"; });
        return saved;
      }
    } catch (e) {}
    return seed();
  }
  var state = load();
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) { toast("Não foi possível salvar no navegador."); }
  }
  function byId(id) { return document.getElementById(id); }
  function recordEvent(title, detail) {
    state.events.push({ id: Date.now(), at: new Date().toISOString(), title: title, detail: detail });
  }
  function currentInvoice() {
    return {
      supplier: byId("supplier").value.trim(), cnpj: byId("cnpj").value.trim(),
      number: byId("number").value.trim(), issued: byId("issued").value,
      amount: parseMoney(byId("amount").value), due: byId("due").value,
      responsible: byId("responsible").value.trim()
    };
  }
  function assess(invoice) {
    var checks = [], blocking = [], warnings = [], conflict = "";
    var issuer = digits(invoice.cnpj), name = supplierKey(invoice.supplier), number = numberKey(invoice.number);
    function check(label, status, detail) {
      checks.push({ label: label, status: status, detail: detail });
      if (status === "block") blocking.push(detail);
      if (status === "warn") warnings.push(detail);
    }
    check("Identificação do emitente", !name || issuer.length !== 14 ? "block" : "ok",
      !name || issuer.length !== 14 ? "Informe fornecedor e CNPJ com 14 dígitos." : "Fornecedor e formato do CNPJ informados.");
    check("Dados essenciais da nota", !number || !invoice.issued || !Number.isFinite(invoice.amount) || invoice.amount <= 0 ? "block" : "ok",
      !number || !invoice.issued || !Number.isFinite(invoice.amount) || invoice.amount <= 0 ? "Confira número, emissão e valor positivo." : "Número, emissão e valor preenchidos.");
    check("Responsável", !invoice.responsible ? "block" : "ok",
      !invoice.responsible ? "Indique quem fará a conferência." : "Conferência atribuída a " + invoice.responsible + ".");

    var sameIssuerNumber = state.invoices.find(function (old) {
      return number && numberKey(old.number) === number && issuer && digits(old.cnpj) === issuer;
    });
    var sameNameNumber = state.invoices.find(function (old) {
      return number && numberKey(old.number) === number && name && supplierKey(old.supplier) === name && digits(old.cnpj) !== issuer;
    });
    var sameNameOtherCnpj = state.invoices.find(function (old) {
      return name && supplierKey(old.supplier) === name && issuer && digits(old.cnpj) !== issuer;
    });
    var sameCnpjOtherName = state.invoices.find(function (old) {
      return issuer && digits(old.cnpj) === issuer && name && supplierKey(old.supplier) !== name;
    });
    if (sameIssuerNumber) {
      conflict = "duplicate";
      check("Duplicidade", "block", "A NF " + invoice.number + " já consta para este CNPJ. Não registre novamente.");
    } else if (sameNameNumber) {
      conflict = "identity";
      check("Identidade do fornecedor", "block", "A NF " + invoice.number + " já consta para este fornecedor com outro CNPJ. Confirme o documento original.");
    } else if (sameNameOtherCnpj) {
      conflict = "identity";
      check("Identidade do fornecedor", "block", "Este fornecedor já consta com outro CNPJ. Confirme se são a mesma empresa antes de registrar.");
    } else if (sameCnpjOtherName) {
      conflict = "identity";
      check("Identidade do fornecedor", "block", "Este CNPJ já consta com outro nome de fornecedor. Confirme os dados antes de registrar.");
    } else {
      check("Duplicidade e cadastro", "ok", "Nenhum conflito encontrado no controle local.");
    }
    var correctedCnpj = !!(sourceSuggestion && sourceSuggestion.cnpj && digits(sourceSuggestion.cnpj) !== issuer);
    if (correctedCnpj && !byId("cnpj-correction").checked) {
      check("Alteração do CNPJ extraído", "block", "O CNPJ foi alterado após a leitura. Confirme a correção com o documento e marque a declaração.");
    } else if (correctedCnpj) {
      check("Alteração do CNPJ extraído", "warn", "CNPJ corrigido manualmente; mantenha a conferência documentada.");
    }
    check("Vencimento", !invoice.due ? "warn" : invoice.issued && invoice.due < invoice.issued ? "block" : "ok",
      !invoice.due ? "Vencimento ausente: uma pendência será criada após o registro." :
      invoice.issued && invoice.due < invoice.issued ? "Vencimento anterior à emissão. Confirme a data no documento." : "Prazo informado.");
    return { checks: checks, blocking: blocking, warnings: warnings, conflict: conflict, correctedCnpj: correctedCnpj };
  }
  function renderValidation() {
    var invoice = currentInvoice();
    var hasData = !!(invoice.supplier || invoice.cnpj || invoice.number || invoice.issued || byId("amount").value);
    byId("validation-box").hidden = !hasData;
    if (!hasData) return;
    var result = assess(invoice);
    byId("cnpj-correction-row").hidden = !result.correctedCnpj;
    byId("validation-summary").textContent = result.blocking.length ? result.blocking.length + " bloqueio(s)" : result.warnings.length ? result.warnings.length + " atenção" : "Pronta para conferência";
    byId("validation-summary").className = result.blocking.length ? "validation-block" : result.warnings.length ? "validation-warn" : "validation-ok";
    byId("validation-list").innerHTML = result.checks.map(function (item) {
      return '<li class="check-' + item.status + '"><strong>' + safe(item.label) + '</strong><span>' + safe(item.detail) + '</span></li>';
    }).join("");
  }
  function flagException(invoice, result) {
    if (!result.conflict) return false;
    var reference = [result.conflict, supplierKey(invoice.supplier), numberKey(invoice.number)].join("|");
    var exists = state.pending.some(function (p) { return !p.done && p.reference === reference; });
    if (exists) return false;
    var title = result.conflict === "duplicate" ? "Verificar duplicidade da NF " + invoice.number + " — " + invoice.supplier :
      "Verificar CNPJ divergente da NF " + invoice.number + " — " + invoice.supplier;
    state.pending.push({ id: Date.now(), title: title, owner: invoice.responsible || "Administrativo", due: shiftDays(1), done: false, kind: "Conferência", reference: reference });
    recordEvent("Registro bloqueado", title + ". Pendência criada para " + (invoice.responsible || "Administrativo") + ".");
    persist(); renderAll();
    return true;
  }
  function toast(message) {
    var t = byId("toast");
    t.textContent = message;
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.classList.remove("show"); }, 3200);
  }
  function show(view) {
    document.querySelectorAll(".view").forEach(function (v) { v.classList.toggle("active", v.id === view); });
    document.querySelectorAll(".nav-item").forEach(function (n) {
      var active = n.dataset.view === view;
      n.classList.toggle("active", active);
      if (active) n.setAttribute("aria-current", "page");
      else n.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll("[data-view]").forEach(function (b) {
    b.addEventListener("click", function () { show(b.dataset.view); });
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { show(b.dataset.go); });
  });

  function renderStats() {
    byId("stat-review").textContent = state.invoices.length;
    var open = state.pending.filter(function (p) { return !p.done; });
    byId("stat-open").textContent = open.length;
    byId("stat-due").textContent = open.filter(function (p) {
      var diff = (new Date(p.due + "T12:00:00") - new Date(todayISO + "T12:00:00")) / 86400000;
      return diff <= 3;
    }).length;
  }
  function renderActions() {
    var list = state.pending.filter(function (p) { return !p.done; }).sort(function (a, b) { return a.due.localeCompare(b.due); }).slice(0, 4);
    byId("overview-actions").innerHTML = list.length ? list.map(function (p) {
      return '<div class="action-row"><span class="action-mark' + (p.kind === "Convênio" ? " neutral" : "") + '">' + (p.kind === "Convênio" ? "C" : "N") + '</span><span class="action-body"><strong>' + safe(p.title) + '</strong><small>' + safe(p.kind) + ' · ' + safe(p.owner) + '</small></span><span class="action-date">' + formatDate(p.due) + '</span></div>';
    }).join("") : '<p class="empty">Nenhuma pendência aberta. Registre uma nova ação quando surgir uma exceção.</p>';
  }
  function renderInvoices() {
    byId("invoice-rows").innerHTML = state.invoices.slice().reverse().map(function (n) {
      return '<tr><td><strong>' + safe(n.supplier) + '</strong><span class="subline">' + safe(n.cnpj || "CNPJ não informado") + '</span></td><td>' + safe(n.number) + '</td><td>' + formatDate(n.issued) + '</td><td>' + money(n.amount) + '</td><td>' + safe(n.responsible || "Administrativo") + '</td><td><span class="badge' + (n.status === "Conferida" ? "" : " warn") + '">' + safe(n.status) + '</span></td></tr>';
    }).join("");
  }
  function renderHistory() {
    byId("history-list").innerHTML = state.events.length ? state.events.slice().reverse().slice(0, 6).map(function (event) {
      var when = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(event.at));
      return '<div class="history-row"><span class="history-time">' + when + '</span><div><strong>' + safe(event.title) + '</strong><p>' + safe(event.detail) + '</p></div></div>';
    }).join("") : '<p class="empty">As decisões desta demonstração aparecerão aqui.</p>';
  }
  function renderPending() {
    var filter = byId("pending-filter").value;
    var items = state.pending.filter(function (p) { return filter === "all" || (filter === "done" ? p.done : !p.done); }).sort(function (a, b) { return a.due.localeCompare(b.due); });
    byId("pending-list").innerHTML = items.length ? items.map(function (p) {
      var late = !p.done && p.due < todayISO;
      return '<div class="pending-item' + (p.done ? " done" : "") + '"><input class="pending-check" type="checkbox" data-pending-id="' + p.id + '" aria-label="Marcar ' + safe(p.title) + ' como ' + (p.done ? "em aberto" : "concluída") + '"' + (p.done ? " checked" : "") + '><div><strong>' + safe(p.title) + '</strong><small>' + safe(p.kind) + ' · Responsável: ' + safe(p.owner) + '</small></div><span class="due-label' + (late ? " late" : "") + '">' + (late ? "Atrasada · " : "Prazo · ") + formatDate(p.due) + '</span></div>';
    }).join("") : '<p class="empty">Nenhum item neste filtro. Adicione uma pendência quando houver uma próxima ação.</p>';
    document.querySelectorAll("[data-pending-id]").forEach(function (input) {
      input.addEventListener("change", function () {
        var item = state.pending.find(function (p) { return p.id === Number(input.dataset.pendingId); });
        if (item) { item.done = input.checked; recordEvent(item.done ? "Pendência concluída" : "Pendência reaberta", item.title + " · " + item.owner); persist(); renderAll(); toast(item.done ? "Pendência concluída." : "Pendência reaberta."); }
      });
    });
  }
  function renderAll() { renderStats(); renderActions(); renderInvoices(); renderPending(); renderHistory(); }
  byId("today").textContent = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(now);
  byId("pending-date").value = shiftDays(2);
  byId("pending-filter").addEventListener("change", renderPending);

  function loadExample(text) {
    byId("invoice-form").reset();
    sourceSuggestion = null;
    byId("invoice-text").value = text;
    byId("xml-file").value = "";
    byId("xml-source-details").hidden = true;
    byId("xml-preview").textContent = "";
    byId("xml-feedback").textContent = "Entrada alternativa por texto selecionada.";
    byId("text-fallback").open = true;
    byId("analysis-status").textContent = "Exemplo carregado";
    byId("analysis-status").className = "status status-neutral";
    byId("invoice-alert").hidden = true;
    byId("validation-box").hidden = true;
    byId("cnpj-correction-row").hidden = true;
    toast("Exemplo fictício carregado. Clique em Analisar texto.");
  }
  byId("load-sample").addEventListener("click", function () { loadExample(sampleText); });
  byId("load-conflict").addEventListener("click", function () { loadExample(conflictText); });
  function applySuggestion(data, source) {
    byId("invoice-form").reset();
    byId("supplier").value = data.supplier || "";
    byId("cnpj").value = data.cnpj || "";
    byId("number").value = data.number || "";
    byId("issued").value = data.issued || "";
    byId("amount").value = data.amount || "";
    byId("due").value = data.due || "";
    byId("responsible").value = "Administrativo";
    sourceSuggestion = currentInvoice();
    var result = assess(sourceSuggestion);
    renderValidation();
    var alert = byId("invoice-alert");
    alert.classList.remove("error");
    if (result.blocking.length) {
      alert.textContent = result.blocking[0] + " O registro ficará bloqueado até a conferência.";
      alert.classList.add("error");
      alert.hidden = false;
      byId("analysis-status").textContent = "Revisão necessária";
      byId("analysis-status").className = "status status-warn";
    } else if (result.warnings.length) {
      alert.textContent = result.warnings[0];
      alert.hidden = false;
      byId("analysis-status").textContent = "Conferir atenção";
      byId("analysis-status").className = "status status-warn";
    } else {
      alert.hidden = true;
      byId("analysis-status").textContent = "Sugestão pronta";
      byId("analysis-status").className = "status status-ok";
    }
    toast(source + " lido. Revise todos os campos.");
  }
  function loadXml(xml, label) {
    try {
      var data = window.ISAXmlReader.read(xml);
      byId("invoice-text").value = "";
      byId("xml-preview").textContent = xml;
      byId("xml-source-details").hidden = false;
      byId("xml-feedback").textContent = data.kind + " · " + label + " · Campos sugeridos para conferência." + (data.notice ? " " + data.notice : "");
      applySuggestion(data, data.kind);
    } catch (error) {
      byId("invoice-form").reset();
      sourceSuggestion = null;
      byId("validation-box").hidden = true;
      byId("xml-source-details").hidden = true;
      byId("xml-preview").textContent = "";
      byId("xml-feedback").textContent = "Não foi possível ler: " + error.message;
      byId("analysis-status").textContent = "XML não lido";
      byId("analysis-status").className = "status status-warn";
      byId("invoice-alert").textContent = error.message;
      byId("invoice-alert").classList.add("error");
      byId("invoice-alert").hidden = false;
      toast("Confira o formato do XML selecionado.");
    }
  }
  byId("xml-file").addEventListener("change", async function () {
    var file = this.files && this.files[0];
    if (!file) return;
    if (!/\.xml$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
      byId("invoice-form").reset();
      sourceSuggestion = null;
      byId("validation-box").hidden = true;
      byId("xml-source-details").hidden = true;
      byId("xml-preview").textContent = "";
      byId("xml-feedback").textContent = "Selecione um arquivo .xml de até 2 MB.";
      byId("analysis-status").textContent = "XML não lido";
      byId("analysis-status").className = "status status-warn";
      return;
    }
    try { loadXml(await file.text(), file.name); }
    catch (error) { byId("invoice-form").reset(); sourceSuggestion = null; byId("validation-box").hidden = true; byId("xml-feedback").textContent = "Não foi possível abrir o arquivo."; }
  });
  byId("load-xml-sample").addEventListener("click", function () {
    byId("xml-file").value = "";
    loadXml(demoXml("2482", "00111222000133", "1245.90", ""), "exemplo fictício");
  });
  byId("load-xml-conflict").addEventListener("click", function () {
    byId("xml-file").value = "";
    loadXml(demoXml("2481", "00111222000132", "890.50", shiftDays(10)), "cenário fictício divergente");
  });
  byId("analyze").addEventListener("click", function () {
    var text = byId("invoice-text").value.trim();
    if (!text) { toast("Cole um texto ou carregue o exemplo fictício."); byId("invoice-text").focus(); return; }
    function match(pattern) { var m = text.match(pattern); return m ? m[1].trim() : ""; }
    byId("xml-file").value = "";
    byId("xml-source-details").hidden = true;
    byId("xml-preview").textContent = "";
    byId("xml-feedback").textContent = "Entrada alternativa por texto selecionada.";
    applySuggestion({
      supplier: match(/Fornecedor\s*:\s*([^\n]+)/i),
      cnpj: match(/CNPJ\s*:\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i),
      number: match(/(?:Nota|N[úu]mero da nota)\s*:\s*([\w.-]+)/i),
      issued: parseDate(match(/Emiss[ãa]o\s*:\s*(\d{2}\/\d{2}\/\d{4})/i)),
      amount: match(/Valor total\s*:\s*R?\$?\s*([\d.,]+)/i),
      due: parseDate(match(/Vencimento\s*:\s*(\d{2}\/\d{2}\/\d{4})/i))
    }, "Texto");
    byId("supplier").focus();
  });
  ["supplier", "cnpj", "number", "issued", "amount", "due", "responsible"].forEach(function (id) {
    byId(id).addEventListener("input", function () { byId("invoice-alert").hidden = true; renderValidation(); });
    byId(id).addEventListener("change", renderValidation);
  });
  byId("cnpj-correction").addEventListener("change", renderValidation);

  byId("invoice-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var invoice = currentInvoice();
    var result = assess(invoice);
    renderValidation();
    var alert = byId("invoice-alert");
    alert.hidden = true;
    if (result.blocking.length) {
      var created = flagException(invoice, result);
      alert.textContent = result.blocking[0] + (created ? " Uma pendência foi aberta para " + (invoice.responsible || "Administrativo") + "." : "");
      alert.classList.add("error"); alert.hidden = false; return;
    }
    if (!byId("confirmed").checked) {
      alert.textContent = "Marque a confirmação após comparar os dados com o documento de origem.";
      alert.classList.add("error"); alert.hidden = false; return;
    }
    invoice.id = Date.now();
    invoice.status = invoice.due ? "Conferida" : "Com pendência";
    state.invoices.push(invoice);
    recordEvent("Nota registrada", "NF " + invoice.number + " · " + invoice.supplier + " · responsável: " + invoice.responsible + ".");
    if (!invoice.due) {
      state.pending.push({ id: Date.now() + 1, title: "Confirmar vencimento da NF " + invoice.number + " com " + invoice.supplier, owner: invoice.responsible, due: shiftDays(2), done: false, kind: "Fornecedor" });
      recordEvent("Pendência automática", "Vencimento da NF " + invoice.number + " atribuído a " + invoice.responsible + ".");
    }
    persist(); renderAll();
    byId("invoice-form").reset();
    byId("invoice-text").value = "";
    byId("xml-file").value = "";
    byId("xml-feedback").textContent = "Nenhum XML carregado.";
    byId("xml-source-details").hidden = true;
    byId("xml-preview").textContent = "";
    sourceSuggestion = null;
    byId("validation-box").hidden = true;
    byId("cnpj-correction-row").hidden = true;
    byId("analysis-status").textContent = "Aguardando leitura";
    byId("analysis-status").className = "status status-neutral";
    alert.hidden = true;
    toast(invoice.due ? "Nota conferida e registrada." : "Nota registrada. Pendência de vencimento criada.");
    show("pending");
  });

  byId("pending-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var title = byId("pending-title").value.trim(), owner = byId("pending-owner").value.trim();
    state.pending.push({ id: Date.now(), title: title, owner: owner, due: byId("pending-date").value, done: false, kind: "Administrativo" });
    recordEvent("Pendência adicionada", title + " · responsável: " + owner + ".");
    persist(); renderAll(); event.target.reset(); byId("pending-date").value = shiftDays(2); toast("Pendência adicionada.");
  });
  byId("export-csv").addEventListener("click", function () {
    var rows = [["Fornecedor", "CNPJ", "Numero da nota", "Emissao", "Valor", "Vencimento", "Responsavel", "Situacao"]].concat(state.invoices.map(function (n) { return [n.supplier, n.cnpj, n.number, formatDate(n.issued), n.amount.toFixed(2).replace(".", ","), formatDate(n.due), n.responsible || "Administrativo", n.status]; }));
    var csv = "\ufeff" + rows.map(function (row) { return row.map(function (v) { return '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; }).join(";"); }).join("\r\n");
    var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    var a = document.createElement("a"); a.href = url; a.download = "notas-ficticias-isa.csv"; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("CSV exportado com os dados fictícios.");
  });
  byId("reset-demo").addEventListener("click", function () {
    state = seed(); sourceSuggestion = null; byId("invoice-form").reset(); byId("invoice-text").value = "";
    byId("xml-file").value = ""; byId("xml-feedback").textContent = "Nenhum XML carregado."; byId("xml-source-details").hidden = true; byId("xml-preview").textContent = "";
    byId("validation-box").hidden = true; byId("cnpj-correction-row").hidden = true;
    persist(); renderAll(); show("overview"); toast("Dados fictícios restaurados.");
  });
  renderAll();
})();

