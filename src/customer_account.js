(function(){
  'use strict';
  const auth=firebase.auth(), raw=firebase.database();
  const mandatory=!!document.getElementById('tab-about');
  let current=null, profile={}, registering=false, loadedUid='', signup=true;
  const cacheKeys=['cng_name','cng_phone','cng_car','cng_customer_avatar','cng_last_order','cng_notifs'];
  function clearCache(){cacheKeys.forEach(k=>localStorage.removeItem(k));}
  const style=document.createElement('style');style.textContent=`
  #cngAccount{position:fixed;inset:0;z-index:2147483000;background:rgba(18,24,33,.7);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto;font-family:Arial,sans-serif;color:#17202e}#cngAccount[hidden],#cngAccount [hidden]{display:none!important}#cngAccount .cng-account-card{background:#fff;width:100%;max-width:420px;max-height:90dvh;overflow:auto;border-radius:24px;padding:24px;box-shadow:0 20px 70px #0004;box-sizing:border-box}#cngAccount h2{margin:0 0 8px;font-size:23px}#cngAccount p{font-size:13px;color:#687184;line-height:1.6}#cngAccount label{display:block;font-size:12px;font-weight:700;margin-top:14px}#cngAccount input{width:100%;padding:12px;margin-top:6px;border:1px solid #dfe3e8;border-radius:12px;box-sizing:border-box;font-size:16px;background:#fff;color:#17202e}#cngAccount button,.cng-account-entry{border:0;border-radius:12px;padding:11px 16px;cursor:pointer;font-family:inherit;font-weight:700}#cngAccount button[type=submit]{background:#ed841a;color:white;width:100%;margin-top:18px}#cngAccount button:disabled{opacity:.55;cursor:wait}#cngAccount .account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}#cngAccount .account-actions button{background:#f1f3f6;color:#334155}#cngAccountError{color:#bd2727!important;min-height:20px}#cngAccountAvatar{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#fff2e5}.cng-account-entry{background:#fff2e5;color:#ae5300;margin:8px;position:relative;z-index:50}#cngAccount input[readonly]{background:#f4f5f7;color:#64748b}`;
  document.head.appendChild(style);
  const box=document.createElement('div');box.id='cngAccount';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Customer account');
  box.innerHTML=`<div class="cng-account-card"><h2 id="cngAccountTitle">Cup And Go</h2><p id="cngAccountIntro">Checking your account…</p><form id="cngAccountForm"><label id="cngAccountNameLabel">Name<input id="cngAccountName" maxlength="100" autocomplete="name"></label><label>Email<input id="cngAccountEmail" type="email" required maxlength="254" autocomplete="email"></label><label id="cngAccountPasswordLabel">Password<input id="cngAccountPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" required></label><div id="cngAccountDetails" hidden><img id="cngAccountAvatar" alt="Your profile photo"><label>Profile photo<input id="cngAccountPhoto" type="file" accept="image/jpeg,image/png,image/webp"></label><label>Mobile (optional)<input id="cngAccountPhone" type="tel" maxlength="30" autocomplete="tel"></label><label>Car number (optional)<input id="cngAccountCar" maxlength="40"></label></div><p id="cngAccountError" role="status" aria-live="polite"></p><button type="submit" id="cngAccountSubmit" disabled>Please wait…</button></form><div class="account-actions"><button id="cngAccountToggle" type="button">Already have an account? Sign in</button><button id="cngAccountReset" type="button">Forgot password?</button><button id="cngAccountLogout" type="button" hidden>Sign out</button><button id="cngAccountClose" type="button" hidden>Close</button></div></div>`;
  document.body.appendChild(box);
  const el=id=>document.getElementById('cngAccount'+id);
  function message(s){el('Error').textContent=s;}
  function errorMessage(e){return({'auth/weak-password':'Use a stronger password (at least 8 characters).','auth/invalid-email':'Enter a valid email address.','auth/network-request-failed':'Check your internet connection and try again.','auth/too-many-requests':'Too many attempts. Please wait and try again.','auth/email-already-in-use':'Unable to create this account. Try signing in or resetting your password.','auth/operation-not-allowed':'Sign-in is not available yet. Please contact the shop.'})[e.code]||'Unable to sign in or save. Check your details and try again.';}
  function mode(){
    const signed=!!current;el('Title').textContent=signed?'Your profile':signup?'Create your account':'Welcome back';el('Intro').textContent=signed?'Your name and photo are saved to your account.':'Create an account with your name, email and password. Sign in with email and password next time.';
    el('NameLabel').hidden=!signed&&!signup;el('Name').required=signed||signup;el('PasswordLabel').hidden=signed;el('Password').required=!signed;el('Password').autocomplete=signup?'new-password':'current-password';el('Email').readOnly=signed;el('Details').hidden=!signed;el('Toggle').hidden=signed;el('Reset').hidden=signed;el('Logout').hidden=!signed;el('Close').hidden=mandatory&&!signed;el('Submit').disabled=false;el('Submit').textContent=signed?'Save profile':signup?'Create account':'Sign in';el('Toggle').textContent=signup?'Already have an account? Sign in':'New here? Create account';
    if(signed){el('Name').value=profile.name||current.displayName||'';el('Email').value=current.email||'';el('Phone').value=profile.phone||'';el('Car').value=profile.car||'';el('Avatar').src=profile.avatar||'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" rx="40" fill="%23fff2e5"/%3E%3Ctext x="40" y="54" text-anchor="middle" font-size="40"%3E☕%3C/text%3E%3C/svg%3E';}
  }
  function applyCache(){if(localStorage.getItem('cng_account_uid')!==current.uid)clearCache();['cng_name','cng_phone','cng_car','cng_customer_avatar'].forEach(k=>localStorage.removeItem(k));localStorage.setItem('cng_account_uid',current.uid);localStorage.setItem('cng_name',profile.name||current.displayName||'');if(profile.phone)localStorage.setItem('cng_phone',profile.phone);if(profile.car)localStorage.setItem('cng_car',profile.car);if(profile.avatar)localStorage.setItem('cng_customer_avatar',profile.avatar);if(typeof window.renderCustomerProfile==='function')window.renderCustomerProfile();}
  async function save(values){
    if(!current)throw new Error('Sign-in required');
    const next={...profile,...values};next.name=String(next.name||'').trim();if(!next.name||next.name.length>100)throw new Error('Name required');
    next.updatedAt=firebase.database.ServerValue.TIMESTAMP;
    await raw.ref('/customerProfiles/'+current.uid).set(next);profile=next;applyCache();
  }
  async function load(user){
    const passwordUser=user&&!user.isAnonymous&&user.providerData.some(p=>p.providerId==='password');
    if(!passwordUser){current=null;profile={};clearCache();localStorage.removeItem('cng_account_uid');mode();if(mandatory)box.hidden=false;return;}
    if(loadedUid&&loadedUid!==user.uid){location.reload();return;}current=user;loadedUid=user.uid;
    try{profile=(await raw.ref('/customerProfiles/'+user.uid).once('value')).val()||{name:user.displayName||''};applyCache();mode();box.hidden=!!profile.name;}catch(e){mode();box.hidden=false;message(errorMessage(e));}
  }
  window.cngRequireCustomer=async function(){if(current)return current;box.hidden=false;mode();message('Please sign in to continue.');throw new Error('Sign-in required');};
  window.cngSaveCheckoutProfile=async values=>{await window.cngRequireCustomer();await save(values);};
  window.cngOpenAccount=function(){box.hidden=false;mode();message('');};
  el('Toggle').onclick=()=>{signup=!signup;mode();message('');};el('Close').onclick=()=>{box.hidden=true;};
  el('Logout').onclick=async()=>{try{await auth.signOut();clearCache();localStorage.removeItem('cng_account_uid');location.reload();}catch(e){message(errorMessage(e));}};
  el('Reset').onclick=async()=>{const email=el('Email').value.trim();if(!email){message('Enter your email first.');return;}try{await auth.sendPasswordResetEmail(email);message('If an account is available, a password reset email will arrive. Check your inbox.');}catch(e){message(errorMessage(e));}};
  el('Form').onsubmit=async event=>{
    event.preventDefault();const button=el('Submit');button.disabled=true;message('');
    try{
      if(current){await save({name:el('Name').value.trim(),phone:el('Phone').value.trim(),car:el('Car').value.trim()});mode();message('Profile saved.');return;}
      const email=el('Email').value.trim(),password=el('Password').value,name=el('Name').value.trim();
      if(signup){if(!name)throw new Error('Name required');registering=true;const result=await auth.createUserWithEmailAndPassword(email,password);current=result.user;loadedUid=current.uid;await current.updateProfile({displayName:name});profile={name};await save(profile);registering=false;}
      else {const result=await auth.signInWithEmailAndPassword(email,password);await load(result.user);}
      el('Password').value='';mode();box.hidden=!!profile.name;
    }catch(e){registering=false;message(errorMessage(e));if(current)mode();}finally{button.disabled=false;}
  };
  async function upload(file){
    await window.cngRequireCustomer();if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('Choose a JPEG, PNG or WebP under 8 MB.');
    const url=URL.createObjectURL(file);try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url;});const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const side=Math.min(img.naturalWidth,img.naturalHeight);canvas.getContext('2d').drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,256,256);const avatar=canvas.toDataURL('image/jpeg',.75);if(avatar.length>160000)throw new Error('Photo too large');await save({avatar});mode();message('Photo saved.');}finally{URL.revokeObjectURL(url);}
  }
  el('Photo').onchange=async event=>{try{await upload(event.target.files[0]);}catch(e){message(e.message||errorMessage(e));}finally{event.target.value='';}};
  window.handleCustomerAvatar=async event=>{try{await upload(event.target.files[0]);if(typeof showToast==='function')showToast('Photo saved to your account.');}catch(e){if(typeof showToast==='function')showToast(e.message||errorMessage(e));}finally{event.target.value='';}};
  window.saveCustomerProfile=async()=>{try{await window.cngRequireCustomer();await save({name:document.getElementById('profileNameInput').value.trim(),phone:document.getElementById('profilePhoneInput').value.trim(),car:document.getElementById('profileCarInput').value.trim()});if(typeof toggleProfileEdit==='function')toggleProfileEdit(false);if(typeof showToast==='function')showToast('Profile saved to your account.');}catch(e){if(typeof showToast==='function')showToast(errorMessage(e));}};
  const entry=document.createElement('button');entry.type='button';entry.className='cng-account-entry';entry.textContent='Account / Profile';entry.onclick=window.cngOpenAccount;
  const target=document.querySelector('.profile-page-wrap')||document.querySelector('.header-tools')||document.querySelector('header.header')||document.body;target.appendChild(entry);
  box.hidden=!mandatory;auth.onAuthStateChanged(user=>{if(!registering)load(user);});
})();
