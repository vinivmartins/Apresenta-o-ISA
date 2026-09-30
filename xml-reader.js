(function () {
  "use strict";

  function child(node, name) {
    return node && Array.from(node.children || []).find(function (item) { return item.localName === name; });
  }
  function path(node, names) {
    return names.reduce(child, node);
  }
  function value(node, names) {
    var found = path(node, names);
    return found ? found.textContent.trim() : "";
  }
  function date(value) {
    var iso = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : "";
  }
  function read(xmlText) {
    if (!xmlText || xmlText.length > 2 * 1024 * 1024) throw new Error("O XML deve ter até 2 MB.");
    if (/<!DOCTYPE|<!ENTITY/i.test(xmlText)) throw new Error("XML com DTD ou entidades não é aceito nesta demonstração.");
    var xml = new DOMParser().parseFromString(xmlText, "application/xml");
    if (xml.getElementsByTagName("parsererror").length) throw new Error("O arquivo XML está malformado.");
    var root = xml.documentElement;
    var nfe = root.localName === "NFe" ? root : root.localName === "nfeProc" ? child(root, "NFe") : null;
    if (nfe) {
      var info = child(nfe, "infNFe");
      if (!info) throw new Error("NF-e sem bloco infNFe.");
      var charge = child(info, "cobr");
      var duplicates = charge ? Array.from(charge.children).filter(function (item) { return item.localName === "dup"; }) : [];
      return {
        kind: "NF-e", supplier: value(info, ["emit", "xNome"]), cnpj: value(info, ["emit", "CNPJ"]),
        number: value(info, ["ide", "nNF"]), issued: date(value(info, ["ide", "dhEmi"]) || value(info, ["ide", "dEmi"])),
        amount: value(info, ["total", "ICMSTot", "vNF"]),
        due: duplicates.length === 1 ? date(value(duplicates[0], ["dVenc"])) : "",
        notice: duplicates.length > 1 ? "Há múltiplas parcelas; confirme todos os vencimentos no documento." : ""
      };
    }
    if (root.localName === "NFSe") {
      var nfse = child(root, "infNFSe");
      if (!nfse) throw new Error("NFS-e sem bloco infNFSe.");
      return {
        kind: "NFS-e nacional", supplier: value(nfse, ["emit", "xNome"]), cnpj: value(nfse, ["emit", "CNPJ"]),
        number: value(nfse, ["nNFSe"]), issued: date(value(nfse, ["dhEmi"])),
        amount: value(nfse, ["valores", "vLiq"]), due: "", notice: ""
      };
    }
    throw new Error("Formato não reconhecido. Use XML de NF-e ou NFS-e padrão nacional.");
  }

  window.ISAXmlReader = { read: read };
})();
