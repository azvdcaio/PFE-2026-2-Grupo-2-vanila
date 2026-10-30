/* ==========================================================
   Ideia geral do arquivo: o HTML fica "limpo" e o JS monta
   o que falta 
   ========================================================== */

// Breakpoint usado pelo menu e pelos submenus (mesmo valor do CSS)
const DESKTOP = window.matchMedia("(min-width: 767px)");

/* ==========================================================
   1. MENU HAMBÚRGUER
   ========================================================== */
function iniciarMenu() {
  const header = document.querySelector("body > header");
  const nav = header?.querySelector("nav");
  if (!nav) return;

  // O "painel" é o filho direto do header que contém o nav
  const painel = [...header.children].find((filho) => filho.contains(nav));
  painel.classList.add("menu-painel");
  painel.id ||= "menu-painel";

  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "menu-toggle";
  botao.setAttribute("aria-controls", painel.id);
  botao.setAttribute("aria-expanded", "false");
  botao.setAttribute("aria-label", "Abrir menu");
  botao.innerHTML = '<span class="menu-toggle__barra" aria-hidden="true"></span>';

  header.insertBefore(botao, painel);
  header.classList.add("menu-pronto");

  // Única função que muda o estado: tudo passa por aqui
  function definirAberto(aberto) {
    header.classList.toggle("menu-aberto", aberto);
    botao.setAttribute("aria-expanded", String(aberto));
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  }

  botao.addEventListener("click", () => {
    definirAberto(!header.classList.contains("menu-aberto"));
  });

  // Fecha ao clicar num link do menu
  painel.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) definirAberto(false);
  });

  // Fecha com ESC e devolve o foco ao botão (acessibilidade)
  header.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      definirAberto(false);
      botao.focus();
    }
  });

  // Fecha ao clicar fora do header
  document.addEventListener("click", (evento) => {
    if (!header.contains(evento.target)) definirAberto(false);
  });

  // Ao virar desktop, volta para o estado fechado
  DESKTOP.addEventListener("change", (evento) => {
    if (evento.matches) definirAberto(false);
  });
}

/* ==========================================================
   2. SUBMENUS
   ========================================================== */
const SUBMENUS = {
  "index.html": [
    { texto: "Valores", ancora: "valores" },
    { texto: "Empresas", ancora: "empresas" },
    { texto: "Equipe", ancora: "equipe" },
  ],
  "pkz-lab.html": [
    { texto: "Quem somos", ancora: "pkz-sobre" },
    { texto: "Características", ancora: "pkz-caracteristicas" },
    { texto: "Planos", ancora: "pkz-planos" },
    { texto: "Depoimentos", ancora: "pkz-depoimentos" },
    { texto: "Localização", ancora: "pkz-localizacao" },
    { texto: "Dúvidas", ancora: "pkz-faq" },
  ],
  "one-to-one.html": [
    { texto: "Características", ancora: "caracteristicas" },
    { texto: "Planos", ancora: "planos" },
    { texto: "Depoimentos", ancora: "depoimentos" },
    { texto: "Localização", ancora: "localizacao" },
    { texto: "Dúvidas", ancora: "faq" },
  ],
};

function iniciarSubmenus() {
  const itens = []; // guarda todos para fechar os outros ao abrir um

  document.querySelectorAll("body > header .menu > li > a").forEach((link) => {
    const pagina = link.getAttribute("href");
    const secoes = SUBMENUS[pagina];
    if (!secoes) return; // link sem submenu (ex.: "Contato")

    const item = link.parentElement;
    const id = `submenu-${pagina.replace(".html", "")}`;
    item.classList.add("menu__item--sub");

    // Botão da setinha (usado no mobile)
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "submenu-toggle";
    botao.setAttribute("aria-expanded", "false");
    botao.setAttribute("aria-controls", id);
    botao.setAttribute("aria-label", `Seções de ${link.textContent.trim()}`);
    botao.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>';

    // Lista de links das seções
    const lista = document.createElement("ul");
    lista.className = "submenu";
    lista.id = id;

    secoes.forEach(({ texto, ancora }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `${pagina}#${ancora}`;
      a.textContent = texto;
      li.append(a);
      lista.append(li);
    });

    item.append(botao, lista);
    itens.push({ item, botao });

    botao.addEventListener("click", () => {
      const aberto = item.classList.toggle("submenu-aberto");
      botao.setAttribute("aria-expanded", String(aberto));

      // Só um submenu aberto por vez
      if (aberto) {
        itens.forEach((outro) => {
          if (outro.item === item) return;
          outro.item.classList.remove("submenu-aberto");
          outro.botao.setAttribute("aria-expanded", "false");
        });
      }
    });
  });

  // Ao virar desktop (submenu é só hover), limpa o que ficou aberto
  DESKTOP.addEventListener("change", (evento) => {
    if (!evento.matches) return;
    itens.forEach(({ item, botao }) => {
      item.classList.remove("submenu-aberto");
      botao.setAttribute("aria-expanded", "false");
    });
  });
}

