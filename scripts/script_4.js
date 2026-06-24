
(() => {
  const V106_ZOOM_SCALE=[1,1.14,1.32,1.56,1.86,2.22,2.7,3.32,4.12,5.18];
  let v106MainCenter={x:300,y:380};
  let v106DetailZoom=1;
  let v106DetailCenter=null;
  let v106DetailBase=null;
  let v106DetailKey="";
  let v106MapScreenActive=false;

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const inBox=(x,y,b)=>x>=b.x&&x<=b.x+b.w&&y>=b.y&&y<=b.y+b.h;
  const v106Scale=level=>V106_ZOOM_SCALE[clamp(Math.round(Number(level)||1),1,10)-1];
  const v106ClampCenter=(center,w,h)=>({x:clamp(center.x,w/2,600-w/2),y:clamp(center.y,h/2,760-h/2)});
  const v106MainView=()=>{const scale=v106Scale(mapZoom),w=600/scale,h=760/scale,c=v106ClampCenter(v106MainCenter,w,h);v106MainCenter=c;return{x:c.x-w/2,y:c.y-h/2,w,h,scale};};
  const v106DetailView=()=>{const base=v106DetailBase||{x:0,y:0,w:600,h:760},scale=v106Scale(v106DetailZoom),w=base.w/scale,h=base.h/scale,c=v106ClampCenter(v106DetailCenter||{x:base.x+base.w/2,y:base.y+base.h/2},w,h);v106DetailCenter=c;return{x:c.x-w/2,y:c.y-h/2,w,h,scale};};

  function v106ResetState(render=true){
    mapMode="all";mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;mapZoom=1;
    v106MainCenter={x:300,y:380};v106DetailZoom=1;v106DetailCenter=null;v106DetailBase=null;v106DetailKey="";
    if(render&&els.deptMapPanel)renderMapPanel();
  }

  function v106RefreshRefs(panel){
    els.deptMapPanel=panel;
    ["mapSelectionBar","mapStoreSelectWrap","mapTcSelectWrap","mapStoreSelect","mapTcSelect","mapMetroToggle","mapBackBtn","mapResetBtn","mapZoomIn","mapZoomOut","koreaMap","metroMap","mapDetailLayout","mapInfo","mapCoverageList"].forEach(id=>{els[id]=document.getElementById(id);});
  }

  function v106PreparePanel(){
    const old=els.deptMapPanel;if(!old)return;
    const panel=old.cloneNode(true);old.replaceWith(panel);v106RefreshRefs(panel);
    const zoom=panel.querySelector(".map-zoom-control");
    if(zoom)zoom.innerHTML='<button id="mapZoomOut" type="button" aria-label="지도 축소">−</button><span id="mapZoomLevel" class="map-zoom-level">1 / 10</span><button id="mapZoomIn" type="button" aria-label="지도 확대">+</button>';
    els.mapZoomIn=document.getElementById("mapZoomIn");els.mapZoomOut=document.getElementById("mapZoomOut");
    if(els.mapResetBtn){els.mapResetBtn.title="지도 선택·확대 상태 초기화";els.mapResetBtn.setAttribute("aria-label","지도 초기화");}
    const modeLabels={all:"전체",store:"점포",center:"물류센터",tc:"TC",coverage:"해당 물류 권역만"};panel.querySelectorAll(".map-mode-btn").forEach(btn=>{const sym=btn.querySelector(".map-mode-dot,.map-mode-symbol");btn.innerHTML=(sym?sym.outerHTML:"")+(modeLabels[btn.dataset.mapMode]||btn.textContent.trim());});
    const legend=panel.querySelector(".map-legend");if(legend&&!legend.querySelector(".map-legend-pin.center")){const item=document.createElement("span");item.className="map-legend-item";item.innerHTML='<i class="map-legend-pin center"></i>물류센터';const tcItem=[...legend.children].find(x=>x.textContent.includes("TC")&&!x.textContent.includes("선택"));legend.insertBefore(item,tcItem||legend.children[1]||null);}

    panel.addEventListener("click",e=>{
      const btn=e.target.closest("[data-map-mode]");if(!btn)return;
      const next=btn.dataset.mapMode||"all";
      mapMode=next;mapSelectedStore="";mapSelectedTc="";mapMetroOpen=false;mapZoom=1;v106MainCenter={x:300,y:380};v106DetailKey="";
      renderMapPanel();
    });
    els.mapStoreSelect?.addEventListener("change",()=>{
      mapSelectedStore=els.mapStoreSelect.value||"";const md=getMapDataSafe(),st=md.stores.find(r=>r.name===mapSelectedStore);mapSelectedTc=st?.tc||"";mapMode="store";mapMetroOpen=Boolean(st);mapZoom=st?5:1;v106MainCenter=st?v105Point(st):{x:300,y:380};v106DetailKey="";renderMapPanel();if(st)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),80);
    });
    els.mapTcSelect?.addEventListener("change",()=>{
      mapSelectedTc=els.mapTcSelect.value||"";mapSelectedStore="";mapMode="coverage";mapMetroOpen=Boolean(mapSelectedTc);mapZoom=mapSelectedTc?3:1;
      const feats=mapSelectedTc?v105CoverageFeatures(mapSelectedTc):[];const box=feats.length?v105Bounds(feats):null;v106MainCenter=box?{x:box.x+box.w/2,y:box.y+box.h/2}:{x:300,y:380};v106DetailKey="";renderMapPanel();if(mapSelectedTc)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),80);
    });
    els.mapMetroToggle?.addEventListener("click",()=>{if(!mapSelectedTc&&!mapSelectedStore)return;mapMetroOpen=!mapMetroOpen;renderMapPanel();if(mapMetroOpen)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),70);});
    els.mapResetBtn?.addEventListener("click",()=>v106ResetState(true));
    els.mapBackBtn?.addEventListener("click",()=>{v106ResetState(false);deptFilter="업무지원실";deptInteracted=false;renderDeptChips();renderDeptFilterPanel();renderDepartments();window.scrollTo({top:0,behavior:"smooth"});});
    els.mapZoomIn?.addEventListener("click",()=>{mapZoom=clamp((Number(mapZoom)||1)+1,1,10);renderKoreaMap();});
    els.mapZoomOut?.addEventListener("click",()=>{mapZoom=clamp((Number(mapZoom)||1)-1,1,10);renderKoreaMap();});
  }

  function v106Paths(activeIds=new Set(),contextIds=null){
    return V105_SIGUNGU.map(f=>`<path class="v106-district ${activeIds.has(f[0])?"active":contextIds?.has(f[0])?"context":""}" d="${f[3]}" fill-rule="evenodd"><title>${esc(f[1]+" "+f[2])}</title></path>`).join("");
  }

  function v106LabelCandidates(level,box,activeIds){
    const out=[];
    if(level<=3){
      V105_PROVINCE_LABELS.forEach(v=>{if(inBox(v[1],v[2],box))out.push({key:"p"+v[0],text:v[0],x:v[1],y:v[2],type:"province",active:false,priority:3});});
      return out;
    }
    const cityGroups=new Map();
    V105_SIGUNGU.forEach(f=>{
      const n=f[2],parent=n.includes("시 ")?n.split(" ")[0]:(n.endsWith("시")?n:"");
      if(parent){const key=f[1]+"|"+parent,cur=cityGroups.get(key)||{key,text:parent,x:0,y:0,count:0,type:"city",active:false,priority:3};cur.x+=f[4];cur.y+=f[5];cur.count++;cur.active=cur.active||activeIds.has(f[0]);cityGroups.set(key,cur);}
    });
    cityGroups.forEach(v=>{v.x/=v.count;v.y/=v.count;if(inBox(v.x,v.y,box))out.push(v);});
    if(level>=7)V105_SIGUNGU.filter(f=>f[2].endsWith("군")).forEach(f=>{if(inBox(f[4],f[5],box))out.push({key:"c"+f[0],text:f[2],x:f[4],y:f[5],type:"county",active:activeIds.has(f[0]),priority:2});});
    if(level>=10)V105_SIGUNGU.filter(f=>f[2].endsWith("구")||f[2].includes("시 ")).forEach(f=>{if(!inBox(f[4],f[5],box))return;const text=f[2].includes("시 ")?f[2].split(" ").slice(1).join(" "):f[2];out.push({key:"d"+f[0],text,x:f[4],y:f[5],type:"district",active:activeIds.has(f[0]),priority:1});});
    return out;
  }

  function v106Labels(level,box,activeIds,scale){
    const rows=v106LabelCandidates(level,box,activeIds).sort((a,b)=>(b.active-a.active)||(b.priority-a.priority)||a.text.localeCompare(b.text,"ko"));
    const placed=[],parts=[];
    const minPx=level>=10?38:level>=7?43:50;
    rows.forEach(r=>{
      const sx=(r.x-box.x)/box.w*600,sy=(r.y-box.y)/box.h*760;
      if(placed.some(p=>Math.hypot(p.x-sx,p.y-sy)<minPx))return;
      placed.push({x:sx,y:sy});
      const font=(r.type==="province"?13:r.type==="city"?11:r.type==="county"?10:9)/scale;
      const stroke=(r.type==="province"?3:2.4)/scale;
      parts.push(`<text class="v106-map-label ${r.type}${r.active?" active":""}" x="${r.x}" y="${r.y}" style="font-size:${font}px;stroke-width:${stroke}px">${esc(r.text)}</text>`);
    });
    return parts.join("");
  }

  function v106MarkerLayout(items,box,scale,showLabels){
    const positioned=[];const threshold=25;
    items.forEach((it,index)=>{
      const origin=v105Point(it.row),baseSx=(origin.x-box.x)/box.w*600,baseSy=(origin.y-box.y)/box.h*760;
      let sx=baseSx,sy=baseSy,tryNo=0;
      while(positioned.some(p=>Math.hypot(p.sx-sx,p.sy-sy)<threshold)&&tryNo<36){tryNo++;const ring=Math.ceil(tryNo/8),angle=(tryNo*137.508)*Math.PI/180,r=18+ring*9;sx=baseSx+Math.cos(angle)*r;sy=baseSy+Math.sin(angle)*r;}
      const x=box.x+sx/600*box.w,y=box.y+sy/760*box.h;positioned.push({...it,origin,x,y,sx,sy,index});
    });
    const inv=1/scale,leaders=[],marks=[];
    positioned.forEach(p=>{
      const moved=Math.hypot(p.x-p.origin.x,p.y-p.origin.y)>1.2;
      if(moved)leaders.push(`<path class="v106-leader" d="M${p.origin.x.toFixed(1)},${p.origin.y.toFixed(1)} L${p.x.toFixed(1)},${p.y.toFixed(1)}"/><circle class="v106-origin" cx="${p.origin.x.toFixed(1)}" cy="${p.origin.y.toFixed(1)}" r="${(1.7*inv).toFixed(2)}"/>`);
      const name=String(p.row.name||""),data=p.kind==="store"?`data-store="${esc(name)}"`:p.kind==="center"?`data-center="${esc(name)}"`:`data-tc="${esc(name)}"`,label=showLabels||p.selected;
      const width=Math.max(42,Math.min(126,name.length*10+22));
      marks.push(`<g class="v106-marker ${p.kind} ${p.selected?"selected":""}" ${data} transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${inv.toFixed(4)})"><title>${esc(name)}</title><circle class="halo" r="8.3"/><circle class="dot" r="6.4"/><circle class="inner" r="2.05"/>${label?`<g class="v106-marker-label"><rect x="10.5" y="-10.5" width="${width}" height="21" rx="9"/><text x="18" y=".5" style="font-size:9px">${esc(name)}</text></g>`:""}</g>`);
    });
    return{leaders:leaders.join(""),marks:marks.join("")};
  }

  function v106BindDrag(container,getView,setCenter,rerender){
    if(!container)return;
    let state=null;
    container.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;if(e.target.closest?.("[data-store],[data-tc],button"))return;const v=getView();state={id:e.pointerId,x:e.clientX,y:e.clientY,cx:v.x+v.w/2,cy:v.y+v.h/2,v,moved:false};container.classList.add("dragging");container.setPointerCapture?.(e.pointerId);};
    container.onpointermove=e=>{if(!state||state.id!==e.pointerId)return;const rect=container.getBoundingClientRect(),dx=(e.clientX-state.x)/Math.max(1,rect.width)*state.v.w,dy=(e.clientY-state.y)/Math.max(1,rect.height)*state.v.h;if(Math.abs(dx)+Math.abs(dy)>1)state.moved=true;setCenter({x:state.cx-dx,y:state.cy-dy});const svg=container.querySelector("svg");if(svg){const v=getView();svg.setAttribute("viewBox",`${v.x} ${v.y} ${v.w} ${v.h}`);}};
    const end=e=>{if(!state)return;container.releasePointerCapture?.(state.id);container.classList.remove("dragging");const moved=state.moved;state=null;if(moved)rerender?.();};container.onpointerup=end;container.onpointercancel=end;container.onpointerleave=e=>{if(state&&e.buttons===0)end(e);};
  }

  function v106SelectStore(name,scroll=true){
    const md=getMapDataSafe(),st=md.stores.find(r=>r.name===name);if(!st)return;mapSelectedStore=st.name;mapSelectedTc=st.tc||"";mapMode="store";mapMetroOpen=true;mapZoom=5;v106MainCenter=v105Point(st);v106DetailKey="";renderMapPanel();if(scroll)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),75);
  }
  function v106SelectTc(name,scroll=true){
    const md=getMapDataSafe(),tc=md.logistics.find(r=>r.name===name);if(!tc)return;mapSelectedTc=tc.name;mapSelectedStore="";mapMode="coverage";mapMetroOpen=true;mapZoom=3;const feats=v105CoverageFeatures(tc.name),box=feats.length?v105Bounds(feats,v105Point(tc)):null;v106MainCenter=box?{x:box.x+box.w/2,y:box.y+box.h/2}:v105Point(tc);v106DetailKey="";renderMapPanel();if(scroll)setTimeout(()=>els.mapDetailLayout?.scrollIntoView({behavior:"smooth",block:"start"}),75);
  }

  resetMapView=function(){v106ResetState(true);};

  renderMapPanel=function(){
    if(!els.deptMapPanel)return;const md=getMapDataSafe(),tcRows=md.logistics.filter(r=>mapLogisticsKind(r)==="tc");
    if(els.mapStoreSelect){const cur=mapSelectedStore;els.mapStoreSelect.innerHTML='<option value="">코스트코 점포 선택</option>'+md.stores.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join("");if(md.stores.some(r=>r.name===cur))els.mapStoreSelect.value=cur;}
    if(els.mapTcSelect){const cur=mapSelectedTc;els.mapTcSelect.innerHTML='<option value="">TC 선택</option>'+tcRows.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(r=>`<option value="${esc(r.name)}">${esc(r.name)}</option>`).join("");if(tcRows.some(r=>r.name===cur))els.mapTcSelect.value=cur;}
    const needStore=mapMode==="store",needTc=mapMode==="coverage";els.mapSelectionBar?.classList.toggle("show",needStore||needTc);els.mapStoreSelectWrap?.classList.toggle("show",needStore);els.mapTcSelectWrap?.classList.toggle("show",needTc);
    els.deptMapPanel.querySelectorAll(".map-mode-btn").forEach(btn=>btn.classList.toggle("active",btn.dataset.mapMode===mapMode));
    const hasSelection=Boolean(mapSelectedTc||mapSelectedStore),detail=mapMetroOpen&&hasSelection;els.mapMetroToggle?.classList.toggle("show",hasSelection);if(els.mapMetroToggle)els.mapMetroToggle.textContent=detail?"상세 닫기":"상세 다시 보기";
    els.mapDetailLayout?.classList.toggle("detail-open",detail);els.mapDetailLayout?.classList.toggle("metro-open",detail);
    renderKoreaMap();renderMetroMap();renderMapInfo();renderMapCoverageList();
  };

  renderKoreaMap=function(){
    if(!els.koreaMap)return;const md=getMapDataSafe(),tc=md.logistics.find(r=>r.name===mapSelectedTc),store=md.stores.find(r=>r.name===mapSelectedStore),tcName=mapSelectedTc||(store?.tc||"");
    const active=tcName?v105CoverageFeatures(tcName):[],activeIds=new Set(active.map(f=>f[0]));let stores=[],tcs=[];
    let centers=[];
    if(mapMode==="all"){stores=md.stores;tcs=md.logistics.filter(r=>mapLogisticsKind(r)==="tc");centers=md.logistics.filter(r=>mapLogisticsKind(r)==="center");}
    else if(mapMode==="center"){centers=md.logistics.filter(r=>mapLogisticsKind(r)==="center");}
    else if(mapMode==="tc"){tcs=md.logistics.filter(r=>mapLogisticsKind(r)==="tc");}
    else if(mapMode==="store"){stores=mapSelectedStore?md.stores.filter(r=>r.name===mapSelectedStore):md.stores;if(store?.tc)tcs=md.logistics.filter(r=>r.name===store.tc);}
    else if(mapMode==="coverage"){tcs=mapSelectedTc?md.logistics.filter(r=>r.name===mapSelectedTc):md.logistics.filter(r=>mapLogisticsKind(r)==="tc");if(mapSelectedTc)stores=md.stores.filter(r=>r.tc===mapSelectedTc);}
    const view=v106MainView(),context=new Set(V105_SIGUNGU.filter(f=>v105Intersects(f,view)).map(f=>f[0]));
    const items=[...stores.map(r=>({row:r,kind:"store",selected:r.name===mapSelectedStore})),...centers.map(r=>({row:r,kind:"center",selected:false})),...tcs.map(r=>({row:r,kind:"tc",selected:r.name===mapSelectedTc}))];
    const layout=v106MarkerLayout(items,view,view.scale,false);
    let relation="";if(store&&tc){const a=v105Point(store),b=v105Point(tc);relation=`<path class="v106-relation" d="M${a.x},${a.y} L${b.x},${b.y}"/>`;}
    const paths=v106Paths((mapMode==="coverage"||mapMode==="store")?activeIds:new Set(),context),labels=v106Labels(Number(mapZoom)||1,view,activeIds,view.scale);
    els.koreaMap.innerHTML=`<svg class="korea-map-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}" role="img" aria-label="대한민국 실제 시군구 지도"><rect x="0" y="0" width="600" height="760" fill="#dff1fd"/>${paths}${labels}${relation}${layout.leaders}${layout.marks}</svg><div class="map-drag-help">마우스로 지도를 끌어 이동</div>`;
    const level=document.getElementById("mapZoomLevel");if(level)level.textContent=`${mapZoom} / 10`;
    els.koreaMap.querySelectorAll("[data-store]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();v106SelectStore(el.dataset.store||"");}));
    els.koreaMap.querySelectorAll("[data-tc]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();v106SelectTc(el.dataset.tc||"");}));
    v106BindDrag(els.koreaMap,v106MainView,c=>{v106MainCenter=c;},()=>renderKoreaMap());
  };

  renderMetroMap=function(){
    if(!els.metroMap)return;const open=mapMetroOpen&&Boolean(mapSelectedTc||mapSelectedStore);els.metroMap.classList.toggle("show",open);if(!open){els.metroMap.innerHTML="";return;}
    const md=getMapDataSafe(),store=md.stores.find(r=>r.name===mapSelectedStore),tcName=mapSelectedTc||(store?.tc||""),tc=md.logistics.find(r=>r.name===tcName),active=v105CoverageFeatures(tcName),ids=new Set(active.map(f=>f[0])),point=v105Point(store||tc),base=v105Bounds(active,point),key=(store?"S:":"T:")+(store?.name||tcName);
    if(v106DetailKey!==key){v106DetailKey=key;v106DetailZoom=1;v106DetailBase=base;v106DetailCenter={x:base.x+base.w/2,y:base.y+base.h/2};}else v106DetailBase=base;
    const view=v106DetailView(),context=new Set(V105_SIGUNGU.filter(f=>v105Intersects(f,view)).map(f=>f[0])),linked=md.stores.filter(s=>s.tc===tcName);
    const markerRows=store?[{row:store,kind:"store",selected:true},...(tc?[{row:tc,kind:"tc",selected:true}]:[])]:[...linked.map(s=>({row:s,kind:"store",selected:false})),...(tc?[{row:tc,kind:"tc",selected:true}]:[])];
    const layout=v106MarkerLayout(markerRows,view,view.scale,false),labels=v106Labels(v106DetailZoom,view,ids,view.scale),title=store?`${store.name} 진열·판매 가능 권역`:`${tcName||"선택 TC"} 권역 확대`;
    els.metroMap.innerHTML=`<div class="metro-map-head"><div class="metro-map-title">${esc(title)}</div><button class="metro-map-close" type="button" aria-label="상세 닫기">×</button></div><div class="metro-canvas"><svg class="v106-detail-svg" viewBox="${view.x} ${view.y} ${view.w} ${view.h}"><rect x="0" y="0" width="600" height="760" fill="#dff1fd"/>${v106Paths(ids,context)}${labels}${layout.leaders}${layout.marks}</svg><div class="detail-zoom-control"><button type="button" data-detail-zoom="out" aria-label="상세 지도 축소">−</button><span class="detail-zoom-level">${v106DetailZoom} / 10</span><button type="button" data-detail-zoom="in" aria-label="상세 지도 확대">+</button></div><div class="map-drag-help">마우스로 지도를 끌어 이동</div></div><div class="map-map-source-note">2025-06-30 시군구 행정경계 SHP 기준 · 확대 단계에 따라 시·군·구 명칭 표시</div>`;
    els.metroMap.querySelector(".metro-map-close")?.addEventListener("click",()=>{mapMetroOpen=false;renderMapPanel();});
    els.metroMap.querySelector('[data-detail-zoom="in"]')?.addEventListener("click",()=>{v106DetailZoom=clamp(v106DetailZoom+1,1,10);renderMetroMap();});
    els.metroMap.querySelector('[data-detail-zoom="out"]')?.addEventListener("click",()=>{v106DetailZoom=clamp(v106DetailZoom-1,1,10);renderMetroMap();});
    els.metroMap.querySelectorAll("[data-store]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();v106SelectStore(el.dataset.store||"",false);}));
    els.metroMap.querySelectorAll("[data-tc]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();v106SelectTc(el.dataset.tc||"",false);}));
    const canvas=els.metroMap.querySelector(".metro-canvas");v106BindDrag(canvas,v106DetailView,c=>{v106DetailCenter=c;},()=>renderMetroMap());
  };

  renderMapInfo=function(){
    if(!els.mapInfo)return;const md=getMapDataSafe(),store=md.stores.find(r=>r.name===mapSelectedStore),tc=md.logistics.find(r=>r.name===mapSelectedTc),row=store||tc;if(!row||!mapMetroOpen){els.mapInfo.innerHTML="";return;}
    const isStore=Boolean(store),tcName=isStore?(store.tc||mapSelectedTc):row.name,linked=isStore?[]:md.stores.filter(s=>s.tc===row.name).sort((a,b)=>processLocaleCompare(a.name,b.name)),coverage=md.coverage.filter(r=>r.tc===tcName),chips=coverage.map(r=>`<span class="map-info-area-chip">${esc((r.province?normalizeProvinceName(r.province)+" ":"")+(r.area||""))}</span>`).join("");
    els.mapInfo.innerHTML=`<div class="map-info-card"><div class="map-info-head"><div><div><span class="map-info-title">${esc(row.name)}</span><span class="map-info-selected">선택됨</span></div><div class="map-info-phone">☎ ${esc(row.phone||"미등록")}</div></div></div>${isStore?`<div class="map-overlay-section"><div class="map-overlay-label">담당 TC</div><div class="map-overlay-value">${esc(tcName||"미등록")}</div></div><div class="map-overlay-section"><div class="map-overlay-label">진열·판매 가능 권역</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`:`<div class="map-linked-count-box"><span>연결 점포</span><strong>${linked.length}개</strong></div><div class="map-overlay-section"><div class="map-overlay-label">관할 시·군·구</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`}<div class="map-overlay-section"><div class="map-overlay-label">주소</div><div class="map-overlay-value">${esc(row.address||"주소 입력 전")}</div></div>${!isStore&&linked.length?`<div class="map-linked-stores"><div class="map-linked-title">연결 점포 목록</div><div class="map-linked-chips">${linked.map(s=>`<button class="map-linked-chip" type="button" data-linked-store="${esc(s.name)}">${esc(s.name)}</button>`).join("")}</div></div>`:""}<div class="map-actions"><button class="map-action copy" type="button" data-copy-address="${esc(row.address||"")}" ${row.address?"":"disabled"}>주소 복사</button></div></div>`;
    els.mapInfo.querySelector("[data-copy-address]")?.addEventListener("click",async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.copyAddress||"");e.currentTarget.textContent="복사 완료";setTimeout(()=>e.currentTarget.textContent="주소 복사",1200);}catch(err){}});
    els.mapInfo.querySelectorAll("[data-linked-store]").forEach(btn=>btn.addEventListener("click",()=>v106SelectStore(btn.dataset.linkedStore||"",false)));
  };
  renderMapCoverageList=function(){if(els.mapCoverageList)els.mapCoverageList.innerHTML="";};

  const originalShowPage=showPage;
  showPage=function(page,push=true){
    const next=page||"home";if(next!=="dept"){v106MapScreenActive=false;v106ResetState(false);}return originalShowPage(next,push);
  };
  const originalRenderDeptFilterPanel=renderDeptFilterPanel;
  renderDeptFilterPanel=function(){
    const isMap=deptFilter==="지도 보기";if(isMap&&!v106MapScreenActive){v106ResetState(false);v106MapScreenActive=true;}else if(!isMap)v106MapScreenActive=false;
    const result=originalRenderDeptFilterPanel();if(isMap)renderMapPanel();return result;
  };

  v106PreparePanel();
  renderMapPanel();
})();
