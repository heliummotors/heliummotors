
async function loadPublicReviews(){
 const box=document.getElementById("publicReviews");if(!box)return;
 const {data}=await hm.from("reviews").select("*").eq("published",true).order("created_at",{ascending:false});
 box.innerHTML=(data||[]).map(r=>`<article class="card"><div style="color:#e5bd70">${"★".repeat(r.rating||0)}</div><p>« ${r.content} »</p><strong>${r.client_name}</strong><small>${r.vehicle_name||""}</small></article>`).join("")||"<p>Les premiers avis seront publiés prochainement.</p>";
}
document.addEventListener("DOMContentLoaded",loadPublicReviews);
