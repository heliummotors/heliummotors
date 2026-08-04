
const login=document.getElementById("login"),dash=document.getElementById("dashboard");
let currentRequests=[];

async function authSession(){
 const {data}=await hm.auth.getSession();
 if(data.session){login.classList.add("hidden");dash.classList.remove("hidden");await refreshAll()}
}
loginForm.onsubmit=async e=>{
 e.preventDefault();
 const {error}=await hm.auth.signInWithPassword({email:loginEmail.value,password:loginPassword.value});
 if(error){const el=e.target.querySelector(".error");el.textContent=error.message;el.style.display="block"}else authSession()
};
logout.onclick=async()=>{await hm.auth.signOut();location.reload()};

document.querySelectorAll("[data-view]").forEach(btn=>btn.onclick=()=>{
 document.querySelectorAll(".view-section").forEach(v=>v.classList.remove("active"));
 document.getElementById(btn.dataset.view).classList.add("active");
 viewTitle.textContent=btn.textContent.replace(/[^\wÀ-ÿ ]/g,"").trim();
});

async function refreshAll(){
 await Promise.all([loadDashboard(),loadVehiclesAdmin(),loadRequests(),loadArticlesAdmin(),loadReviewsAdmin(),loadSoldAdmin(),loadMedia(),loadSettings()]);
}

async function loadDashboard(){
 const tables=["vehicles","contact_messages","brokerage_requests","import_requests","sale_requests","reservations","articles"];
 const counts={};
 for(const t of tables){const {count}=await hm.from(t).select("*",{count:"exact",head:true});counts[t]=count||0}
 kpiVehicles.textContent=counts.vehicles;kpiRequests.textContent=counts.contact_messages+counts.brokerage_requests+counts.import_requests+counts.sale_requests;
 kpiReservations.textContent=counts.reservations;kpiArticles.textContent=counts.articles;
 const chart=[["Contact",counts.contact_messages],["Courtage",counts.brokerage_requests],["Import",counts.import_requests],["Vente",counts.sale_requests],["Réservation",counts.reservations]];
 const max=Math.max(...chart.map(x=>x[1]),1);
 requestChart.innerHTML=chart.map(([n,v])=>`<div class="bar-row"><span>${n}</span><div class="bar"><span style="width:${v/max*100}%"></span></div><b>${v}</b></div>`).join("");
 recentActivity.innerHTML=chart.filter(x=>x[1]>0).map(([n,v])=>`<div class="request-card"><strong>${v} demande(s) ${n}</strong></div>`).join("")||"<p>Aucune activité récente.</p>";
}

let pendingVehicleFiles=[];
vehicleDropzone.onclick=()=>vehicleFiles.click();
vehicleDropzone.ondragover=e=>{e.preventDefault();vehicleDropzone.classList.add("drag")};
vehicleDropzone.ondragleave=()=>vehicleDropzone.classList.remove("drag");
vehicleDropzone.ondrop=e=>{e.preventDefault();vehicleDropzone.classList.remove("drag");setVehicleFiles([...e.dataTransfer.files])};
vehicleFiles.onchange=e=>setVehicleFiles([...e.target.files]);
function setVehicleFiles(files){pendingVehicleFiles=files;vehiclePreview.innerHTML=files.map(f=>`<img src="${URL.createObjectURL(f)}">`).join("")}

