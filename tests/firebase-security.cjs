const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const rules=JSON.parse(fs.readFileSync('security-package/database.rules.json')).rules;
const owner={uid:'owner',token:{email:'islamiclibrary2.0@gmail.com',email_verified:true,firebase:{sign_in_provider:'google.com'}}};
const guest={uid:'customerA',token:{firebase:{sign_in_provider:'password'}}};
const other={uid:'customerB',token:{firebase:{sign_in_provider:'password'}}};
const now=1760000000000;
const order={ownerUid:'customerA',id:now,items:[{name:'Coffee',price:10,qty:1}],total:10,timestamp:now,status:'new',customerName:'Customer'};
const key='customerA_'+now;
const tree={customerOrders:{[key]:order},customerChats:{customerA:{messages:{adminMessage:{sender:'admin',text:'Ready',timestamp:now}}}}};
function snap(value){return {val:()=>value??null,exists:()=>value!==null&&value!==undefined,child:path=>snap(path.split('/').reduce((v,k)=>v?.[k],value)),hasChildren:keys=>keys.every(k=>value?.[k]!==null&&value?.[k]!==undefined),isNumber:()=>typeof value==='number',isString:()=>typeof value==='string'};}
function expression(expr,auth,path,value,query={},vars={}){if(typeof expr==='boolean')return expr;const current=path.split('/').filter(Boolean).reduce((v,k)=>v?.[k],tree);try{return Function('auth','data','newData','root','now','query',...Object.keys(vars),'return '+expr)(auth,snap(current),snap(value),snap(tree),now,query,...Object.values(vars))===true;}catch{return false;}}
function permission(operation,path,auth,value,query={}){
 const parts=path.split('/').filter(Boolean);let nodes=[{rule:rules,path:'',vars:{}}];let granted=false;const visited=[];
 for(let depth=0;depth<=parts.length;depth++){
  for(const node of nodes){visited.push(node);if(node.rule['.'+operation]!==undefined&&expression(node.rule['.'+operation],auth,node.path,value,query,node.vars))granted=true;}
  if(depth===parts.length)break;
  const next=[];for(const node of nodes){const part=parts[depth];const staticRule=node.rule[part];if(staticRule)next.push({rule:staticRule,path:[node.path,part].filter(Boolean).join('/'),vars:node.vars});else for(const k of Object.keys(node.rule).filter(k=>k.startsWith('$')))next.push({rule:node.rule[k],path:[node.path,part].filter(Boolean).join('/'),vars:{...node.vars,[k]:part}});}
  nodes=next;
 }
 if(operation!=='write'||value===null)return granted;
 for(const node of nodes){if(node.rule['.validate']!==undefined&&!expression(node.rule['.validate'],auth,path,value,query,node.vars))return false;}
 return granted;
}
assert(!permission('read','/',null));assert(!permission('write','/',null,{}));
assert(permission('read','products',null));assert(!permission('read','settings',null));
assert(!permission('read','orders',guest));assert(!permission('write','products',guest,{}));
assert(permission('read','/',owner));assert(permission('write','products',owner,{}));
assert(!permission('read','/',{...owner,token:{...owner.token,email_verified:false}}));
assert(!permission('read','/',{...owner,token:{...owner.token,firebase:{sign_in_provider:'password'}}}));
assert(permission('read','customerOrders',guest,undefined,{orderByChild:'ownerUid',equalTo:'customerA'}));
assert(!permission('read','customerOrders',other,undefined,{orderByChild:'ownerUid',equalTo:'customerA'}));
assert(!permission('read','customerOrders',guest));
assert(permission('read','customerOrders/'+key,guest));assert(!permission('read','customerOrders/'+key,other));
const newKey='customerA_'+(now+1),newOrder={...order,id:now+1};
assert(permission('write','customerOrders/'+newKey,guest,newOrder));
assert(!permission('write','customerOrders/'+newKey,other,newOrder));
assert(!permission('write','customerOrders/'+newKey,guest,{...newOrder,status:'completed'}));
assert(!permission('write','customerOrders/'+key,guest,{...order,status:'ready'}));
assert(permission('write','customerOrders/'+key,guest,null));assert(!permission('write','customerOrders/'+key,other,null));
assert(permission('write','customerOrderHistory/'+key,guest,{...order,status:'cancelled'}));
assert(!permission('write','customerOrderHistory/'+key,guest,{...order,status:'completed'}));
assert(!permission('read','customerChats/customerA',other));
assert(permission('write','customerChats/customerA/messages/new',guest,{sender:'customer',text:'Hello',timestamp:now}));
assert(!permission('write','customerChats/customerA/messages/new',guest,{sender:'admin',text:'Hello',timestamp:now}));
assert(!permission('write','customerChats/customerA/messages/adminMessage',guest,{sender:'customer',text:'Changed',timestamp:now}));
assert(!permission('write','_security/admins/attacker',owner,true));
assert(permission('read','customerPrivateNotifications/customerA',guest));assert(!permission('read','customerPrivateNotifications/customerA',other));
assert(!permission('read','customerOrders/'+key,{uid:'customerA',token:{firebase:{sign_in_provider:'anonymous'}}}));
assert(permission('read','customerProfiles/customerA',guest));assert(!permission('read','customerProfiles/customerA',other));
assert(!permission('read','customerProfiles/customerA',null));
assert(permission('write','customerProfiles/customerA',guest,{name:'A',updatedAt:now}));
assert(!permission('write','customerProfiles/customerA',other,{name:'B',updatedAt:now}));
console.log('36 modeled permission assertions passed (not a Firebase emulator).');
// Verify reads wait for authorization, early writes cannot mutate, and the
// settings mirror never copies PINs, cashier credentials or reporting settings.
const calls=[];let authCallback;
function ref(path){return {key:path.split('/').filter(Boolean).at(-1),toString:()=>path,on:(...args)=>calls.push(['on',path,args[0]]),off:()=>{},once:()=>{calls.push(['once',path]);return Promise.resolve(snap({}));},set:value=>{calls.push(['set',path,value]);return Promise.resolve();},transaction:update=>{calls.push(['transaction',path,update([order])]);return Promise.resolve({committed:true});}};}
const message={textContent:''},button={disabled:false};const form={querySelector:()=>button,addEventListener:()=>{}};
const gate={style:{},querySelector:selector=>selector==='form'?form:message};
const auth={onAuthStateChanged:cb=>{authCallback=cb;},signOut:()=>Promise.resolve()};
const ctx=vm.createContext({firebase:{database:()=>({ref}),auth:()=>auth},document:{createElement:()=>gate,body:{appendChild:()=>{}}},showToast:()=>{},location:{reload:()=>{}},Promise,Proxy,Error,JSON});
const fields=['shopName','shopLogo','categories'];
vm.runInContext(fs.readFileSync('security_gate.js','utf8').replace('__PUBLIC_FIELDS__',JSON.stringify(fields)),ctx);
(async()=>{
 vm.runInContext("db.ref('/orders').on('value',()=>{});db.ref('/blocked').set({x:1}).catch(()=>{});",ctx);
 await Promise.resolve();assert.equal(calls.length,0);
 await authCallback({email:'islamiclibrary2.0@gmail.com',emailVerified:true,providerData:[{providerId:'google.com'}]});await Promise.resolve();
 assert(calls.some(c=>c[0]==='on'&&c[1]==='/orders'));
 vm.runInContext("cngPublishPublicSettings({shopName:'Cup And Go',adminPin:'secret',cashiers:[{pin:'secret'}],shopLogo:'logo'},null)",ctx);
 const published=calls.find(c=>c[0]==='set'&&c[1]==='/publicSettings')[2];assert.equal(published.shopName,'Cup And Go');assert(!('adminPin'in published));assert(!('cashiers'in published));
 await vm.runInContext("db.ref('/customerOrders').transaction(current=>current)",ctx);
 const mapped=calls.find(c=>c[0]==='transaction')[2];assert(mapped[key]);assert(!Array.isArray(mapped));
 console.log('Admin authorization gate, public projection and stable order-key checks passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
