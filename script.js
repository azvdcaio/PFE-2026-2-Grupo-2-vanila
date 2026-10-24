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
   Modais: comportamento genérico
   - Abrir:  <button data-modal-abrir="id-do-dialog">
   - Fechar: <button data-modal-fechar> dentro do <dialog>
   - Clique no backdrop também fecha
   ========================================================== */

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

  // O backdrop conta como clique no próprio <dialog>
  if (
    evento.target instanceof HTMLDialogElement &&
    evento.target.classList.contains("modal")
  ) {
    evento.target.close();
  }
});