vehicleForm.onsubmit=async e=>{
 e.preventDefault();const f=e.target,fd=new FormData(f),p={};
 for(const[k,v]of fd.entries()) if(!["equipment","published","featured"].includes(k)) p[k]=v||null;
 p.published=f.published.checked;p.featured=f.featured.checked;p.slug=(p.title||"vehicle").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 const {data,error}=await hm.from("vehicles").insert(p).select().single();if(error)return alert(error.message);
 const urls=[];
 for(let i=0;i<pendingVehicleFiles.length;i++){const file=pendingVehicleFiles[i],path=`${data.id}/${crypto.randomUUID()}-${file.name}`;const up=await hmUpload("vehicle-images",path,file);const url=await hmPublicUrl("vehicle-images",path);urls.push(url);await hm.from("vehicle_photos").insert({vehicle_id:data.id,image_url:url,sort_order:i})}
 if(urls[0])await hm.from("vehicles").update({cover_image:urls[0]}).eq("id",data.id);
 const eq=(fd.get("equipment")||"").split(",").map(x=>x.trim()).filter(Boolean);if(eq.length)await hm.from("vehicle_equipment").insert(eq.map(name=>({vehicle_id:data.id,name})));
 f.reset();pendingVehicleFiles=[];vehiclePreview.innerHTML="";await loadVehiclesAdmin();await loadDashboard();
};

async function loadVehiclesAdmin(){
 const {data}=await hm.from("vehicles").select("*").order("created_at",{ascending:false});
 vehicleAdminList.innerHTML=(data||[]).map(v=>`<div class="request-card"><header><div><strong>${v.title}</strong><div class="request-meta">${v.year||""} · ${v.mileage||0} km · ${v.status}</div></div><span class="badge ${v.published?'new':'pending'}">${v.published?'Publié':'Brouillon'}</span></header><div class="actions"><button class="btn btn-outline" onclick="togglePublish('${v.id}',${!v.published})">${v.published?'Masquer':'Publier'}</button><button class="btn btn-danger" onclick="removeRow('vehicles','${v.id}')">Supprimer</button></div></div>`).join("");
}
async function togglePublish(id,val){await hm.from("vehicles").update({published:val}).eq("id",id);loadVehiclesAdmin()}
async function removeRow(table,id){if(confirm("Supprimer cet élément ?")){await hm.from(table).delete().eq("id",id);refreshAll()}}

async function loadRequests(){
 const sources=["contact_messages","brokerage_requests","import_requests","sale_requests","reservations"];currentRequests=[];
 for(const source of sources){const {data}=await hm.from(source).select("*").order("created_at",{ascending:false}).limit(50);(data||[]).forEach(r=>currentRequests.push({...r,_source:source}))}
 currentRequests.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));renderRequests();
}
requestFilter.onchange=renderRequests;
function renderRequests(){
 const filter=requestFilter.value,list=filter==="all"?currentRequests:currentRequests.filter(x=>x._source===filter);
 requestList.innerHTML=list.map((r,i)=>`<div class="request-card" onclick="showRequest('${r._source}','${r.id}')"><header><div><strong>${r.full_name||r.owner_name||r.email||"Demande"}</strong><div class="request-meta">${r._source} · ${new Date(r.created_at).toLocaleString("fr-FR")}</div></div><span class="badge ${r.status==="new"?"new":"pending"}">${r.status||"new"}</span></header><p>${r.message||r.vehicle_query||r.make_model||""}</p></div>`).join("")||"<p>Aucune demande.</p>";
}
function showRequest(source,id){
 const r=currentRequests.find(x=>x._source===source&&x.id===id);if(!r)return;
 clientPanel.innerHTML=`<h3>${r.full_name||r.owner_name||"Client"}</h3><p>${r.email||""}<br>${r.phone||""}</p><pre style="white-space:pre-wrap;color:#bbb">${JSON.stringify(r,null,2)}</pre><textarea id="internalNote" placeholder="Note interne"></textarea><button class="btn btn-gold" onclick="createClientFromRequest('${source}','${id}')">Créer / mettre à jour la fiche client</button>`;
}
async function createClientFromRequest(source,id){
 const r=currentRequests.find(x=>x._source===source&&x.id===id),note=internalNote.value;
 const payload={full_name:r.full_name||r.owner_name,email:r.email,phone:r.phone,source,status:"prospect",last_contact_at:new Date().toISOString(),notes:note};
 const {data:existing}=await hm.from("clients").select("*").eq("email",r.email).maybeSingle();
 if(existing)await hm.from("clients").update(payload).eq("id",existing.id);else await hm.from("clients").insert(payload);
 alert("Fiche client enregistrée.");
}

