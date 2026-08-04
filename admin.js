
const loginBox=document.getElementById("loginBox"),app=document.getElementById("adminApp");
document.getElementById("loginForm").onsubmit=e=>{e.preventDefault();if(document.getElementById("adminPassword").value==="helium2026"){loginBox.hidden=true;app.hidden=false;renderAdmin()}else alert("Mot de passe incorrect")};
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{document.getElementById("vehiclesTab").hidden=b.dataset.tab!=="vehicles";document.getElementById("reviewsTab").hidden=b.dataset.tab!=="reviews"});
function renderAdmin(){
 let vs=getVehicles();document.getElementById("vehicleAdminList").innerHTML=vs.map(v=>`<div class="admin-item"><span>${v.title} — ${v.status}</span><button class="danger" onclick="deleteVehicle(${v.id})">Supprimer</button></div>`).join("");
 let rs=getReviews();document.getElementById("reviewAdminList").innerHTML=rs.map(r=>`<div class="admin-item"><span>${r.name} — ${r.vehicle}</span><button class="danger" onclick="deleteReview(${r.id})">Supprimer</button></div>`).join("");
}
document.getElementById("vehicleForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),v=getVehicles();v.push({id:Date.now(),title:f.get("title"),year:f.get("year"),km:f.get("km"),price:f.get("price"),image:f.get("image")||"car-1.svg",status:f.get("status")});saveVehicles(v);e.target.reset();renderAdmin()};
document.getElementById("reviewForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target),r=getReviews();r.push({id:Date.now(),name:f.get("name"),vehicle:f.get("vehicle"),rating:Number(f.get("rating")),text:f.get("text"),image:f.get("image")||"car-1.svg"});saveReviews(r);e.target.reset();renderAdmin()};
function deleteVehicle(id){saveVehicles(getVehicles().filter(v=>v.id!==id));renderAdmin()}
function deleteReview(id){saveReviews(getReviews().filter(r=>r.id!==id));renderAdmin()}
