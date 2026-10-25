// ==========================================================================
// Carrossel de Opiniões
// ==========================================================================
const cards = document.querySelectorAll(".opiniao-card");
const btnAnt = document.getElementById("btn-opiniao-ant");
const btnProx = document.getElementById("btn-opiniao-prox");
const indicadoresConteiner = document.getElementById("carrossel-indicadores");
const wrapperCarrossel = document.querySelector(".secao--opinioes");

let indiceAtivo = 0;
let intervaloAutoPlay = null;

function renderizarIndicadores() {
  if (!indicadoresConteiner || cards.length === 0) return;
  indicadoresConteiner.innerHTML = "";

  cards.forEach((_, idx) => {
    const ponto = document.createElement("button");
    ponto.type = "button";
    ponto.setAttribute("role", "tab");
    ponto.setAttribute(
      "aria-label",
      `Ir para depoimento ${idx + 1} de ${cards.length}`,
    );
    ponto.setAttribute("aria-current", idx === 0 ? "true" : "false");
    ponto.addEventListener("click", () => {
      irParaSlide(idx);
      reiniciarAutoPlay();
    });
    indicadoresConteiner.appendChild(ponto);
  });
}

function irParaSlide(novoIndice) {
  if (cards.length === 0) return;

  // Desativa o atual
  cards[indiceAtivo].removeAttribute("aria-current");
  cards[indiceAtivo].setAttribute("aria-hidden", "true");

  const botoesIndicador = indicadoresConteiner
    ? indicadoresConteiner.querySelectorAll("button")
    : [];
  if (botoesIndicador[indiceAtivo]) {
    botoesIndicador[indiceAtivo].setAttribute("aria-current", "false");
  }

  // Calcula novo índice com loop circular
  indiceAtivo = (novoIndice + cards.length) % cards.length;

  // Ativa o novo
  cards[indiceAtivo].setAttribute("aria-current", "true");
  cards[indiceAtivo].setAttribute("aria-hidden", "false");

  if (botoesIndicador[indiceAtivo]) {
    botoesIndicador[indiceAtivo].setAttribute("aria-current", "true");
  }
}

function slideProximo() {
  irParaSlide(indiceAtivo + 1);
}

function slideAnterior() {
  irParaSlide(indiceAtivo - 1);
}

function iniciarAutoPlay() {
  pararAutoPlay();
  intervaloAutoPlay = setInterval(slideProximo, 5500);
}

function pararAutoPlay() {
  if (intervaloAutoPlay) clearInterval(intervaloAutoPlay);
}

function reiniciarAutoPlay() {
  pararAutoPlay();
  iniciarAutoPlay();
}

if (cards.length > 0) {
  // Configura atributos iniciais de acessibilidade
  cards.forEach((card, idx) => {
    card.setAttribute("aria-hidden", idx === 0 ? "false" : "true");
    if (idx === 0) {
      card.setAttribute("aria-current", "true");
    } else {
      card.removeAttribute("aria-current");
    }
  });

  renderizarIndicadores();

  if (btnAnt) {
    btnAnt.addEventListener("click", () => {
      slideAnterior();
      reiniciarAutoPlay();
    });
  }

  if (btnProx) {
    btnProx.addEventListener("click", () => {
      slideProximo();
      reiniciarAutoPlay();
    });
  }

  // Pausar autoplay ao passar o mouse ou focar com o teclado
  if (wrapperCarrossel) {
    wrapperCarrossel.addEventListener("mouseenter", pararAutoPlay);
    wrapperCarrossel.addEventListener("mouseleave", iniciarAutoPlay);
    wrapperCarrossel.addEventListener("focusin", pararAutoPlay);
    wrapperCarrossel.addEventListener("focusout", iniciarAutoPlay);

    // Navegação com setas do teclado
    wrapperCarrossel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        slideAnterior();
        reiniciarAutoPlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        slideProximo();
        reiniciarAutoPlay();
      }
    });

    // Suporte a gestos de arrasto (Touch swipe para mobile)
    let touchStartX = 0;
    wrapperCarrossel.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true },
    );

    wrapperCarrossel.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 45) {
          if (diff > 0) {
            slideProximo();
          } else {
            slideAnterior();
          }
          reiniciarAutoPlay();
        }
      },
      { passive: true },
    );
  }

  iniciarAutoPlay();
}

