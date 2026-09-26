const websiteControlDefaults={
  enabled:true,
  brandName:'CUP AND GO',
  menuUrl:'https://cupandgo-ksa.github.io/cup-and-go-menu/',
  autoSlideMs:6500,
  experienceTextEn:'Fast enough for your day. Premium enough to remember. Cup And Go brings clean design, fresh taste and a little theatre to every cup.',
  experienceTextAr:'سريع ليناسب يومك، وفاخر بما يكفي لتتذكره. كوب أند جو يجمع الطعم الطازج والتصميم النظيف في كل كوب.',
  finalTextEn:'Find your next favorite.',
  finalTextAr:'اكتشف مشروبك المفضل القادم.',
  slides:[
    {productId:'',imageUrl:'',hero:'#381018',accent:'#e5c158',word:'BOLD'},
    {productId:'',imageUrl:'',hero:'#4a2f1c',accent:'#ffc76a',word:'PURE'},
    {productId:'',imageUrl:'',hero:'#31462a',accent:'#dff59b',word:'CALM'},
    {productId:'',imageUrl:'',hero:'#4d1725',accent:'#ff9eb5',word:'BRIGHT'}
  ]
};
let websiteProductsCache=[];
let websiteSlidesWorking=[];

function websiteEsc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function websiteProductId(p){return String(p&&(p.id!=null?p.id:(p.name||''))||'')}
function websiteProductName(p){return String(p&&(p.name||p.nameEn||p.nameAr||p.arName)||'')}
function websiteProductDesc(p){return String(p&&(p.description||p.desc||p.descriptionAr||p.descAr)||'')}
function websiteProductImage(p){return String(p&&(p.imageHD||p.imageHd||p.hdImage||p.icon||p.image)||'')}
function websiteFindProduct(id){return websiteProductsCache.find(p=>websiteProductId(p)===String(id||''))||null}
function websiteSplitName(name){const w=String(name||'').trim().split(/\s+/);if(w.length<2)return[w[0]||'',''];const n=Math.ceil(w.length/2);return[w.slice(0,n).join(' '),w.slice(n).join(' ')]}