/* ==========================================================
   3. MODAIS (genéricos)
   ========================================================== */
let cliqueComecouNoFundo = false;

// Evita fechar o modal se a pessoa selecionou texto dentro dele
// e soltou o mouse fora da caixa
document.addEventListener("pointerdown", (evento) => {
  cliqueComecouNoFundo = evento.target instanceof HTMLDialogElement;
});

document.addEventListener("click", (evento) => {
  const abrir = evento.target.closest("[data-modal-abrir]");
  if (abrir) {
    document.getElementById(abrir.dataset.modalAbrir)?.showModal();
    return;
  }

  const fechar = evento.target.closest("[data-modal-fechar]");
  if (fechar) {
    fechar.closest("dialog")?.close();
    return;
  }

  // Clicar no "fundo" = clicar no próprio <dialog>, fora do conteúdo
  if (cliqueComecouNoFundo && evento.target instanceof HTMLDialogElement) {
    evento.target.close();
  }
});

/* ==========================================================
   4. REVELAR CARDS AO ROLAR (index.html)
   ========================================================== */
const observador = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.remove("valor--oculto");
        observador.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.2 },
);

document.querySelectorAll(".valores__lista .card-caracteristica").forEach((card) => {
  card.classList.add("valor--oculto"); // esconde via JS (sem JS, o card aparece normal)
  observador.observe(card);
});

/* ==========================================================
   5. VALIDAÇÃO (compartilhada pelo calendário e pelo contato)
   ========================================================== */

// "(31) 98888-7777" -> "31988887777"
function apenasNumeros(texto) {
  let numeros = "";
  for (const caractere of texto) {
    if (caractere >= "0" && caractere <= "9") numeros += caractere;
  }
  return numeros;
}

// Aceita letras (com acento), espaço, hífen e apóstrofo.
// Truque: letra muda ao trocar maiúscula/minúscula; número e símbolo não.
function soTemLetras(texto) {
  for (const caractere of texto) {
    const ehLetra = caractere.toLowerCase() !== caractere.toUpperCase();
    if (!ehLetra && caractere !== " " && caractere !== "-" && caractere !== "'") {
      return false;
    }
  }
  return true;
}

// exigirSobrenome = true no agendamento ("Nome completo")
function validarNome(nome, exigirSobrenome) {
  nome = nome.trim();
  if (nome === "") return "Preencha o nome.";
  if (nome.length < 3) return "O nome precisa ter pelo menos 3 letras.";
  if (nome.length > 80) return "O nome está muito longo.";
  if (!soTemLetras(nome)) return "O nome só pode ter letras.";
  if (exigirSobrenome && !nome.includes(" ")) return "Informe nome e sobrenome.";
  return "";
}

// Sobrenome é opcional: vazio é válido
function validarSobrenome(sobrenome) {
  sobrenome = sobrenome.trim();
  if (sobrenome === "") return "";
  if (sobrenome.length > 80) return "O sobrenome está muito longo.";
  if (!soTemLetras(sobrenome)) return "O sobrenome só pode ter letras.";
  return "";
}

// obrigatorio = false nas páginas de contato
function validarWhatsapp(whatsapp, obrigatorio = true) {
  const numeros = apenasNumeros(whatsapp);

  if (numeros === "") return obrigatorio ? "Preencha o WhatsApp." : "";
  if (numeros.length !== 10 && numeros.length !== 11) {
    return "Use o formato (00) 00000-0000.";
  }
  if (numeros[0] === "0" || numeros[1] === "0") return "DDD inválido.";
  if (numeros.length === 11 && numeros[2] !== "9") {
    return "Celular deve começar com 9 depois do DDD.";
  }
  return "";
}

