import pg from 'pg';
const { Pool } = pg;
let pool;
const getPool = () => { if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing'); return pool ??= new Pool({ connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}, max:3 }); };
const allowedInterests = new Set(['prices','cart','recipes','fuel','family','nutrition']);
const allowedDevices = new Set(['current','other','both']);
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({error:'method_not_allowed'});
  if (process.env.BETA_REGISTRATION_ENABLED !== 'true') return res.status(503).json({error:'registration_not_enabled'});
  let client;
  try {
    client=await getPool().connect();
    if(req.method==='GET'){
      const result=await client.query('SELECT profile_key,label_fi,description_fi,quota,occupied,available,waitlisted FROM public.ziiply_beta_profile_availability ORDER BY display_order');
      return res.status(200).json({profiles:result.rows});
    }
    const b=req.body||{};
    const email=String(b.email||'').trim().toLowerCase();
    const municipality=String(b.municipality||'').trim();
    const profile=String(b.profile_key||'');
    const device=String(b.device_choice||'current');
    const interests=Array.isArray(b.interests)?[...new Set(b.interests)].filter(x=>allowedInterests.has(x)):[];
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!municipality||municipality.length>120||!allowedDevices.has(device)||b.privacy_consent!==true)
      return res.status(400).json({error:'invalid_input'});
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[profile]);
    const p=await client.query('SELECT quota FROM public.ziiply_beta_profiles WHERE profile_key=$1 AND is_active=true FOR UPDATE',[profile]);
    if(!p.rowCount){await client.query('ROLLBACK');return res.status(400).json({error:'invalid_profile'});}
    const existing=await client.query('SELECT 1 FROM public.ziiply_beta_applications WHERE lower(btrim(email))=$1',[email]);
    if(existing.rowCount){await client.query('ROLLBACK');return res.status(409).json({error:'already_registered'});}
    const occupied=await client.query("SELECT count(*)::integer AS n FROM public.ziiply_beta_applications WHERE profile_key=$1 AND status IN ('registered','invited','active')",[profile]);
    const status=occupied.rows[0].n<p.rows[0].quota?'registered':'waitlist';
    await client.query(`INSERT INTO public.ziiply_beta_applications(email,municipality,profile_key,interests,detected_os,detected_browser,detected_device_type,device_choice,other_device_os,status,privacy_consent_at)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())`,[email,municipality,profile,interests,String(b.detected_os||'').slice(0,80),String(b.detected_browser||'').slice(0,80),String(b.detected_device_type||'').slice(0,80),device,String(b.other_device_os||'').slice(0,80),status]);
    await client.query('COMMIT');
    return res.status(201).json({status});
  }catch(e){if(client)await client.query('ROLLBACK').catch(()=>{});console.error('beta API error',e.message);return res.status(500).json({error:'server_error'});}
  finally{client?.release();}
}