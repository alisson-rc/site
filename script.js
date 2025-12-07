// ---------------------------
// 1. Menu Hambúrguer, Modal, Filtros e Utilitários
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  const linksMenu = document.querySelectorAll(".nav-menu a[data-filter]");
  linksMenu.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const filtro = link.getAttribute("data-filter");
      linksMenu.forEach(l => l.style.opacity = "0.7");
      link.style.opacity = "1";
      carregarProdutos(filtro); 
      if (navMenu.classList.contains("active")) navMenu.classList.remove("active");
    });
  });

  const modalClose = document.querySelector(".modal-close");
  const modal = document.getElementById("produto-modal");
  
  if (modalClose) {
    modalClose.addEventListener("click", () => { modal.style.display = "none"; });
  }
  
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

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
    indicatorsContainer.innerHTML = ''; 
    slides.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.classList.add('indicator');
      if (index === currentIndex) indicator.classList.add('active');
      indicator.addEventListener('click', () => { currentIndex = index; updateCarousel(); });
      indicatorsContainer.appendChild(indicator);
    });
  }

  if(prevBtn) prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
    updateCarousel();
  });

  if(nextBtn) nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  });

  let autoPlay = setInterval(() => {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateCarousel();
  }, 5000);

  carousel.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
  carousel.parentElement.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => {
      currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    }, 5000);
  });

  updateCarousel();
});

