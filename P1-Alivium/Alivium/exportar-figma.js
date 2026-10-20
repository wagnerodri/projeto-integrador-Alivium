const fs = require("fs");
const path = require("path");

const root = __dirname;
const output = path.join(root, "figma-editavel");
const colors = {
  green: "#176b63",
  dark: "#123f3b",
  pale: "#d9eee8",
  coral: "#e88768",
  cream: "#f7f5ef",
  text: "#233b3a",
  white: "#ffffff",
  border: "#dce5df",
};

fs.mkdirSync(output, { recursive: true });

function esc(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;",
  }[char]));
}

function image(file, x, y, width, height, id, radius = 0) {
  const filePath = path.join(root, "img", file);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" :
    ext === ".avif" ? "image/avif" : ext === ".jfif" ? "image/jpeg" : "image/jpeg";
  const data = fs.readFileSync(filePath).toString("base64");
  const clip = radius
    ? `<defs><clipPath id="${id}-clip"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/></clipPath></defs>`
    : "";
  return `${clip}<image id="${id}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" href="data:${mime};base64,${data}"${radius ? ` clip-path="url(#${id}-clip)"` : ""}/>`;
}

function rect(x, y, width, height, fill, rx = 0, extra = "") {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="${fill}" ${extra}/>`;
}

function text(value, x, y, size, fill = colors.text, options = {}) {
  const family = options.family || "Georgia, 'Times New Roman', serif";
  const weight = options.weight || 400;
  const anchor = options.anchor || "start";
  const letter = options.letter || 0;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${letter}">${esc(value)}</text>`;
}

function paragraph(lines, x, y, size = 18, fill = colors.text, lineHeight = 29, family = "Arial, sans-serif") {
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" fill="${fill}">${lines.map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${esc(line)}</tspan>`).join("")}</text>`;
}

function label(value, x, y, fill = colors.coral) {
  return text(value.toUpperCase(), x, y, 13, fill, { family: "Arial, sans-serif", weight: 700, letter: 2 });
}

function button(value, x, y, width, fill = colors.coral, color = colors.white) {
  return `${rect(x, y, width, 52, fill, 3)}${text(value, x + width / 2, y + 33, 15, color, { family: "Arial, sans-serif", weight: 700, anchor: "middle" })}`;
}

function card(x, y, width, height, title, lines, icon = "✦") {
  return `<g>${rect(x, y, width, height, colors.white, 2, `filter="url(#shadow)"`)}${rect(x, y, width, 5, colors.coral)}${text(icon, x + 28, y + 58, 27, colors.coral)}${text(title, x + 28, y + 103, 23, colors.green, { weight: 700 })}${paragraph(lines, x + 28, y + 139, 15, colors.text, 24)}</g>`;
}

function header(active) {
  const links = ["Início", "Quem somos", "Profissionais", "Contato"];
  const starts = [817, 900, 1055, 1215];
  let out = `<g id="Cabecalho">${rect(0, 0, 1440, 102, colors.cream)}<line x1="0" y1="101" x2="1440" y2="101" stroke="${colors.border}"/>`;
  out += image("logoOriginal.png", 140, 14, 126, 74, "Logo-Alivium");
  links.forEach((link, index) => {
    const isActive = link === active;
    out += text(link, starts[index], 59, 15, isActive ? colors.green : colors.text, { family: "Arial, sans-serif", weight: isActive ? 700 : 400 });
    if (isActive) out += `<line x1="${starts[index]}" y1="72" x2="${starts[index] + (link === "Profissionais" ? 100 : 83)}" y2="72" stroke="${colors.coral}" stroke-width="3"/>`;
  });
  return `${out}</g>`;
}

