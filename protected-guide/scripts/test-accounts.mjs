import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const dir=mkdtempSync(join(tmpdir(),'ziiply-guide-test-'));
try {
 const result=spawnSync(process.execPath,['scripts/generate-accounts.mjs',dir],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const rows=readFileSync(join(dir,'ziiply-406-credentials.csv'),'utf8').trim().split(/\r?\n/);
 assert.equal(rows.length,407);
 assert.equal(rows[0],'ryhma,kayttajatunnus,salasana');
 const users=new Set(),passwords=new Set();
 for(let i=1;i<rows.length;i++){
  const [role,user,password]=rows[i].split(',');
  assert.equal(role,i<=6?'media':'beta');
  assert.equal(user,i<=6?'media'+i:'beta'+String(i-6).padStart(3,'0'));
  assert.match(password,/^[A-Za-z0-9_-]{32}$/);
  assert(!users.has(user));assert(!passwords.has(password));
  users.add(user);passwords.add(password);
 }
 assert.equal(users.size,406);assert.equal(passwords.size,406);
 console.log('PASS: 6 media + 400 beta accounts; unique strong passwords; no credentials printed');
}finally{rmSync(dir,{recursive:true,force:true});}