// ---------------------------
// 3. Carregamento de Produtos
// ---------------------------
async function carregarProdutos(filtro = "todos") {
  try {
    const lista = await fetch("produtos.txt").then(r => r.text());
    const arquivos = lista.split("\n").map(l => l.trim()).filter(l => l !== "");
    const container = document.getElementById("lista-produtos");

    container.innerHTML = ""; 

    for (const arquivo of arquivos) {
      const html = await fetch(arquivo).then(r => r.text());
      const doc = new DOMParser().parseFromString(html, "text/html");

      const tagsMeta = doc.querySelector('meta[name="tags"]');
      const tags = tagsMeta ? tagsMeta.content.split(",").map(t => t.trim()) : [];

      if (filtro !== "todos" && !tags.includes(filtro)) continue;

      const nome = doc.querySelector('meta[name="nome"]')?.content || "Produto";
      const preco = doc.querySelector('meta[name="preco"]')?.content || "0,00";
      const imagem = doc.querySelector('meta[name="imagem"]')?.content || "";

      const coresMeta = doc.querySelector('meta[name="cores_grid"]');
      const cores = coresMeta ? coresMeta.content.split(",").map(c => c.trim()) : [];
      
      let swatchesHTML = "";
      if (cores.length > 0) {
          swatchesHTML = `<div class="card-swatches">`;
          cores.slice(0, 3).forEach(cor => {
              swatchesHTML += `<span class="swatch-grid" style="background-color: ${cor};"></span>`;
          });
          if (cores.length > 3) swatchesHTML += `<span class="swatch-plus">(+${cores.length - 3})</span>`;
          swatchesHTML += `</div>`;
      }

      const estoqueMeta = doc.querySelector('meta[name="estoque"]');
      const sobEncomenda = estoqueMeta ? estoqueMeta.content === "encomenda" : false;

      let tarjaHTML = sobEncomenda ? `<div class="tarja-estoque">Sob Encomenda</div>` : "";

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="card-top">
          ${tarjaHTML}
          <img src="${imagem}" alt="${nome}">
          ${swatchesHTML}
          <h3>${nome}</h3>
        </div>
        <p class="price">R$ ${preco}</p>
        <button class="btn-add" type="button">Adicionar ao Carrinho</button>
      `;

      container.appendChild(card);
      card.querySelector(".btn-add").addEventListener("click", (e) => {
        e.stopPropagation();
        const nomeFinal = sobEncomenda ? `${nome} (encomenda)` : nome;
        adicionarAoCarrinho(nomeFinal, preco, "Padrão");
      });
      card.addEventListener("click", () => abrirModalProduto(arquivo, nome, preco));
    }
  } catch (err) { console.error("Erro carregamento:", err); }
}

// ---------------------------
// 4. Modal (Corrigido: Tarja Sob Encomenda dentro do Modal)
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

      // DECLARAÇÃO DAS VARIÁVEIS DO MODAL
      const mainImage = modalBody.querySelector("#main-product-image");
      const thumbnailsContainer = modalBody.querySelector(".product-thumbnails");
      const imgCol = modalBody.querySelector(".modal-img-col"); 

      const estoqueMeta = doc.querySelector('meta[name="estoque"]');
      const isEncomenda = estoqueMeta ? estoqueMeta.content === "encomenda" : false;

      // --- LOGICA DA TARJA NO MODAL ---
      if (isEncomenda && imgCol) {
        const tarjaModal = document.createElement("div");
        tarjaModal.className = "tarja-estoque";
        tarjaModal.innerText = "Sob Encomenda";
        // Insere a tarja no topo da coluna de imagem
        imgCol.style.position = "relative";
        imgCol.insertBefore(tarjaModal, mainImage);
      }

      const galeriaMeta = doc.querySelector('meta[name="galeria"]');
      const galeriaImagens = galeriaMeta ? galeriaMeta.content.split(",").map(src => src.trim()) : [];
      
      const tamanhosMeta = doc.querySelector('meta[name="opcoes_tamanho"]');
      const tamanhos = tamanhosMeta ? tamanhosMeta.content.split(",").map(t => t.trim()) : [];

      const coresMapMeta = doc.querySelector('meta[name="cores_map"]');
      const coresMap = coresMapMeta ? JSON.parse(coresMapMeta.content) : [];

      // Galeria Automática
      if (mainImage) mainImage.src = galeriaImagens.length > 0 ? galeriaImagens[0] : "";
      if (thumbnailsContainer && galeriaImagens.length > 0) {
        thumbnailsContainer.innerHTML = "";
        galeriaImagens.forEach((src, index) => {
           const img = document.createElement("img");
           img.src = src;
           img.className = "thumbnail";
           if (index === 0) img.classList.add("active");
           img.addEventListener("click", () => {
             modalBody.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
             img.classList.add("active");
             if (mainImage) mainImage.src = src;
           });
           thumbnailsContainer.appendChild(img);
        });
      }

      // Seletores e Compra
      const btnComprar = modalBody.querySelector(".btn-comprar-modal");
      if (tamanhos.length > 0 || coresMap.length > 0) {
          const divSeletores = document.createElement("div");
          divSeletores.className = "modal-selectors";
          let htmlSeletores = "";
          if(tamanhos.length > 0) {
              htmlSeletores += `<div class="selector-group"><label>Tamanho</label><select id="sel-tamanho" class="modal-select">${tamanhos.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>`;
          }
          if(coresMap.length > 0) {
              htmlSeletores += `<div class="selector-group"><label>Cor</label><select id="sel-cor" class="modal-select">${coresMap.map(c => `<option value="${c.nome}" data-img="${c.img}">${c.nome}</option>`).join('')}</select></div>`;
          }
          divSeletores.innerHTML = htmlSeletores;
          if(btnComprar) btnComprar.parentNode.insertBefore(divSeletores, btnComprar);
      }

      const selCor = modalBody.querySelector("#sel-cor");
      if (selCor && mainImage) {
          selCor.addEventListener("change", () => {
              const opt = selCor.options[selCor.selectedIndex];
              const novaImg = opt.getAttribute("data-img");
              if (novaImg) {
                  mainImage.src = novaImg;
                  modalBody.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
              }
          });
      }

      if (btnComprar) {
        btnComprar.addEventListener("click", () => {
          const selTam = modalBody.querySelector("#sel-tamanho");
          const selCorSeletor = modalBody.querySelector("#sel-cor");
          let detalhes = "";
          if(selTam) detalhes += `Tam: ${selTam.value} `;
          if(selCorSeletor) detalhes += `| Cor: ${selCorSeletor.value}`;
          const nomeFinal = isEncomenda ? `${nome} (encomenda)` : nome;
          adicionarAoCarrinho(nomeFinal, preco, detalhes.trim());
          modal.style.display = "none";
        });
      }
      modal.style.display = "block";
    }
  } catch (err) { console.error("Erro modal:", err); }
}

// ---------------------------
// 5. Carrinho e WhatsApp
// ---------------------------
function adicionarAoCarrinho(nome, preco, detalhes = "") {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const nomeFinal = detalhes && detalhes !== "Padrão" ? `${nome} (${detalhes})` : nome;
  carrinho.push({ nome: nomeFinal, preco });
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
  alert("Produto adicionado!");
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
    const avisoEstoque = item.nome.includes("(encomenda)") ? `<small style="color: #6a2a32; display: block; font-weight: bold;">(Sob Encomenda)</small>` : "";
    const div = document.createElement("div");
    div.className = "item-carrinho";
    div.innerHTML = `<div>${item.nome}${avisoEstoque}<small>R$ ${item.preco}</small></div><span class="remove" data-index="${index}">X</span>`;
    lista.appendChild(div);
  });
  const totalEl = document.getElementById("total-carrinho");
  if(totalEl) totalEl.innerText = total.toFixed(2).replace(".", ",");
  const contador = document.getElementById("carrinho-contador");
  if (contador) contador.innerText = carrinho.length;
  document.querySelectorAll(".item-carrinho .remove").forEach(el => {
    el.addEventListener("click", function() { removerItem(parseInt(this.getAttribute("data-index"))); });
  });
}

function removerItem(index) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  carrinho.splice(index, 1);
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  atualizarCarrinho();
}

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    atualizarCarrinho();
    const btnWhats = document.getElementById("btn-whats");
    if (btnWhats) {
      btnWhats.addEventListener("click", () => {
        const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
        if (carrinho.length === 0) return alert("Carrinho vazio!");

        let total = 0;
        let msg = "*Pedido Zabala Moda Íntima*%0A";
        msg += "-------------------------------%0A";

        carrinho.forEach(item => {
          const avisoEncomenda = item.nome.includes("(encomenda)") ? " [SOB ENCOMENDA]" : "";
          msg += `• ${item.nome}${avisoEncomenda} — R$ ${item.preco}%0A`;
          total += parseFloat(String(item.preco).replace(",", ".").replace(/[^\d\.]/g, "")) || 0;
        });

        msg += "-------------------------------%0A";
        msg += `*Total:* R$ ${total.toFixed(2).replace(".", ",")} %0A%0A`;
        msg += "Olá! Gostaria de finalizar meu pedido.";

        const numero = "5548996896175"; 
        window.open(`https://wa.me/${numero}?text=${msg}`, "_blank");
      });
    }
});