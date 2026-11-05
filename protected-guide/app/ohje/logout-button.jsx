'use client';
export default function LogoutButton(){
 async function logout(){
  const response=await fetch('/api/logout',{method:'POST',cache:'no-store'});
  if(response.ok) window.location.replace('/');
 }
 return <button type="button" onClick={logout}>Kirjaudu ulos</button>;
}
