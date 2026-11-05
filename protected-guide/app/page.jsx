'use client';
import {useState} from 'react';
export default function Login(){
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');
 async function submit(e){e.preventDefault();setError('');try{const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username,password})});if(!r.ok){setError('Kirjautuminen epäonnistui');return;}location.href='/ohje';}catch{setError('Yhteysvirhe');}}
 return <main style={{maxWidth:380,margin:'12vh auto',fontFamily:'system-ui',padding:24}}><h1>Ziiply – mobiiliohje</h1><p>Kirjaudu omilla tunnuksillasi.</p><form onSubmit={submit}><label>Käyttäjätunnus<input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'8px 0 20px'}}/></label><label>Salasana<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'8px 0 20px'}}/></label><button style={{padding:12,width:'100%'}}>Kirjaudu</button></form><p role="alert">{error}</p></main>;
}
