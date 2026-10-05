const cngRawDb = firebase.database();
const CNG_OWNER_EMAIL = 'islamiclibrary2.0@gmail.com';
let cngCloudAuthorized = false;
let cngResolveCloud;
const cngCloudReady = new Promise(resolve => { cngResolveCloud = resolve; });
const cngSubscriptions = [];
function cngGuardReference(ref) {
  return new Proxy(ref, {get(target, property) {
    if(property === 'on') return (event, callback, error, context) => {
      const entry={path:target.toString(),event,callback,active:true}; cngSubscriptions.push(entry);
      cngCloudReady.then(()=>{if(entry.active)target.on(event,callback,error,context);}); return callback;
    };
    if(property === 'off') return (event,callback,context) => {
      cngSubscriptions.forEach(entry=>{if(entry.path===target.toString()&&(!event||entry.event===event)&&(!callback||entry.callback===callback))entry.active=false;});
      return target.off(event,callback,context);
    };
    if(property === 'once') return (...args) => cngCloudReady.then(()=>target.once(...args));
    if(['set','update','remove','transaction','setWithPriority','setPriority'].includes(property)) return (...args) => {
      if(!cngCloudAuthorized) {
        const error=new Error('Firebase sign-in is required'); error.code='PERMISSION_DENIED';
        if(property==='transaction'&&typeof args[1]==='function') args[1](error,false,null);
        const result=Promise.reject(error); result.catch(()=>{}); return result;
      }
      if(property==='transaction' && ['customerOrders','customerOrderHistory'].includes(target.key)) {
        const update=args[0];args[0]=current=>{const next=update(current);if(!Array.isArray(next))return next;const map={};next.filter(Boolean).forEach(order=>{const key=(order.ownerUid||'legacy')+'_'+String(order.id);map[key]=order;});return map;};
      }
      return target[property](...args);
    };
    if(property === 'push') return (value,callback) => {
      const next=cngGuardReference(target.push());
      if(value!==undefined){const promise=next.set(value);if(callback)promise.then(()=>callback(null),callback);}
      return next;
    };
    const value=target[property];
    if(typeof value==='function') return (...args)=>{
      const result=value.apply(target,args);
      return result&&typeof result.once==='function'?cngGuardReference(result):result;
    };
    return value;
  }});
}
const db = {ref:path=>cngGuardReference(cngRawDb.ref(path))};
let cngPublicSettingsSignature='';
function cngPublishPublicSettings(settings,current) {
  if(!cngCloudAuthorized)return;
  const visible={};
  __PUBLIC_FIELDS__.forEach(key=>{if(settings[key]!==undefined&&settings[key]!==null)visible[key]=settings[key];});
  const signature=JSON.stringify(visible);
  if(signature===JSON.stringify(current||{})||signature===cngPublicSettingsSignature)return;
  cngPublicSettingsSignature=signature;
  cngRawDb.ref('/publicSettings').set(visible).catch(()=>{cngPublicSettingsSignature='';showToast('Could not update public menu settings');});
}
(function cngFirebaseLoginGate(){
  const gate=document.createElement('div');gate.id='cng-firebase-login';
  gate.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#071b20;display:flex;align-items:center;justify-content:center;padding:22px;color:white;font-family:Arial,sans-serif';
  gate.innerHTML='<form style="width:100%;max-width:360px;padding:28px;background:#ffffff0d;border:1px solid #ffffff22;border-radius:24px"><h2 style="margin:0 0 12px">Cup And Go</h2><p>تسجيل الدخول الآمن · Secure sign-in</p><button type="submit" style="width:100%;padding:14px;margin-top:12px;border:0;border-radius:12px;background:#e5c158;font-weight:bold">المتابعة باستخدام Google · Continue with Google</button><p id="cng-auth-message" role="status" style="font-size:13px;line-height:1.5">Sign in with the shop owner’s Google account.</p></form>';
  document.body.appendChild(gate);
  const form=gate.querySelector('form'),message=gate.querySelector('#cng-auth-message'),button=form.querySelector('button');
  form.addEventListener('submit',async event=>{
    event.preventDefault();button.disabled=true;message.textContent='Signing in…';
    try {await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());}
    catch(error){message.textContent='Could not sign in. Check your Google account and connection.';button.disabled=false;}
  });
  firebase.auth().onAuthStateChanged(async user=>{
    if(!user){cngCloudAuthorized=false;gate.style.display='flex';button.disabled=false;return;}
    message.textContent='Checking POS access…';
    try {
      const allowed=user.email===CNG_OWNER_EMAIL && user.emailVerified && user.providerData.some(provider=>provider.providerId==='google.com');
      if(!allowed){message.textContent='Please use the shop owner’s Google account.';await firebase.auth().signOut();return;}
      cngCloudAuthorized=true;gate.style.display='none';cngResolveCloud();
    } catch(error){message.textContent='Could not verify access. Check the database rules and your connection.';button.disabled=false;}
  });
})();
