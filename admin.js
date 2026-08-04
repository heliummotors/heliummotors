
const login=document.getElementById("login"),dash=document.getElementById("dashboard");
async function session(){const {data}=await hm.auth.getSession();if(data.session){login.classList.add("hidden");dash.classList.remove("hidden");loadAll()}}
document.getElementById("loginForm").onsubmit=async e=>{e.preventDefault();const {error}=await hm.auth.signInWithPassword({email:loginEmail.value,password:loginPassword.value});if(error){const el=e.target.querySelector(".error");el.textContent=error.message;el.style.display="block"}else session()};
document.getElementById("logout").onclick=async()=>{await hm.auth.signOut();location.reload()};
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{["vehicles","requests","articles","sold"].forEach(x=>document.getElementById(x+"View").classList.toggle("hidden",x!==b.dataset.view))});
async function addForm(form,table){const fd=new FormData(form),p={};for(const[k,v]of fd.entries())p[k]=v;if(form.querySelector('[name=published]'))p.published=form.querySelector('[name=published]').checked;const{error}=await hm.from(table).insert(p);if(error)alert(error.message);else{form.reset();loadAll()}}
vehicleForm.onsubmit=e=>{e.preventDefault();addForm(e.target,"vehicles")};articleForm.onsubmit=e=>{e.preventDefault();const t=e.target;t.querySelector('[name=published]').checked&&(new FormData(t).set("published_at",new Date().toISOString()));addForm(t,"articles")};soldForm.onsubmit=e=>{e.preventDefault();addForm(e.target,"sold_vehicles")};
async function loadAll(){
 const {data:v}=await hm.from("vehicles").select("*").order("created_at",{ascending:false});vehicleRows.innerHTML=(v||[]).map(x=>`<tr><td>${x.title}</td><td>${x.status}</td><td>${x.published?"Publié":"Brouillon"}</td><td><button class="btn btn-danger" onclick="del('vehicles','${x.id}')">Supprimer</button></td></tr>`).join("");
 const {data:a}=await hm.from("articles").select("*").order("created_at",{ascending:false});articleRows.innerHTML=(a||[]).map(x=>`<tr><td>${x.title}</td><td>${x.published?"Publié":"Brouillon"}</td><td><button class="btn btn-danger" onclick="del('articles','${x.id}')">Supprimer</button></td></tr>`).join("");
 const tables=["contact_messages","brokerage_requests","import_requests","sale_requests","reservations"];let html="";
 for(const t of tables){const{data}=await hm.from(t).select("*").order("created_at",{ascending:false}).limit(20);html+=`<h3>${t}</h3><table class="table">${(data||[]).map(r=>`<tr><td>${r.full_name||r.owner_name||r.email||"Demande"}</td><td>${r.phone||""}</td><td>${new Date(r.created_at).toLocaleString("fr-FR")}</td></tr>`).join("")}</table>`}requestTables.innerHTML=html;
}
async function del(t,id){if(confirm("Supprimer ?")){await hm.from(t).delete().eq("id",id);loadAll()}}
session();
