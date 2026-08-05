
document.querySelectorAll("[data-year]").forEach(e=>e.textContent=new Date().getFullYear());
const menu=document.querySelector(".menu"),nav=document.querySelector(".nav");if(menu)menu.onclick=()=>nav.classList.toggle("open");

const waText=encodeURIComponent(`Bonjour,

Je souhaite obtenir des informations concernant les services proposés par Hélium Motors.

Je vous contacte au sujet de :
- L'achat d'un véhicule
- L'importation d'un véhicule
- La vente de mon véhicule
- La recherche d'un véhicule sur demande
- Un autre service

Merci de me contacter afin de m'accompagner dans mon projet.`);
document.querySelectorAll("[data-whatsapp]").forEach(a=>a.href=`https://wa.me/${HM_CONFIG.WHATSAPP_NUMBER}?text=${waText}`);

const cookie=document.getElementById("cookieBanner");
if(cookie && !localStorage.getItem("hm_cookie_choice")) cookie.style.display="flex";
document.querySelectorAll("[data-cookie]").forEach(b=>b.onclick=()=>{localStorage.setItem("hm_cookie_choice",b.dataset.cookie);cookie.style.display="none"});

function showMessage(form,type,text){
 const el=form.querySelector(type==="success"?".success":".error");if(el){el.textContent=text;el.style.display="block"}
}
async function submitSimpleForm(form,table,type){
 const submit=form.querySelector("button[type=submit]");submit.disabled=true;
 try{
  const fd=new FormData(form),payload={};
  for(const [k,v] of fd.entries()) if(!(v instanceof File)) payload[k]=v;
  payload.created_at=new Date().toISOString();payload.status="new";
  const data=await hmInsert(table,payload);await hmNotify(type,data?.[0]||payload);
  form.reset();showMessage(form,"success","Merci. Votre demande a bien été transmise à Hélium Motors.");
 }catch(e){showMessage(form,"error","Une erreur est survenue : "+e.message)}
 finally{submit.disabled=false}
}
document.querySelectorAll("form[data-table]").forEach(form=>form.onsubmit=e=>{e.preventDefault();submitSimpleForm(form,form.dataset.table,form.dataset.type||form.dataset.table)});

async function loadVehicles(){
 const grid=document.getElementById("vehicleGrid");if(!grid)return;
 try{
  const list=await hmSelect("vehicles",{eq:{published:true},order:"created_at"});
  if(!list.length) throw new Error("empty");
  grid.innerHTML=list.map(v=>`<article class="vehicle-card"><img src="${v.cover_image||'hero-showroom.jpg'}" alt="${v.title}"><div class="vehicle-body"><span class="status">${v.status||'Disponible'}</span><h3>${v.title}</h3><small>${v.year||''} · ${v.mileage||''} km</small><p class="price">${v.price?Number(v.price).toLocaleString('fr-FR')+' €':'Prix sur demande'}</p><a class="btn btn-outline" href="vehicule.html?id=${v.id}">Voir le véhicule</a></div></article>`).join("");
 }catch(e){
  grid.innerHTML=`<article class="vehicle-card"><img src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85"><div class="vehicle-body"><span class="status">Exemple</span><h3>Mercedes-Benz AMG</h3><small>2024 · 18 500 km</small><p class="price">Prix sur demande</p><a class="btn btn-outline" href="vehicule.html?demo=1">Voir le véhicule</a></div></article>
  <article class="vehicle-card"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85"><div class="vehicle-body"><span class="status">Exemple</span><h3>Porsche 911</h3><small>2023 · 24 000 km</small><p class="price">Prix sur demande</p><a class="btn btn-outline" href="vehicule.html?demo=2">Voir le véhicule</a></div></article>
  <article class="vehicle-card"><img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85"><div class="vehicle-body"><span class="status">Exemple</span><h3>Véhicule premium</h3><small>Sur recherche</small><p class="price">Prix sur demande</p><a class="btn btn-outline" href="courtage.html">Confier une recherche</a></div></article>`;
 }
}
async function loadSold(){
 const grid=document.getElementById("soldGrid");if(!grid)return;
 try{
  const list=await hmSelect("sold_vehicles",{eq:{published:true},order:"sold_at"});
  grid.innerHTML=list.map(v=>`<article class="vehicle-card"><img src="${v.image_url||'hero-showroom.jpg'}"><div class="vehicle-body"><span class="status">Vendu</span><h3>${v.title}</h3><small>${v.destination||'France'} · ${v.sold_at||''}</small></div></article>`).join("");
 }catch(e){grid.innerHTML="<p>Les premières livraisons seront publiées prochainement.</p>"}
}
async function loadArticles(){
 const grid=document.getElementById("articleGrid");if(!grid)return;
 try{
  const list=await hmSelect("articles",{eq:{published:true},order:"published_at"});
  grid.innerHTML=list.map(a=>`<article class="article-card"><img src="${a.cover_image||'hero-showroom.jpg'}"><div class="article-body"><small>${a.category||'Conseils'}</small><h3>${a.title}</h3><p>${a.excerpt||''}</p><a href="article.html?id=${a.id}">Lire l'article →</a></div></article>`).join("");
 }catch(e){grid.innerHTML="<p>Les premiers articles Hélium Motors seront publiés prochainement.</p>"}
}
document.addEventListener("DOMContentLoaded",()=>{loadVehicles();loadSold();loadArticles()});


// Improved responsive navigation
document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 980 && nav) nav.classList.remove("open");
  });
});
