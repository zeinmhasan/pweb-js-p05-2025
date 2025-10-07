const userData = JSON.parse(localStorage.getItem('user'));
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const recipesContainer = document.getElementById('recipesContainer');
const loadingText = document.getElementById('loadingText');
const categoryFilter = document.getElementById('categoryFilter');
const searchInput = document.getElementById('searchInput');

// Modal element references
const modal = document.getElementById('recipeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalIngredients = document.getElementById('modalIngredients');
const modalInstructions = document.getElementById('modalInstructions');
const closeBtn = document.querySelector('.close-btn');

// Proteksi halaman
// if (!userData) window.location.href = 'index.html';
// userName.textContent = userData.firstName;

// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Fetch data
async function fetchRecipes() {
  try {
    const res = await fetch('https://dummyjson.com/recipes');
    if (!res.ok) throw new Error('Gagal memuat data resep');

    const data = await res.json();
    loadingText.style.display = 'none';

    const recipes = data.recipes;
    renderRecipes(recipes);
    populateCategories(recipes);

    // filter event
    categoryFilter.addEventListener('change', () => applyFilter(recipes));
    searchInput.addEventListener('input', () => applyFilter(recipes));
  } catch (err) {
    loadingText.textContent = err.message;
  }
}

// Render card resep
function renderRecipes(recipes) {
  recipesContainer.innerHTML = '';

  if (recipes.length === 0) {
    recipesContainer.innerHTML = '<p>Tidak ada resep ditemukan.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}">
      <div class="recipe-content">
        <h3 class="recipe-title">${recipe.name}</h3>
        <p class="recipe-meta">
          ⏱️ ${recipe.cookTimeMinutes} menit | 🍽️ ${recipe.servings} porsi | 💪 ${recipe.difficulty}
        </p>
        <p class="ingredients"><strong>Bahan:</strong> ${recipe.ingredients.slice(0,4).join(', ')}...</p>
      </div>
    `;

    // klik card → buka modal detail
    card.addEventListener('click', () => openModal(recipe));
    recipesContainer.appendChild(card);
  });
}

// Isi dropdown kategori
function populateCategories(recipes) {
  const categories = [...new Set(recipes.map(r => r.cuisine))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Filter
function applyFilter(recipes) {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory ? recipe.cuisine === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  renderRecipes(filtered);
}

// ====== MODAL HANDLING ======
function openModal(recipe) {
  modal.style.display = 'flex';
  modalImage.src = recipe.image;
  modalTitle.textContent = recipe.name;
  modalMeta.textContent = `⏱️ ${recipe.cookTimeMinutes} menit | 🍽️ ${recipe.servings} porsi | 💪 ${recipe.difficulty} | ⭐ ${recipe.rating}/5`;

  modalIngredients.innerHTML = '';
  recipe.ingredients.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    modalIngredients.appendChild(li);
  });

  modalInstructions.innerHTML = '';
  recipe.instructions.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    modalInstructions.appendChild(li);
  });
}

// Tutup modal
closeBtn.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
});

// Jalankan
fetchRecipes();
