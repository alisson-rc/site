// ---------------------------
// Menu Hambúrguer (Objetivo 3)
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Listener para fechar modal
  const modalClose = document.querySelector(".modal-close");
  const modal = document.getElementById("produto-modal");
  
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
  
  // Fechar ao clicar fora do modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

// ---------------------------
// Carrossel do Banner Principal
// ---------------------------
document.addEventListener("DOMContentLoaded", function() {
  const carousel = document.querySelector(".banner-carousel");
  const slides = document.querySelectorAll(".banner-slide");
  const prevBtn = document.querySelector(".carousel-control.prev");
  const nextBtn = document.querySelector(".carousel-control.next");
  const indicatorsContainer = document.querySelector(".carousel-indicators");

  let currentIndex = 0;

  function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateIndicators();
  }

  function updateIndicators() {
    indicatorsContainer.innerHTML = ''; // Limpa indicadores anteriores
    slides.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (index === currentIndex) {
        indicator.classList.add('active');
      }
      indicator.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
      });
      indicatorsContainer.appendChild(indicator);
    });
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  });

  // Autoplay (opcional)
  let autoPlayInterval = setInterval(() => {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  }, 5000); // Muda a cada 5 segundos

  // Pausar autoplay ao passar o mouse, retomar ao tirar
  carousel.parentElement.addEventListener('mouseenter', () => {
    clearInterval(autoPlayInterval);
  });
  carousel.parentElement.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(() => {
      currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    }, 5000);
  });


  updateCarousel(); // Inicializa o carrossel e indicadores
});


