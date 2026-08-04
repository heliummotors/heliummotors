
document.getElementById("sellForm").onsubmit=async e=>{
 e.preventDefault();const form=e.target,btn=form.querySelector("button");btn.disabled=true;
 try{
  const fd=new FormData(form),payload={};
  for(const [k,v] of fd.entries()) if(!(v instanceof File)) payload[k]=v;
  payload.status="new";payload.created_at=new Date().toISOString();
  const inserted=await hmInsert("sale_requests",payload);const requestId=inserted[0].id;
  const photos=[...document.getElementById("vehiclePhotos").files];
  for(const file of photos){const path=`${requestId}/photos/${crypto.randomUUID()}-${file.name}`;await hmUpload("private-documents",path,file);await hmInsert("sale_request_documents",{sale_request_id:requestId,document_type:"vehicle_photo",storage_path:path,file_name:file.name})}
  const doc=document.getElementById("registrationDoc").files[0];const path=`${requestId}/registration/${crypto.randomUUID()}-${doc.name}`;await hmUpload("private-documents",path,doc);await hmInsert("sale_request_documents",{sale_request_id:requestId,document_type:"registration_document",storage_path:path,file_name:doc.name});
  await hmNotify("vente_vehicule",inserted[0]);form.reset();showMessage(form,"success","Votre véhicule a bien été transmis pour étude.");
 }catch(err){showMessage(form,"error","Erreur : "+err.message)}finally{btn.disabled=false}
};