function websiteProductOptions(selected){
  const opts=['<option value="">— Select menu item —</option>'];
  websiteProductsCache.slice().sort((a,b)=>websiteProductName(a).localeCompare(websiteProductName(b))).forEach(p=>{
    const id=websiteProductId(p),name=websiteProductName(p);
    opts.push('<option value="'+websiteEsc(id)+'"'+(String(selected||'')===id?' selected':'')+'>'+websiteEsc(name)+'</option>');
  });
  return opts.join('');
}
function websiteSlideHtml(s,i){
  const p=websiteFindProduct(s.productId);
  const pname=p?websiteProductName(p):'Choose a menu item';
  const pdesc=p?websiteProductDesc(p):'Name, description, price and category will come from your Menu automatically.';
  const price=p?Number(p.price||0).toFixed(2)+' ﷼':'';
  const preview=s.imageUrl||'';
  return '<div class="card" style="padding:14px;margin-bottom:12px;">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><b style="color:var(--orange)">Featured '+(i+1)+'</b><span style="font-size:10px;opacity:.55;">Animation PNG</span></div>'+
    '<div class="field"><label>Menu item</label><select id="ws-'+i+'-product" onchange="websiteProductPicked('+i+')" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid var(--glass-border);color:var(--text);">'+websiteProductOptions(s.productId)+'</select></div>'+
    '<div id="ws-'+i+'-info" style="padding:12px;border:1px solid var(--glass-border);border-radius:14px;background:rgba(255,255,255,.04);margin-bottom:10px;"><div style="font-weight:900;color:var(--orange);">'+websiteEsc(pname)+'</div><div style="font-size:10px;opacity:.66;line-height:1.55;margin-top:5px;">'+websiteEsc(pdesc)+'</div><div style="font-size:12px;font-weight:900;margin-top:7px;">'+websiteEsc(price)+'</div></div>'+
    '<div style="display:grid;grid-template-columns:110px 1fr;gap:12px;align-items:center;">'+
      '<div style="height:120px;border-radius:16px;background:rgba(255,255,255,.055);border:1px dashed var(--glass-border);display:grid;place-items:center;overflow:hidden;"><img id="ws-'+i+'-preview" src="'+websiteEsc(preview)+'" style="max-width:100%;max-height:100%;object-fit:contain;display:'+(preview?'block':'none')+';"><span id="ws-'+i+'-empty" style="font-size:9px;opacity:.5;text-align:center;padding:8px;display:'+(preview?'none':'block')+';">Transparent<br>PNG</span></div>'+
      '<div>'+
        '<div class="field"><label>Animation image</label><div style="display:flex;gap:8px;flex-wrap:wrap;"><label class="btn" style="flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;padding:11px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload PNG<input type="file" accept="image/png,image/webp,image/*" style="display:none" onchange="uploadWebsiteSlideImage(event,'+i+')"></label><button class="btn" type="button" onclick="removeWebsiteSlideImage('+i+')" style="padding:0 12px;border-radius:12px;background:rgba(255,59,48,.12);color:#ff8179;">Remove</button></div></div>'+
        '<input id="ws-'+i+'-image" type="hidden" value="'+websiteEsc(preview)+'">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div class="field"><label>Scene colour</label><input id="ws-'+i+'-hero" type="color" value="'+websiteEsc(s.hero||'#381018')+'" style="width:100%;height:42px;border-radius:10px;"></div><div class="field"><label>Accent</label><input id="ws-'+i+'-accent" type="color" value="'+websiteEsc(s.accent||'#e5c158')+'" style="width:100%;height:42px;border-radius:10px;"></div></div>'+
      '</div>'+
    '</div>'+
    '<p style="font-size:9px;opacity:.52;line-height:1.5;margin-top:9px;">For the top animation, use a transparent PNG with empty background. The full menu cards below use the real Menu image automatically.</p>'+
  '</div>';
}
function renderWebsiteSlideEditors(cfg){
  const box=document.getElementById('website-slide-editors');if(!box)return;
  const incoming=Array.isArray(cfg.slides)?cfg.slides:[];
  websiteSlidesWorking=[0,1,2,3].map(i=>({...websiteControlDefaults.slides[i],...(incoming[i]||{})}));
  box.innerHTML=websiteSlidesWorking.map(websiteSlideHtml).join('');
}
function websiteProductPicked(i){
  const sel=document.getElementById('ws-'+i+'-product');if(!sel)return;
  const p=websiteFindProduct(sel.value);websiteSlidesWorking[i]=websiteSlidesWorking[i]||{};
  websiteSlidesWorking[i].productId=sel.value||'';
  const info=document.getElementById('ws-'+i+'-info');
  if(info){
    if(p)info.innerHTML='<div style="font-weight:900;color:var(--orange);">'+websiteEsc(websiteProductName(p))+'</div><div style="font-size:10px;opacity:.66;line-height:1.55;margin-top:5px;">'+websiteEsc(websiteProductDesc(p))+'</div><div style="font-size:12px;font-weight:900;margin-top:7px;">'+Number(p.price||0).toFixed(2)+' ﷼</div>';
    else info.innerHTML='<div style="font-weight:900;color:var(--orange);">Choose a menu item</div><div style="font-size:10px;opacity:.66;line-height:1.55;margin-top:5px;">Name, description, price and category will come from your Menu automatically.</div>';
  }
}
async function openWebsiteControl(){
  let c;
  try{
    const res=await Promise.all([db.ref('/website/config').once('value'),db.ref('/products').once('value')]);
    c={...websiteControlDefaults,...(res[0].val()||{})};
    const pdata=res[1].val();websiteProductsCache=pdata?Object.values(pdata).filter(Boolean):[];
  }catch(e){
    c=JSON.parse(JSON.stringify(websiteControlDefaults));websiteProductsCache=Array.isArray(products)?products:[];
  }
  document.getElementById('website-enabled').checked=c.enabled!==false;
  document.getElementById('website-brand').value=c.brandName||'CUP AND GO';
  document.getElementById('website-menu-url').value=c.menuUrl||websiteControlDefaults.menuUrl;
  document.getElementById('website-slide-seconds').value=(Number(c.autoSlideMs)||6500)/1000;
  document.getElementById('website-exp-en').value=c.experienceTextEn||websiteControlDefaults.experienceTextEn;
  document.getElementById('website-exp-ar').value=c.experienceTextAr||websiteControlDefaults.experienceTextAr;
  document.getElementById('website-final-en').value=c.finalTextEn||websiteControlDefaults.finalTextEn;
  document.getElementById('website-final-ar').value=c.finalTextAr||websiteControlDefaults.finalTextAr;
  renderWebsiteSlideEditors(c);
  fillWebsiteExtraFields(c);
  openModal('modal-website-control');
}
function readWebsiteSlide(i){
  const base={...(websiteSlidesWorking[i]||websiteControlDefaults.slides[i]||{})};
  const sel=document.getElementById('ws-'+i+'-product');
  const productId=sel?sel.value:'';
  const p=websiteFindProduct(productId);
  const image=document.getElementById('ws-'+i+'-image')?.value?.trim()||'';
  const hero=document.getElementById('ws-'+i+'-hero')?.value||base.hero||'#381018';
  const accent=document.getElementById('ws-'+i+'-accent')?.value||base.accent||'#e5c158';
  if(p){
    const parts=websiteSplitName(websiteProductName(p));
    base.top=parts[0];base.bottom=parts[1];base.desc=websiteProductDesc(p);base.type=String(p.category||'');base.temp=/hot/i.test(websiteProductName(p))?'HOT':'FRESH';
  }
  return {...base,productId:productId,imageUrl:image,hero:hero,accent:accent};
}
async function saveWebsiteControl(){
  const cfg={
    enabled:document.getElementById('website-enabled').checked,
    brandName:document.getElementById('website-brand').value.trim()||'CUP AND GO',
    menuUrl:document.getElementById('website-menu-url').value.trim()||websiteControlDefaults.menuUrl,
    autoSlideMs:Math.max(3500,Math.round((parseFloat(document.getElementById('website-slide-seconds').value)||6.5)*1000)),
    experienceTextEn:document.getElementById('website-exp-en').value.trim(),
    experienceTextAr:document.getElementById('website-exp-ar').value.trim(),
    finalTextEn:document.getElementById('website-final-en').value.trim(),
    finalTextAr:document.getElementById('website-final-ar').value.trim(),
    slides:[0,1,2,3].map(readWebsiteSlide),
    ...readWebsiteExtraFields(),
    updatedAt:firebase.database.ServerValue.TIMESTAMP
  };
  try{await db.ref('/website/config').set(cfg);websiteSlidesWorking=cfg.slides;showToast('✅ Website animation updated live');}
  catch(e){console.error(e);showToast('❌ Website save failed');}
}
async function uploadWebsiteSlideImage(ev,i){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading transparent animation image…');
    let url='';
    if(typeof uploadImageToImgBB==='function'){
      // shop-logo purpose keeps the original image bytes, so PNG transparency is preserved.
      url=await uploadImageToImgBB(file,'shop-logo');
    }else throw new Error('Uploader unavailable');
    const hidden=document.getElementById('ws-'+i+'-image'),preview=document.getElementById('ws-'+i+'-preview'),empty=document.getElementById('ws-'+i+'-empty');
    if(hidden)hidden.value=url;if(preview){preview.src=url;preview.style.display='block'}if(empty)empty.style.display='none';
    websiteSlidesWorking[i]=websiteSlidesWorking[i]||{};websiteSlidesWorking[i].imageUrl=url;
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-slide-png');
    showToast(file.type==='image/png'?'✅ PNG ready for animation':'✅ Image ready — PNG is best for transparent animation');
  }catch(e){console.error(e);showToast('❌ Image upload failed');}
  ev.target.value='';
}
function removeWebsiteSlideImage(i){
  const hidden=document.getElementById('ws-'+i+'-image'),preview=document.getElementById('ws-'+i+'-preview'),empty=document.getElementById('ws-'+i+'-empty');
  if(hidden)hidden.value='';if(preview){preview.removeAttribute('src');preview.style.display='none'}if(empty)empty.style.display='block';
  websiteSlidesWorking[i]=websiteSlidesWorking[i]||{};websiteSlidesWorking[i].imageUrl='';
  showToast('Animation image removed');
}

