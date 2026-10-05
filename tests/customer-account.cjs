const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const elements=new Map(),storage=new Map([['cng_phone','legacy-phone']]),writes=[],callbacks=[];
function elem(id){if(!elements.has(id))elements.set(id,{id,hidden:false,disabled:false,value:'',textContent:'',setAttribute(){},appendChild(){},style:{}});return elements.get(id);}
const user={uid:'customerA',email:'a@example.com',isAnonymous:false,providerData:[{providerId:'password'}],displayName:'',async updateProfile(p){this.displayName=p.displayName;}};
let saved=null,logout=false;
const auth={onAuthStateChanged:cb=>callbacks.push(cb),createUserWithEmailAndPassword:async(email,password)=>{assert.equal(email,'a@example.com');assert.equal(password,'private-secret');callbacks[0](user);return{user};},signInWithEmailAndPassword:async()=>({user}),signOut:async()=>{logout=true;},sendPasswordResetEmail:async()=>{}};
const database=()=>({ref:path=>({async set(value){writes.push({path,value});saved=structuredClone(value);},async once(){return{val:()=>saved};}})});database.ServerValue={TIMESTAMP:{'.sv':'timestamp'}};
const context=vm.createContext({firebase:{auth:()=>auth,database},document:{head:elem('head'),body:elem('body'),createElement:()=>elem('created'+Math.random()),getElementById:elem,querySelector:()=>elem('target')},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},window:{},location:{reload(){logout=true;}},Image:class{},URL,Promise,Error,String});
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../src/customer_account.js'),'utf8'),context);
(async()=>{
 await callbacks[0](null);assert.equal(storage.has('cng_phone'),false);await assert.rejects(context.window.cngRequireCustomer());
 elem('cngAccountName').value='Ashik';elem('cngAccountEmail').value='a@example.com';elem('cngAccountPassword').value='private-secret';
 await elem('cngAccountForm').onsubmit({preventDefault(){}});
 assert.equal(writes[0].path,'/customerProfiles/customerA');assert.equal(writes[0].value.name,'Ashik');assert(!JSON.stringify(writes).includes('private-secret'));assert(!JSON.stringify([...storage]).includes('private-secret'));assert.equal(elem('cngAccountPassword').value,'');
 assert.equal((await context.window.cngRequireCustomer()).uid,'customerA');
 elem('profileNameInput').value='Updated';elem('profilePhoneInput').value='0501234567';elem('profileCarInput').value='ABC';await context.window.saveCustomerProfile();assert.equal(saved.name,'Updated');assert.equal(storage.get('cng_name'),'Updated');
 storage.delete('cng_name');await callbacks[0](user);await new Promise(r=>setImmediate(r));assert.equal(storage.get('cng_name'),'Updated');
 await elem('cngAccountLogout').onclick();assert(logout);assert.equal(storage.has('cng_name'),false);
 console.log('Customer account signup, private profile persistence, password handling, restore and logout checks passed (mock Firebase).');
})().catch(e=>{console.error(e);process.exitCode=1;});