/* ==========================================================
   MODAIS: comportamento genérico
   - Abrir:  <button data-modal-abrir="id-do-dialog">
   - Fechar: <button data-modal-fechar> dentro do <dialog>
   - Clique no fundo (backdrop) também fecha
   ========================================================== */

// Evita fechar o modal quando o usuário seleciona texto num campo
// e solta o mouse fora da caixa
let cliqueComecouNoFundo = false;

document.addEventListener("pointerdown", (evento) => {
  cliqueComecouNoFundo = evento.target instanceof HTMLDialogElement;
});

document.addEventListener("click", (evento) => {
  const gatilhoAbrir = evento.target.closest("[data-modal-abrir]");
  if (gatilhoAbrir) {
    const modal = document.getElementById(gatilhoAbrir.dataset.modalAbrir);
    if (modal instanceof HTMLDialogElement) modal.showModal();
    return;
  }

  const gatilhoFechar = evento.target.closest("[data-modal-fechar]");
  if (gatilhoFechar) {
    gatilhoFechar.closest("dialog")?.close();
    return;
  }

  if (
    cliqueComecouNoFundo &&
    evento.target instanceof HTMLDialogElement &&
    evento.target.classList.contains("modal")
  ) {
    evento.target.close();
  }
});

/* ==========================================================
   Revela os cards de valores quando entram na tela (index.html)
   ========================================================== */
const cardsValores = document.querySelectorAll(
  ".valores__lista .card-caracteristica",
);

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.remove("valor--oculto");
    }
  });
});

cardsValores.forEach((card) => {
  card.classList.add("valor--oculto");
  observador.observe(card);
});

/* ==========================================================
   Calendário de agendamento
   Só roda em páginas que têm .calendario, #modal-agendamento
   e #modal-sucesso
   ========================================================== */
