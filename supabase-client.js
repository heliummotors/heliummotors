
const hm = window.supabase.createClient(HM_CONFIG.SUPABASE_URL, HM_CONFIG.SUPABASE_ANON_KEY);

async function hmInsert(table, payload){
  const {data,error}=await hm.from(table).insert(payload).select();
  if(error) throw error;
  return data;
}
async function hmSelect(table, options={}){
  let q=hm.from(table).select(options.select||"*");
  if(options.eq) Object.entries(options.eq).forEach(([k,v])=>q=q.eq(k,v));
  if(options.order) q=q.order(options.order,{ascending:options.ascending??false});
  if(options.limit) q=q.limit(options.limit);
  const {data,error}=await q;if(error) throw error;return data;
}
async function hmUpload(bucket, path, file){
  const {data,error}=await hm.storage.from(bucket).upload(path,file,{upsert:false});
  if(error) throw error;return data;
}
async function hmPublicUrl(bucket,path){
  return hm.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
async function hmNotify(type,record){
  try{
    await hm.functions.invoke("notify-request",{body:{type,record}});
  }catch(e){console.warn("Notification email non disponible",e)}
}
