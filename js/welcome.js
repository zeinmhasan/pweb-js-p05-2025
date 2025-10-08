;(() => {
  const slidesEl = document.getElementById("slides")
  const yearEl = document.getElementById("year")
  if (yearEl) yearEl.textContent = new Date().getFullYear()

 
const IMAGES = [
  "https://i.pinimg.com/736x/48/a9/74/48a9742a6ca340599dc847272c028874.jpg", 
  "https://i.pinimg.com/736x/6a/5c/c4/6a5cc4233a7ea04c86817f9424814387.jpg",
  "https://i.pinimg.com/736x/59/8f/38/598f384b9f3a3759f47f607f905bddd4.jpg",
  "https://i.pinimg.com/1200x/01/df/f8/01dff8ba20d3248fb02142eb9ec214e8.jpg",
];


  const els = IMAGES.map((src, i) => {
    const img = new Image()
    img.src = src
    img.alt = "Foto masakan " + (i + 1)
    img.decoding = "async"
    img.loading = "eager"
    img.onerror = function () {
      this.src = ""
    }
    if (i === 0) img.classList.add("active")
    slidesEl.appendChild(img)
    return img
  })

  let idx = 0
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  let timer = null
  function show(i) {
    els[idx].classList.remove("active")
    idx = (i + els.length) % els.length
    els[idx].classList.add("active")
  }
  function next() {
    show(idx + 1)
  }
  function prev() {
    show(idx - 1)
  }
  function auto() {
    if (reduceMotion) return
    clearInterval(timer)
    timer = setInterval(next, 5000)
  }
  auto()

  const nextBtn = document.getElementById("next")
  const prevBtn = document.getElementById("prev")
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      next()
      auto()
    })
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      prev()
      auto()
    })

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      next()
      auto()
    }
    if (e.key === "ArrowLeft") {
      prev()
      auto()
    }
  })

  // Search → go to main app with query
  const form = document.getElementById("search-form")
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      const q = new FormData(form).get("q") || ""
      const url = "app.html" + (q ? "?q=" + encodeURIComponent(q) : "")
      window.location.href = url
    })
  }
})()
