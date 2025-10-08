const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const loading = document.getElementById("loading");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  message.textContent = "";
  message.classList.remove("show");
  loading.style.display = "block";

  if (!username || !password) {
    loading.style.display = "none";
    message.textContent = "Username dan password wajib diisi!";
    message.style.color = "#e97311";
    message.classList.add("show");
    return;
  }

  try {
    const res = await fetch("https://dummyjson.com/users");
    const data = await res.json();
    const user = data.users.find(u => u.username === username);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      message.textContent = "Login berhasil! Mengarahkan...";
      message.style.color = "#edcb14";
      message.classList.add("show");

      setTimeout(() => {
        window.location.href = "recipes.html";
      }, 1200);
    } else {
      message.textContent = "Username tidak ditemukan.";
      message.style.color = "#e97311";
      message.classList.add("show");
    }
  } catch (err) {
    message.textContent = "Gagal menghubungi server.";
    message.style.color = "#e97311";
    message.classList.add("show");
  } finally {
    loading.style.display = "none";
  }
});