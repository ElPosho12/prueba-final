// admin.js — versión completa con sonidos del carrusel y footer funcionando

// ===============================
//  IMPORTS FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// ===============================
//  CONFIG FIREBASE
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyClsm9dQXvGHazTFISxrU0NLcqhNxXvCls",
  authDomain: "monkey-awards.firebaseapp.com",
  projectId: "monkey-awards",
  storageBucket: "monkey-awards.firebasestorage.app",
  messagingSenderId: "247832993400",
  appId: "1:247832993400:web:c134b1ae66aefb14d2978d",
  measurementId: "G-BZ8HY4C03Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
//  UID DEL ADMIN
// ===============================
const ADMIN_UID = "hd6wskPepSZkDmb6OTyvtKOekrX2";

// ===============================
//  ELEMENTOS DOM
// ===============================
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const authMsg = document.getElementById("authMsg");
const authDiv = document.getElementById("auth");
const resultsDiv = document.getElementById("results");

// ===============================
//  SONIDOS DEL CARRUSEL
// ===============================
const hoverSound = document.getElementById("carousel-hover-sound");
const slideSound = document.getElementById("carousel-move-sound");

hoverSound.volume = 0.4;
slideSound.volume = 0.4;

// ===============================
//  LOGIN
// ===============================
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    authMsg.textContent = "";
    try {
      await signInWithEmailAndPassword(auth, emailEl.value, passEl.value);
    } catch (err) {
      console.error("Login error:", err);
      authMsg.textContent = "Error en inicio de sesión: " + (err.message || err);
    }
  });
}

// ===============================
//  LOGOUT
// ===============================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    resultsDiv.classList.remove("slide-center");
    resultsDiv.classList.add("slide-right");

    authDiv.classList.remove("hidden", "slide-left");
    setTimeout(() => authDiv.classList.add("slide-center"), 10);

    signOut(auth);
  });
}

// ===============================
//  AUTENTICACIÓN
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (user && user.uid === ADMIN_UID) {
    authDiv.classList.remove("slide-center");
    authDiv.classList.add("slide-left");

    resultsDiv.classList.remove("hidden", "slide-right");
    setTimeout(() => resultsDiv.classList.add("slide-center"), 10);

    await loadResults();
  } else {
    resultsDiv.classList.add("hidden");
    authDiv.classList.remove("hidden");

    if (user && user.uid !== ADMIN_UID) {
      authMsg.textContent = "Usuario no autorizado.";
    }
  }
});

// ===============================
//     CARRUSEL + RESULTADOS
// ===============================
const ordenCategorias = [
  "JUNTADA DEL AÑO",
  "CLIP DEL AÑO",
  "FOTO DEL AÑO",
  "FAIL DEL AÑO",
  "MONADA DEL AÑO",
  "CANCION DEL AÑO",
  "MEJOR MONO EN LA ESCUELA",
  "MEJOR MONO FUERA DEL COLE",
  "MONITO DEL AÑO",
  "MONO DEL AÑO"
];

