const websiteControlDefaults={
  enabled:true,
  brandName:'CUP AND GO',
  menuUrl:'https://cupandgoksa.com/menu/',
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
        '<div class="field"><label>Transparent PNG for top animation</label><div style="display:flex;gap:8px;flex-wrap:wrap;"><label class="btn" style="flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;padding:11px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload Transparent PNG<input type="file" accept="image/png,image/webp,image/*" style="display:none" onchange="uploadWebsiteSlideImage(event,'+i+')"></label><button class="btn" type="button" onclick="removeWebsiteSlideImage('+i+')" style="padding:0 12px;border-radius:12px;background:rgba(255,59,48,.12);color:#ff8179;">Remove</button></div></div>'+
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
  document.getElementById('website-menu-url').value=websiteControlDefaults.menuUrl;
  document.getElementById('website-slide-seconds').value=(Number(c.autoSlideMs)||6500)/1000;
  document.getElementById('website-exp-en').value=c.experienceTextEn||websiteControlDefaults.experienceTextEn;
  document.getElementById('website-exp-ar').value=c.experienceTextAr||websiteControlDefaults.experienceTextAr;
  document.getElementById('website-final-en').value=c.finalTextEn||websiteControlDefaults.finalTextEn;
  document.getElementById('website-final-ar').value=c.finalTextAr||websiteControlDefaults.finalTextAr;
  renderWebsiteSlideEditors(c);
  fillWebsiteExtraFields(c);
  fillWebsiteBrandGalleryFields(c);
  fillWebsiteBaristas(c);
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
    menuUrl:websiteControlDefaults.menuUrl,
    autoSlideMs:Math.max(3500,Math.round((parseFloat(document.getElementById('website-slide-seconds').value)||6.5)*1000)),
    experienceTextEn:document.getElementById('website-exp-en').value.trim(),
    experienceTextAr:document.getElementById('website-exp-ar').value.trim(),
    finalTextEn:document.getElementById('website-final-en').value.trim(),
    finalTextAr:document.getElementById('website-final-ar').value.trim(),
    slides:[0,1,2,3].map(readWebsiteSlide),
    ...readWebsiteExtraFields(),
    ...readWebsiteBrandGalleryFields(),
    ...readWebsiteBaristas(),
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

function ensureWebsiteBrandGalleryFields(){
  const extra=document.getElementById('website-extra-fields');
  const host=extra||document.getElementById('website-slide-editors');
  if(!host||document.getElementById('website-brand-gallery-fields'))return;
  const box=document.createElement('div');
  box.id='website-brand-gallery-fields';
  box.className='card';
  box.style.cssText='padding:14px;margin:0 0 12px;';
  box.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><b style="color:var(--orange)">Brand + Store Photos</b><span style="font-size:10px;opacity:.55;">Mobile website</span></div>'+
    '<div class="field"><label>Stylish shop-name PNG</label><div style="display:grid;grid-template-columns:95px 1fr;gap:10px;align-items:center;"><div style="height:70px;border-radius:14px;border:1px dashed var(--glass-border);display:grid;place-items:center;overflow:hidden;background:rgba(255,255,255,.04);"><img id="website-brand-image-preview" style="max-width:100%;max-height:100%;object-fit:contain;display:none"><span id="website-brand-image-empty" style="font-size:9px;opacity:.5;">PNG</span></div><div><label class="btn" style="display:flex;align-items:center;justify-content:center;padding:11px;border-radius:12px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload shop-name PNG<input type="file" accept="image/png,image/webp,image/*" style="display:none" onchange="uploadWebsiteBrandImage(event)"></label><button type="button" class="btn" onclick="removeWebsiteBrandImage()" style="width:100%;margin-top:7px;padding:9px;border-radius:12px;background:rgba(255,59,48,.1);color:#ff8179;">Remove</button></div></div><input id="website-brand-image-url" type="hidden"></div>'+
    '<div style="font-size:10px;font-weight:900;color:var(--orange);margin:16px 0 9px;">Store / Signboard slideshow — 3 photos</div>'+
    '<div id="website-store-gallery-fields" style="display:grid;gap:10px;"></div>'+'<div style="font-size:10px;font-weight:900;color:var(--orange);margin:18px 0 9px;">3D Signboard Artwork</div>'+'<div style="display:grid;grid-template-columns:95px 1fr;gap:10px;align-items:center;padding:9px;border-radius:14px;border:1px solid var(--glass-border);background:rgba(255,255,255,.035);"><div style="height:86px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04);display:grid;place-items:center;"><img id="website-signboard-preview" style="width:100%;height:100%;object-fit:contain;display:none"><span id="website-signboard-empty" style="font-size:9px;opacity:.5;">Signboard</span></div><div><label class="btn" style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:11px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">🪧 Upload signboard image<input type="file" accept="image/*" style="display:none" onchange="uploadWebsiteSignboardImage(event)"></label><button type="button" class="btn" onclick="removeWebsiteSignboardImage()" style="width:100%;margin-top:6px;padding:8px;border-radius:11px;background:rgba(255,59,48,.1);color:#ff8179;">Remove</button><input id="website-signboard-image-url" type="hidden"></div></div>'+
    '<p style="font-size:9px;opacity:.52;line-height:1.6;margin-top:9px;">These 3 photos slide automatically in the middle of the website. Upload your storefront, signboard or interior photos.</p>';
  if(extra&&extra.parentNode)extra.parentNode.insertBefore(box,extra);
  else host.parentNode.insertBefore(box,host);
  const g=document.getElementById('website-store-gallery-fields');
  g.innerHTML=[0,1,2].map(i=>
    '<div style="display:grid;grid-template-columns:86px 1fr;gap:10px;align-items:center;padding:9px;border-radius:14px;border:1px solid var(--glass-border);background:rgba(255,255,255,.035);">'+
      '<div style="height:76px;border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04);display:grid;place-items:center;"><img id="website-store-preview-'+i+'" style="width:100%;height:100%;object-fit:cover;display:none"><span id="website-store-empty-'+i+'" style="font-size:9px;opacity:.5;">Photo '+(i+1)+'</span></div>'+
      '<div><label class="btn" style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:11px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload photo '+(i+1)+'<input type="file" accept="image/*" style="display:none" onchange="uploadWebsiteStoreImage(event,'+i+')"></label><button type="button" class="btn" onclick="removeWebsiteStoreImage('+i+')" style="width:100%;margin-top:6px;padding:8px;border-radius:11px;background:rgba(255,59,48,.1);color:#ff8179;">Remove</button><input id="website-store-url-'+i+'" type="hidden"></div>'+
    '</div>').join('');
}
function fillWebsiteBrandGalleryFields(c){
  ensureWebsiteBrandGalleryFields();
  const brand=c.brandImageUrl||'';
  const bi=document.getElementById('website-brand-image-url'),bp=document.getElementById('website-brand-image-preview'),be=document.getElementById('website-brand-image-empty');
  if(bi)bi.value=brand;if(bp){if(brand){bp.src=brand;bp.style.display='block'}else{bp.removeAttribute('src');bp.style.display='none'}}if(be)be.style.display=brand?'none':'block';
  const sign=c.signboardImageUrl||'',si=document.getElementById('website-signboard-image-url'),sp=document.getElementById('website-signboard-preview'),se=document.getElementById('website-signboard-empty');if(si)si.value=sign;if(sp){if(sign){sp.src=sign;sp.style.display='block'}else{sp.removeAttribute('src');sp.style.display='none'}}if(se)se.style.display=sign?'none':'block';
  const g=Array.isArray(c.storeGallery)?c.storeGallery:[];
  [0,1,2].forEach(i=>{const u=g[i]||'',inp=document.getElementById('website-store-url-'+i),pr=document.getElementById('website-store-preview-'+i),em=document.getElementById('website-store-empty-'+i);if(inp)inp.value=u;if(pr){if(u){pr.src=u;pr.style.display='block'}else{pr.removeAttribute('src');pr.style.display='none'}}if(em)em.style.display=u?'none':'block';});
}
function readWebsiteBrandGalleryFields(){
  return{
    brandImageUrl:document.getElementById('website-brand-image-url')?.value?.trim()||'',
    storeGallery:[0,1,2].map(i=>document.getElementById('website-store-url-'+i)?.value?.trim()||'').filter(Boolean),
    signboardImageUrl:document.getElementById('website-signboard-image-url')?.value?.trim()||''
  };
}
async function uploadWebsiteBrandImage(ev){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading shop-name PNG…');
    const url=await uploadImageToImgBB(file,'shop-logo');
    document.getElementById('website-brand-image-url').value=url;
    const p=document.getElementById('website-brand-image-preview'),e=document.getElementById('website-brand-image-empty');p.src=url;p.style.display='block';e.style.display='none';
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-brand-png');
    showToast('✅ Shop-name image ready');
  }catch(err){console.error(err);showToast('❌ Brand image upload failed')}
  ev.target.value='';
}
function removeWebsiteBrandImage(){
  const i=document.getElementById('website-brand-image-url'),p=document.getElementById('website-brand-image-preview'),e=document.getElementById('website-brand-image-empty');if(i)i.value='';if(p){p.removeAttribute('src');p.style.display='none'}if(e)e.style.display='block';showToast('Brand image removed');
}
async function uploadWebsiteStoreImage(ev,i){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading store photo…');
    const url=await uploadImageToImgBB(file,'promo-banner');
    document.getElementById('website-store-url-'+i).value=url;
    const p=document.getElementById('website-store-preview-'+i),e=document.getElementById('website-store-empty-'+i);p.src=url;p.style.display='block';e.style.display='none';
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-store-photo');
    showToast('✅ Store photo ready');
  }catch(err){console.error(err);showToast('❌ Store photo upload failed')}
  ev.target.value='';
}
function removeWebsiteStoreImage(i){
  const inp=document.getElementById('website-store-url-'+i),p=document.getElementById('website-store-preview-'+i),e=document.getElementById('website-store-empty-'+i);if(inp)inp.value='';if(p){p.removeAttribute('src');p.style.display='none'}if(e)e.style.display='block';showToast('Store photo removed');
}

