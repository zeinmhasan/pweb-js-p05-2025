// ---- recipe.js ----
const userData = JSON.parse(localStorage.getItem("auth_user"));
const token = localStorage.getItem("auth_token");
const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const recipesContainer = document.getElementById("recipesContainer");
const loadingText = document.getElementById("loadingText");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

// Pager elements
const pager = document.getElementById("pager");
const prevBtn = document.getElementById("prevBtn");
const moreBtn = document.getElementById("moreBtn");
const pageInfo = document.getElementById("pageInfo");

// Modal element references
const modal = document.getElementById("recipeModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalIngredients = document.getElementById("modalIngredients");
const modalInstructions = document.getElementById("modalInstructions");
const closeBtn = document.querySelector(".close-btn");

// Proteksi halaman
if (!userData || !token) {
  window.location.href = "./login.html";
} else {
  // Ambil firstName langsung jika ada; kalau tidak, ambil kata pertama dari "name".
  // Terakhir fallback ke potongan pertama dari username.
  const firstNameOnly =
    (userData.firstName && String(userData.firstName).trim()) ||
    (userData.name && String(userData.name).trim().split(/\s+/)[0]) ||
    (userData.username && String(userData.username).split(/[._-]/)[0]) ||
    "User";

  userName.textContent = firstNameOnly;
}


// Logout: hapus keduanya
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
  window.location.href = "./login.html";
});

// ====== STATE PAGINATION & DATA ======
let allRecipes = [];         // semua resep dari API
let filteredRecipes = [];    // hasil filter & search
let currentPage = 1;         // halaman sekarang (mulai 1)
const pageSize = 8;          // jumlah kartu per halaman (ubah sesuka hati)

// ====== FETCH DATA RESEP ======
async function fetchRecipes() {
  try {
    loadingText.style.display = "block";
    loadingText.textContent = "Memuat resep...";

    const res = await fetch("https://dummyjson.com/recipes");
    if (!res.ok) throw new Error("Gagal memuat data resep");

    const data = await res.json();
    loadingText.style.display = "none";

    allRecipes = data.recipes || [];
    // init: filteredRecipes = all
    filteredRecipes = [...allRecipes];

    populateCategories(allRecipes);
    attachFilterHandlers();

    // render halaman pertama
    currentPage = 1;
    renderCurrentPage();
  } catch (err) {
    loadingText.style.display = "block";
    loadingText.textContent = err.message || "Terjadi kesalahan saat memuat data.";
  }
}

// ====== RENDER HALAMAN BERDASARKAN currentPage & filteredRecipes ======
function renderCurrentPage() {
  recipesContainer.innerHTML = "";

  if (!filteredRecipes.length) {
    pager.style.display = "none";
    recipesContainer.innerHTML = "<p>Tidak ada resep ditemukan.</p>";
    return;
  }

  const totalPages = Math.ceil(filteredRecipes.length / pageSize);
  // clamp currentPage agar aman
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredRecipes.slice(start, end);

  renderRecipes(pageItems);
  updatePager(totalPages);
}

// ====== RENDER KARTU RESEP (untuk list yang disediakan) ======
function renderRecipes(recipes) {
  recipesContainer.innerHTML = "";

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.name}</h3>
        <p class="recipe-meta">
          ⏱️ ${recipe.cookTimeMinutes} menit | 🍽️ ${recipe.servings} porsi | 💪 ${recipe.difficulty}
        </p>
        <p class="ingredients"><strong>Bahan:</strong> ${recipe.ingredients.slice(0, 4).join(", ")}...</p>
      </div>
    `;

    // Klik card → buka modal detail
    card.addEventListener("click", () => openModal(recipe));
    recipesContainer.appendChild(card);
  });
}

// ====== PAGER UI (Back / Show more) ======
function updatePager(totalPages) {
  // tampilkan pager hanya jika butuh (lebih dari 1 halaman)
  if (totalPages > 1) {
    pager.style.display = "flex";
  } else {
    pager.style.display = "none";
  }

  pageInfo.textContent = `${currentPage} / ${totalPages}`;
  prevBtn.disabled = currentPage <= 1;
  moreBtn.disabled = currentPage >= totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderCurrentPage();
  }
});

moreBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredRecipes.length / pageSize);
  if (currentPage < totalPages) {
    currentPage++;
    renderCurrentPage();
  }
});

// ====== FILTER & SEARCH ======
function attachFilterHandlers() {
  categoryFilter.addEventListener("change", () => applyFilter());
  searchInput.addEventListener("input", () => applyFilter());
}

// Isi dropdown kategori (berdasarkan cuisine)
function populateCategories(recipes) {
  // kosongkan dulu kecuali "Semua"
  categoryFilter.innerHTML = `<option value="">Semua</option>`;
  const categories = [...new Set(recipes.map((r) => r.cuisine))].sort();

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function applyFilter() {
  const searchTerm = (searchInput.value || "").toLowerCase();
  const selectedCategory = categoryFilter.value;

  filteredRecipes = allRecipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory ? recipe.cuisine === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Setel ulang ke halaman pertama setiap kali filter/search berubah
  currentPage = 1;
  renderCurrentPage();
}

// ====== MODAL HANDLING ======
function openModal(recipe) {
  modal.style.display = "flex";
  modalImage.src = recipe.image;
  modalImage.alt = recipe.name;
  modalTitle.textContent = recipe.name;
  modalMeta.textContent = `⏱️ ${recipe.cookTimeMinutes} menit | 🍽️ ${recipe.servings} porsi | 💪 ${recipe.difficulty} | ⭐ ${recipe.rating}/5`;

  // Ingredients
  modalIngredients.innerHTML = "";
  recipe.ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    modalIngredients.appendChild(li);
  });

  // Instructions
  modalInstructions.innerHTML = "";
  recipe.instructions.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    modalInstructions.appendChild(li);
  });
}

// Tutup modal
closeBtn.addEventListener("click", () => (modal.style.display = "none"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Jalankan
fetchRecipes();
