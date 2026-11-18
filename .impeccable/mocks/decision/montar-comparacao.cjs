// Monta a página de comparação com os rascunhos embutidos (srcdoc), para abrir como arquivo local.
const fs = require("fs");
const path = require("path");
const dir = __dirname;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const card = (file, titulo, texto, escala) => {
  const w = Math.round(390 * escala), h = Math.round(844 * escala);
  return `<figure style="width:${w}px"><div class="f" style="width:${w}px;height:${h}px"><iframe style="transform:scale(${escala})" srcdoc="${esc(fs.readFileSync(path.join(dir, file), "utf8"))}"></iframe></div><figcaption>${titulo}</figcaption><small>${texto}</small></figure>`;
};
const novos = [
  ["r1/selos.html", "5 · Vitrine de Selos (sorteada)", "Campo azul-anil, fotos em arcos, preço em selo redondo amarelo. Forte e varejista, passa segurança."],
  ["r1/pote.html", "6 · Pote Organizador (minha preferida)", "Verde-menta claro, cada peça num pote com tampa de bambu e etiqueta de rotuladora."],
  ["r1/quarto.html", "7 · Monte seu Cantinho", "Cômodo ilustrado em tons pastel; as peças ficam no lugar delas e você toca para ver preço."],
  ["r1/canon.html", "8 · Padrão bem-feito", "Loja clara, banner com foto, cards arredondados com sombra suave."],
];
const antigos = [
  ["assigned.html", "1 · Barra de Sabonete", ""],
  ["model-pick.html", "2 · Bandeja Organizadora", ""],
  ["challenger-tropicalia.html", "3 · Colagem Tropicália", ""],
  ["canon.html", "4 · Padrão da categoria", ""],
];
const html = `<!doctype html><html><head><meta charset="utf-8"><title>Direções Yumi Mix</title><style>
body{margin:0;background:#1c1c1c;color:#eee;font-family:system-ui;padding:20px}
h2{font:700 18px system-ui;margin:4px 0 14px}h3{font:600 14px system-ui;color:#999;margin:36px 0 12px}
.row{display:flex;gap:20px;flex-wrap:wrap}figure{margin:0}
figcaption{font:600 15px system-ui;margin:8px 0 2px}small{display:block;color:#aaa;font-size:12px;line-height:1.4}
.f{overflow:hidden;border-radius:18px;border:1px solid #444;background:#fff}
iframe{width:390px;height:844px;border:0;transform-origin:0 0}
</style></head><body><h2>Rodada 2 · quatro direções novas</h2><div class="row">${novos.map((c) => card(c[0], c[1], c[2], 0.75)).join("")}</div>
<h3>Rodada 1 · ainda dá para escolher</h3><div class="row">${antigos.map((c) => card(c[0], c[1], c[2], 0.45)).join("")}</div></body></html>`;
fs.writeFileSync(path.join(dir, "comparar.html"), html);
