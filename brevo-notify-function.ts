
// Supabase Edge Function: notify-request
// Configure secrets: BREVO_API_KEY, ADMIN_NOTIFICATION_EMAIL
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async (req) => {
  const { type, record } = await req.json();
  const apiKey = Deno.env.get("BREVO_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "heliummotors08@gmail.com";
  if (!apiKey) return new Response(JSON.stringify({error:"BREVO_API_KEY missing"}),{status:500});
  const html = `<h2>Nouvelle demande Hélium Motors</h2><p>Type : ${type}</p><pre>${JSON.stringify(record,null,2)}</pre>`;
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method:"POST",
    headers:{"Content-Type":"application/json","api-key":apiKey},
    body:JSON.stringify({
      sender:{name:"Hélium Motors",email:"heliummotors08@gmail.com"},
      to:[{email:adminEmail,name:"Sloane Bohico"}],
      subject:`Nouvelle demande : ${type}`,
      htmlContent:html
    })
  });
  return new Response(await response.text(),{status:response.status,headers:{"Content-Type":"application/json"}});
});