// Checagem simples: um @, texto antes, um ponto depois do @, sem espaço
function validarEmail(email) {
  email = email.trim();
  if (email === "") return "Preencha o e-mail.";
  if (email.length > 120) return "E-mail muito longo.";

  const arroba = email.indexOf("@");
  const ultimoPonto = email.lastIndexOf(".");

  const valido =
    arroba > 0 && // tem texto antes do @
    email.indexOf("@", arroba + 1) === -1 && // só um @
    ultimoPonto > arroba + 1 && // tem ponto depois do @
    ultimoPonto < email.length - 1 && // não termina em ponto
    !email.includes(" "); // sem espaço

  return valido ? "" : "E-mail inválido. Exemplo: nome@dominio.com";
}

// Mostra (ou apaga) a mensagem no <span data-erro-para="campo">
// e liga/desliga a borda vermelha. Devolve true se o campo está certo.
// "campo" só é passado quando a borda não vai em form.elements[nome]
// (ex.: grupo de radios).
function mostrarErro(form, nomeDoCampo, mensagem, campo) {
  const spanDeErro = form.querySelector(`[data-erro-para="${nomeDoCampo}"]`);
  campo = campo || form.elements[nomeDoCampo];

  spanDeErro.textContent = mensagem;

  if (mensagem === "") {
    campo.classList.remove("invalido");
    campo.removeAttribute("aria-invalid");
    return true;
  }
  campo.classList.add("invalido");
  campo.setAttribute("aria-invalid", "true");
  return false;
}

// Máscara: vai formatando "(00) 00000-0000" enquanto a pessoa digita
function aplicarMascaraWhatsapp(campo) {
  campo.addEventListener("input", (evento) => {
    const n = apenasNumeros(evento.target.value).slice(0, 11);

    if (n.length > 10) {
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    } else if (n.length > 6) {
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    } else if (n.length > 2) {
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    } else {
      evento.target.value = n ? `(${n}` : "";
    }
  });
}

// Comportamento comum aos dois formulários:
// valida ao sair do campo (blur); depois do 1º erro, revalida a cada tecla.
function ligarValidacaoDoCampo(campo, validar) {
  campo.addEventListener("blur", validar);
  campo.addEventListener("input", () => {
    if (campo.classList.contains("invalido")) validar();
  });
}

/* ==========================================================
   6. CALENDÁRIO DE AGENDAMENTO
   ========================================================== */
