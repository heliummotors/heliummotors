
const demo={
 title:"Mercedes-Benz AMG",year:"2024",mileage:"18 500",price:null,status:"Disponible",fuel:"Essence",transmission:"Automatique",color:"Noir",history:"Historique et documents disponibles sur demande.",equipment:["Caméra 360°","Sièges cuir","Toit ouvrant","Apple CarPlay","Régulateur adaptatif"],photos:[
 "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=85",
 "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85",
 "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=85",
 "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85",
 "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85"]};
async function loadDetail(){
 const params=new URLSearchParams(location.search),id=params.get("id");let v=demo;
 if(id){try{const {data,error}=await hm.from("vehicles").select("*,vehicle_photos(*),vehicle_equipment(*)").eq("id",id).single();if(!error&&data){v=data;v.photos=(data.vehicle_photos||[]).map(p=>p.image_url);v.equipment=(data.vehicle_equipment||[]).map(x=>x.name)}}catch(e){}}
 document.getElementById("vehicleTitle").textContent=v.title;document.getElementById("detailTitle").textContent=v.title;document.getElementById("vehicleStatus").textContent=v.status||"Disponible";document.getElementById("detailPrice").textContent=v.price?Number(v.price).toLocaleString("fr-FR")+" €":"Prix sur demande";document.getElementById("history").textContent=v.history||"Historique disponible sur demande.";document.getElementById("reserveVehicleId").value=v.id||"demo";
 document.getElementById("specs").innerHTML=[["Année",v.year],["Kilométrage",(v.mileage||"")+" km"],["Motorisation",v.fuel||"À confirmer"],["Boîte",v.transmission||"À confirmer"],["Couleur",v.color||"À confirmer"],["Origine",v.origin||"À confirmer"]].map(x=>`<div class="spec"><small>${x[0]}</small><strong>${x[1]||"—"}</strong></div>`).join("");
 document.getElementById("equipment").innerHTML=(v.equipment||[]).map(x=>`<span>${x}</span>`).join("");
 const photos=(v.photos&&v.photos.length?v.photos:[v.cover_image||demo.photos[0],...demo.photos.slice(1)]);document.getElementById("gallery").innerHTML=photos.slice(0,30).map(p=>`<img src="${p}" alt="${v.title}">`).join("");
}
document.getElementById("reservationForm").onsubmit=async e=>{e.preventDefault();const f=e.target,fd=new FormData(f),payload={};for(const [k,v] of fd.entries())payload[k]=v;payload.deposit_percentage=20;payload.hold_hours=72;payload.status="pending";try{const d=await hmInsert("reservations",payload);await hmNotify("reservation",d[0]);f.reset();showMessage(f,"success","Votre demande de réservation a été transmise. Nous vous contacterons pour confirmer le véhicule et le paiement.")}catch(err){showMessage(f,"error","Erreur : "+err.message)}};
loadDetail();