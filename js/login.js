;(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel)

  // Elements
  const form = $("#login-form")
  // try several selectors, fallback to #email if markup belum diganti
  const usernameEl = $("#username") || document.querySelector('[name="username"]') || $("#email")
  const password = $("#password")
  const remember = $("#remember") || { checked: false }
  const toggle = $(".password__toggle")
  const userErr = $("#username-error") || $("#email-error")
  const pwErr = $("#password-error")
  const toast = $("#toast")

  if (!form || !usernameEl || !password) {
    console.log("[v0] login.js: missing required elements")
    return
  }

  // Prefill username jika pernah disimpan
  const savedUser = localStorage.getItem("recipe_username")
  if (savedUser) {
    usernameEl.value = savedUser
    if (remember && remember.type === "checkbox") remember.checked = true
  }

  // Toggle show/hide password
  if (toggle) {
    toggle.addEventListener("click", () => {
      const showing = password.getAttribute("type") === "text"
      password.setAttribute("type", showing ? "password" : "text")
      toggle.textContent = showing ? "Tampilkan" : "Sembunyikan"
      toggle.setAttribute("aria-label", showing ? "Tampilkan kata sandi" : "Sembunyikan kata sandi")
    })
  }

  function clearErrors() {
    if (userErr) userErr.textContent = ""
    if (pwErr) pwErr.textContent = ""
  }

  // Validasi minimal (biar API yang menilai kredensial)
  function validate() {
    clearErrors()
    let ok = true
    if (!usernameEl.value.trim()) {
      if (userErr) userErr.textContent = "Masukkan username."
      ok = false
    }
    if (!password.value) {
      if (pwErr) pwErr.textContent = "Masukkan kata sandi."
      ok = false
    }
    return ok
  }

  function showToast(msg) {
    if (!toast) {
      console.log("[v0] toast:", msg)
      return
    }
    toast.textContent = msg
    toast.classList.add("show")
    clearTimeout(showToast._t)
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2400)
  }

  const guestBtn = $("#guest")
  if (guestBtn) guestBtn.style.display = "none"
  const signupLink = $("#signup-link")
  if (signupLink) signupLink.style.display = "none"

  form.addEventListener("submit", async (e) => {
    e.preventDefault()
    if (!validate()) return

    const btn = form.querySelector('button[type="submit"]')
    const origText = btn ? btn.textContent : null
    if (btn) {
      btn.disabled = true
      btn.textContent = "Memproses…"
    }

    try {
      const res = await fetch("https://dummyjson.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameEl.value.trim(),
          password: password.value,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        const message = data?.message || "Username atau kata sandi salah."
        if (pwErr) pwErr.textContent = message
        showToast("Gagal masuk")
        return
      }

      // Simpan token & user ringkas
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          name: [data.firstName, data.lastName].filter(Boolean).join(" "),
        }),
      )

      // Remember username optional
      if (remember && remember.checked) localStorage.setItem("recipe_username", usernameEl.value.trim())
      else localStorage.removeItem("recipe_username")

      showToast("Berhasil masuk. Mengarahkan…")
      setTimeout(() => (window.location.href = "app.html"), 800)
    } catch (err) {
      if (pwErr) pwErr.textContent = "Terjadi kesalahan jaringan. Coba lagi."
      console.log("[v0] login error:", err)
      showToast("Gagal masuk")
    } finally {
      if (btn) {
        btn.disabled = false
        btn.textContent = origText
      }
    }
  })

  // Aksesibilitas: ESC hapus pesan error
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") clearErrors()
  })
})()
