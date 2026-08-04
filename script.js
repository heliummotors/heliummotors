
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

menuButton.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

document.getElementById("year").textContent = new Date().getFullYear();

const toast = document.getElementById("toast");
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
  e.target.reset();
});

document.getElementById("searchButton").addEventListener("click", () => {
  document.getElementById("vehicules").scrollIntoView({behavior:"smooth"});
});
