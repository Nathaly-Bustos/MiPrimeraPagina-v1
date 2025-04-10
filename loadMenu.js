document.addEventListener('DOMContentLoaded', function() {
    // Cargar el menú
    fetch('menu.html')
        .then(response => {
            if (!response.ok) throw new Error("Error al cargar menú");
            return response.text();
        })
        .then(menuHTML => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = menuHTML;
            const menuHeader = tempDiv.querySelector('header');
            if (!menuHeader) throw new Error("No se encontró el header en menu.html");
            
            document.querySelectorAll('header').forEach(header => header.remove());
            document.body.insertBefore(menuHeader, document.body.firstChild);
            
            initMobileMenu();
            console.log("Menú cargado correctamente");
        })
        .catch(error => {
            console.error("Error:", error);
            createFallbackMenu();
        });

    // Inicializar componentes
    initCarrusel();
    initImagePopup();
    initCarrito();
});

function initMobileMenu() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Menú');
    
    const header = document.querySelector('header');
    header.insertBefore(menuToggle, header.querySelector('nav'));
    
    menuToggle.addEventListener('click', function() {
        const nav = document.querySelector('nav ul');
        nav.classList.toggle('active');
        menuToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
    });
}

function createFallbackMenu() {
    const fallbackHTML = `
    <header>
        <h1>Anime Paradise</h1>
        <nav>
            <ul>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="ventas.html">Ventas</a></li>
                <li><a href="cosplay.html">Cosplay</a></li>
                <li><a href="contacto.html">Contacto</a></li>
            </ul>
        </nav>
    </header>`;
    
    document.body.insertAdjacentHTML('afterbegin', fallbackHTML);
    console.log("Se cargó menú de respaldo");
}

function initCarrusel() {
    const slides = document.querySelectorAll('.carrusel .slide');
    if (slides.length === 0) return;

    let currentIndex = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function startCarousel() {
        showSlide(0);
        slideInterval = setInterval(nextSlide, 3000);
    }

    function pauseCarousel() {
        clearInterval(slideInterval);
    }

    // Configurar navegación
    const nextBtn = document.querySelector('.carrusel .next');
    const prevBtn = document.querySelector('.carrusel .prev');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            pauseCarousel();
            nextSlide();
            slideInterval = setInterval(nextSlide, 3000);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            pauseCarousel();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
            slideInterval = setInterval(nextSlide, 3000);
        });
    }

    startCarousel();
}

function initImagePopup() {
    const popup = document.getElementById('imagePopup');
    if (!popup) return;

    const popupImg = document.getElementById('popupImage');
    const closePopup = document.getElementById('closePopup');

    // Configurar lightbox para imágenes del carrusel
    document.querySelectorAll('.carrusel .slide, .producto img, .galeria img, .cosplay-item img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            if (document.querySelector('.carrusel')) {
                clearInterval(slideInterval);
            }
            popupImg.src = this.src;
            popupImg.alt = this.alt || 'Imagen ampliada';
            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Configurar controles de cierre
    closePopup.addEventListener('click', closeLightbox);
    
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closeLightbox();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
        if (document.querySelector('.carrusel')) {
            slideInterval = setInterval(nextSlide, 3000);
        }
    }
}

// ===== CARRITO DE COMPRAS =====
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let total = carrito.reduce((sum, item) => sum + item.precio, 0);

function initCarrito() {
    actualizarCarritoGlobal();
}

function actualizarCarritoGlobal() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    const lista = document.getElementById("lista-carrito");
    const totalElement = document.getElementById("total-carrito");
    
    if (lista) {
        lista.innerHTML = "";
        carrito.forEach((item, index) => {
            const li = document.createElement("li");
            li.innerHTML = `${item.nombre} - $${item.precio.toLocaleString('es-CL')} 
                <button onclick="eliminarDelCarrito(${index})">❌</button>`;
            lista.appendChild(li);
        });
    }
    
    if (totalElement) {
        totalElement.textContent = total.toLocaleString('es-CL');
    }
}

window.agregarAlCarrito = function(nombre, precio) {
    carrito.push({ nombre, precio });
    total += precio;
    actualizarCarritoGlobal();
    
    // Efecto visual en el botón
    const boton = event.target;
    boton.classList.add('agregado');
    boton.innerHTML = 'Agregado <span>✓</span>';
    
    setTimeout(() => {
        boton.classList.remove('agregado');
        boton.innerHTML = 'Agregar al carrito <span>🛒</span>';
    }, 2000);
};

window.eliminarDelCarrito = function(index) {
    total -= carrito[index].precio;
    carrito.splice(index, 1);
    actualizarCarritoGlobal();
};

window.finalizarCompra = function() {
    if (carrito.length === 0) {
        alert("¡Tu carrito está vacío! Agrega productos antes de comprar.");
        return;
    }

    let resumen = "Resumen de tu compra:\n\n";
    carrito.forEach(item => {
        resumen += `- ${item.nombre}: $${item.precio.toLocaleString('es-CL')}\n`;
    });
    resumen += `\nTotal: $${total.toLocaleString('es-CL')}\n\n¿Confirmas la compra?`;

    if (confirm(resumen)) {
        alert("¡Compra realizada con éxito! Gracias por tu compra.");
        vaciarCarrito();
    }
};

window.vaciarCarrito = function() {
    carrito = [];
    total = 0;
    actualizarCarritoGlobal();
};