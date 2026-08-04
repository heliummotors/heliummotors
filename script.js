
document.querySelectorAll("[data-year]").forEach(el=>el.textContent=new Date().getFullYear());
const menu=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav");
if(menu){menu.onclick=()=>nav.classList.toggle("open")}

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

const launcher=document.getElementById("chatLauncher"),panel=document.getElementById("chatPanel"),close=document.getElementById("chatClose");
if(launcher){launcher.onclick=()=>panel.classList.toggle("open");close.onclick=()=>panel.classList.remove("open");
document.getElementById("chatForm").onsubmit=e=>{e.preventDefault();let i=document.getElementById("chatInput");if(!i.value.trim())return;
let m=document.createElement("div");m.className="message user";m.textContent=i.value;document.getElementById("chatMessages").appendChild(m);i.value="";
setTimeout(()=>{let a=document.createElement("div");a.className="message agent";a.textContent="Merci. Un conseiller vous répondra dès que le service de chat sera connecté.";document.getElementById("chatMessages").appendChild(a)},600)}}

function renderVehicles(targetId="vehicleGrid"){
 const box=document.getElementById(targetId);if(!box)return;
 box.innerHTML=getVehicles().map(v=>`<article class="vehicle-card reveal visible">
 <img src="${v.image}" alt="${v.title}"><div class="vehicle-body"><small>${v.status} · ${v.year} · ${v.km}</small>
 <h3>${v.title}</h3><p class="vehicle-price">${v.price}</p><a href="contact.html">Demander le dossier →</a></div></article>`).join("");
}
function renderReviews(targetId="reviewGrid"){
 const box=document.getElementById(targetId);if(!box)return;
 const reviews=getReviews();
 box.innerHTML=reviews.map(r=>`<article class="review-card reveal visible"><img class="review-photo" src="${r.image}" alt="${r.vehicle}">
 <div class="review-body"><div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</div>
 <blockquote>« ${r.text} »</blockquote><div class="review-meta">${r.name} · ${r.vehicle}</div></div></article>`).join("");
 const avg=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0;
 document.querySelectorAll("[data-rating]").forEach(el=>el.textContent=avg.toFixed(1).replace(".",",")+"/5");
}
document.addEventListener("DOMContentLoaded",()=>{renderVehicles();renderReviews()});