async function uploadWebsiteSignboardImage(ev){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading signboard image…');
    const url=await uploadImageToImgBB(file,'promo-banner');
    const i=document.getElementById('website-signboard-image-url'),p=document.getElementById('website-signboard-preview'),e=document.getElementById('website-signboard-empty');
    if(i)i.value=url;if(p){p.src=url;p.style.display='block'}if(e)e.style.display='none';
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-signboard');
    showToast('✅ Signboard ready');
  }catch(err){console.error(err);showToast('❌ Signboard upload failed')}
  ev.target.value='';
}
function removeWebsiteSignboardImage(){
  const i=document.getElementById('website-signboard-image-url'),p=document.getElementById('website-signboard-preview'),e=document.getElementById('website-signboard-empty');
  if(i)i.value='';if(p){p.removeAttribute('src');p.style.display='none'}if(e)e.style.display='block';showToast('Signboard removed');
}

function ensureWebsiteBaristaFields(){
  const anchor=document.getElementById('website-extra-fields')||document.getElementById('website-slide-editors');
  if(!anchor||document.getElementById('website-barista-fields'))return;
  const box=document.createElement('div');
  box.id='website-barista-fields';
  box.className='card';
  box.style.cssText='padding:14px;margin:0 0 12px;';
  box.innerHTML=
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><b style="color:var(--orange)">☕ Baristas</b><span style="font-size:10px;opacity:.55;">English + العربية</span></div>'+
    '<p style="font-size:9px;opacity:.58;line-height:1.6;margin:0 0 12px;">Add the owner and up to 3 baristas. Empty profiles stay hidden on the public website.</p>'+'<div style="padding:12px;border:1px solid var(--glass-border);border-radius:16px;background:rgba(255,255,255,.045);margin-bottom:12px;">'+'<div style="font-size:10px;font-weight:900;color:var(--orange);margin-bottom:9px;">👑 Owner</div>'+'<div style="display:grid;grid-template-columns:100px 1fr;gap:11px;align-items:center;">'+'<div style="height:100px;width:100px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.05);border:1px dashed var(--glass-border);display:grid;place-items:center;"><img id="website-owner-preview" style="width:100%;height:100%;object-fit:cover;display:none"><span id="website-owner-empty" style="font-size:9px;opacity:.5;text-align:center;">Owner<br>Photo</span></div>'+'<div><label class="btn" style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:11px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload owner photo<input type="file" accept="image/*" style="display:none" onchange="uploadWebsiteOwnerImage(event)"></label><button type="button" class="btn" onclick="removeWebsiteOwnerImage()" style="width:100%;margin-top:6px;padding:8px;border-radius:11px;background:rgba(255,59,48,.1);color:#ff8179;">Remove photo</button><input id="website-owner-image" type="hidden"></div>'+'</div>'+'<div class="field" style="margin-top:10px;"><label>Owner name — English</label><input id="website-owner-en" type="text" placeholder="Owner name"></div>'+'<div class="field"><label>اسم المالك — عربي</label><input id="website-owner-ar" type="text" dir="rtl" placeholder="اسم المالك"></div>'+'</div>'+
    '<div id="website-barista-list" style="display:grid;gap:12px;"></div>';
  anchor.parentNode.insertBefore(box,anchor);
  const list=document.getElementById('website-barista-list');
  list.innerHTML=[0,1,2].map(i=>
    '<div style="padding:11px;border:1px solid var(--glass-border);border-radius:16px;background:rgba(255,255,255,.035);">'+
      '<div style="font-size:10px;font-weight:900;color:var(--orange);margin-bottom:9px;">Barista '+(i+1)+'</div>'+
      '<div style="display:grid;grid-template-columns:92px 1fr;gap:11px;align-items:center;">'+
        '<div style="height:92px;width:92px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.05);border:1px dashed var(--glass-border);display:grid;place-items:center;">'+
          '<img id="website-barista-preview-'+i+'" style="width:100%;height:100%;object-fit:cover;display:none"><span id="website-barista-empty-'+i+'" style="font-size:9px;opacity:.5;text-align:center;">Barista<br>Photo</span>'+
        '</div>'+
        '<div>'+
          '<label class="btn" style="display:flex;align-items:center;justify-content:center;padding:10px;border-radius:11px;cursor:pointer;background:rgba(255,255,255,.08);color:var(--orange);">📷 Upload photo<input type="file" accept="image/*" style="display:none" onchange="uploadWebsiteBaristaImage(event,'+i+')"></label>'+
          '<button type="button" class="btn" onclick="removeWebsiteBaristaImage('+i+')" style="width:100%;margin-top:6px;padding:8px;border-radius:11px;background:rgba(255,59,48,.1);color:#ff8179;">Remove photo</button>'+
          '<input id="website-barista-image-'+i+'" type="hidden">'+
        '</div>'+
      '</div>'+
      '<div class="field" style="margin-top:10px;"><label>Name — English</label><input id="website-barista-en-'+i+'" type="text" placeholder="Barista name"></div>'+
      '<div class="field"><label>الاسم — عربي</label><input id="website-barista-ar-'+i+'" type="text" dir="rtl" placeholder="اسم الباريستا"></div>'+
    '</div>'
  ).join('');
}
function fillWebsiteBaristas(c){
  ensureWebsiteBaristaFields();
  const owner=c.owner||{},ourl=owner.imageUrl||'';
  const oen=document.getElementById('website-owner-en'),oar=document.getElementById('website-owner-ar'),oim=document.getElementById('website-owner-image'),opr=document.getElementById('website-owner-preview'),oem=document.getElementById('website-owner-empty');
  if(oen)oen.value=owner.nameEn||'';
  if(oar)oar.value=owner.nameAr||'';
  if(oim)oim.value=ourl;
  if(opr){if(ourl){opr.src=ourl;opr.style.display='block'}else{opr.removeAttribute('src');opr.style.display='none'}}
  if(oem)oem.style.display=ourl?'none':'block';
  const arr=Array.isArray(c.baristas)?c.baristas:[];
  [0,1,2].forEach(i=>{
    const b=arr[i]||{},url=b.imageUrl||'';
    const en=document.getElementById('website-barista-en-'+i),ar=document.getElementById('website-barista-ar-'+i),im=document.getElementById('website-barista-image-'+i),pr=document.getElementById('website-barista-preview-'+i),em=document.getElementById('website-barista-empty-'+i);
    if(en)en.value=b.nameEn||'';
    if(ar)ar.value=b.nameAr||'';
    if(im)im.value=url;
    if(pr){if(url){pr.src=url;pr.style.display='block'}else{pr.removeAttribute('src');pr.style.display='none'}}
    if(em)em.style.display=url?'none':'block';
  });
}
function readWebsiteBaristas(){
  const baristas=[0,1,2].map(i=>({
    nameEn:document.getElementById('website-barista-en-'+i)?.value?.trim()||'',
    nameAr:document.getElementById('website-barista-ar-'+i)?.value?.trim()||'',
    imageUrl:document.getElementById('website-barista-image-'+i)?.value?.trim()||''
  }));
  const owner={
    nameEn:document.getElementById('website-owner-en')?.value?.trim()||'',
    nameAr:document.getElementById('website-owner-ar')?.value?.trim()||'',
    imageUrl:document.getElementById('website-owner-image')?.value?.trim()||''
  };
  return {owner,baristas};
}
async function uploadWebsiteBaristaImage(ev,i){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading barista photo…');
    const url=await uploadImageToImgBB(file,'promo-banner');
    const input=document.getElementById('website-barista-image-'+i),pr=document.getElementById('website-barista-preview-'+i),em=document.getElementById('website-barista-empty-'+i);
    if(input)input.value=url;
    if(pr){pr.src=url;pr.style.display='block'}
    if(em)em.style.display='none';
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-barista');
    showToast('✅ Barista photo ready');
  }catch(err){console.error(err);showToast('❌ Barista photo upload failed')}
  ev.target.value='';
}
function removeWebsiteBaristaImage(i){
  const input=document.getElementById('website-barista-image-'+i),pr=document.getElementById('website-barista-preview-'+i),em=document.getElementById('website-barista-empty-'+i);
  if(input)input.value='';
  if(pr){pr.removeAttribute('src');pr.style.display='none'}
  if(em)em.style.display='block';
  showToast('Barista photo removed');
}

async function uploadWebsiteOwnerImage(ev){
  const file=ev.target.files&&ev.target.files[0];if(!file)return;
  try{
    showToast('Uploading owner photo…');
    const url=await uploadImageToImgBB(file,'promo-banner');
    const input=document.getElementById('website-owner-image'),pr=document.getElementById('website-owner-preview'),em=document.getElementById('website-owner-empty');
    if(input)input.value=url;
    if(pr){pr.src=url;pr.style.display='block'}
    if(em)em.style.display='none';
    if(typeof rememberHostedImage==='function')rememberHostedImage(url,file,'website-owner');
    showToast('✅ Owner photo ready');
  }catch(err){console.error(err);showToast('❌ Owner photo upload failed')}
  ev.target.value='';
}
function removeWebsiteOwnerImage(){
  const input=document.getElementById('website-owner-image'),pr=document.getElementById('website-owner-preview'),em=document.getElementById('website-owner-empty');
  if(input)input.value='';
  if(pr){pr.removeAttribute('src');pr.style.display='none'}
  if(em)em.style.display='block';
  showToast('Owner photo removed');
}