function footer(y) {
  let out = `<g id="Rodape">${rect(0, y, 1440, 252, colors.dark)}`;
  out += image("logoOriginal.png", 140, y + 40, 132, 78, "Logo-rodape");
  out += text("Alivium", 485, y + 72, 22, colors.white, { weight: 700 });
  out += paragraph(["Saúde mental com acolhimento", "e propósito."], 485, y + 105, 15, "#cce3dc", 25);
  out += text("Contato", 925, y + 72, 22, colors.white, { weight: 700 });
  out += paragraph(["Fale com nossa equipe", "contato@alivium.com.br", "WhatsApp"], 925, y + 105, 15, "#cce3dc", 29);
  out += `<line x1="140" y1="${y + 205}" x2="1300" y2="${y + 205}" stroke="#ffffff" stroke-opacity=".2"/>`;
  out += text("Desenvolvido pela equipe DSM-FATEC © 2026", 720, y + 233, 13, "#cce3dc", { family: "Arial, sans-serif", anchor: "middle" });
  return `${out}</g>`;
}

function svg(name, height, content) {
  const source = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1440" height="${height}" viewBox="0 0 1440 ${height}">
<defs><filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#194540" flood-opacity=".08"/></filter><linearGradient id="hero-overlay" x1="0" x2="1"><stop offset="0" stop-color="#14413c" stop-opacity=".9"/><stop offset="1" stop-color="#14413c" stop-opacity=".42"/></linearGradient></defs>
${rect(0, 0, 1440, height, colors.cream)}${content}</svg>`;
  fs.writeFileSync(path.join(output, name), source, "utf8");
}

function homepage() {
  let c = header("Início");
  c += `<g id="Hero">${image("síndrome-de-burnout-no-trabalho.jpeg", 0, 102, 1440, 600, "Imagem-hero")}${rect(0, 102, 1440, 600, "url(#hero-overlay)")}`;
  c += label("Cuidado psicológico para a vida real", 140, 280, "#ffd1bd");
  c += text("Você não precisa enfrentar", 140, 360, 58, colors.white, { weight: 700 });
  c += text("tudo sozinho.", 140, 425, 58, colors.white, { weight: 700 });
  c += paragraph(["Encontre acolhimento e profissionais preparados para cuidar da sua", "saúde mental com respeito, privacidade e escuta."], 140, 480, 20, colors.white, 32);
  c += button("Fale com a Alivium", 140, 550, 205) + `</g>`;
  c += `<g id="Nosso-proposito">${label("Nosso propósito", 140, 815)}${text("Um espaço para você respirar e se reorganizar", 140, 874, 39, colors.green, { weight: 700 })}`;
  c += paragraph(["A Alivium conecta pessoas a uma rede de apoio psicológico", "qualificada, com atendimento humano e acessível."], 140, 917, 17, colors.text, 28);
  c += card(140, 1000, 365, 235, "Acolhimento", ["Um atendimento respeitoso, sem", "julgamentos e atento à sua história."], "♡");
  c += card(537, 1000, 365, 235, "Profissionais", ["Conexão com especialistas preparados", "para diferentes necessidades."], "✚");
  c += card(934, 1000, 365, 235, "Ambiente corporativo", ["Soluções para promover saúde mental", "também dentro das empresas."], "▦");
  c += `</g><g id="Destaque">${rect(0, 1310, 1440, 340, colors.green)}${label("Saúde mental importa", 140, 1390, "#ffd1bd")}`;
  c += text("Cuidar cedo também é uma forma", 140, 1450, 39, colors.white, { weight: 700 });
  c += text("de prevenção.", 140, 1494, 39, colors.white, { weight: 700 });
  c += paragraph(["Estresse constante, ansiedade e burnout merecem atenção.", "Buscar ajuda é um passo de cuidado, não um sinal de fraqueza."], 140, 1540, 16, colors.white, 27);
  c += button("Conheça a Alivium", 900, 1450, 200, colors.white, colors.green) + `</g>`;
  c += footer(1650);
  svg("01-inicio.svg", 1902, c);
}

function about() {
  let c = header("Quem somos");
  c += `<g id="Apresentacao">${label("Quem somos", 140, 210)}${text("Uma rede de cuidado para momentos", 140, 286, 46, colors.green, { weight: 700 })}${text("que pedem atenção.", 140, 340, 46, colors.green, { weight: 700 })}`;
  c += paragraph(["A Alivium nasceu para aproximar saúde mental e cotidiano, tornando", "a busca por apoio mais simples, humana e possível."], 140, 390, 18, colors.text, 30) + `</g>`;
  c += `<g id="Sobre-a-Alivium">${rect(140, 500, 1160, 430, colors.pale)}${image("quemsomos.jpg", 140, 500, 540, 430, "Imagem-sobre")}`;
  c += text("Escuta, tecnologia e", 735, 590, 36, colors.green, { weight: 700 }) + text("responsabilidade", 735, 632, 36, colors.green, { weight: 700 });
  c += paragraph(["Sabemos que pressão, ansiedade e esgotamento podem", "afetar a forma como vivemos e trabalhamos. Por isso,", "construímos uma plataforma que valoriza o tempo, a", "privacidade e a individualidade de cada pessoa."], 735, 686, 16, colors.text, 27);
  c += paragraph(["Conectamos usuários a profissionais qualificados e também", "apoiamos organizações que desejam cultivar ambientes", "mais saudáveis."], 735, 814, 16, colors.text, 27);
  c += button("Converse conosco", 735, 875, 190) + `</g>`;
  c += `<g id="Equipe">${label("Projeto em grupo", 140, 1040)}${text("As pessoas por trás da Alivium", 140, 1090, 37, colors.green, { weight: 700 })}`;
  c += paragraph(["Estudantes que contribuíram com diferentes habilidades para tirar a ideia do papel."], 140, 1124, 16, colors.text, 26);
  const members = [
    ["Product Owner", "Icaro", "Trouxe a ideia inicial e participou", "da condução do projeto."],
    ["Scrum Master", "Alberto", "Apoiou a organização da equipe e", "o acompanhamento das etapas."],
    ["Developers", "Wagner", "Contribuiu para o desenvolvimento", "das páginas e recursos da plataforma."],
    ["Developers", "Keven", "Contribuiu para o desenvolvimento", "das páginas e recursos da plataforma."],
    ["Developers", "Wesley", "Contribuiu para o desenvolvimento", "das páginas e recursos da plataforma."],
    ["Developers", "Gabriel", "Apoiou a criação do visual e a", "organização das interfaces."],
  ];
  members.forEach((member, i) => {
    const x = 140 + (i % 3) * 397, y = 1190 + Math.floor(i / 3) * 220;
    c += `<g>${rect(x, y, 365, 195, colors.white, 2, `filter="url(#shadow)"`)}${rect(x, y, 365, 5, colors.coral)}`;
    c += image(i === 2 ? "wag.jfif" : "ajudanos.jpg", x + 25, y + 22, 58, 58, `Membro-${i + 1}`, 29);
    c += text(member[0].toUpperCase(), x + 25, y + 108, 12, colors.coral, { family: "Arial, sans-serif", weight: 700, letter: 1 });
    c += text(member[1], x + 25, y + 139, 23, colors.green, { weight: 700 });
    c += paragraph(member.slice(2), x + 25, y + 165, 13, colors.text, 19);
    c += `</g>`;
  });
  c += `</g><g id="Valores">${label("O que nos guia", 140, 1690)}${text("Cuidado que respeita cada história", 140, 1740, 37, colors.green, { weight: 700 })}`;
  c += card(140, 1790, 365, 190, "Privacidade", ["Seu processo acontece com discrição,", "segurança e respeito."], "♡");
  c += card(537, 1790, 365, 190, "Humanidade", ["O acolhimento vem antes de qualquer", "diagnóstico ou solução."], "♡");
  c += card(934, 1790, 365, 190, "Prevenção", ["Promovemos hábitos e relações que", "sustentam o bem-estar."], "✦");
  c += `</g>` + footer(2030);
  svg("02-quem-somos.svg", 2282, c);
}

function professionals() {
  let c = header("Profissionais");
  c += `<g id="Apresentacao">${label("Nossa equipe", 140, 210)}${text("Profissionais para acompanhar", 140, 286, 46, colors.green, { weight: 700 })}${text("o seu momento.", 140, 340, 46, colors.green, { weight: 700 })}`;
  c += paragraph(["Encontre especialistas com diferentes experiências para cuidar da ansiedade,", "do estresse e do burnout com escuta e responsabilidade."], 140, 390, 18, colors.text, 30) + `</g>`;
  c += `<g id="Especialistas">${text("Conheça alguns especialistas", 140, 560, 36, colors.green, { weight: 700 })}`;
  c += paragraph(["Os perfis abaixo são ilustrativos e servem para apresentar a experiência da plataforma."], 140, 596, 16, colors.text, 26);
  const profiles = [
    ["dra.avif", "Psicóloga clínica", "Dra. Marina Alves", ["Atendimento para ansiedade,", "autoestima e desenvolvimento pessoal."]],
    ["doutor.1.webp", "Psicólogo e terapeuta", "Dr. Rafael Mendes", ["Foco em estresse profissional,", "burnout e equilíbrio no trabalho."]],
    ["dra.3.jpg", "Psicóloga para adultos", "Dra. Beatriz Costa", ["Acompanhamento de relacionamentos,", "luto e mudanças de vida."]],
    ["dr.2.webp", "Psicólogo corporativo", "Dr. Lucas Ferreira", ["Programas de saúde mental e", "prevenção para equipes e empresas."]],
  ];
  profiles.forEach((profile, i) => {
    const x = 140 + (i % 2) * 597, y = 660 + Math.floor(i / 2) * 300;
    c += `<g>${rect(x, y, 563, 270, colors.white, 2, `filter="url(#shadow)"`)}`;
    c += image(profile[0], x, y, 210, 270, `Foto-profissional-${i + 1}`);
    c += text(profile[1].toUpperCase(), x + 237, y + 53, 11, colors.coral, { family: "Arial, sans-serif", weight: 700, letter: 1 });
    c += text(profile[2], x + 237, y + 91, 22, colors.green, { weight: 700 });
    c += paragraph(profile[3], x + 237, y + 134, 14, colors.text, 23);
    c += text("Entrar em contato  →", x + 237, y + 220, 14, colors.green, { family: "Arial, sans-serif", weight: 700 });
    c += `</g>`;
  });
  c += `</g>` + footer(1320);
  svg("03-profissionais.svg", 1572, c);
}

function contact() {
  let c = header("Contato");
  c += `<g id="Apresentacao">${label("Fale com a Alivium", 140, 210)}${text("O primeiro passo pode ser", 140, 286, 46, colors.green, { weight: 700 })}${text("uma conversa.", 140, 340, 46, colors.green, { weight: 700 })}`;
  c += paragraph(["Conte um pouco do que você está vivendo. Nossa equipe está pronta", "para orientar você com calma, cuidado e respeito."], 140, 390, 18, colors.text, 30) + `</g>`;
  c += `<g id="Contato">${rect(140, 500, 455, 520, colors.green, 2)}${label("Estamos aqui", 185, 566, "#ffd1bd")}`;
  c += text("Você merece ser", 185, 625, 34, colors.white, { weight: 700 }) + text("ouvido.", 185, 665, 34, colors.white, { weight: 700 });
  c += paragraph(["Não é preciso ter todas as respostas para", "pedir ajuda. Escreva para nós e encontraremos,", "juntos, o melhor caminho para o seu atendimento."], 185, 718, 15, colors.white, 25);
  c += text("✉   contato@alivium.com.br", 185, 846, 15, colors.white, { family: "Arial, sans-serif" });
  c += text("◉   Conversar pelo WhatsApp", 185, 894, 15, colors.white, { family: "Arial, sans-serif" });
  c += `${rect(625, 500, 675, 520, colors.white, 2, `filter="url(#shadow)"`)}${text("Envie uma mensagem", 675, 563, 30, colors.green, { weight: 700 })}`;
  const fields = [["Nome", 620], ["E-mail", 725], ["Como podemos ajudar?", 830]];
  fields.forEach(([name, y], index) => {
    c += text(name, 675, y, 14, colors.green, { family: "Arial, sans-serif", weight: 700 });
    c += rect(675, y + 15, 575, index === 2 ? 100 : 48, "#fbfdfc", 2, `stroke="#cadbd6" stroke-width="1"`);
  });
  c += button("Enviar mensagem", 675, 960, 190) + `</g>`;
  c += footer(1100);
  svg("04-contato.svg", 1352, c);
}

homepage();
about();
professionals();
contact();