function iniciarCalendario() {
  const calendario = document.querySelector(".calendario");
  const modal = document.getElementById("modal-agendamento");
  const modalSucesso = document.getElementById("modal-sucesso");
  if (!calendario || !modal || !modalSucesso) return; // página sem calendário

  /* ---- Configuração (fácil de alterar) ---- */
  const CHAVE_STORAGE = `agendamentos:${calendario.dataset.empresa || "pkz"}`;
  const HORARIOS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const DIAS_BLOQUEADOS = ["2026-10-15"]; // AAAA-MM-DD
  const DIAS_FECHADOS = [0]; // 0 = domingo ... 6 = sábado
  const FERIADOS = {
    "01-01": "Confraternização Universal",
    "04-21": "Tiradentes",
    "05-01": "Dia do Trabalho",
    "09-07": "Independência do Brasil",
    "10-12": "Nossa Senhora Aparecida",
    "11-02": "Finados",
    "11-15": "Proclamação da República",
    "11-20": "Consciência Negra",
    "12-25": "Natal",
  };
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"];

  /* ---- Elementos ---- */
  const titulo = calendario.querySelector(".calendario__titulo");
  const grade = calendario.querySelector(".calendario__dias");
  const btnAnterior = calendario.querySelector("[data-calendario-anterior]");
  const btnProximo = calendario.querySelector("[data-calendario-proximo]");
  const form = modal.querySelector("form");
  const textoData = modal.querySelector("[data-agendamento-data]");
  const listaHorarios = modal.querySelector(".horarios");
  const erro = modal.querySelector(".form-agendamento__erro");
  const tituloSucesso = modalSucesso.querySelector("[data-sucesso-titulo]");
  const detalheSucesso = modalSucesso.querySelector("[data-sucesso-detalhe]");
  const painelReservas = document.querySelector("[data-reservas]");
  const listaReservas = painelReservas?.querySelector(".reservas__lista");

  /* ---- Estado ---- */
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // zera a hora para comparar só o dia
  const mesInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const mesAtual = new Date(mesInicial);
  let diaSelecionado = null;

  /* ---- Datas ----
     chave(): Date -> "2026-10-29". Não uso toISOString() porque ele
     converte para UTC e pode trocar o dia no fuso do Brasil. */
  const chave = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // "2026-10-29" -> Date
  const dataDe = (texto) => {
    const [ano, mes, dia] = texto.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  };

  const rotuloData = (d) =>
    `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

  // "10-12" (mês-dia) é a chave dos feriados fixos
  const nomeFeriado = (d) => FERIADOS[chave(d).slice(5)];

  /* ---- Reservas no localStorage ----
     O localStorage só guarda TEXTO, por isso JSON.stringify/parse.
     try/catch: pode estar cheio, bloqueado ou com JSON quebrado. */
  function lerReservas() {
    try {
      const lista = JSON.parse(localStorage.getItem(CHAVE_STORAGE));
      return Array.isArray(lista) ? lista : [];
    } catch {
      return [];
    }
  }

  function salvarReservas(lista) {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
      return true;
    } catch {
      return false;
    }
  }

  /* ---- Disponibilidade ---- */
  const horariosOcupados = (dia, reservas) =>
    reservas.filter((r) => r.data === dia).map((r) => r.horario);

  // Hoje, um horário que já passou não pode ser escolhido
  function horarioPassou(dia, hora) {
    const agora = new Date();
    if (dia !== chave(agora)) return false;
    const [h, min] = hora.split(":").map(Number);
    return h * 60 + min <= agora.getHours() * 60 + agora.getMinutes();
  }

  // Devolve null se o dia está livre, ou { tipo, texto } com o motivo.
  // O "tipo" vira data-motivo no botão e o CSS pinta cada caso.
  function motivoBloqueio(data, reservas) {
    const dia = chave(data);

    if (data < hoje) return { tipo: "passado" };

    const feriado = nomeFeriado(data);
    if (feriado) return { tipo: "feriado", texto: `Feriado: ${feriado}` };

    if (DIAS_BLOQUEADOS.includes(dia) || DIAS_FECHADOS.includes(data.getDay())) {
      return { tipo: "indisponivel", texto: "Indisponível" };
    }

    const ocupados = horariosOcupados(dia, reservas);
    const livres = HORARIOS.filter((h) => !ocupados.includes(h) && !horarioPassou(dia, h));

    if (livres.length === 0) {
      return ocupados.length
        ? { tipo: "reservado", texto: "Reservado" }
        : { tipo: "indisponivel", texto: "Sem horários disponíveis" };
    }
    return null;
  }

  /* ---- Desenho do calendário ---- */
  function marcarSelecao() {
    grade.querySelectorAll(".calendario__dia").forEach((botao) => {
      botao.setAttribute("aria-pressed", botao.dataset.data === diaSelecionado);
    });
  }

  function desenharMes() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const reservas = lerReservas(); // lê uma vez só por desenho

    titulo.textContent = `${MESES[mes][0].toUpperCase()}${MESES[mes].slice(1)} ${ano}`;
    btnAnterior.disabled = mesAtual <= mesInicial; // não volta para o passado
    grade.innerHTML = "";

    // Espaços vazios até o dia da semana em que o mês começa
    for (let i = 0; i < new Date(ano, mes, 1).getDay(); i++) {
      grade.append(document.createElement("span"));
    }

    // new Date(ano, mes + 1, 0) = último dia do mês atual
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= totalDias; dia++) {
      const data = new Date(ano, mes, dia);
      const bloqueio = motivoBloqueio(data, reservas);
      const rotulo = rotuloData(data);

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "calendario__dia";
      botao.textContent = dia;
      botao.dataset.data = chave(data);
      botao.dataset.rotulo = rotulo;
      botao.disabled = Boolean(bloqueio);
      botao.setAttribute("aria-label", bloqueio?.texto ? `${rotulo}. ${bloqueio.texto}` : rotulo);

      if (bloqueio) {
        botao.dataset.motivo = bloqueio.tipo;
        if (bloqueio.texto) botao.title = bloqueio.texto;
      }
      if (data.getTime() === hoje.getTime()) botao.setAttribute("aria-current", "date");

      grade.append(botao);
    }
    marcarSelecao();
  }

  btnAnterior.addEventListener("click", () => {
    mesAtual.setMonth(mesAtual.getMonth() - 1);
    desenharMes();
  });
  btnProximo.addEventListener("click", () => {
    mesAtual.setMonth(mesAtual.getMonth() + 1);
    desenharMes();
  });

  // Radios de horário: os ocupados/passados ficam desabilitados
  function desenharHorarios(dia) {
    const ocupados = horariosOcupados(dia, lerReservas());
    listaHorarios.innerHTML = "";

    HORARIOS.forEach((hora) => {
      const reservado = ocupados.includes(hora);
      const label = document.createElement("label");
      const input = document.createElement("input");
      const texto = document.createElement("span");

      label.className = "horario";
      input.type = "radio";
      input.name = "horario";
      input.value = hora;
      input.disabled = reservado || horarioPassou(dia, hora);
      texto.textContent = hora;
      if (reservado) label.title = "Horário reservado";

      label.append(input, texto);
      listaHorarios.append(label);
    });
  }

  // Atalho para criar elemento com classe e texto
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto) elemento.textContent = texto; // textContent (não innerHTML) evita injetar HTML
    return elemento;
  }

  // Painel "Suas reservas"
  function desenharReservas() {
    if (!painelReservas || !listaReservas) return;

    // Ordena por data e hora (texto "AAAA-MM-DD HH:MM" ordena certo)
    const reservas = lerReservas().sort((a, b) =>
      `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`),
    );

    listaReservas.innerHTML = "";
    painelReservas.hidden = reservas.length === 0;

    reservas.forEach((reserva) => {
      const item = criar("li", "reserva");

      const topo = criar("div", "reserva__topo");
      topo.append(
        criar("strong", "reserva__data", rotuloData(dataDe(reserva.data))),
        criar("span", "reserva__hora", reserva.horario),
      );

      const dados = criar("dl", "reserva__dados");
      [
        ["Nome", reserva.nome],
        ["WhatsApp", reserva.whatsapp],
        ["E-mail", reserva.email],
        ["Observações", reserva.observacoes],
      ].forEach(([rotulo, valor]) => {
        if (!valor) return; // não mostra campo vazio
        const bloco = criar("div");
        bloco.append(criar("dt", "", rotulo), criar("dd", "", valor));
        dados.append(bloco);
      });

      const cancelar = criar("button", "reserva__cancelar", "Cancelar reserva");
      cancelar.type = "button";
      cancelar.dataset.cancelar = reserva.id;

      item.append(topo, dados, cancelar);
      listaReservas.append(item);
    });
  }

  // Delegação: um listener na lista serve para todos os botões "Cancelar"
  listaReservas?.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-cancelar]");
    if (!botao || !confirm("Cancelar esta reserva?")) return;

    salvarReservas(lerReservas().filter((r) => r.id !== botao.dataset.cancelar));
    desenharMes();
    desenharReservas();
  });

  // Clicar num dia: seleciona e abre o modal
  grade.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".calendario__dia");
    if (!botao) return;

    diaSelecionado = botao.dataset.data;
    marcarSelecao();
    limparErros();

    form.elements.data.value = diaSelecionado; // input hidden
    textoData.dateTime = diaSelecionado;
    textoData.textContent = botao.dataset.rotulo;
    desenharHorarios(diaSelecionado);
    modal.showModal();
  });

  /* ---- Validação do formulário de agendamento ---- */
  const validarHorario = (h) => (h === "" ? "Selecione um horário." : HORARIOS.includes(h) ? "" : "Horário inválido.");
  const validarObservacoes = (t) => (t.length > 300 ? "Máximo de 300 caracteres." : "");

  // A data vem de um input hidden: confere se não foi mexida no DevTools
  function dataEstaValida() {
    const data = dataDe(form.elements.data.value);
    return !isNaN(data.getTime()) && !motivoBloqueio(data, lerReservas());
  }

  // Mapa campo -> função validadora (mesmo padrão do contato)
  const VALIDADORES = {
    horario: validarHorario,
    nome: (valor) => validarNome(valor, true),
    whatsapp: validarWhatsapp,
    email: validarEmail,
    observacoes: validarObservacoes,
  };

  // Radios não são um input só: a borda vermelha vai no grupo inteiro
  function validarCampo(nomeDoCampo) {
    const valor = form.elements[nomeDoCampo].value; // em radio, é o marcado ou ""
    const campoVisual = nomeDoCampo === "horario" ? listaHorarios : undefined;
    return mostrarErro(form, nomeDoCampo, VALIDADORES[nomeDoCampo](valor), campoVisual);
  }

  function validarFormulario() {
    erro.textContent = "";
    let tudoCerto = true;
    let primeiroComErro = null;

    // Sem parar no primeiro erro: mostra todos de uma vez
    for (const nomeDoCampo in VALIDADORES) {
      if (!validarCampo(nomeDoCampo)) {
        tudoCerto = false;
        primeiroComErro ??= nomeDoCampo;
      }
    }

    if (!dataEstaValida()) {
      erro.textContent = "Data indisponível. Feche e escolha outro dia.";
      return false;
    }

    // Leva o foco ao primeiro campo com erro
    if (primeiroComErro === "horario") {
      listaHorarios.querySelector("input:not(:disabled)")?.focus();
    } else if (primeiroComErro) {
      form.elements[primeiroComErro].focus();
    }
    return tudoCerto;
  }

  function limparErros() {
    for (const nomeDoCampo in VALIDADORES) {
      const campoVisual = nomeDoCampo === "horario" ? listaHorarios : undefined;
      mostrarErro(form, nomeDoCampo, "", campoVisual);
    }
    erro.textContent = "";
  }

  ["nome", "whatsapp", "email", "observacoes"].forEach((nomeDoCampo) => {
    ligarValidacaoDoCampo(form.elements[nomeDoCampo], () => validarCampo(nomeDoCampo));
  });
  // Radios são recriados a cada abertura: delegação no container
  listaHorarios.addEventListener("change", () => validarCampo("horario"));
  aplicarMascaraWhatsapp(form.elements.whatsapp);

  /* ---- Envio ---- */
  async function enviarAgendamento(reserva) {
    // TODO: trocar pelo envio real (fetch para o back-end, webhook do n8n...)
    console.log("Agendamento:", reserva);
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault(); // impede o recarregamento da página
    if (!validarFormulario()) return;

    const dados = Object.fromEntries(new FormData(form)); // form -> objeto
    dados.nome = dados.nome.trim();
    dados.email = dados.email.trim();
    dados.observacoes = dados.observacoes.trim();

    // Lê de novo: outra aba pode ter reservado o mesmo horário
    const reservas = lerReservas();
    const conflito = reservas.some((r) => r.data === dados.data && r.horario === dados.horario);

    if (conflito) {
      erro.textContent = "Esse horário acabou de ser reservado. Escolha outro.";
      desenharHorarios(dados.data);
      desenharMes();
      return;
    }

    const reserva = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, // id único
      ...dados,
      criadoEm: new Date().toISOString(),
    };

    if (!salvarReservas([...reservas, reserva])) {
      erro.textContent = "Não foi possível salvar o agendamento. Tente novamente.";
      return;
    }

    await enviarAgendamento(reserva);

    const rotulo = textoData.textContent;
    modal.close();
    diaSelecionado = null;
    desenharMes();
    desenharReservas();

    tituloSucesso.textContent = `Parabéns ${reserva.nome}, visita agendada com sucesso`;
    detalheSucesso.textContent = `${rotulo}, às ${reserva.horario}. Entraremos em contato para confirmar.`;
    modalSucesso.showModal();
  });

  // Ao fechar o modal (por qualquer meio), limpa o formulário
  modal.addEventListener("close", () => {
    form.reset();
    limparErros();
  });

  desenharMes();
  desenharReservas();
}

/* ==========================================================
   7. FORMULÁRIO DE CONTATO
   ========================================================== */
function iniciarContato() {
  const form = document.querySelector("[data-form-contato]");
  if (!form) return;

  const erro = form.querySelector(".form-agendamento__erro");
  const sucesso = form.querySelector(".form-agendamento__sucesso");

  function validarMensagem(mensagem) {
    mensagem = mensagem.trim();
    if (mensagem === "") return "Escreva sua mensagem.";
    if (mensagem.length < 10) return "A mensagem precisa ter pelo menos 10 caracteres.";
    if (mensagem.length > 1000) return "Máximo de 1000 caracteres.";
    return "";
  }

  const VALIDADORES = {
    nome: (valor) => validarNome(valor, false),
    sobrenome: validarSobrenome,
    email: validarEmail,
    whatsapp: (valor) => validarWhatsapp(valor, false), // opcional aqui
    mensagem: validarMensagem,
  };

  function validarCampo(nomeDoCampo) {
    const valor = form.elements[nomeDoCampo].value;
    return mostrarErro(form, nomeDoCampo, VALIDADORES[nomeDoCampo](valor));
  }

  function validarFormulario() {
    erro.textContent = "";
    let tudoCerto = true;
    let primeiroComErro = null;

    for (const nomeDoCampo in VALIDADORES) {
      if (!validarCampo(nomeDoCampo)) {
        tudoCerto = false;
        primeiroComErro ??= nomeDoCampo;
      }
    }
    if (primeiroComErro) form.elements[primeiroComErro].focus();
    return tudoCerto;
  }

  function limparErros() {
    for (const nomeDoCampo in VALIDADORES) mostrarErro(form, nomeDoCampo, "");
    erro.textContent = "";
  }

  async function enviarContato(dados) {
    // TODO: trocar pelo envio real (fetch para o back-end, webhook do n8n...)
    console.log("Contato:", dados);
  }

  for (const nomeDoCampo in VALIDADORES) {
    const campo = form.elements[nomeDoCampo];
    ligarValidacaoDoCampo(campo, () => validarCampo(nomeDoCampo));
    campo.addEventListener("input", () => (sucesso.textContent = "")); // some a msg de sucesso ao digitar
  }
  aplicarMascaraWhatsapp(form.elements.whatsapp);

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    sucesso.textContent = "";
    if (!validarFormulario()) return;

    const dados = Object.fromEntries(new FormData(form));
    for (const nomeDoCampo in dados) dados[nomeDoCampo] = dados[nomeDoCampo].trim();

    try {
      await enviarContato(dados);
    } catch {
      erro.textContent = "Não foi possível enviar a mensagem. Tente novamente.";
      return;
    }

    form.reset();
    limparErros();
    sucesso.textContent = "Mensagem enviada com sucesso! Responderemos o mais rápido possível.";
  });
}

/* ==========================================================
   8. CARROSSEL DE PLANOS
   ========================================================== */
function iniciarCarrossel(secao) {
  const faixa = secao.querySelector(".carrossel__slides");
  const slides = [...faixa.children];
  const dots = [...secao.querySelectorAll(".carrossel__dots button")];
  const [anterior, proximo] = secao.querySelectorAll(".carrossel > .carrossel__seta");
  if (!slides.length || !anterior || !proximo) return;

  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  let atual = 0;

  function marcar(i) {
    atual = i;
    slides.forEach((s, n) => s.setAttribute("aria-current", n === i));
    dots.forEach((d, n) => d.setAttribute("aria-current", n === i));
  }

  function irPara(i) {
    i = (i + slides.length) % slides.length; // dá a volta: do último vai ao primeiro
    marcar(i);
    faixa.scrollTo({
      left: i * faixa.clientWidth,
      behavior: reduzirMovimento.matches ? "auto" : "smooth",
    });
  }

  // Se a pessoa arrasta com o dedo, descobrimos o slide quando o scroll PARA
  // (debounce: o timer reinicia a cada evento de scroll)
  let espera;
  faixa.addEventListener("scroll", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const n = Math.round(faixa.scrollLeft / faixa.clientWidth);
      if (n !== atual) marcar(n);
    }, 100);
  });

  anterior.addEventListener("click", () => irPara(atual - 1));
  proximo.addEventListener("click", () => irPara(atual + 1));
  dots.forEach((d, n) => d.addEventListener("click", () => irPara(n)));
  marcar(0);
}

/* ==========================================================
   INICIALIZAÇÃO
   Cada função se protege com "if (!elemento) return", então o
   mesmo arquivo roda em todas as páginas sem erro.
   ========================================================== */
iniciarSubmenus();
iniciarMenu();
iniciarCalendario();
iniciarContato();
document.querySelectorAll(".planos-one").forEach(iniciarCarrossel);