// ---------------------------
// Menu Hambúrguer (Objetivo 3)
// ---------------------------
// ... (o código do menu hambúrguer permanece o mesmo, você já o tem) ...
document.addEventListener("DOMContentLoaded", () => { // Certifique-se de que este listener é apenas um, se já tem, não duplique
  const menuBtn = document.querySelector(".menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Listener para fechar modal
  const modalClose = document.querySelector(".modal-close");
  const modal = document.getElementById("produto-modal");
  
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
  
  // Fechar ao clicar fora do modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});


// ---------------------------
// Carregamento dos produtos
// ---------------------------
async function carregarProdutos() {
  try {
    const lista = await fetch("produtos.txt").then(r => r.text());
    const arquivos = lista.split("\n").map(l => l.trim()).filter(l => l !== "");
    const container = document.getElementById("lista-produtos");

    for (const arquivo of arquivos) {
      const html = await fetch(arquivo).then(r => r.text());
      const doc = new DOMParser().parseFromString(html, "text/html");

      const nomeMeta = doc.querySelector('meta[name="nome"]');
      const precoMeta = doc.querySelector('meta[name="preco"]');
      const imagemMeta = doc.querySelector('meta[name="imagem"]');

      const nome = nomeMeta ? nomeMeta.content : "Produto";
      const preco = precoMeta ? precoMeta.content : "0,00";
      const imagem = imagemMeta ? imagemMeta.content : "https://via.placeholder.com/500x600";

      // Criar card (DIV agora, em vez de A, pois vamos controlar o clique via JS)
      const card = document.createElement("div");
      card.className = "card";
      
      card.innerHTML = `
        <div class="card-top">
          <img src="${imagem}" alt="${nome}">
          <h3>${nome}</h3>
        </div>
        <p class="price">R$ ${preco}</p>
        <button class="btn-add" type="button">Adicionar ao Carrinho</button>
      `;

      container.appendChild(card);

      // --- LOGICA DE CLIQUE (Objetivo 2) ---
      
      // 1. Clique no botão "Adicionar" (Não abre modal)
      const btn = card.querySelector(".btn-add");
      btn.addEventListener("click", function(event) {
        event.stopPropagation(); // Impede que o clique suba para o card
        adicionarAoCarrinho(nome, preco);
      });

      // 2. Clique no Card (Abre Modal com conteúdo do arquivo)
      card.addEventListener("click", async function() {
        abrirModalProduto(arquivo, nome, preco);
      });
    }

  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}


// Função para buscar o HTML do produto e exibir no Modal
async function abrirModalProduto(url, nome, preco) {
  try {
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    // Pegamos o conteúdo da tag MAIN do arquivo do produto
    const conteudoPrincipal = doc.querySelector("main"); 
    
    const modalBody = document.getElementById("modal-body");
    const modal = document.getElementById("produto-modal");

    if (conteudoPrincipal) {
      modalBody.innerHTML = ""; // Limpa conteúdo anterior
      modalBody.appendChild(conteudoPrincipal); // Insere o novo layout

      // --- LOGICA DO CARROSSEL DE IMAGENS (NOVIDADE AQUI) ---
      const mainImage = modalBody.querySelector("#main-product-image");
      const thumbnails = modalBody.querySelectorAll(".product-thumbnails .thumbnail");

      if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
          thumbnail.addEventListener("click", function() {
            // Remove a classe 'active' de todas as miniaturas
            thumbnails.forEach(t => t.classList.remove("active"));
            // Adiciona a classe 'active' à miniatura clicada
            this.classList.add("active");
            // Troca a imagem principal
            mainImage.src = this.src;
          });
        });
      }
      // --- FIM DA LOGICA DO CARROSSEL ---

      // Ativar o botão de adicionar ao carrinho (já tínhamos isso, mas aqui atualizamos para o novo HTML)
      const btnInterno = modalBody.querySelector(".btn-comprar-modal");
      if (btnInterno) {
        btnInterno.addEventListener("click", () => {
          adicionarAoCarrinho(nome, preco);
          alert(`"${nome}" foi adicionado ao carrinho!`);
          modal.style.display = "none"; 
        });
      }

      modal.style.display = "block"; // Mostra o modal na tela
    }
  } catch (err) {
    console.error("Erro ao abrir detalhe do produto", err);
  }
}

// ---------------------------
// Carrinho - persistência com localStorage
// ---------------------------
function adicionarAoCarrinho(nome, preco) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.push({ nome, preco });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const lista = document.getElementById("itens-carrinho");
  if(!lista) return; 
  
  lista.innerHTML = "";

  let total = 0;
  carrinho.forEach((item, index) => {
    const val = parseFloat(String(item.preco).replace(",", ".").replace(/[^\d\.]/g, "")) || 0;
    total += val;

    const div = document.createElement("div");
    div.className = "item-carrinho";
    div.innerHTML = `
      <div>
        ${item.nome}
        <small>R$ ${item.preco}</small>
      </div>
      <div>
        <span class="remove" data-index="${index}">X</span>
      </div>
    `;
    lista.appendChild(div);
  });

  const totalEl = document.getElementById("total-carrinho");
  if(totalEl) totalEl.innerText = total.toFixed(2).replace(".", ",");

  const removes = document.querySelectorAll(".item-carrinho .remove");
  removes.forEach(el => {
    el.addEventListener("click", function() {
      const idx = parseInt(this.getAttribute("data-index"), 10);
      removerItem(idx);
    });
  });
}

function removerItem(index) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (index >= 0 && index < carrinho.length) {
    carrinho.splice(index, 1);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarCarrinho();
  }
}

// ---------------------------
// Finalizar no WhatsApp
// ---------------------------
document.addEventListener("DOMContentLoaded", function() {
  const btnWhats = document.getElementById("btn-whats");
  if(btnWhats) {
      btnWhats.addEventListener("click", function() {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        if (carrinho.length === 0) {
          alert("Seu carrinho está vazio.");
          return;
        }

        let mensagem = "*Pedido Encantos Íntimos*%0A";
        mensagem += "-------------------------------%0A";

        let total = 0;
        carrinho.forEach(item => {
          mensagem += `• ${item.nome} — R$ ${item.preco}%0A`;
          total += parseFloat(String(item.preco).replace(",", ".").replace(/[^\d\.]/g, "")) || 0;
        });

        mensagem += "-------------------------------%0A";
        mensagem += `*Total:* R$ ${total.toFixed(2).replace(".", ",")} %0A%0A`;
        mensagem += "Olá! Gostaria de finalizar meu pedido.";

        const numero = "5548996896175"; 
        const url = `https://wa.me/${numero}?text=${mensagem}`;
        window.open(url, "_blank");
      });
  }
});

// Inicializações
carregarProdutos();

atualizarCarrinho();