articleForm.onsubmit=e=>{e.preventDefault();saveGenericForm(e.target,"articles")};
reviewForm.onsubmit=e=>{e.preventDefault();saveGenericForm(e.target,"reviews")};
soldForm.onsubmit=e=>{e.preventDefault();saveGenericForm(e.target,"sold_vehicles")};
async function saveGenericForm(form,table){
 const fd=new FormData(form),p={};for(const[k,v]of fd.entries())p[k]=v;
 if(form.published)p.published=form.published.checked;
 if(table==="articles"){p.slug=(p.title||"article").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");if(p.published)p.published_at=new Date().toISOString()}
 if(table==="reviews")p.rating=Number(p.rating);
 const {error}=await hm.from(table).insert(p);if(error)alert(error.message);else{form.reset();refreshAll()}
}

async function loadArticlesAdmin(){const{data}=await hm.from("articles").select("*").order("created_at",{ascending:false});articleAdminList.innerHTML=(data||[]).map(x=>`<div class="request-card"><strong>${x.title}</strong><div>${x.published?"Publié":"Brouillon"}</div><button class="btn btn-danger" onclick="removeRow('articles','${x.id}')">Supprimer</button></div>`).join("")}
async function loadReviewsAdmin(){const{data}=await hm.from("reviews").select("*").order("created_at",{ascending:false});reviewAdminList.innerHTML=(data||[]).map(x=>`<div class="request-card"><strong>${x.client_name}</strong><div>${"★".repeat(x.rating||0)}</div><p>${x.content}</p><button class="btn btn-danger" onclick="removeRow('reviews','${x.id}')">Supprimer</button></div>`).join("")}
async function loadSoldAdmin(){const{data}=await hm.from("sold_vehicles").select("*").order("created_at",{ascending:false});soldAdminList.innerHTML=(data||[]).map(x=>`<div class="request-card"><strong>${x.title}</strong><div>${x.destination||""}</div><button class="btn btn-danger" onclick="removeRow('sold_vehicles','${x.id}')">Supprimer</button></div>`).join("")}

mediaDropzone.onclick=()=>mediaFiles.click();mediaDropzone.ondragover=e=>e.preventDefault();mediaDropzone.ondrop=e=>{e.preventDefault();uploadMedia([...e.dataTransfer.files])};mediaFiles.onchange=e=>uploadMedia([...e.target.files]);
async function uploadMedia(files){
 for(const file of files){const path=`library/${crypto.randomUUID()}-${file.name}`;await hmUpload("vehicle-images",path,file);const url=await hmPublicUrl("vehicle-images",path);await hm.from("media_library").insert({file_name:file.name,file_url:url,bucket:"vehicle-images",file_type:file.type,size_bytes:file.size})}
 loadMedia();
}
async function loadMedia(){const{data}=await hm.from("media_library").select("*").order("created_at",{ascending:false});mediaLibrary.innerHTML=(data||[]).map(x=>`<img src="${x.file_url}" title="${x.file_name}" onclick="navigator.clipboard.writeText('${x.file_url}');alert('URL copiée')">`).join("")}

contactSettings.onsubmit=e=>{e.preventDefault();saveSettings("contact",e.target)};
statsSettings.onsubmit=e=>{e.preventDefault();saveSettings("stats",e.target)};
async function saveSettings(key,form){const fd=new FormData(form),value={};for(const[k,v]of fd.entries())value[k]=isNaN(v)||v===""?v:Number(v);await hm.from("site_settings").upsert({setting_key:key,setting_value:value,updated_at:new Date().toISOString()},{onConflict:"setting_key"});alert("Paramètres enregistrés")}
async function loadSettings(){const{data}=await hm.from("site_settings").select("*");for(const s of data||[]){const form=s.setting_key==="contact"?contactSettings:s.setting_key==="stats"?statsSettings:null;if(form)Object.entries(s.setting_value||{}).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v})}}

function closeModal(){modal.classList.remove("open")}
authSession();
