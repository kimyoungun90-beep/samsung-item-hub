
(() => {
  const overlay = document.getElementById("aiAssistantOverlay");
  const openButton = document.getElementById("homeAiAssistantShortcut");
  const closeButton = document.getElementById("aiAssistantClose");
  const resetButton = document.getElementById("aiAssistantReset");
  const messages = document.getElementById("aiAssistantMessages");
  const suggestions = document.getElementById("aiAssistantSuggestions");
  const input = document.getElementById("aiAssistantInput");
  const sendButton = document.getElementById("aiAssistantSend");
  const micButton = document.getElementById("aiAssistantMic");
  if(!overlay || !openButton || !messages || !input) return;

  let typingNode = null;
  let recognition = null;
  const aiConversation = {
    lastQuestion: "",
    excludedProcessTitles: [],
    lastProcessTitles: []
  };

  const aiEscape = value => typeof esc === "function" ? esc(String(value ?? "")) : String(value ?? "").replace(/[&<>\"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[ch]));
  const aiNormalize = value => String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
  const aiNow = () => new Intl.DateTimeFormat("ko-KR", {hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());
  const aiScrollBottom = () => requestAnimationFrame(()=>{ messages.scrollTop = messages.scrollHeight; });

  function aiInitialMarkup(){
    return `<div class="ai-message-row bot"><div class="ai-message-avatar" aria-hidden="true">AI</div><div class="ai-message-bubble"><strong>무엇을 도와드릴까요?</strong><p>제품 모델, 아이템번호, VOC, 배송·설치 처리 절차를 평소 말투로 질문해 주세요.</p><small>현재는 HUB에 등록된 자료를 찾아 안내합니다.</small></div></div>`;
  }

  function openAiAssistant(){
    if(overlay.classList.contains("show")) return;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("ai-assistant-open");
    try{
      const baseState = typeof currentRouteState === "function" ? currentRouteState(currentPage) : {hubPage:currentPage || "home"};
      history.pushState({...baseState, hubOverlay:"aiAssistant"}, "", (typeof getCleanAppUrl === "function" ? getCleanAppUrl() : location.pathname) + "#ai-assistant");
    }catch(err){}
    setTimeout(()=>input.focus({preventScroll:true}), 80);
    aiScrollBottom();
  }

  function hideAiAssistant(){
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ai-assistant-open");
    stopRecognition();
  }

  function closeAiAssistant(){
    if(!overlay.classList.contains("show")) return;
    if(history.state && history.state.hubOverlay === "aiAssistant"){
      history.back();
    }else{
      hideAiAssistant();
    }
  }

  function dismissForNavigation(){
    hideAiAssistant();
    try{ if(typeof replaceCurrentRouteState === "function") replaceCurrentRouteState(); }catch(err){}
  }

  function addMessage(role, html){
    const row = document.createElement("div");
    row.className = `ai-message-row ${role}`;
    row.innerHTML = `${role === "bot" ? '<div class="ai-message-avatar" aria-hidden="true">AI</div>' : ''}<div class="ai-message-bubble">${html}<div class="ai-message-time">${aiNow()}</div></div>`;
    messages.appendChild(row);
    aiScrollBottom();
    return row;
  }

  function showTyping(){
    hideTyping();
    typingNode = document.createElement("div");
    typingNode.className = "ai-message-row bot";
    typingNode.innerHTML = '<div class="ai-message-avatar" aria-hidden="true">AI</div><div class="ai-message-bubble"><div class="ai-typing"><i></i><i></i><i></i></div></div>';
    messages.appendChild(typingNode);
    aiScrollBottom();
  }

  function hideTyping(){
    if(typingNode && typingNode.parentNode) typingNode.remove();
    typingNode = null;
  }

  function questionTokens(query){
    const stop = new Set(["어떻게","알려줘","알려주세요","해줘","해주세요","해야","하나요","인가요","뭐야","무엇","어디로","관련","질문","문의해","있나요","가능한가요","좀","그냥"]);
    const raw = aiNormalize(query).replace(/[^0-9a-z가-힣+./-]+/gi," ");
    const parts = raw.split(/\s+/).filter(Boolean);
    const out = [];
    parts.forEach(part=>{
      const candidates = [part, part.replace(/(으로|에서|에게|한테|부터|까지|이라면|이면|은|는|이|가|을|를|에|의|도|만)$/g,"")];
      candidates.forEach(token=>{ if(token.length >= 2 && !stop.has(token) && !out.includes(token)) out.push(token); });
    });
    return out.slice(0,14);
  }

  function scoreText(haystack, title, type, query, tokens){
    const hay = aiNormalize(haystack);
    const titleText = aiNormalize(title);
    const typeText = aiNormalize(type);
    const q = aiNormalize(query);
    let score = 0;
    if(q && hay.includes(q)) score += 45;
    tokens.forEach(token=>{
      if(titleText.includes(token)) score += 12;
      else if(typeText.includes(token)) score += 8;
      else if(hay.includes(token)) score += 4;
    });
    return score;
  }

  function rankProcesses(query, tokens){
    return (Array.isArray(DB?.processes) ? DB.processes : []).map((row,index)=>{
      const hay = [row.type,row.title,row.summary,row.body,row.fullText, ...(Array.isArray(row.steps)?row.steps.map(step=>typeof step === "object" ? step.text : step):[])].join(" ");
      return {row,index,score:scoreText(hay,row.title,row.type,query,tokens)};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score || String(a.row.title||"").localeCompare(String(b.row.title||""),"ko"));
  }

  function searchProcesses(query, tokens){
    return rankProcesses(query,tokens).slice(0,3);
  }

  function searchItems(query, tokens){
    const digits = String(query||"").replace(/\D/g,"");
    const q = aiNormalize(query);
    return (Array.isArray(DB?.items) ? DB.items : []).map((row,index)=>{
      const itemNo = aiNormalize(row.itemNo);
      const model = aiNormalize(row.modelName);
      const title = [row.productName,row.modelName].filter(Boolean).join(" ");
      const hay = [row.itemNo,row.modelName,row.productName,row.category,row.brand,row.keywords].join(" ");
      let score = scoreText(hay,title,row.category,query,tokens);
      if(digits && itemNo === digits) score += 120;
      if(q && model === q) score += 100;
      if(tokens.some(token=>model.startsWith(token))) score += 18;
      return {row,index,score};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  }

  function searchContacts(query, tokens){
    return (Array.isArray(DB?.departments) ? DB.departments : []).map((row,index)=>{
      const title = [row.place,row.deptName,row.type].filter(Boolean).join(" ");
      const hay = [row.type,row.place,row.deptName,row.phone,row.scope,row.note,row.keywords].join(" ");
      return {row,index,score:scoreText(hay,title,row.type,query,tokens)};
    }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score).slice(0,3);
  }

  function resultButton(kind, index, title, sub){
    return `<button class="ai-result-card" type="button" data-ai-kind="${kind}" data-ai-index="${index}"><span class="ai-result-copy"><b>${aiEscape(title)}</b><span>${aiEscape(sub)}</span></span><span>›</span></button>`;
  }

  function isAlternativeAnswerRequest(value){
    const text = aiNormalize(value).replace(/[.!?~]+/g," ").replace(/\s+/g," ").trim();
    return /(?:이|그|저)?\s*(?:대답|답변|내용|거|것)?\s*(?:이|가)?\s*(?:아니야|아닙니다|아닌데|틀렸어|틀려|안 맞아|맞지 않아)|(?:그거|그것|이거|이것)\s*말고|다른\s*(?:답|답변|거|것|내용)|다시\s*(?:찾아|검색)/.test(text);
  }

  function normalizeProcessTitle(value){
    return aiNormalize(value);
  }

  function uniqueProcessTitles(values){
    const out = [];
    const used = new Set();
    (Array.isArray(values) ? values : []).forEach(value=>{
      const title = String(value || "").trim();
      const key = normalizeProcessTitle(title);
      if(!key || used.has(key)) return;
      used.add(key);
      out.push(title);
    });
    return out;
  }

  function rememberProcessContext(question, titles, resetExcluded){
    if(question) aiConversation.lastQuestion = String(question).trim();
    aiConversation.lastProcessTitles = uniqueProcessTitles(titles);
    if(resetExcluded) aiConversation.excludedProcessTitles = [];
  }

  function excludeLastProcessAnswers(){
    aiConversation.excludedProcessTitles = uniqueProcessTitles([
      ...aiConversation.excludedProcessTitles,
      ...aiConversation.lastProcessTitles
    ]);
  }

  function isExcludedProcessTitle(title, excludedTitles){
    const key = normalizeProcessTitle(title);
    return (Array.isArray(excludedTitles) ? excludedTitles : []).some(value=>normalizeProcessTitle(value) === key);
  }

  function buildProcessRowAnswer(row, index, noteText){
    if(!row) return "";
    const steps = Array.isArray(row.steps) ? row.steps.filter(step=>step && (typeof step === "string" ? step : step.text)) : [];
    const summary = row.summary || row.body || row.fullText || "등록된 프로세스를 확인했습니다.";
    const cautionHtml = row.caution
      ? `<div class="ai-answer-note"><b>주의사항</b><p>${aiEscape(row.caution).replace(/\n/g,"<br>")}</p></div>`
      : "";
    const stepsHtml = steps.length
      ? `<div class="ai-answer-note">${steps.map((step,stepIndex)=>{
          const no = typeof step === "object" ? (step.no || stepIndex + 1) : stepIndex + 1;
          const text = typeof step === "object" ? step.text : step;
          return `<p><b>${aiEscape(no)}.</b> ${aiEscape(text).replace(/\n/g,"<br>")}</p>`;
        }).join("")}</div>`
      : "";
    const sourceButton = Number.isInteger(index) && index >= 0
      ? `<div class="ai-answer-section">${resultButton("process",index,row.title || "프로세스",`${row.type || "프로세스"} · 원문 전체 보기`)}</div>`
      : "";
    const note = noteText ? `<small>${aiEscape(noteText)}</small>` : "";
    return `<strong>${aiEscape(row.title || "관련 업무 프로세스")}</strong><p>${aiEscape(summary).replace(/\n/g,"<br>")}</p>${cautionHtml}${stepsHtml}${sourceButton}${note}`;
  }

  function findPriorityProcess(query, excludedTitles){
    const normalized = aiNormalize(query);
    const processes = Array.isArray(DB?.processes) ? DB.processes : [];
    const candidates = processes.map((row,index)=>({row,index})).filter(entry=>!isExcludedProcessTitle(entry.row?.title,excludedTitles));

    const mentionsStoreProduct = /(매장|진열\s*제품|전시\s*제품|제품\s*자체)/.test(normalized);
    const mentionsPropertyDamage = !mentionsStoreProduct && (
      /(?:설치|기사).*(?:파손|손해|기스|긁|손상|깨)/.test(normalized) ||
      /(?:파손|손해|기스|긁|손상|깨).*(?:설치|기사)/.test(normalized) ||
      /(?:고객|회원).*(?:집|가정|바닥|벽지|수납장|재산).*(?:파손|손해|기스|긁|손상)/.test(normalized)
    );

    if(mentionsPropertyDamage){
      const matched = candidates.find(({row})=>{
        const hay = aiNormalize([row?.title,row?.summary,row?.body,row?.fullText,row?.caution].join(" "));
        return /(재산|바닥\s*기스|수납장\s*파손|벽지\s*손상|회원\s*재산)/.test(hay);
      });
      if(matched) return matched;
    }

    if(mentionsStoreProduct && /(파손|불량|손상|깨)/.test(normalized)){
      const matched = candidates.find(({row})=>{
        const hay = aiNormalize([row?.title,row?.summary,row?.body,row?.fullText].join(" "));
        return /(매장\s*제품|진열\s*제품).*(파손|불량)|(파손|불량).*(매장\s*제품|진열\s*제품)/.test(hay);
      });
      if(matched) return matched;
    }

    return null;
  }

  function findNextProcess(query, excludedTitles){
    const priority = findPriorityProcess(query,excludedTitles);
    if(priority) return priority;
    return rankProcesses(query,questionTokens(query)).find(entry=>!isExcludedProcessTitle(entry.row?.title,excludedTitles)) || null;
  }

  function fallbackProcessTitles(query){
    return searchProcesses(query,questionTokens(query)).map(entry=>entry.row?.title).filter(Boolean);
  }

  function isProductCompareQuestion(query){
    return /(차이|차이점|비교|vs\.?|대비|서로\s*다|뭐가\s*달|무엇이\s*달|어떤\s*게?\s*좋|공통점|다른\s*점)/i.test(String(query || ""));
  }

  function cleanCompareValue(value){
    const text = String(value ?? "")
      .replace(/<br\s*\/?>/gi,"\n")
      .replace(/<[^>]+>/g," ")
      .replace(/&nbsp;/gi," ")
      .replace(/\r/g,"")
      .replace(/[ \t]+/g," ")
      .replace(/\n{3,}/g,"\n\n")
      .trim();
    return text.length > 420 ? text.slice(0,417) + "…" : text;
  }

  function comparisonItemKey(item){
    return aiNormalize(item?.itemNo || item?.modelName || item?.productName || "");
  }

  function findComparisonItems(query, productHints){
    const items = Array.isArray(DB?.items) ? DB.items : [];
    const selected = [];
    const used = new Set();
    const add = item=>{
      if(!item) return;
      const key = comparisonItemKey(item);
      if(!key || used.has(key)) return;
      used.add(key);
      selected.push(item);
    };

    const itemNumbers = Array.from(new Set((String(query || "").match(/\b\d{5,8}\b/g) || [])));
    itemNumbers.forEach(no=>add(items.find(row=>String(row?.itemNo || "").replace(/\D/g,"") === no)));

    const normalizedQuery = aiNormalize(query);
    items.forEach(row=>{
      const model = aiNormalize(row?.modelName);
      if(model && model.length >= 5 && normalizedQuery.includes(model)) add(row);
    });

    (Array.isArray(productHints) ? productHints : []).forEach(product=>{
      const no = aiNormalize(product?.itemNo);
      const model = aiNormalize(product?.modelName);
      add(items.find(row=>(no && aiNormalize(row?.itemNo) === no) || (model && aiNormalize(row?.modelName) === model)));
    });

    if(selected.length < 2 && isProductCompareQuestion(query)){
      searchItems(query, questionTokens(query)).forEach(entry=>add(entry.row));
    }
    return selected.slice(0,3);
  }

  function collectComparisonFields(item){
    const fields = new Map();
    const put = (label,value)=>{
      const key = String(label || "").trim();
      const clean = cleanCompareValue(value);
      if(!key || !clean || fields.has(key)) return;
      fields.set(key,clean);
    };

    put("상품명",item?.productName);
    put("품목",item?.category);
    put("브랜드",item?.brand);
    put("기본 스펙",item?.spec);
    put("주요 기능",item?.feature);
    put("기능 설명",item?.featureWrite);
    put("벽걸이 모델",item?.wallModel);
    put("이전 설치비",item?.installCost);
    put("철거 비용",item?.removalCost);

    (Array.isArray(item?.specRows) ? item.specRows : []).forEach(row=>{
      const part = String(row?.productPart || "").trim();
      const question = String(row?.question || "").trim();
      const label = part && question ? `${part} · ${question}` : question;
      put(label,row?.answer);
    });
    return fields;
  }

  function buildProductComparisonAnswer(compareItems){
    const items = (Array.isArray(compareItems) ? compareItems : []).filter(Boolean).slice(0,3);
    if(items.length < 2) return "";

    const fieldMaps = items.map(collectComparisonFields);
    const labels = [];
    fieldMaps.forEach(map=>map.forEach((value,label)=>{ if(!labels.includes(label)) labels.push(label); }));
    const differenceRows = labels.filter(label=>{
      const values = fieldMaps.map(map=>aiNormalize(map.get(label) || ""));
      return values.some(Boolean) && new Set(values).size > 1;
    });
    const shownRows = differenceRows.slice(0,16);

    const head = items.map(item=>`<th><span class="ai-compare-product">${aiEscape(item.itemNo || "제품")}</span><span class="ai-compare-model">${aiEscape(item.modelName || item.productName || "")}</span></th>`).join("");
    const body = shownRows.map(label=>`<tr><td>${aiEscape(label)}</td>${fieldMaps.map(map=>`<td>${aiEscape(map.get(label) || "등록 정보 없음").replace(/\n/g,"<br>")}</td>`).join("")}</tr>`).join("");
    const table = body
      ? `<div class="ai-compare-scroll"><table class="ai-compare-table"><thead><tr><th>비교 항목</th>${head}</tr></thead><tbody>${body}</tbody></table></div>`
      : `<div class="ai-answer-note">두 제품의 등록된 상세 스펙에서 서로 다른 항목을 확인하지 못했습니다. 각 제품 상세 화면에서 등록 내용을 확인해 주세요.</div>`;
    const more = differenceRows.length > shownRows.length
      ? `<div class="ai-compare-more">차이 항목이 많아 상위 ${shownRows.length}개만 표시했습니다. 제품 상세에서 전체 스펙을 확인할 수 있습니다.</div>`
      : "";
    const cards = items.map(item=>{
      const index = findAiItemIndex(item);
      const title = [item.itemNo,item.modelName].filter(Boolean).join(" · ") || item.productName || "제품";
      const sub = [item.category,item.productName].filter(Boolean).join(" · ");
      return index >= 0 ? resultButton("item",index,title,sub) : "";
    }).join("");

    return `<strong>제품 ${items.length}개를 비교했습니다.</strong><p>HUB에 등록된 스펙 중 서로 다른 항목을 나란히 표시했습니다.</p><div class="ai-compare-summary">가격·재고·행사 조건은 시점에 따라 달라질 수 있으므로 제품 상세와 매장 기준을 함께 확인해 주세요.</div>${table}${more}<div class="ai-answer-section">${cards}</div><small>비교 결과는 HUB에 등록된 제품 자료만 사용했습니다.</small>`;
  }

  function buildAnswer(query){
    const normalized = aiNormalize(query);
    if(/^(안녕|하이|hello|반가)/.test(normalized)) return `<strong>안녕하세요.</strong><p>HUB에 등록된 제품과 업무 프로세스를 찾아드릴게요. 모델명, 아이템번호 또는 처리 상황을 말씀해 주세요.</p>`;
    if(/(뭘 할 수|무엇을 할 수|사용법|도움말)/.test(normalized)) return `<strong>이렇게 질문할 수 있어요.</strong><p>제품 모델·아이템번호 검색, 제품 간 스펙 비교, VOC·배송·설치·반품 프로세스 검색, 업무지원 연락처 확인을 지원합니다.</p><small>자료에 없는 내용은 임의로 답하지 않습니다.</small>`;

    if(isProductCompareQuestion(query)){
      const compareHtml = buildProductComparisonAnswer(findComparisonItems(query));
      if(compareHtml) return compareHtml;
    }

    const tokens = questionTokens(query);
    const processIntent = /(voc|배송|설치|파손|반품|불량|주소|기사|서비스|물류|접수|교환|설치비|오배송|무타공|고객|회원|처리)/i.test(query);
    const contactIntent = /(연락처|전화|업무지원|물류|서비스센터|담당자)/i.test(query);
    const itemIntent = /(모델|아이템|제품|tv|티비|냉장고|에어컨|모니터|세탁|건조|청소기|전자레인지|큐커|인덕션|제습기|\d{6}|[a-z]{2,}\d+)/i.test(query);
    const processes = searchProcesses(query,tokens);
    const items = searchItems(query,tokens);
    const contacts = contactIntent ? searchContacts(query,tokens) : [];
    const blocks = [];

    if(processes.length && (processIntent || !itemIntent)){
      blocks.push(`<strong>관련 업무 프로세스 ${processes.length}건을 찾았습니다.</strong><p>가장 가까운 항목을 눌러 원문 절차를 확인하세요.</p><div class="ai-answer-section">${processes.map(({row,index})=>resultButton("process",index,row.title || "프로세스",[row.type, typeof processSnippet === "function" ? processSnippet(row) : row.summary].filter(Boolean).join(" · "))).join("")}</div>`);
    }
    if(items.length && (itemIntent || !processes.length)){
      blocks.push(`<strong>관련 제품 ${items.length}개를 찾았습니다.</strong><p>아이템을 누르면 상세 스펙 화면으로 이동합니다.</p><div class="ai-answer-section">${items.map(({row,index})=>resultButton("item",index,[row.itemNo,row.modelName].filter(Boolean).join(" · ") || row.productName || "제품",[row.category,row.productName].filter(Boolean).join(" · "))).join("")}</div>`);
    }
    if(contacts.length){
      blocks.push(`<strong>관련 연락처를 확인했습니다.</strong><div class="ai-answer-section">${contacts.map(({row})=>`<div class="ai-contact-line"><b>${aiEscape([row.place,row.deptName || row.type].filter(Boolean).join(" · ") || "업무지원")}</b><span>${row.phone ? `<a href="tel:${aiEscape(String(row.phone).replace(/[^0-9+]/g,""))}">${aiEscape(row.phone)}</a>` : "전화번호 미등록"}${row.scope ? ` · ${aiEscape(row.scope)}` : ""}</span></div>`).join("")}${resultButton("dept",0,"업무지원 페이지 열기","점포·물류·서비스 연락처 전체 확인")}</div>`);
    }else if(contactIntent){
      blocks.push(`<strong>업무지원 페이지에서 확인할 수 있습니다.</strong><p>점포명을 함께 입력하면 더 정확한 연락처를 찾을 수 있어요.</p><div class="ai-answer-section">${resultButton("dept",0,"업무지원 페이지 열기","점포·물류·서비스 연락처 확인")}</div>`);
    }

    if(!blocks.length){
      return `<strong>HUB 자료에서 바로 일치하는 내용을 찾지 못했습니다.</strong><p>모델명, 6자리 아이템번호 또는 “설치 파손”, “주소 오입력”처럼 핵심 상황을 포함해 다시 질문해 주세요.</p><div class="ai-answer-note">등록 자료에 없는 내용은 추측해서 안내하지 않습니다.</div>`;
    }
    return blocks.join('<div style="height:10px"></div>');
  }

  async function requestHubAi(question){
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = controller ? window.setTimeout(()=>controller.abort(), 45000) : 0;
    try{
      return await apiGet({
        action: "aiAsk",
        question: String(question || ""),
        t: String(Date.now())
      }, controller ? { signal: controller.signal } : {});
    }finally{
      if(timer) window.clearTimeout(timer);
    }
  }

  function findAiProcessIndex(title){
    const target = aiNormalize(title);
    return (Array.isArray(DB?.processes) ? DB.processes : [])
      .findIndex(row=>aiNormalize(row?.title) === target);
  }

  function findAiItemIndex(product){
    const itemNo = aiNormalize(product?.itemNo);
    const modelName = aiNormalize(product?.modelName);
    return (Array.isArray(DB?.items) ? DB.items : []).findIndex(row=>{
      if(itemNo && aiNormalize(row?.itemNo) === itemNo) return true;
      return !!(modelName && aiNormalize(row?.modelName) === modelName);
    });
  }

  function buildHubAiAnswer(data, question){
    if(!data || !data.ok) return "";

    if(data.intent === "PROCESS" && data.process){
      const process = data.process;
      const index = findAiProcessIndex(process.title);
      const steps = Array.isArray(process.steps) ? process.steps.filter(step=>step?.text) : [];
      const summary = process.summary || "등록된 프로세스를 확인했습니다.";
      const cautionHtml = process.caution
        ? `<div class="ai-answer-note"><b>주의사항</b><p>${aiEscape(process.caution).replace(/\n/g,"<br>")}</p></div>`
        : "";
      const stepsHtml = steps.length
        ? `<div class="ai-answer-note">${steps.map(step=>`<p><b>${aiEscape(step.no)}.</b> ${aiEscape(step.text).replace(/\n/g,"<br>")}</p>`).join("")}</div>`
        : "";
      const sourceButton = index >= 0
        ? `<div class="ai-answer-section">${resultButton("process",index,process.title,`${process.type || "프로세스"} · 원문 전체 보기`)}</div>`
        : "";
      return `<strong>${aiEscape(process.title)}</strong><p>${aiEscape(summary).replace(/\n/g,"<br>")}</p>${cautionHtml}${stepsHtml}${sourceButton}<small>질문의 의미는 Gemini가 분석하고, 답변 내용은 HUB에 등록된 원문만 사용했습니다.</small>`;
    }

    if(data.intent === "PRODUCT"){
      const products = Array.isArray(data.products) ? data.products : [];
      if(!products.length) return `<strong>관련 제품을 찾지 못했습니다.</strong><p>모델명 또는 6자리 아이템번호를 함께 입력해 주세요.</p>`;
      if(data.compareRequested || isProductCompareQuestion(question)){
        const compareHtml = buildProductComparisonAnswer(findComparisonItems(question,products));
        if(compareHtml) return compareHtml;
      }
      const cards = products.map(product=>{
        const index = findAiItemIndex(product);
        const title = [product.itemNo,product.modelName].filter(Boolean).join(" · ") || product.productName || "제품";
        const sub = [product.category,product.productName].filter(Boolean).join(" · ");
        return index >= 0
          ? resultButton("item",index,title,sub)
          : `<div class="ai-contact-line"><b>${aiEscape(title)}</b><span>${aiEscape(sub)}</span></div>`;
      }).join("");
      return `<strong>관련 제품 ${products.length}개를 찾았습니다.</strong><p>제품을 누르면 HUB 상세 화면으로 이동합니다.</p><div class="ai-answer-section">${cards}</div>`;
    }

    if(data.intent === "CONTACT"){
      const contacts = Array.isArray(data.contacts) ? data.contacts : [];
      const contactRows = contacts.map(row=>{
        const label = [row.place,row.deptName || row.type].filter(Boolean).join(" · ") || "업무지원";
        const tel = String(row.phone || "").replace(/[^0-9+]/g,"");
        return `<div class="ai-contact-line"><b>${aiEscape(label)}</b><span>${row.phone ? `<a href="tel:${aiEscape(tel)}">${aiEscape(row.phone)}</a>` : "전화번호 미등록"}${row.scope ? ` · ${aiEscape(row.scope)}` : ""}</span></div>`;
      }).join("");
      return `<strong>관련 연락처를 확인했습니다.</strong><div class="ai-answer-section">${contactRows}${resultButton("dept",0,"업무지원 페이지 열기","점포·물류·서비스 연락처 전체 확인")}</div>`;
    }

    return "";
  }

  async function submitQuestion(question){
    const text = String(question || input.value || "").trim();
    if(!text) return;
    input.value = "";
    resizeInput();
    addMessage("user", `<p>${aiEscape(text)}</p>`);
    showTyping();
    if(sendButton) sendButton.disabled = true;

    const alternativeRequest = isAlternativeAnswerRequest(text);

    try{
      if(alternativeRequest){
        const baseQuestion = aiConversation.lastQuestion;
        if(!baseQuestion){
          hideTyping();
          addMessage("bot", `<strong>어떤 질문의 다른 답변을 찾을지 확인이 필요합니다.</strong><p>처음 상황을 한 번만 다시 적어 주세요.</p>`);
          return;
        }

        excludeLastProcessAnswers();
        const excluded = [...aiConversation.excludedProcessTitles];
        const priorityAlternative = findPriorityProcess(baseQuestion,excluded);
        if(priorityAlternative){
          hideTyping();
          rememberProcessContext(baseQuestion,[priorityAlternative.row?.title],false);
          addMessage("bot", buildProcessRowAnswer(priorityAlternative.row,priorityAlternative.index,"이전에 제시한 답변을 제외하고 다음으로 관련 높은 HUB 프로세스를 안내했습니다."));
          return;
        }

        const retryQuestion = [
          baseQuestion,
          "이전에 제시한 아래 프로세스는 사용자가 원하는 답변이 아닙니다.",
          excluded.map(title=>`- ${title}`).join("\n"),
          "위 제목은 제외하고 HUB 목록에서 다른 프로세스 하나를 선택하세요."
        ].join("\n");

        let retryResult = null;
        try{ retryResult = await requestHubAi(retryQuestion); }catch(err){}
        const retryTitle = retryResult?.process?.title || "";
        if(retryResult?.ok && retryResult.intent === "PROCESS" && retryTitle && !isExcludedProcessTitle(retryTitle,excluded)){
          hideTyping();
          rememberProcessContext(baseQuestion,[retryTitle],false);
          addMessage("bot", buildHubAiAnswer(retryResult,baseQuestion));
          return;
        }

        const nextEntry = findNextProcess(baseQuestion,excluded);
        hideTyping();
        if(nextEntry){
          rememberProcessContext(baseQuestion,[nextEntry.row?.title],false);
          addMessage("bot", buildProcessRowAnswer(nextEntry.row,nextEntry.index,"이전에 제시한 답변을 제외하고 다음 후보를 안내했습니다."));
        }else{
          addMessage("bot", `<strong>다른 관련 프로세스를 더 찾지 못했습니다.</strong><p>상황을 조금 더 구체적으로 적어 주세요.</p><small>원하는 답변이 검색되지 않은 경우 삼성 담당자에게 문의해 주세요.</small>`);
        }
        return;
      }

      aiConversation.lastQuestion = text;
      aiConversation.excludedProcessTitles = [];
      aiConversation.lastProcessTitles = [];

      if(isProductCompareQuestion(text)){
        const localCompare = buildProductComparisonAnswer(findComparisonItems(text));
        if(localCompare){
          hideTyping();
          addMessage("bot", localCompare);
          return;
        }
      }

      const priorityProcess = findPriorityProcess(text,[]);
      if(priorityProcess){
        hideTyping();
        rememberProcessContext(text,[priorityProcess.row?.title],true);
        addMessage("bot", buildProcessRowAnswer(priorityProcess.row,priorityProcess.index,"질문의 상황을 기준으로 가장 가까운 HUB 프로세스를 안내했습니다."));
        return;
      }

      const result = await requestHubAi(text);
      hideTyping();

      if(result?.privacyBlocked){
        addMessage("bot", `<strong>개인정보를 삭제해 주세요.</strong><p>${aiEscape(result.message || "전화번호·주소·주문번호를 제외하고 상황만 입력해 주세요.")}</p>`);
        return;
      }

      const aiHtml = buildHubAiAnswer(result,text);
      if(result?.ok && aiHtml){
        if(result.intent === "PROCESS" && result.process?.title){
          rememberProcessContext(text,[result.process.title],true);
        }
        addMessage("bot", aiHtml);
      }else{
        const shownTitles = fallbackProcessTitles(text);
        if(shownTitles.length) rememberProcessContext(text,shownTitles,true);
        addMessage("bot", `${buildAnswer(text)}<small>원하는 답변이 검색되지 않은 경우 삼성 담당자에게 문의해 주세요.</small>`);
      }
    }catch(error){
      hideTyping();
      const shownTitles = fallbackProcessTitles(text);
      if(shownTitles.length) rememberProcessContext(text,shownTitles,true);
      addMessage("bot", `${buildAnswer(text)}<small>원하는 답변이 검색되지 않은 경우 삼성 담당자에게 문의해 주세요.</small>`);
    }finally{
      if(sendButton) sendButton.disabled = false;
      input.focus();
    }
  }

  function resizeInput(){
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight,112) + "px";
  }

  function stopRecognition(){
    if(recognition){ try{ recognition.stop(); }catch(err){} }
    micButton?.classList.remove("listening");
  }

  function startRecognition(){
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!Recognition){
      addMessage("bot", `<strong>이 브라우저는 음성 입력을 지원하지 않습니다.</strong><p>Chrome 또는 삼성 인터넷 최신 버전에서 다시 시도하거나 키보드로 질문해 주세요.</p>`);
      return;
    }
    stopRecognition();
    recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = ()=>micButton?.classList.add("listening");
    recognition.onend = ()=>micButton?.classList.remove("listening");
    recognition.onerror = ()=>micButton?.classList.remove("listening");
    recognition.onresult = event=>{
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if(transcript){ input.value = transcript; resizeInput(); input.focus(); }
    };
    try{ recognition.start(); }catch(err){}
  }

  openButton.addEventListener("click", openAiAssistant);
  closeButton?.addEventListener("click", closeAiAssistant);
  resetButton?.addEventListener("click", ()=>{ messages.innerHTML = aiInitialMarkup(); input.value=""; aiConversation.lastQuestion=""; aiConversation.excludedProcessTitles=[]; aiConversation.lastProcessTitles=[]; resizeInput(); input.focus(); });
  sendButton?.addEventListener("click", ()=>submitQuestion());
  input.addEventListener("input", resizeInput);
  input.addEventListener("keydown", event=>{
    if(event.key === "Enter" && !event.shiftKey){ event.preventDefault(); submitQuestion(); }
  });
  suggestions?.addEventListener("click", event=>{
    const button = event.target.closest("[data-ai-question]");
    if(button) submitQuestion(button.dataset.aiQuestion || "");
  });
  messages.addEventListener("click", event=>{
    const button = event.target.closest("[data-ai-kind]");
    if(!button) return;
    const kind = button.dataset.aiKind;
    const index = Number(button.dataset.aiIndex || 0);
    dismissForNavigation();
    if(kind === "item"){
      const row = DB?.items?.[index];
      if(row && typeof openItemDetailPage === "function") openItemDetailPage(row);
    }else if(kind === "process"){
      const row = DB?.processes?.[index];
      if(row && typeof showPage === "function" && typeof openProcessDetail === "function"){ showPage("process"); setTimeout(()=>openProcessDetail(row),0); }
    }else if(kind === "dept" && typeof showPage === "function"){
      showPage("dept");
    }
  });
  micButton?.addEventListener("click", startRecognition);
  overlay.addEventListener("click", event=>{ if(event.target === overlay) closeAiAssistant(); });
  window.addEventListener("popstate", ()=>{
    if(overlay.classList.contains("show") && (!history.state || history.state.hubOverlay !== "aiAssistant")) hideAiAssistant();
  });
  document.addEventListener("keydown", event=>{
    if(event.key === "Escape" && overlay.classList.contains("show")){ event.preventDefault(); event.stopImmediatePropagation(); closeAiAssistant(); }
  }, true);
})();
