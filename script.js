// ---------------------------
// 1. Menu Hambúrguer, Modal e Filtros
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Menu Mobile
  const menuBtn = document.querySelector(".menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Listener para Filtros do Menu
  const linksMenu = document.querySelectorAll(".nav-menu a[data-filter]");
  linksMenu.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const filtro = link.getAttribute("data-filter");
      
      // Feedback visual simples
      linksMenu.forEach(l => l.style.opacity = "0.7");
      link.style.opacity = "1";

      carregarProdutos(filtro); // Recarrega a grid filtrada
      if (navMenu.classList.contains("active")) navMenu.classList.remove("active");
    });
  });

  // Modal de Produto
  const modalClose = document.querySelector(".modal-close");
  const modal = document.getElementById("produto-modal");
  
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }
  
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Minimizar Carrinho
  const carrinhoPainel = document.getElementById("carrinho-flutuante");
  const carrinhoAba = document.getElementById("reabrir-carrinho");
  const btnMinimizar = document.getElementById("fechar-carrinho");

  if (btnMinimizar) {
    btnMinimizar.addEventListener("click", () => {
      carrinhoPainel.classList.add("minimizado");
      if (carrinhoAba) carrinhoAba.style.display = "flex";
    });
  }

  if (carrinhoAba) {
    carrinhoAba.addEventListener("click", () => {
      carrinhoPainel.classList.remove("minimizado");
      carrinhoAba.style.display = "none";
    });
  }
});

// ---------------------------
// 2. Carrossel do Banner Principal
// ---------------------------
document.addEventListener("DOMContentLoaded", function() {
  const carousel = document.querySelector(".banner-carousel");
  const slides = document.querySelectorAll(".banner-slide");
  const prevBtn = document.querySelector(".carousel-control.prev");
  const nextBtn = document.querySelector(".carousel-control.next");
  const indicatorsContainer = document.querySelector(".carousel-indicators");

  if(!carousel) return;

  let currentIndex = 0;

  function updateCarousel() {
    carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateIndicators();
  }

  function updateIndicators() {
    indicatorsContainer.innerHTML = ''; 
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

  if(prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
      updateCarousel();
    });
  }

  if(nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    });
  }

  let autoPlayInterval = setInterval(() => {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  }, 5000);

  carousel.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
  carousel.parentElement.addEventListener('mouseleave', () => {
    autoPlayInterval = setInterval(() => {
      currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    }, 5000);
  });

  updateCarousel();
});

// ---------------------------
// 3. Carregamento de Produtos com Filtro
// ---------------------------
async function carregarProdutos(filtro = "todos") {
  try {
    const lista = await fetch("produtos.txt").then(r => r.text());
    const arquivos = lista.split("\n").map(l => l.trim()).filter(l => l !== "");
    const container = document.getElementById("lista-produtos");

    container.innerHTML = ""; // Limpa a grid antes de aplicar o filtro

    for (const arquivo of arquivos) {
      const html = await fetch(arquivo).then(r => r.text());
      const doc = new DOMParser().parseFromString(html, "text/html");

      // Verificação das Tags
      const tagsMeta = doc.querySelector('meta[name="tags"]');
      const tags = tagsMeta ? tagsMeta.content.split(",").map(t => t.trim()) : [];

      if (filtro !== "todos" && !tags.includes(filtro)) continue;

      const nome = doc.querySelector('meta[name="nome"]')?.content || "Produto";
      const preco = doc.querySelector('meta[name="preco"]')?.content || "0,00";
      const imagem = doc.querySelector('meta[name="imagem"]')?.content || "";

      const card = document.createElement("div");
      card.className = "card";
      card.style.animation = "fadeIn 0.5s ease"; // Efeito suave
      
      card.innerHTML = `
        <div class="card-top">
          <img src="${imagem}" alt="${nome}">
          <h3>${nome}</h3>
        </div>
        <p class="price">R$ ${preco}</p>
        <button class="btn-add" type="button">Adicionar ao Carrinho</button>
      `;

      container.appendChild(card);

      const btn = card.querySelector(".btn-add");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        adicionarAoCarrinho(nome, preco);
      });

      card.addEventListener("click", () => abrirModalProduto(arquivo, nome, preco));
    }
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
  }
}

// ---------------------------
// 4. Modal, Carrinho e WhatsApp
// ---------------------------
async function abrirModalProduto(url, nome, preco) {
  try {
    const html = await fetch(url).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, "text/html");
    const conteudoPrincipal = doc.querySelector("main"); 
    const modalBody = document.getElementById("modal-body");
    const modal = document.getElementById("produto-modal");

    if (conteudoPrincipal) {
      modalBody.innerHTML = ""; 
      modalBody.appendChild(conteudoPrincipal); 

      // Carrossel interno do produto
      const mainImage = modalBody.querySelector("#main-product-image");
      const thumbnails = modalBody.querySelectorAll(".product-thumbnails .thumbnail");

      if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumbnail => {
          thumbnail.addEventListener("click", () => {
            thumbnails.forEach(t => t.classList.remove("active"));
            thumbnail.classList.add("active");
            mainImage.src = thumbnail.src;
          });
        });
      }

      const btnInterno = modalBody.querySelector(".btn-comprar-modal");
      if (btnInterno) {
        btnInterno.addEventListener("click", () => {
          adicionarAoCarrinho(nome, preco);
          modal.style.display = "none"; 
        });
      }
      modal.style.display = "block";
    }
  } catch (err) { console.error("Erro no modal:", err); }
}

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
    div.innerHTML = `<div>${item.nome}<small>R$ ${item.preco}</small></div>
                     <span class="remove" data-index="${index}">X</span>`;
    lista.appendChild(div);
  });

  const totalEl = document.getElementById("total-carrinho");
  if(totalEl) totalEl.innerText = total.toFixed(2).replace(".", ",");

  const contador = document.getElementById("carrinho-contador");
  if (contador) contador.innerText = carrinho.length;

  document.querySelectorAll(".item-carrinho .remove").forEach(el => {
    el.addEventListener("click", function() {
      removerItem(parseInt(this.getAttribute("data-index")));
    });
  });
}

function removerItem(index) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
}

// Inicializações Globais
document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    atualizarCarrinho();
    
    // Configuração WhatsApp
    const btnWhats = document.getElementById("btn-whats");
    if(btnWhats) {
        btnWhats.addEventListener("click", () => {
            const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
            if (carrinho.length === 0) return alert("Carrinho vazio!");

            let total = 0;
            let msg = "*Pedido Zabala Moda Íntima*%0A---%0A";
            carrinho.forEach(i => {
                msg += `• ${i.nome} - R$ ${i.preco}%0A`;
                total += parseFloat(String(i.preco).replace(",",".")) || 0;
            });
            msg += `---%0A*Total:* R$ ${total.toFixed(2).replace(".",",")}`;
            window.open(`https://wa.me/5548996896175?text=${msg}`, "_blank");
        });
    }
});