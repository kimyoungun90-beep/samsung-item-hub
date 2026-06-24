
(() => {
  const V107_ZOOM_SCALE=[1.06,1.24,1.46,1.72,2.02,2.38,2.82,3.36,4.02,4.82];
  let v107MainCenter={x:322,y:380};
  let v107DetailZoom=1;
  let v107DetailCenter=null;
  let v107DetailBase=null;
  let v107DetailKey="";
  let v107MapScreenActive=false;

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const scaleFor=level=>V107_ZOOM_SCALE[clamp(Math.round(Number(level)||1),1,10)-1];
  const intersects=(a,b)=>!(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);
  const inView=(x,y,b)=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;
  const clampCenter=(center,w,h,extra=0)=>({
    x:clamp(center.x,w/2-extra,600-w/2+extra),
    y:clamp(center.y,h/2-extra,760-h/2+extra)
  });
  const mainView=()=>{const scale=scaleFor(mapZoom),w=600/scale,h=760/scale,c=clampCenter(v107MainCenter,w,h,26);v107MainCenter=c;return{x:c.x-w/2,y:c.y-h/2,w,h,scale};};
  const detailView=()=>{const base=v107DetailBase||{x:0,y:0,w:600,h:760},scale=scaleFor(v107DetailZoom),w=base.w/scale,h=base.h/scale,c=clampCenter(v107DetailCenter||{x:base.x+base.w/2,y:base.y+base.h/2},w,h,8);v107DetailCenter=c;return{x:c.x-w/2,y:c.y-h/2,w,h,scale};};

  function resetState(render=true){
    mapMode="all";mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;mapZoom=1;
    v107MainCenter={x:322,y:380};v107DetailZoom=1;v107DetailCenter=null;v107DetailBase=null;v107DetailKey="";
    if(render&&els.deptMapPanel)renderMapPanel();
  }
  function refreshRefs(panel){
    els.deptMapPanel=panel;
    ["mapSelectionBar","mapStoreSelectWrap","mapTcSelectWrap","mapStoreSelect","mapTcSelect","mapMetroToggle","mapBackBtn","mapResetBtn","mapZoomIn","mapZoomOut","koreaMap","metroMap","mapDetailLayout","mapInfo","mapCoverageList","mapTcGuide"].forEach(id=>{els[id]=document.getElementById(id);});
  }
  function focusCoverage(tcName,scroll=true){
    const md=getMapDataSafe(),tc=md.logistics.find(r=>r.name===tcName);if(!tc)return;
    mapSelectedTc=tc.name;mapSelectedStore="";mapMode="coverage";mapMetroOpen=true;mapZoom=3;
    const feats=v105CoverageFeatures(tc.name),box=feats.length?v105Bounds(feats,v105Point(tc)):null;
    v107MainCenter=box?{x:box.x+box.w/2,y:box.y+box.h/2}:v105Point(tc);v107DetailKey="";renderMapPanel();
    if(scroll)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),75);
  }
  function selectTc(tcName){
    const md=getMapDataSafe(),tc=md.logistics.find(r=>r.name===tcName);if(!tc)return;
    mapSelectedTc=tc.name;mapSelectedStore="";mapMode="tc";mapMetroOpen=false;mapZoom=1;v107MainCenter={x:322,y:380};v107DetailKey="";renderMapPanel();
  }
  function selectStore(storeName,scroll=true){
    const md=getMapDataSafe(),st=md.stores.find(r=>r.name===storeName);if(!st)return;
    mapSelectedStore=st.name;mapSelectedTc=st.tc||"";mapMode="store";mapMetroOpen=true;mapZoom=5;v107MainCenter=v105Point(st);v107DetailKey="";renderMapPanel();
    if(scroll)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),75);
  }

  function preparePanel(){
    const old=els.deptMapPanel;if(!old)return;
    const panel=old.cloneNode(true);old.replaceWith(panel);refreshRefs(panel);
    panel.querySelector('[data-map-mode="center"]')?.remove();
    const scroll=panel.querySelector('.map-filter-scroll');if(scroll)scroll.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';
    const zoom=panel.querySelector('.map-zoom-control');if(zoom)zoom.innerHTML='<button id="mapZoomOut" type="button" aria-label="지도 축소">−</button><span id="mapZoomLevel" class="map-zoom-level">1 / 10</span><button id="mapZoomIn" type="button" aria-label="지도 확대">+</button>';
    els.mapZoomIn=document.getElementById('mapZoomIn');els.mapZoomOut=document.getElementById('mapZoomOut');
    if(els.mapResetBtn){els.mapResetBtn.title='지도 선택·확대 상태 초기화';els.mapResetBtn.setAttribute('aria-label','지도 초기화');}
    const labels={all:'전체',store:'점포',tc:'TC',coverage:'해당 물류 권역만'};
    panel.querySelectorAll('.map-mode-btn').forEach(btn=>{const sym=btn.querySelector('.map-mode-dot,.map-mode-symbol');btn.innerHTML=(sym?sym.outerHTML:'')+(labels[btn.dataset.mapMode]||btn.textContent.trim());});

    panel.addEventListener('click',e=>{
      const btn=e.target.closest('[data-map-mode]');if(!btn)return;
      const next=btn.dataset.mapMode||'all';
      if(next==='coverage'&&mapSelectedTc){focusCoverage(mapSelectedTc,false);return;}
      mapMode=next;mapSelectedStore='';mapMetroOpen=false;mapZoom=1;v107MainCenter={x:322,y:380};v107DetailKey='';
      if(next!=='tc')mapSelectedTc='';
      renderMapPanel();
    });
    els.mapStoreSelect?.addEventListener('change',()=>{const name=els.mapStoreSelect.value||'';if(name)selectStore(name);else{mapSelectedStore='';mapSelectedTc='';mapMetroOpen=false;mapZoom=1;v107MainCenter={x:322,y:380};renderMapPanel();}});
    els.mapTcSelect?.addEventListener('change',()=>{const name=els.mapTcSelect.value||'';if(name)focusCoverage(name);else{mapSelectedTc='';mapMetroOpen=false;mapZoom=1;v107MainCenter={x:322,y:380};renderMapPanel();}});
    els.mapMetroToggle?.addEventListener('click',()=>{if(!mapSelectedStore&&!(mapSelectedTc&&mapMode==='coverage'))return;mapMetroOpen=!mapMetroOpen;renderMapPanel();if(mapMetroOpen)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:'smooth',block:'start'}),70);});
    els.mapResetBtn?.addEventListener('click',()=>resetState(true));
    els.mapBackBtn?.addEventListener('click',()=>{resetState(false);deptFilter='업무지원실';deptInteracted=false;renderDeptChips();renderDeptFilterPanel();renderDepartments();window.scrollTo({top:0,behavior:'smooth'});});
    els.mapZoomIn?.addEventListener('click',()=>{mapZoom=clamp((Number(mapZoom)||1)+1,1,10);renderKoreaMap();});
    els.mapZoomOut?.addEventListener('click',()=>{mapZoom=clamp((Number(mapZoom)||1)-1,1,10);renderKoreaMap();});
  }

  function paths(activeIds=new Set(),contextIds=null){
    return V105_SIGUNGU.map(f=>`<path class="v106-district ${activeIds.has(f[0])?'active':contextIds?.has(f[0])?'context':''}" d="${f[3]}" fill-rule="evenodd"><title>${esc(f[1]+' '+f[2])}</title></path>`).join('');
  }
  function labelCandidates(level,box,activeIds){
    const out=[];
    if(level===1){
      V105_PROVINCE_LABELS.forEach(v=>{if(inView(v[1],v[2],box))out.push({key:'p'+v[0],text:v[0],x:v[1],y:v[2],type:'province',active:false,priority:4});});
      return out;
    }
    const cityGroups=new Map();
    V105_SIGUNGU.forEach(f=>{
      const name=f[2];
      if(name.includes('시 ')){
        const parent=name.split(' ')[0],key=f[1]+'|'+parent,cur=cityGroups.get(key)||{key,text:parent,x:0,y:0,count:0,type:'city',active:false,priority:4};
        cur.x+=f[4];cur.y+=f[5];cur.count++;cur.active=cur.active||activeIds.has(f[0]);cityGroups.set(key,cur);
      }else if(name.endsWith('시')){
        out.push({key:'s'+f[0],text:name,x:f[4],y:f[5],type:'city',active:activeIds.has(f[0]),priority:4});
      }else if(name.endsWith('군')){
        out.push({key:'c'+f[0],text:name,x:f[4],y:f[5],type:'county',active:activeIds.has(f[0]),priority:3});
      }
    });
    cityGroups.forEach(v=>{v.x/=v.count;v.y/=v.count;out.push(v);});
    if(level>=4){
      V105_SIGUNGU.forEach(f=>{
        const name=f[2];if(!(name.endsWith('구')||name.includes('시 ')))return;
        const text=name.includes('시 ')?name.split(' ').slice(1).join(' '):name;
        out.push({key:'d'+f[0],text,x:f[4],y:f[5],type:'district',active:activeIds.has(f[0]),priority:5});
      });
    }
    return out.filter(r=>inView(r.x,r.y,box));
  }
  function labels(level,box,activeIds,scale){
    const rows=labelCandidates(level,box,activeIds).sort((a,b)=>(b.active-a.active)||(b.priority-a.priority)||a.text.localeCompare(b.text,'ko'));
    const placed=[],parts=[];const minPx=level===1?50:level<=3?42:34;
    rows.forEach(r=>{
      const sx=(r.x-box.x)/box.w*600,sy=(r.y-box.y)/box.h*760;
      if(placed.some(p=>Math.hypot(p.x-sx,p.y-sy)<minPx))return;placed.push({x:sx,y:sy});
      const base=r.type==='province'?13:r.type==='district'?8.6:10.3,font=base/scale,stroke=(r.type==='province'?3:2.3)/scale;
      parts.push(`<text class="v107-map-label ${r.type}${r.active?' active':''}" x="${r.x}" y="${r.y}" style="font-size:${font}px;stroke-width:${stroke}px">${esc(r.text)}</text>`);
    });return parts.join('');
  }

  function markerLayout(items,box,scale,showLabels){
    const positioned=[],threshold=29;
    items.forEach((it,index)=>{
      const origin=v105Point(it.row),baseSx=(origin.x-box.x)/box.w*600,baseSy=(origin.y-box.y)/box.h*760;
      let sx=baseSx,sy=baseSy,tryNo=0;
      while(positioned.some(p=>Math.hypot(p.sx-sx,p.sy-sy)<threshold)&&tryNo<48){tryNo++;const ring=Math.ceil(tryNo/8),angle=(tryNo*137.508)*Math.PI/180,r=20+ring*10;sx=baseSx+Math.cos(angle)*r;sy=baseSy+Math.sin(angle)*r;}
      sx=clamp(sx,18,582);sy=clamp(sy,28,742);
      const x=box.x+sx/600*box.w,y=box.y+sy/760*box.h;positioned.push({...it,origin,x,y,sx,sy,index});
    });
    const inv=1/scale,leaders=[],marks=[],labelBoxes=[];
    positioned.forEach((p,i)=>{
      const moved=Math.hypot(p.x-p.origin.x,p.y-p.origin.y)>1.2;
      if(moved)leaders.push(`<path class="v107-leader" d="M${p.origin.x.toFixed(1)},${p.origin.y.toFixed(1)} L${p.x.toFixed(1)},${p.y.toFixed(1)}"/><circle class="v107-origin" cx="${p.origin.x.toFixed(1)}" cy="${p.origin.y.toFixed(1)}" r="${(1.65*inv).toFixed(2)}"/>`);
      const name=String(p.row.name||''),data=p.kind==='store'?`data-store="${esc(name)}"`:`data-tc="${esc(name)}"`,wantLabel=showLabels||p.selected;
      let label='';
      if(wantLabel){
        const width=Math.max(42,Math.min(124,name.length*9+22)),height=21;
        const candidates=[
          {rx:13,ry:-31,tx:20,ty:-20,anchor:'start',box:{x:p.sx+13,y:p.sy-31,w:width,h:height}},
          {rx:-13-width,ry:-31,tx:-20,ty:-20,anchor:'end',box:{x:p.sx-13-width,y:p.sy-31,w:width,h:height}},
          {rx:-width/2,ry:-58,tx:0,ty:-47,anchor:'middle',box:{x:p.sx-width/2,y:p.sy-58,w:width,h:height}},
          {rx:-width/2,ry:5,tx:0,ty:16,anchor:'middle',box:{x:p.sx-width/2,y:p.sy+5,w:width,h:height}},
          {rx:13,ry:-6,tx:20,ty:5,anchor:'start',box:{x:p.sx+13,y:p.sy-6,w:width,h:height}},
          {rx:-13-width,ry:-6,tx:-20,ty:5,anchor:'end',box:{x:p.sx-13-width,y:p.sy-6,w:width,h:height}}
        ];
        let chosen=candidates.find(c=>c.box.x>=2&&c.box.y>=2&&c.box.x+c.box.w<=598&&c.box.y+c.box.h<=758&&!labelBoxes.some(b=>intersects(c.box,b)))||candidates[0];
        labelBoxes.push(chosen.box);
        label=`<g class="v107-marker-label"><rect x="${chosen.rx}" y="${chosen.ry}" width="${width}" height="${height}" rx="9"/><text x="${chosen.tx}" y="${chosen.ty}" text-anchor="${chosen.anchor}" style="font-size:9px">${esc(name)}</text></g>`;
      }
      marks.push(`<g class="v107-marker ${p.kind} ${p.selected?'selected':''}" ${data} transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${inv.toFixed(4)})"><title>${esc(name)}</title><path class="pin-shadow" d="M0 1 C-1 -1 -8.5 -8 -8.5 -14 A8.5 8.5 0 1 1 8.5 -14 C8.5 -8 1 -1 0 1Z"/><path class="pin-shape" d="M0 1 C-1 -1 -7.5 -8 -7.5 -14 A7.5 7.5 0 1 1 7.5 -14 C7.5 -8 1 -1 0 1Z"/><circle class="pin-hole" cx="0" cy="-14" r="2.35"/>${label}</g>`);
    });
    return{leaders:leaders.join(''),marks:marks.join('')};
  }
  function bindDrag(container,getView,setCenter,rerender){
    if(!container)return;let state=null;
    container.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;if(e.target.closest?.('[data-store],[data-tc],button'))return;const v=getView();state={id:e.pointerId,x:e.clientX,y:e.clientY,cx:v.x+v.w/2,cy:v.y+v.h/2,v,moved:false};container.classList.add('dragging');container.setPointerCapture?.(e.pointerId);};
    container.onpointermove=e=>{if(!state||state.id!==e.pointerId)return;const rect=container.getBoundingClientRect(),dx=(e.clientX-state.x)/Math.max(1,rect.width)*state.v.w,dy=(e.clientY-state.y)/Math.max(1,rect.height)*state.v.h;if(Math.abs(dx)+Math.abs(dy)>1)state.moved=true;setCenter({x:state.cx-dx,y:state.cy-dy});const svg=container.querySelector('svg');if(svg){const v=getView();svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`);}};
    const end=e=>{if(!state)return;container.releasePointerCapture?.(state.id);container.classList.remove('dragging');const moved=state.moved;state=null;if(moved)rerender?.();};
    container.onpointerup=end;container.onpointercancel=end;container.onpointerleave=e=>{if(state&&e.buttons===0)end(e);};
  }

  resetMapView=function(){resetState(true);};
  renderMapPanel=function(){
    if(!els.deptMapPanel)return;const md=getMapDataSafe(),tcRows=md.logistics.filter(r=>mapLogisticsKind(r)==='tc');
    if(mapMode==='center')mapMode='all';
    if(els.mapStoreSelect){const cur=mapSelectedStore;els.mapStoreSelect.innerHTML='<option value="">코스트코 점포 선택</option>'+md.stores.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join('');if(md.stores.some(r=>r.name===cur))els.mapStoreSelect.value=cur;}
    if(els.mapTcSelect){const cur=mapSelectedTc;els.mapTcSelect.innerHTML='<option value="">TC 선택</option>'+tcRows.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join('');if(tcRows.some(r=>r.name===cur))els.mapTcSelect.value=cur;}
    const needStore=mapMode==='store',needTc=mapMode==='coverage';els.mapSelectionBar?.classList.toggle('show',needStore||needTc);els.mapStoreSelectWrap?.classList.toggle('show',needStore);els.mapTcSelectWrap?.classList.toggle('show',needTc);
    els.deptMapPanel.querySelectorAll('.map-mode-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.mapMode===mapMode));
    const canDetail=Boolean(mapSelectedStore||(mapSelectedTc&&mapMode==='coverage')),detail=mapMetroOpen&&canDetail;
    els.mapMetroToggle?.classList.toggle('show',canDetail);if(els.mapMetroToggle)els.mapMetroToggle.textContent=detail?'상세 닫기':'상세 다시 보기';
    els.mapTcGuide?.classList.toggle('show',Boolean(mapSelectedTc&&mapMode==='tc'));
    els.mapDetailLayout?.classList.toggle('detail-open',detail);els.mapDetailLayout?.classList.toggle('metro-open',detail);
    renderKoreaMap();renderMetroMap();renderMapInfo();renderMapCoverageList();
  };

  renderKoreaMap=function(){
    if(!els.koreaMap)return;const md=getMapDataSafe(),tc=md.logistics.find(r=>r.name===mapSelectedTc),store=md.stores.find(r=>r.name===mapSelectedStore),tcName=mapSelectedTc||(store?.tc||'');
    const active=tcName?v105CoverageFeatures(tcName):[],activeIds=new Set(active.map(f=>f[0]));let stores=[],tcs=[];
    if(mapMode==='all'){stores=md.stores;tcs=md.logistics.filter(r=>mapLogisticsKind(r)==='tc');}
    else if(mapMode==='store'){stores=mapSelectedStore?md.stores.filter(r=>r.name===mapSelectedStore):md.stores;}
    else if(mapMode==='tc'){tcs=md.logistics.filter(r=>mapLogisticsKind(r)==='tc');}
    else if(mapMode==='coverage'){tcs=mapSelectedTc?md.logistics.filter(r=>r.name===mapSelectedTc):md.logistics.filter(r=>mapLogisticsKind(r)==='tc');if(mapSelectedTc)stores=md.stores.filter(r=>r.tc===mapSelectedTc);}
    const view=mainView(),context=new Set(V105_SIGUNGU.filter(f=>v105Intersects(f,view)).map(f=>f[0]));
    const items=[...stores.map(r=>({row:r,kind:'store',selected:r.name===mapSelectedStore})),...tcs.map(r=>({row:r,kind:'tc',selected:r.name===mapSelectedTc}))];
    const showNames=mapMode==='store'||mapMode==='tc'||mapMode==='coverage';const layout=markerLayout(items,view,view.scale,showNames);
    const paint=(mapMode==='coverage'||(mapMode==='store'&&mapSelectedStore))?activeIds:new Set(),mapLabels=labels(Number(mapZoom)||1,view,activeIds,view.scale);
    els.koreaMap.innerHTML=`<svg class="korea-map-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" role="img" aria-label="대한민국 실제 시군구 지도"><rect x="-100" y="-50" width="800" height="860" fill="#dff1fd"/>${paths(paint,context)}${mapLabels}${layout.leaders}${layout.marks}</svg><div class="map-drag-help">마우스로 지도를 끌어 이동</div>`;
    const level=document.getElementById('mapZoomLevel');if(level)level.textContent=`${mapZoom} / 10`;
    els.koreaMap.querySelectorAll('[data-store]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();selectStore(el.dataset.store||'');}));
    els.koreaMap.querySelectorAll('[data-tc]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();if(mapMode==='coverage')focusCoverage(el.dataset.tc||'');else selectTc(el.dataset.tc||'');}));
    bindDrag(els.koreaMap,mainView,c=>{v107MainCenter=c;},()=>renderKoreaMap());
  };

  renderMetroMap=function(){
    if(!els.metroMap)return;const open=mapMetroOpen&&Boolean(mapSelectedStore||(mapSelectedTc&&mapMode==='coverage'));els.metroMap.classList.toggle('show',open);if(!open){els.metroMap.innerHTML='';return;}
    const md=getMapDataSafe(),store=md.stores.find(r=>r.name===mapSelectedStore),tcName=mapSelectedTc||(store?.tc||''),tc=md.logistics.find(r=>r.name===tcName),active=v105CoverageFeatures(tcName),ids=new Set(active.map(f=>f[0])),point=v105Point(store||tc),base=v105Bounds(active,point),key=(store?'S:':'T:')+(store?.name||tcName);
    if(v107DetailKey!==key){v107DetailKey=key;v107DetailZoom=1;v107DetailBase=base;v107DetailCenter={x:base.x+base.w/2,y:base.y+base.h/2};}else v107DetailBase=base;
    const view=detailView(),context=new Set(V105_SIGUNGU.filter(f=>v105Intersects(f,view)).map(f=>f[0])),linked=md.stores.filter(s=>s.tc===tcName);
    const markerRows=store?[{row:store,kind:'store',selected:true}]:[...linked.map(s=>({row:s,kind:'store',selected:false})),...(tc?[{row:tc,kind:'tc',selected:true}]:[])];
    const layout=markerLayout(markerRows,view,view.scale,true),mapLabels=labels(v107DetailZoom,view,ids,view.scale),title=store?`${store.name} 진열·판매 가능 지역`:`${tcName||'선택 TC'} 권역 확대`;
    els.metroMap.innerHTML=`<div class="metro-map-head"><div class="metro-map-title">${esc(title)}</div><button class="metro-map-close" type="button" aria-label="상세 닫기">×</button></div><div class="metro-canvas"><svg class="v106-detail-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}"><rect x="-100" y="-50" width="800" height="860" fill="#dff1fd"/>${paths(ids,context)}${mapLabels}${layout.leaders}${layout.marks}</svg><div class="detail-zoom-control"><button type="button" data-detail-zoom="out" aria-label="상세 지도 축소">−</button><span class="detail-zoom-level">${v107DetailZoom} / 10</span><button type="button" data-detail-zoom="in" aria-label="상세 지도 확대">+</button></div><div class="map-drag-help">마우스로 지도를 끌어 이동</div></div><div class="map-map-source-note">2025-06-30 시군구 행정경계 SHP 기준 · 1단계 광역시·도 / 2~3단계 시·군 / 4단계부터 구 표시</div>`;
    els.metroMap.querySelector('.metro-map-close')?.addEventListener('click',()=>{mapMetroOpen=false;renderMapPanel();});
    els.metroMap.querySelector('[data-detail-zoom="in"]')?.addEventListener('click',()=>{v107DetailZoom=clamp(v107DetailZoom+1,1,10);renderMetroMap();});
    els.metroMap.querySelector('[data-detail-zoom="out"]')?.addEventListener('click',()=>{v107DetailZoom=clamp(v107DetailZoom-1,1,10);renderMetroMap();});
    els.metroMap.querySelectorAll('[data-store]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();selectStore(el.dataset.store||'',false);}));
    els.metroMap.querySelectorAll('[data-tc]').forEach(el=>el.addEventListener('click',e=>{e.stopPropagation();focusCoverage(el.dataset.tc||'',false);}));
    bindDrag(els.metroMap.querySelector('.metro-canvas'),detailView,c=>{v107DetailCenter=c;},()=>renderMetroMap());
  };

  renderMapInfo=function(){
    if(!els.mapInfo)return;const md=getMapDataSafe(),store=md.stores.find(r=>r.name===mapSelectedStore),tc=md.logistics.find(r=>r.name===mapSelectedTc),row=store||tc;if(!row||!mapMetroOpen){els.mapInfo.innerHTML='';return;}
    const isStore=Boolean(store),tcName=isStore?(store.tc||mapSelectedTc):row.name,supportTc=md.logistics.find(r=>r.name===tcName),supportPhone=isStore?(store.phone||supportTc?.phone||'미등록'):(row.phone||'미등록'),linked=isStore?[]:md.stores.filter(s=>s.tc===row.name).sort((a,b)=>processLocaleCompare(a.name,b.name)),coverage=md.coverage.filter(r=>r.tc===tcName),chips=coverage.map(r=>`<span class="map-info-area-chip">${esc((r.province?normalizeProvinceName(r.province)+' ':'')+(r.area||''))}</span>`).join('');
    els.mapInfo.innerHTML=`<div class="map-info-card"><div class="map-info-head"><div><div><span class="map-info-title">${esc(row.name)}</span><span class="map-info-selected">선택됨</span></div>${!isStore?`<div class="map-info-phone">☎ ${esc(supportPhone)}</div>`:''}</div></div>${isStore?`<div class="map-info-support"><div class="map-info-support-label">업무지원실 연락처</div><div class="map-info-support-value">☎ ${esc(supportPhone)}</div></div><div class="map-overlay-section"><div class="map-overlay-label">진열·판매 가능 지역</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`:`<div class="map-linked-count-box"><span>연결 점포</span><strong>${linked.length}개</strong></div><div class="map-overlay-section"><div class="map-overlay-label">관할 시·군·구</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`}<div class="map-overlay-section"><div class="map-overlay-label">주소</div><div class="map-overlay-value">${esc(row.address||'주소 입력 전')}</div></div>${!isStore&&linked.length?`<div class="map-linked-stores"><div class="map-linked-title">연결 점포 목록</div><div class="map-linked-chips">${linked.map(s=>`<button class="map-linked-chip" type="button" data-linked-store="${esc(s.name)}">${esc(s.name)}</button>`).join('')}</div></div>`:''}<div class="map-actions"><button class="map-action copy" type="button" data-copy-address="${esc(row.address||'')}" ${row.address?'':'disabled'}>주소 복사</button></div></div>`;
    els.mapInfo.querySelector('[data-copy-address]')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.copyAddress||'');e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='주소 복사',1200);}catch(err){}});
    els.mapInfo.querySelectorAll('[data-linked-store]').forEach(btn=>btn.addEventListener('click',()=>selectStore(btn.dataset.linkedStore||'',false)));
  };
  renderMapCoverageList=function(){if(els.mapCoverageList)els.mapCoverageList.innerHTML='';};

  const prevShowPage=showPage;
  showPage=function(page,push=true){const next=page||'home';if(next!=='dept'){v107MapScreenActive=false;resetState(false);}return prevShowPage(next,push);};
  const prevRenderDeptFilterPanel=renderDeptFilterPanel;
  renderDeptFilterPanel=function(){const isMap=deptFilter==='지도 보기';if(isMap&&!v107MapScreenActive){resetState(false);v107MapScreenActive=true;}else if(!isMap)v107MapScreenActive=false;const result=prevRenderDeptFilterPanel();if(isMap)renderMapPanel();return result;};

  preparePanel();renderMapPanel();
})();
