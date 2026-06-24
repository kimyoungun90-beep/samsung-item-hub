
(() => {
  const previousV109RenderDepartments = renderDepartments;
  const cleanStore = value => String(value || '').replace(/^코스트코\s*/, '').split('(')[0].trim();
  const norm = value => normalizeText(String(value || ''));
  const placeBase = value => norm(value)
    .replace(/특별자치도$/,'').replace(/특별자치시$/,'').replace(/광역시$/,'')
    .replace(/특별시$/,'').replace(/도$/,'').replace(/시$/,'').replace(/군$/,'').replace(/구$/,'')
    .replace(/tc$/i,'').replace(/물류$/,'');
  const tcBase = value => norm(value).replace(/tc$/i,'').replace(/물류$/,'');

  function tcRows(md){
    return (md.logistics || []).filter(row => mapLogisticsKind(row) === 'tc');
  }

  function resolveTcFromSearch(query, md){
    const q = norm(query);
    const qb = placeBase(query);
    if(!q) return null;
    const candidates = [];
    const push = (tcName, score, reason='') => {
      const tc = tcRows(md).find(row => row.name === tcName);
      if(tc) candidates.push({tc, score, reason});
    };

    // 1. TC명·물류명 직접 검색
    tcRows(md).forEach(tc => {
      const full = norm(tc.name);
      const base = tcBase(tc.name);
      if(full === q || base === q || base === qb) push(tc.name, 1000, 'tc-exact');
      else if(full.startsWith(q) || base.startsWith(qb)) push(tc.name, 930, 'tc-prefix');
    });

    // 2. 점포명 직접 검색 시 해당 담당 TC
    (md.stores || []).forEach(store => {
      const storeName = norm(cleanStore(store.name));
      if(storeName === q || placeBase(storeName) === qb) push(store.tc, 970, 'store-exact');
      else if(storeName.startsWith(q)) push(store.tc, 900, 'store-prefix');
    });

    // 3. 지도_물류권역DB의 시도·시군구·세부안내에서 검색
    (md.coverage || []).forEach(row => {
      const area = norm(row.area);
      const areaBase = placeBase(row.area);
      const province = norm(row.province);
      const combined = norm(`${row.province || ''}${row.area || ''}`);
      const note = norm(row.note);
      let score = 0;
      if(area === q || areaBase === qb) score = 960;
      else if(combined === q || placeBase(combined) === qb) score = 950;
      else if(area.startsWith(q) || areaBase.startsWith(qb)) score = 890;
      else if(combined.includes(q)) score = 870;
      else if(note && note.includes(q)) score = 850;
      else if(province === q || placeBase(province) === qb) score = 760;
      if(score) push(row.tc, score, 'coverage');
    });

    // 4. TC 주소에 포함된 지역명
    tcRows(md).forEach(tc => {
      const address = norm(tc.address);
      if(address && address.includes(q)) push(tc.name, 720, 'address');
    });

    if(!candidates.length) return null;
    const selectedStoreRaw = cleanStore(els.storeSelect?.value || '');
    const selectedStore = (md.stores || []).find(store => cleanStore(store.name) === selectedStoreRaw);
    candidates.sort((a,b) => b.score - a.score || (a.tc.name === selectedStore?.tc ? -1 : 1) || processLocaleCompare(a.tc.name,b.tc.name));
    return candidates[0].tc;
  }

  function departmentRowMatchesTc(row, tcName){
    const fields = norm([row.place,row.deptName,row.scope,row.note,row.keywords].join(' '));
    const full = norm(tcName);
    const base = tcBase(tcName);
    return fields.includes(full) || fields.includes(base);
  }

  function coverageGuide(md, tcName){
    const grouped = new Map();
    (md.coverage || []).filter(row => row.tc === tcName).forEach(row => {
      const province = normalizeProvinceName(row.province) || row.province || '기타';
      if(!grouped.has(province)) grouped.set(province, []);
      grouped.get(province).push(row.area);
    });
    return Array.from(grouped.entries()).map(([province, areas]) => `${province} : ${uniqueArray(areas.filter(Boolean)).join(', ')}`).join('\n');
  }

  function renderSingleLogisticsTc(targetTc, matchedRow, md){
    const phone = matchedRow?.phone || targetTc.phone || '';
    const scope = matchedRow?.scope || '물류/배송 가능 지역 확인';
    const guide = matchedRow?.note || coverageGuide(md, targetTc.name) || targetTc.address || '';
    els.deptList.innerHTML = `<div class="dept-modern-card logistics"><div class="dept-card-head"><div><div class="dept-card-place">${esc(targetTc.name)}</div><span class="dept-logistics-match">해당 권역 물류</span></div><span class="dept-type-badge">물류</span></div><div class="dept-detail-grid"><div class="dept-detail-row"><div class="dept-detail-label">업무</div><div class="dept-detail-value">${styledText(scope,'-',matchedRow?styleOf(matchedRow,'scope'):{})}</div></div><div class="dept-detail-row"><div class="dept-detail-label">연락처</div><div class="dept-detail-value">${styledText(phone,'-',matchedRow?styleOf(matchedRow,'phone'):{})}</div></div>${guide?`<div class="dept-detail-row"><div class="dept-detail-label">주소/안내</div><div class="dept-detail-value" style="white-space:pre-line">${styledText(guide,'',matchedRow?styleOf(matchedRow,'note'):{})}</div></div>`:''}</div>${phone?`<a class="dept-phone-link" href="tel:${String(phone).replace(/[^0-9+]/g,'')}">☎ 전화 연결</a>`:''}</div>`;
  }

  renderDepartments = function(){
    if((deptFilter || '업무지원실') !== '물류') return previousV109RenderDepartments();
    const md = getMapDataSafe();
    const query = (els.deptSearch?.value || '').trim();
    const selectedRaw = els.storeSelect?.value || '';
    let targetTc = null;

    // 검색어가 있으면 점포 선택보다 항상 우선한다.
    if(query){
      targetTc = resolveTcFromSearch(query, md);
    }else if(selectedRaw){
      const selectedName = cleanStore(selectedRaw);
      const store = (md.stores || []).find(row => cleanStore(row.name) === selectedName);
      if(store) targetTc = tcRows(md).find(row => row.name === store.tc) || null;
    }

    if(els.deptCountPill) els.deptCountPill.textContent = `${tcRows(md).length}개 TC`;
    if(!query && !selectedRaw){
      els.deptList.innerHTML = '<div class="dept-empty">점포를 선택하거나 <b>물류 지역</b>을 입력하면<br>해당 TC 한 곳만 표시됩니다.</div>';
      if(els.deptResultsTitle) els.deptResultsTitle.textContent = '물류 안내';
      return;
    }
    if(!targetTc){
      els.deptList.innerHTML = '<div class="dept-empty">입력한 지역을 담당하는 물류 TC를 찾지 못했습니다.<br>시·군·구 또는 TC명을 다시 확인해 주세요.</div>';
      if(els.deptResultsTitle) els.deptResultsTitle.textContent = '물류 안내';
      return;
    }

    const matchedRow = (DB.departments || [])
      .filter(row => displayDeptType(row) === '물류')
      .find(row => departmentRowMatchesTc(row, targetTc.name)) || null;
    if(els.deptResultsTitle) els.deptResultsTitle.textContent = `${targetTc.name} 안내`;
    renderSingleLogisticsTc(targetTc, matchedRow, md);
  };

  if(els.homeAppVersion) els.homeAppVersion.textContent = 'v135';
  if(deptFilter === '물류') renderDepartments();
})();