function iniciarCalendario() {
  const calendario = document.querySelector(".calendario");
  const modal = document.getElementById("modal-agendamento");
  const modalSucesso = document.getElementById("modal-sucesso");
  if (!calendario || !modal || !modalSucesso) return;

  /* ---- Configuração ---- */
  const EMPRESA = calendario.dataset.empresa || "pkz";
  const CHAVE_STORAGE = `agendamentos:${EMPRESA}`;

  const HORARIOS = [
    "09:00",
    "10:00",
    "11:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  const UM_AGENDAMENTO_POR_DIA = false; // true: reservou um horário, o dia inteiro fica reservado
  const DIAS_BLOQUEADOS = ["2026-10-15"]; // AAAA-MM-DD, aparecem como "Indisponível"
  const DIAS_FECHADOS = [0]; // 0 = domingo ... 6 = sábado

  // Feriados locais ou recessos da empresa: "AAAA-MM-DD": "Nome"
  const FERIADOS_EXTRAS = {};

  const FERIADOS_FIXOS = {
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

  const MESES = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const SEMANA = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

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
  hoje.setHours(0, 0, 0, 0);
  const mesInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const mesAtual = new Date(mesInicial);
  let diaSelecionado = null;

  /* ---- Utilitários de data ---- */
  // Não use toISOString(): ele converte para UTC e pode trocar o dia no fuso do Brasil
  const chave = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const dataDe = (texto) => {
    const [ano, mes, dia] = texto.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  };

  const rotuloData = (d) =>
    `${SEMANA[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

  /* ---- Feriados (os móveis são calculados a partir da Páscoa) ---- */
  const cacheFeriados = {};

  function feriadosDoAno(ano) {
    if (cacheFeriados[ano]) return cacheFeriados[ano];

    const lista = {};
    for (const [mesDia, nome] of Object.entries(FERIADOS_FIXOS)) {
      lista[`${ano}-${mesDia}`] = nome;
    }

    // Páscoa (algoritmo de Meeus/Jones/Butcher)
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31);
    const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;

    const movel = (deslocamento, nome) => {
      lista[chave(new Date(ano, mesPascoa - 1, diaPascoa + deslocamento))] =
        nome;
    };

    movel(-48, "Segunda-feira de Carnaval"); // ponto facultativo
    movel(-47, "Terça-feira de Carnaval"); // ponto facultativo
    movel(-2, "Sexta-feira Santa");
    movel(60, "Corpus Christi"); // ponto facultativo

    cacheFeriados[ano] = lista;
    return lista;
  }

  const nomeFeriado = (data) =>
    FERIADOS_EXTRAS[chave(data)] ??
    feriadosDoAno(data.getFullYear())[chave(data)];

  /* ---- Reservas no localStorage ---- */
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
      return false; // armazenamento cheio ou bloqueado pelo navegador
    }
  }

  const idDe = (reserva) => reserva.id ?? reserva.criadoEm;

  /* ---- Disponibilidade ---- */
  function horarioPassou(dia, hora) {
    const agora = new Date();
    if (dia !== chave(agora)) return false;
    const [h, min] = hora.split(":").map(Number);
    return h * 60 + min <= agora.getHours() * 60 + agora.getMinutes();
  }

  const horariosOcupados = (dia, reservas) =>
    reservas.filter((r) => r.data === dia).map((r) => r.horario);

  // Retorna null se o dia está livre, ou { tipo, texto } com o motivo do bloqueio
  function motivoBloqueio(data, reservas) {
    const dia = chave(data);

    if (data < hoje) return { tipo: "passado" };

    const feriado = nomeFeriado(data);
    if (feriado) return { tipo: "feriado", texto: `Feriado: ${feriado}` };

    if (
      DIAS_BLOQUEADOS.includes(dia) ||
      DIAS_FECHADOS.includes(data.getDay())
    ) {
      return { tipo: "indisponivel", texto: "Indisponível" };
    }

    const ocupados = horariosOcupados(dia, reservas);
    const livres = HORARIOS.filter(
      (h) => !ocupados.includes(h) && !horarioPassou(dia, h),
    );

    if (ocupados.length && (UM_AGENDAMENTO_POR_DIA || !livres.length)) {
      return { tipo: "reservado", texto: "Reservado" };
    }
    if (!livres.length)
      return { tipo: "indisponivel", texto: "Sem horários disponíveis" };

    return null;
  }

  /* ---- Calendário ---- */
  function marcarSelecao() {
    grade.querySelectorAll(".calendario__dia").forEach((botao) => {
      botao.setAttribute("aria-pressed", botao.dataset.data === diaSelecionado);
    });
  }

  function desenharMes() {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const reservas = lerReservas(); // lê uma vez por renderização

    titulo.textContent = `${MESES[mes][0].toUpperCase()}${MESES[mes].slice(1)} ${ano}`;
    btnAnterior.disabled = mesAtual <= mesInicial;
    grade.innerHTML = "";

    for (let i = 0; i < new Date(ano, mes, 1).getDay(); i++) {
      grade.append(document.createElement("span"));
    }

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
      botao.setAttribute(
        "aria-label",
        bloqueio?.texto ? `${rotulo}. ${bloqueio.texto}` : rotulo,
      );

      if (bloqueio) {
        botao.dataset.motivo = bloqueio.tipo;
        if (bloqueio.texto) botao.title = bloqueio.texto;
      }

      if (data.getTime() === hoje.getTime())
        botao.setAttribute("aria-current", "date");

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

  /* ---- Horários do modal (reservados e passados ficam desabilitados) ---- */
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
      input.required = true;
      input.disabled = reservado || horarioPassou(dia, hora);
      texto.textContent = hora;
      if (reservado) label.title = "Horário reservado";

      label.append(input, texto);
      listaHorarios.append(label);
    });
  }

  /* ---- Painel "Suas reservas" (div abaixo da section.agendamento) ---- */
  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) elemento.className = classe;
    if (texto) elemento.textContent = texto;
    return elemento;
  }

  function desenharReservas() {
    if (!painelReservas || !listaReservas) return;

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
        if (!valor) return;
        const bloco = criar("div");
        bloco.append(criar("dt", "", rotulo), criar("dd", "", valor));
        dados.append(bloco);
      });

      const cancelar = criar("button", "reserva__cancelar", "Cancelar reserva");
      cancelar.type = "button";
      cancelar.dataset.cancelar = idDe(reserva);

      item.append(topo, dados, cancelar);
      listaReservas.append(item);
    });
  }

  listaReservas?.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-cancelar]");
    if (!botao) return;
    if (!confirm("Cancelar esta reserva?")) return;

    const restantes = lerReservas().filter(
      (r) => String(idDe(r)) !== botao.dataset.cancelar,
    );
    salvarReservas(restantes);
    desenharMes();
    desenharReservas();
  });

  /* ---- Clique em um dia: seleciona e abre o modal ---- */
  grade.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".calendario__dia");
    if (!botao) return;

    diaSelecionado = botao.dataset.data;
    marcarSelecao();
    erro.textContent = "";

    form.elements.data.value = diaSelecionado;
    textoData.dateTime = diaSelecionado;
    textoData.textContent = botao.dataset.rotulo;
    desenharHorarios(diaSelecionado);
    modal.showModal();
  });

  /* ---- Máscara do WhatsApp: (00) 00000-0000 ---- */
  form.elements.whatsapp.addEventListener("input", (evento) => {
    const n = evento.target.value.replace(/\D/g, "").slice(0, 11);

    if (n.length > 10)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
    else if (n.length > 6)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
    else if (n.length > 2)
      evento.target.value = `(${n.slice(0, 2)}) ${n.slice(2)}`;
    else evento.target.value = n ? `(${n}` : "";
  });

  /* ---- Envio ---- */
  async function enviarAgendamento(reserva) {
    // TODO: trocar pelo envio real (fetch para o back-end, webhook do n8n...)
    console.log("Agendamento:", reserva);
  }

  form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = Object.fromEntries(new FormData(form));
    dados.nome = dados.nome.trim();
    const reservas = lerReservas(); // lê de novo: outra aba pode ter reservado antes

    const conflito = reservas.some(
      (r) =>
        r.data === dados.data &&
        (UM_AGENDAMENTO_POR_DIA || r.horario === dados.horario),
    );

    if (conflito) {
      erro.textContent = "Esse horário acabou de ser reservado. Escolha outro.";
      desenharHorarios(dados.data);
      desenharMes();
      return;
    }

    const reserva = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...dados,
      criadoEm: new Date().toISOString(),
    };

    if (!salvarReservas([...reservas, reserva])) {
      erro.textContent =
        "Não foi possível salvar o agendamento. Tente novamente.";
      return;
    }

    await enviarAgendamento(reserva);

    const rotulo = textoData.textContent;

    modal.close();
    diaSelecionado = null;
    desenharMes();
    desenharReservas();

    // Popup de sucesso
    tituloSucesso.textContent = `Parabéns ${reserva.nome}, visita agendada com sucesso`;
    detalheSucesso.textContent = `${rotulo}, às ${reserva.horario}. Entraremos em contato para confirmar.`;
    modalSucesso.showModal();
  });

  modal.addEventListener("close", () => {
    form.reset();
    erro.textContent = "";
  });

  // Se o agendamento for feito em outra aba, atualiza esta
  window.addEventListener("storage", (evento) => {
    if (evento.key !== CHAVE_STORAGE) return;
    desenharMes();
    desenharReservas();
  });

  desenharMes();
  desenharReservas();
}

iniciarCalendario();
