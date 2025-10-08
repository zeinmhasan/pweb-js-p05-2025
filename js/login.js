// ---- login.js ----
const form = document.getElementById("loginForm");
const message = document.getElementById("message");
const loading = document.getElementById("loading");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Toggle password: pasang SEKALI, di luar submit handler
togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.textContent = type === "password" ? "🫣" : "😌";
});

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
    const res = await fetch("https://dummyjson.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login gagal");
    }

    const data = await res.json();
    // Simpan objek user ke localStorage (key: 'user')
    const user = {
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      token: data.token,
    };
    localStorage.setItem("user", JSON.stringify(user));

    message.textContent = "Login berhasil! Mengarahkan...";
    message.style.color = "#edcb14";
    message.classList.add("show");

    setTimeout(() => {
      // Pakai path relatif agar aman di subfolder (mis. GitHub Pages)
      window.location.href = "./recipe.html";
    }, 1200);
  } catch (err) {
    message.textContent = err.message || "Gagal menghubungi server.";
    message.style.color = "#e97311";
    message.classList.add("show");
  } finally {
    loading.style.display = "none";
  }
});