async function loadResults() {
  const track = document.getElementById("carouselTrack");
  const dotsContainer = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (!track || !dotsContainer) {
    console.error("Faltan elementos del carrusel.");
    return;
  }

  track.innerHTML = "Cargando...";

  try {
    const snap = await getDocs(collection(db, "votosSecuenciales"));

    if (!snap.size) {
      track.innerHTML = "<p>No hay votos aún.</p>";
      return;
    }

    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    const slides = [];
    let idx = 0;

    snap.forEach(doc => {
      const data = doc.data();
      const nombre = data.name ?? "Sin nombre";
      const votos = data.votes ?? {};

      const slide = document.createElement("div");
      slide.className = "carousel-slide";

      const box = document.createElement("div");
      box.className = "voter-box";

      const title = document.createElement("h3");
      title.textContent = nombre;
      box.appendChild(title);

      const list = document.createElement("ul");
      const keys = ordenCategorias.filter(cat => cat in votos);

      if (!keys.length) {
        const li = document.createElement("li");
        li.textContent = "No votó en ninguna categoría.";
        list.appendChild(li);
      } else {
        keys.forEach(cat => {
          const li = document.createElement("li");
          const value = Array.isArray(votos[cat]) ? votos[cat].join(", ") : votos[cat];
          li.innerHTML = `<strong>${cat}:</strong> ${value}`;
          list.appendChild(li);
        });
      }

      box.appendChild(list);
      slide.appendChild(box);
      track.appendChild(slide);

      slides.push(slide);

      const dot = document.createElement("span");
      dot.className = idx === 0 ? "active" : "";
      dot.dataset.index = idx;
      dotsContainer.appendChild(dot);

      idx++;
    });

    let current = 0;

    function updateCarousel() {
      if (!slides.length) return;
      track.style.transform = `translateX(-${current * 100}%)`;

      const allDots = dotsContainer.querySelectorAll("span");
      allDots.forEach(d => d.classList.remove("active"));
      dotsContainer.querySelector(`span[data-index="${current}"]`)?.classList.add("active");
    }

    // ======================
    // EVENTOS DE BOTONES
    // ======================
    prevBtn.addEventListener("mouseenter", () => {
      hoverSound.currentTime = 0;
      hoverSound.play();
    });
    nextBtn.addEventListener("mouseenter", () => {
      hoverSound.currentTime = 0;
      hoverSound.play();
    });

    prevBtn.onclick = () => {
      slideSound.currentTime = 0;
      slideSound.play();
      current = (current - 1 + slides.length) % slides.length;
      updateCarousel();
    };
    nextBtn.onclick = () => {
      slideSound.currentTime = 0;
      slideSound.play();
      current = (current + 1) % slides.length;
      updateCarousel();
    };

    // ======================
    // DOTS
    // ======================
    dotsContainer.querySelectorAll("span").forEach(dot => {
      dot.addEventListener("click", () => {
        slideSound.currentTime = 0;
        slideSound.play();
        current = parseInt(dot.dataset.index, 10);
        updateCarousel();
      });
    });

    // ======================
    // TECLAS IZQ/DER
    // ======================
    document.addEventListener("keydown", (e) => {
      if (!slides.length) return;

      if (e.key === "ArrowRight") {
        slideSound.currentTime = 0;
        slideSound.play();
        current = (current + 1) % slides.length;
        updateCarousel();
      }
      if (e.key === "ArrowLeft") {
        slideSound.currentTime = 0;
        slideSound.play();
        current = (current - 1 + slides.length) % slides.length;
        updateCarousel();
      }
    });

    updateCarousel();

  } catch (err) {
    console.error("Error cargando votos:", err);
    track.innerHTML = "<p>Error cargando resultados.</p>";
  }
}

// ===============================
//  SONIDO FOOTER + NAVEGACIÓN
// ===============================
// ===============================
//  SONIDOS FOOTER + NAVEGACIÓN
// ===============================
const adminFooterBtn = document.getElementById("footerBtn");
const adminFooterHover = document.getElementById("footer-sound");
const adminFooterClick = document.getElementById("click-sound");

if (adminFooterBtn && adminFooterHover && adminFooterClick) {

  // Sonido al pasar el mouse (hover)
  adminFooterBtn.addEventListener("mouseenter", () => {
    adminFooterHover.currentTime = 0;
    adminFooterHover.play().catch(() => {});
  });

  // Sonido distinto al hacer click
  adminFooterBtn.addEventListener("click", (e) => {
    e.preventDefault(); // evita cortar el sonido

    adminFooterClick.currentTime = 0;
    adminFooterClick.play().catch(() => {});

    setTimeout(() => {
      window.location.href = "index.html";
    }, 300); // tiempo suficiente para escuchar el "click"
  });
}
