const cngAdminApp = firebase.initializeApp(firebase.app().options, 'cng-admin');
const cngRawDb = cngAdminApp.database();
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
(function cngDeviceAccess(){
  const gate=document.createElement('div');gate.id='cng-device-activation';
  gate.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#071b20;display:flex;align-items:center;justify-content:center;padding:22px;color:white;font-family:Arial,sans-serif';
  gate.innerHTML='<section style="width:100%;max-width:390px;padding:28px;background:#ffffff0d;border:1px solid #ffffff22;border-radius:24px"><h2>Cup And Go</h2><p>One-time device activation · تفعيل الجهاز</p><p id="cng-device-message" role="status">Connecting your device…</p><label>Device ID<input id="cng-device-id" readonly aria-label="Device ID" style="display:block;width:100%;box-sizing:border-box;padding:12px;margin-top:8px;font-size:14px"></label><p style="font-size:13px;line-height:1.6">Send this Device ID to the shop owner for approval. After approval, use your existing PIN as usual. This ID is not a password.</p><button id="cng-device-retry" type="button">Retry connection</button></section>';
  document.body.appendChild(gate);
  const message=gate.querySelector('#cng-device-message'),deviceId=gate.querySelector('#cng-device-id');
  gate.querySelector('#cng-device-retry').onclick=()=>location.reload();
  let permissionRef=null,creating=false;
  cngAdminApp.auth().onAuthStateChanged(async user=>{
    cngCloudAuthorized=false;
    if(permissionRef){permissionRef.off();permissionRef=null;}
    gate.style.display='flex';
    if(!user){
      if(creating)return;creating=true;
      try{await cngAdminApp.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);await cngAdminApp.auth().signInAnonymously();}
      catch(error){message.textContent='Could not connect. Check your internet connection and retry.';}
      finally{creating=false;}return;
    }
    deviceId.value=user.uid;
    if(!user.isAnonymous){message.textContent='This device needs its own activation identity. Contact the shop owner.';return;}
    message.textContent='Waiting for owner approval. Keep this page open; after approval your normal PIN screen will appear.';
    permissionRef=cngRawDb.ref('/_security/admins/'+user.uid);
    permissionRef.on('value',snapshot=>{
      const allowed=snapshot.child('active').val()===true;
      cngCloudAuthorized=allowed;gate.style.display=allowed?'none':'flex';
      if(allowed)cngResolveCloud();
      else message.textContent='Waiting for owner approval. Send the Device ID above to the shop owner.';
    },error=>{cngCloudAuthorized=false;gate.style.display='flex';message.textContent='Could not check device approval. Check your connection and retry.';});
  });
})();