function ensureWebsiteExtraFields(){
  const host=document.getElementById('website-slide-editors');if(!host||document.getElementById('website-extra-fields'))return;
  const wrap=document.createElement('div');wrap.id='website-extra-fields';wrap.className='card';wrap.style.cssText='padding:14px;margin:0 0 12px;';
  wrap.innerHTML=
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><b style="color:var(--orange)">About + Contact</b><span style="font-size:10px;opacity:.55;">Website footer</span></div>'+
    '<div class="field"><label>Popular items to show</label><select id="website-popular-limit" style="width:100%;padding:12px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid var(--glass-border);color:var(--text);"><option value="5">5 items</option><option value="6">6 items</option></select></div>'+
    '<div class="field"><label>About title — English</label><input id="website-about-title-en" type="text" placeholder="About Cup And Go"></div>'+
    '<div class="field"><label>About title — Arabic</label><input id="website-about-title-ar" type="text" dir="rtl" placeholder="عن كوب أند جو"></div>'+
    '<div class="field"><label>About text — English</label><textarea id="website-about-text-en" rows="5" style="width:100%;padding:12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid var(--glass-border);color:var(--text);" placeholder="Write a detailed description about the shop..."></textarea></div>'+
    '<div class="field"><label>About text — Arabic</label><textarea id="website-about-text-ar" rows="5" dir="rtl" style="width:100%;padding:12px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid var(--glass-border);color:var(--text);" placeholder="اكتب وصفاً مفصلاً عن المتجر..."></textarea></div>'+
    '<div class="field"><label>Google Maps / Location URL</label><input id="website-location-url" type="url" placeholder="https://maps.app.goo.gl/..."></div>'+
    '<div class="field"><label>WhatsApp number</label><input id="website-whatsapp" type="tel" placeholder="9665XXXXXXXX"></div>'+
    '<div class="field"><label>Instagram ID or URL</label><input id="website-instagram" type="text" placeholder="Cupandgo.ksa"></div>'+
    '<div class="field"><label>TikTok ID or URL</label><input id="website-tiktok" type="text" placeholder="@cupandgo..."></div>'+
    '<p style="font-size:9px;opacity:.5;line-height:1.6;margin-top:8px;">Leave any contact field empty to hide it from the website.</p>';
  host.parentNode.insertBefore(wrap,host);
}
function fillWebsiteExtraFields(c){
  ensureWebsiteExtraFields();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v==null?'':v};
  set('website-popular-limit',String(Number(c.popularLimit)||6));
  set('website-about-title-en',c.aboutTitleEn||'');
  set('website-about-title-ar',c.aboutTitleAr||'');
  set('website-about-text-en',c.aboutTextEn||'');
  set('website-about-text-ar',c.aboutTextAr||'');
  set('website-location-url',c.locationUrl||'');
  set('website-whatsapp',c.whatsapp||'');
  set('website-instagram',c.instagram||'');
  set('website-tiktok',c.tiktok||'');
}
function readWebsiteExtraFields(){
  const val=id=>document.getElementById(id)?.value?.trim()||'';
  return {
    popularLimit:Math.min(6,Math.max(5,Number(val('website-popular-limit'))||6)),
    aboutTitleEn:val('website-about-title-en'),
    aboutTitleAr:val('website-about-title-ar'),
    aboutTextEn:val('website-about-text-en'),
    aboutTextAr:val('website-about-text-ar'),
    locationUrl:val('website-location-url'),
    whatsapp:val('website-whatsapp'),
    instagram:val('website-instagram'),
    tiktok:val('website-tiktok')
  };
}
