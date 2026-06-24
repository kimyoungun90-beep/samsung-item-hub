
(() => {
  const STORE_SUPPORT_PHONE = Object.freeze({
    '고척점':'02-331-5206','공세점':'02-331-5212','광명점':'02-331-5212','김해점':'02-331-5206',
    '대구점':'02-331-5212','대전점':'02-331-5212','부산점':'02-331-5212','상봉점':'02-331-5206',
    '세종점':'02-331-5212','송도점':'02-331-5206','양재점':'02-331-5212','양평점':'02-331-5212',
    '울산점':'02-331-5212','의정부점':'02-331-5206','일산점':'02-331-5212','천안점':'02-331-5201',
    '청라점':'02-331-5212','평택점':'02-331-5206','하남점':'02-331-5206','혁신점':'02-331-5201'
  });
  const cleanStoreName=v=>String(v||'').replace(/^코스트코\s*/,'').split('(')[0].trim();
  const tcBase=v=>String(v||'').replace(/\s+/g,'').replace(/TC$/i,'').replace(/물류$/,'').trim();
  const tcDisplay=v=>{const b=tcBase(v);return b?`${b} 물류`:'';};
  const supportPhoneFor=v=>STORE_SUPPORT_PHONE[cleanStoreName(v)]||'';
  const processCategory=v=>{const s=String(v||'').trim();if(s.includes('배송'))return '배송';if(s.includes('설치'))return '설치';if(s.toUpperCase().includes('VOC'))return 'VOC';if(s.includes('서비스'))return '서비스';return '기타';};

  // 프로세스 아이콘/분류/순서
  processTypeIconSvg=function(type){
    const key=String(type||'기타');
    if(key==='전체'||key==='전체 프로세스')return `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="4" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="4" y="14" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/><rect x="14" y="14" width="6" height="6" rx="1.4" stroke="currentColor" stroke-width="1.8"/></svg>`;
    if(key==='배송')return `<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 6h10v10h-10V6Zm10 3h4l3 3v4h-7V9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="18" r="2" stroke="currentColor" stroke-width="1.8"/></svg>`;
    if(key==='설치')return `<svg viewBox="0 0 24 24" fill="none"><path d="m14.5 5.5 4 4-9.8 9.8a2.1 2.1 0 0 1-3 0l-1-1a2.1 2.1 0 0 1 0-3l9.8-9.8Z" stroke="currentColor" stroke-width="1.8"/><path d="m13 7 4 4M4 5l5 5M7 3 3 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    if(key==='VOC')return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5h16v11H9l-5 3v-14Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 11h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    if(key==='서비스')return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12a7 7 0 0 1 14 0v5a2 2 0 0 1-2 2h-2v-6h4M5 19H4a2 2 0 0 1-2-2v-5h3v7Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 20h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    return `<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>`;
  };
  getProcessTypes=function(){
    const rows=DB.processes||[], counts={배송:0,설치:0,VOC:0,서비스:0,기타:0};
    rows.forEach(r=>counts[processCategory(r.type)]++);
    return [
      {type:'전체',count:rows.length},
      {type:'배송',count:counts.배송},{type:'설치',count:counts.설치},{type:'VOC',count:counts.VOC},
      {type:'서비스',count:counts.서비스},{type:'기타',count:counts.기타}
    ];
  };
  processTypeDescription=function(type){return ({전체:'등록된 전체 업무 절차',배송:'배송 일정과 인계 관련 절차',설치:'제품 설치와 철거 관련 절차',VOC:'회원 불편과 요청 처리 절차',서비스:'서비스 관련 업무 절차',기타:'그 외 업무 처리 절차'})[type]||`${type} 관련 업무 절차`;};
  matchProcesses=function(query,typeFilter='전체'){
    const q=normalizeText(query);let rows=(DB.processes||[]).map((row,index)=>({...row,_dbIndex:index,_displayType:processCategory(row.type)}));
    if(typeFilter&&typeFilter!=='전체')rows=rows.filter(r=>r._displayType===typeFilter);
    if(!q)return rows.sort((a,b)=>processLocaleCompare(a.title,b.title));
    return rows.map(r=>{const title=normalizeText(r.title),body=normalizeText(r.fullText||r.body||r.summary);let rank=99;if(title.startsWith(q))rank=0;else if(title.includes(q))rank=1;else if(body.includes(q))rank=2;return {...r,_rank:rank};}).filter(r=>r._rank<99).sort((a,b)=>a._rank-b._rank||processLocaleCompare(a.title,b.title));
  };
  renderProcessRecommendations=function(){
    const terms=Array.isArray(DB.processRecommendations)?DB.processRecommendations.filter(Boolean).slice(0,8):[];if(!els.processRecommendSection||!els.processRecommendChips)return;
    if(!terms.length){els.processRecommendSection.classList.remove('show');els.processRecommendChips.innerHTML='';return;}
    els.processRecommendSection.classList.add('show');els.processRecommendChips.innerHTML=terms.map(term=>`<button class="process-recommend-chip" type="button" data-term="${esc(term)}">${esc(term)}</button>`).join('');
    els.processRecommendChips.querySelectorAll('.process-recommend-chip').forEach(btn=>btn.addEventListener('click',()=>{const term=btn.dataset.term||'';els.processSearch.value=term;processFilter='전체';hideProcessSuggestions();pushProcessHistory('results');processViewMode='results';processHistoryView='results';const rows=renderProcessCurrentView(false);queueProcessSearchLog(term,rows.length,'','추천 검색어');}));
  };
  renderProcessTypes=function(){
    if(!els.processTypeList)return;const types=getProcessTypes();
    els.processTypeList.innerHTML=types.map(({type,count})=>`<button class="process-type-row" type="button" data-type="${esc(type)}"><span class="process-type-icon ${type==='서비스'?'service':''}">${processTypeIconSvg(type)}</span><span class="process-type-text"><span class="process-type-name">${esc(type==='전체'?'전체 프로세스':type)}</span><span class="process-type-desc">${esc(processTypeDescription(type))}</span></span><span class="process-type-count">${count}건</span><span class="process-type-arrow">›</span></button>`).join('');
    els.processTypeList.querySelectorAll('.process-type-row').forEach(btn=>btn.addEventListener('click',()=>{processFilter=btn.dataset.type||'전체';if(els.processSearch)els.processSearch.value='';hideProcessSuggestions();pushProcessHistory('results');processViewMode='results';processHistoryView='results';renderProcessCurrentView(false);}));
  };
  renderProcessCurrentView=function(showSuggestions=false){
    if(els.processCountPill)els.processCountPill.textContent=`${(DB.processes||[]).length}건`;renderProcessRecommendations();renderProcessTypes();
    const detailMode=processViewMode==='detail'&&processDetailRow;if(els.processPageHeading)els.processPageHeading.style.display=detailMode?'none':'flex';if(els.processSearchWrap)els.processSearchWrap.style.display=detailMode?'none':'block';
    if(detailMode){els.processRecommendSection?.classList.remove('show');els.processTypeSection?.classList.remove('show');els.processResultSection?.classList.remove('show');els.processDetailSection?.classList.add('show');renderProcessDetail(processDetailRow);hideProcessSuggestions();return[processDetailRow];}
    const raw=els.processSearch?els.processSearch.value.trim():'',searching=Boolean(raw),requestedResults=processViewMode==='results',typeSelected=!searching&&processFilter!=='전체',allSelected=!searching&&processFilter==='전체'&&requestedResults;
    const rows=searching?matchProcesses(raw,'전체'):typeSelected?matchProcesses('',processFilter):allSelected?matchProcesses('','전체'):[];
    processViewMode=(searching||typeSelected||allSelected)?'results':'home';processHistoryView=processViewMode;els.processDetailSection?.classList.remove('show');els.processTypeSection?.classList.toggle('show',processViewMode==='home');els.processRecommendSection?.classList.toggle('show',processViewMode==='home'&&(DB.processRecommendations||[]).length>0);els.processResultSection?.classList.toggle('show',processViewMode==='results');
    if(processViewMode==='results'){if(els.processResultTitle)els.processResultTitle.textContent=searching?`“${raw}” 검색 결과`:(processFilter==='전체'?'전체 프로세스':`${processFilter} 프로세스`);if(els.processResultCount)els.processResultCount.textContent=`${rows.length}건`;renderProcesses(rows);}else if(els.processList)els.processList.innerHTML='';
    if(showSuggestions&&searching)renderProcessSuggestions();else if(!searching)hideProcessSuggestions();return rows;
  };
  renderProcesses=function(rowsArg){
    const rows=Array.isArray(rowsArg)?rowsArg:[];if(!els.processList)return;if(!rows.length){els.processList.innerHTML='<div class="process-no-result">검색 조건에 맞는 프로세스가 없습니다.<br>다른 글자로 다시 검색해 주세요.</div>';return;}
    els.processList.innerHTML=rows.map(row=>{const t=processCategory(row.type),favoriteKey=processFavoriteKey(row);return `<div class="info-card process-card" data-process-index="${row._dbIndex}"><button class="process-question" type="button"><div class="process-question-row"><div class="process-card-main"><span class="process-card-icon">${processTypeIconSvg(t)}</span><span class="process-card-copy"><span class="info-title">${styledText(row.title,'제목 미등록',styleOf(row,'title'))}</span><span class="process-card-snippet">${esc(processSnippet(row))}</span></span></div><div class="process-card-side"><span class="pill type-chip">${esc(t)}</span><span class="process-card-chevron">›</span></div></div></button>${contentFavoriteStarButton('process',favoriteKey,'process-card-star')}</div>`;}).join('');
    els.processList.querySelectorAll('.process-card').forEach(card=>{const row=(DB.processes||[])[Number(card.dataset.processIndex)];card.querySelector('.process-question')?.addEventListener('click',()=>row&&openProcessDetail(row));});
    bindContentFavoriteButtons(els.processList);
  };

  // 업무지원부서 물류 검색: 점포→담당 TC, 지역명→TC 단일 결과
  const previousRenderDepartments=renderDepartments;
  function logisticsMatchRow(row,tcName){const base=normalizeText(tcBase(tcName));return normalizeText([row.place,row.deptName,row.scope,row.note,row.keywords].join(' ')).includes(base);}
  function logisticsTargetFromQuery(q,md){const n=normalizeText(q);if(!n)return null;return md.logistics.filter(r=>mapLogisticsKind(r)==='tc').find(r=>normalizeText(tcBase(r.name))===n)||md.logistics.filter(r=>mapLogisticsKind(r)==='tc').find(r=>normalizeText(tcBase(r.name)).startsWith(n));}
  function renderLogisticsCards(rows,targetTc){
    if(!rows.length&&targetTc)rows=[{type:'물류',place:targetTc.name,deptName:targetTc.name,phone:targetTc.phone,note:targetTc.address,scope:'담당 물류 권역'}];
    if(!rows.length){els.deptList.innerHTML='<div class="dept-empty">선택한 조건에 맞는 물류 연락처가 없습니다.</div>';return;}
    const row=rows[0],title=targetTc?.name||row.place||row.deptName||'물류';
    els.deptList.innerHTML=`<div class="dept-modern-card logistics"><div class="dept-card-head"><div><div class="dept-card-place">${esc(title)}</div><span class="dept-logistics-match">해당 권역 물류</span></div><span class="dept-type-badge">물류</span></div><div class="dept-detail-grid">${row.scope?`<div class="dept-detail-row"><div class="dept-detail-label">업무</div><div class="dept-detail-value">${styledText(row.scope,'',styleOf(row,'scope'))}</div></div>`:''}<div class="dept-detail-row"><div class="dept-detail-label">연락처</div><div class="dept-detail-value">${styledText(row.phone||targetTc?.phone,'-',styleOf(row,'phone'))}</div></div>${row.note||targetTc?.address?`<div class="dept-detail-row"><div class="dept-detail-label">주소/안내</div><div class="dept-detail-value">${styledText(row.note||targetTc?.address,'',styleOf(row,'note'))}</div></div>`:''}</div>${row.phone||targetTc?.phone?`<a class="dept-phone-link" href="tel:${String(row.phone||targetTc.phone).replace(/[^0-9+]/g,'')}">☎ 전화 연결</a>`:''}</div>`;
  }
  renderDepartments=function(){
    if((deptFilter||'업무지원실')!=='물류')return previousRenderDepartments();
    const md=getMapDataSafe(),selectedRaw=els.storeSelect?.value||'',q=(els.deptSearch?.value||'').trim();let targetTc=null;
    if(selectedRaw){const base=cleanStoreName(selectedRaw),store=md.stores.find(s=>cleanStoreName(s.name)===base);if(store)targetTc=md.logistics.find(t=>t.name===store.tc)||null;}
    if(!targetTc&&q)targetTc=logisticsTargetFromQuery(q,md);
    if(els.deptCountPill)els.deptCountPill.textContent=`${md.logistics.filter(r=>mapLogisticsKind(r)==='tc').length}개 TC`;
    if(!selectedRaw&&!q){els.deptList.innerHTML='<div class="dept-empty">점포를 선택하거나 <b>물류 지역</b>을 입력하면<br>해당 TC 한 곳만 표시됩니다.</div>';return;}
    let rows=(DB.departments||[]).filter(r=>displayDeptType(r)==='물류');
    if(targetTc)rows=rows.filter(r=>logisticsMatchRow(r,targetTc.name));else if(q)rows=rows.filter(r=>deptRowSearchText(r).includes(normalizeText(q)));
    const dedup=[];const seen=new Set();rows.forEach(r=>{const k=normalizeText([r.place,r.deptName,r.phone].join('|'));if(!seen.has(k)){seen.add(k);dedup.push(r);}});
    if(els.deptResultsTitle)els.deptResultsTitle.textContent=targetTc?`${targetTc.name} 안내`:'물류 안내';renderLogisticsCards(dedup,targetTc);
  };

  // 지도 통합 점포/TC 선택
  function ensureUnifiedMapSelect(){
    const bar=document.getElementById('mapSelectionBar');if(!bar)return null;let wrap=document.getElementById('mapUnifiedSelectWrap');
    if(!wrap){wrap=document.createElement('div');wrap.id='mapUnifiedSelectWrap';wrap.className='v110-map-unified-wrap';wrap.innerHTML='<label class="v110-map-unified-label" for="mapUnifiedSelect">점포·물류 통합 선택</label><select id="mapUnifiedSelect" class="v110-map-unified-select"><option value="">점포 또는 물류를 선택하세요</option></select><div class="v110-map-unified-hint">점포를 선택하면 담당 물류 권역과 업무지원실 연락처를 함께 표시합니다.</div>';bar.prepend(wrap);wrap.querySelector('select').addEventListener('change',e=>{const value=e.target.value||'',parts=value.split('|'),kind=parts[0],name=parts.slice(1).join('|');const md=getMapDataSafe();if(kind==='S'){const st=md.stores.find(r=>r.name===name);if(!st)return;if(els.mapStoreSelect){els.mapStoreSelect.value=name;els.mapStoreSelect.dispatchEvent(new Event('change',{bubbles:true}));}else{mapSelectedStore=name;mapSelectedTc=st.tc||'';mapMode='store';mapMetroOpen=true;renderMapPanel();}}else if(kind==='T'){mapSelectedStore='';mapSelectedTc=name;mapMode='tc';mapMetroOpen=false;mapZoom=1;renderMapPanel();}});}
    return wrap;
  }
  function populateUnified(){const wrap=ensureUnifiedMapSelect();if(!wrap)return;const select=wrap.querySelector('select'),md=getMapDataSafe(),value=mapSelectedStore?`S|${mapSelectedStore}`:(mapSelectedTc?`T|${mapSelectedTc}`:'');select.innerHTML='<option value="">점포 또는 물류를 선택하세요</option><optgroup label="코스트코 점포">'+md.stores.slice().sort((a,b)=>processLocaleCompare(a.name,b.name)).map(s=>`<option value="S|${esc(s.name)}">${esc(s.name)} (${esc(tcDisplay(s.tc))})</option>`).join('')+'</optgroup><optgroup label="물류 TC">'+md.logistics.filter(r=>mapLogisticsKind(r)==='tc').sort((a,b)=>processLocaleCompare(a.name,b.name)).map(t=>`<option value="T|${esc(t.name)}">${esc(t.name)}</option>`).join('')+'</optgroup>';if([...select.options].some(o=>o.value===value))select.value=value;}

  // 라벨 충돌 계산에 담당 물류명까지 포함시키기 위해 렌더 시에만 이름 확장
  function withDecoratedStoreNames(fn){
    const md=getMapDataSafe(),pairs=md.stores.map(s=>({s,raw:s.name,display:`${s.name}(${tcDisplay(s.tc)})`})),selected=mapSelectedStore,displaySelected=pairs.find(p=>p.raw===selected)?.display||selected;
    pairs.forEach(p=>p.s.name=p.display);if(selected)mapSelectedStore=displaySelected;
    try{fn();}finally{pairs.forEach(p=>p.s.name=p.raw);mapSelectedStore=selected;const reverse=new Map(pairs.map(p=>[p.display,p.raw]));document.querySelectorAll('[data-store]').forEach(el=>{if(reverse.has(el.dataset.store))el.dataset.store=reverse.get(el.dataset.store);});}
  }
  const previousRenderKoreaMap=renderKoreaMap;
  renderKoreaMap=function(){withDecoratedStoreNames(()=>previousRenderKoreaMap());};
  const previousRenderMetroMap=renderMetroMap;
  renderMetroMap=function(){withDecoratedStoreNames(()=>previousRenderMetroMap());};

  const previousRenderMapPanel=renderMapPanel;
  renderMapPanel=function(){previousRenderMapPanel();const bar=document.getElementById('mapSelectionBar'),wrap=ensureUnifiedMapSelect();populateUnified();const all=mapMode==='all';if(bar){bar.classList.toggle('v110-unified',all);bar.classList.toggle('show',all||mapMode==='store'||mapMode==='coverage');}wrap?.classList.toggle('show',all);};

  // 점포 상세 연락처 및 담당 물류 표시
  renderMapInfo=function(){
    if(!els.mapInfo)return;const md=getMapDataSafe(),store=md.stores.find(r=>r.name===mapSelectedStore),tc=md.logistics.find(r=>r.name===mapSelectedTc),row=store||tc;if(!row||!mapMetroOpen){els.mapInfo.innerHTML='';return;}
    const isStore=Boolean(store),tcName=isStore?(store.tc||mapSelectedTc):row.name,supportPhone=isStore?(supportPhoneFor(store.name)||'미등록'):(row.phone||'미등록'),linked=isStore?[]:md.stores.filter(s=>s.tc===row.name).sort((a,b)=>processLocaleCompare(a.name,b.name)),coverage=md.coverage.filter(r=>r.tc===tcName),chips=coverage.map(r=>`<span class="map-info-area-chip">${esc((r.province?normalizeProvinceName(r.province)+' ':'')+(r.area||''))}</span>`).join('');
    els.mapInfo.innerHTML=`<div class="map-info-card"><div class="map-info-head"><div><div><span class="map-info-title">${esc(row.name)}</span><span class="map-info-selected">선택됨</span></div>${!isStore?`<div class="map-info-phone">☎ ${esc(supportPhone)}</div>`:''}</div></div>${isStore?`<div class="map-info-support"><div class="map-info-support-label">업무지원실 연락처</div><div class="map-info-support-value">☎ ${esc(supportPhone)}</div></div><div class="map-info-tc-box"><div class="map-info-tc-label">담당 물류</div><div class="map-info-tc-value">${esc(tcName||'미등록')}</div></div><div class="map-overlay-section"><div class="map-overlay-label">진열·판매 가능 지역</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`:`<div class="map-linked-count-box"><span>연결 점포</span><strong>${linked.length}개</strong></div><div class="map-overlay-section"><div class="map-overlay-label">관할 시·군·구</div><div class="map-info-area-list">${chips||'<span class="map-overlay-value">시트 입력 전</span>'}</div></div>`}<div class="map-overlay-section"><div class="map-overlay-label">주소</div><div class="map-overlay-value">${esc(row.address||'주소 입력 전')}</div></div>${!isStore&&linked.length?`<div class="map-linked-stores"><div class="map-linked-title">연결 점포 목록</div><div class="map-linked-chips">${linked.map(s=>`<button class="map-linked-chip" type="button" data-linked-store="${esc(s.name)}">${esc(s.name)} (${esc(tcDisplay(s.tc))})</button>`).join('')}</div></div>`:''}<div class="map-actions"><button class="map-action copy" type="button" data-copy-address="${esc(row.address||'')}" ${row.address?'':'disabled'}>주소 복사</button></div></div>`;
    els.mapInfo.querySelector('[data-copy-address]')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(e.currentTarget.dataset.copyAddress||'');e.currentTarget.textContent='복사 완료';setTimeout(()=>e.currentTarget.textContent='주소 복사',1200);}catch(err){}});
    els.mapInfo.querySelectorAll('[data-linked-store]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.linkedStore||'';if(els.mapStoreSelect){els.mapStoreSelect.value=name;els.mapStoreSelect.dispatchEvent(new Event('change',{bubbles:true}));}}));
  };

  // 이미 열린 화면도 즉시 갱신
  if(els.homeAppVersion)els.homeAppVersion.textContent='v135';
  renderProcessTypes();renderProcessRecommendations();
  if(deptFilter==='지도 보기')renderMapPanel();
})();
