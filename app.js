'use strict';
/* Đảo Câu Văn — phần chạy game. Câu hỏi nằm trong data/*.js (window.BANK). */

const ISLANDS=[
 {name:'Đảo Mở rộng câu',blurb:'Làm câu ngắn dài ra, hiểu từng thành phần của câu.'},
 {name:'Đảo Câu ghép',blurb:'Nối các ý bằng cặp quan hệ từ cho đúng nghĩa.'},
 {name:'Đảo Tu từ',blurb:'So sánh, nhân hóa, điệp ngữ và cảm nhận cái hay của câu thơ.'},
 {name:'Đảo Từ ngữ',blurb:'Từ gợi tả, từ láy, thành ngữ và tục ngữ.'},
 {name:'Đảo Viết đoạn',blurb:'Ghép câu thành đoạn văn và làm bài thi thử.'}
];
const GAMES=[
 {id:'cay-cau',is:0,name:'Cây câu',skill:'Thêm thành phần phụ: khi nào, ở đâu, như thế nào, để làm gì.'},
 {id:'tau-chu',is:0,name:'Tàu chữ',skill:'Nhận ra trạng ngữ chỉ thời gian, nơi chốn, nguyên nhân, mục đích, phương tiện.'},
 {id:'tham-tu',is:0,name:'Thám tử câu',skill:'Tìm trạng ngữ, chủ ngữ và vị ngữ trong câu.'},
 {id:'ghep-cau',is:1,name:'Ghép đôi câu',skill:'Nối hai câu đơn thành câu ghép bằng cặp quan hệ từ đúng nghĩa.'},
 {id:'cau-noi',is:1,name:'Cầu nối',skill:'Chọn vế sau hợp nghĩa với cặp quan hệ từ, cặp từ hô ứng.'},
 {id:'sua-cau',is:1,name:'Sửa câu sai',skill:'Phát hiện và sửa quan hệ từ bị dùng sai.'},
 {id:'so-sanh',is:2,name:'Xưởng so sánh',skill:'Chọn hình ảnh so sánh vừa hợp lý, vừa gợi tả.'},
 {id:'nhan-hoa',is:2,name:'Phép thuật nhân hóa',skill:'Phân biệt nhân hóa với so sánh, chọn câu nhân hóa hay.'},
 {id:'cam-thu',is:2,name:'Kính lúp cảm thụ',skill:'Hiểu cái hay của hình ảnh, biện pháp tu từ, nghĩa của từ và dấu câu.'},
 {id:'noi-doi',is:3,name:'Nối đôi bạn thân',skill:'Nối sự vật với từ gợi tả phù hợp.'},
 {id:'kinh-lup',is:3,name:'Kính lúp từ ngữ',skill:'Thay từ còn nhạt bằng từ gợi tả hay và đúng nghĩa.'},
 {id:'tu-lay',is:3,name:'Nhà máy từ láy',skill:'Ghép tiếng thành từ láy, phân biệt với từ ghép.'},
 {id:'thanh-ngu',is:3,name:'Giải mã thành ngữ',skill:'Hoàn thành thành ngữ, tục ngữ và hiểu nghĩa.'},
 {id:'xep-doan',is:4,name:'Xếp đoạn văn',skill:'Sắp xếp các câu thành đoạn văn mạch lạc, có liên kết.'},
 {id:'thi-thu',is:4,name:'Phòng thi thử',skill:'Viết đoạn văn theo đề, máy kiểm tra các yêu cầu của đề.'}
];
const MIXED=(()=>{const by=ISLANDS.map((_,k)=>GAMES.filter(g=>g.is===k)),out=[];for(let r=0;out.length<GAMES.length;r++)by.forEach(a=>{if(a[r])out.push(a[r])});return out})();
/* Số câu mỗi lượt chơi */
const PER={'cay-cau':3,'tau-chu':4,'tham-tu':5,'noi-doi':3,'xep-doan':3};
const QUIZ_N=6;

const $app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const lc=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
const noComma=s=>s.replace(/[,.]$/,'');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);
const bank=id=>((window.BANK||{})[id]||[]);
const size=id=>id==='noi-doi'?bank(id).reduce((a,s)=>a+s.split(';').length,0):bank(id).length;
const unit=id=>id==='noi-doi'?'cặp':id==='thi-thu'?'đề':id==='xep-doan'?'đoạn':'câu';
const rows=id=>bank(id).map(s=>s.split('|'));
const STAR='<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>';
function stars(n,big){let h=`<span class="stars${big?' big':''}" role="img" aria-label="${n} trên 3 sao">`;for(let i=0;i<3;i++)h+=`<svg viewBox="0 0 24 24" class="${i<n?'on':''}" aria-hidden="true">${STAR}</svg>`;return h+'</span>'}
const starsFrom=(c,n)=>c===n?3:c>=Math.ceil(n*.75)?2:c>=1?1:0;

/* ---------- Lưu sao: trên máy + lên mạng theo mã học sinh ---------- */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let code=LS.get('dcv-code','')||'';
let best=LS.get('dcv-best-'+code,{})||{};
let essays=[];let sync='';
async function api(method,body){
  const url=method==='GET'?'api/progress?code='+encodeURIComponent(code):'api/progress';
  const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  if(!r.ok)throw new Error(String(r.status));return r.json();
}
async function loadServer(){
  if(!code){sync='';return}
  try{const d=await api('GET');const b=d.best||{};for(const k in b)if(!(best[k]>=b[k]))best[k]=b[k];essays=d.essays||[];sync='ok';LS.set('dcv-best-'+code,best)}
  catch(e){sync='off'}
  renderTotal();if(!G)renderMap();else if(G.g.id==='thi-thu')renderEssays();
}
function saveBest(id,s,essay){
  if(!(best[id]>=s))best[id]=s;LS.set('dcv-best-'+code,best);renderTotal();
  if(code)api('POST',{code,game:id,stars:s,essay}).then(d=>{essays=d.essays||essays;sync='ok';if(G&&G.g.id==='thi-thu')renderEssays()}).catch(()=>{sync='off'});
}
function setCode(c){code=c;LS.set('dcv-code',c);best=LS.get('dcv-best-'+c,{})||{};essays=[];sync='';renderTotal();renderMap();loadServer()}
function renderTotal(){const t=GAMES.reduce((a,g)=>a+(best[g.id]||0),0);document.getElementById('total').innerHTML=`${code?`<span class="who">Mã ${esc(code)}</span>`:''}<svg viewBox="0 0 24 24" aria-hidden="true">${STAR}</svg>${t} / ${GAMES.length*3} sao`}

let G=null;

/* ---------- Bản đồ ---------- */
function acct(){
  if(code)return `<div class="acct"><span>Đang lưu sao cho mã <b>${esc(code)}</b>.</span><span class="fine">${sync==='ok'?'Đã đồng bộ lên mạng.':sync==='off'?'Chưa kết nối được máy chủ, sao vẫn lưu trên máy này.':'Đang tải…'}</span><button class="ghost sm" data-act="chgcode">Đổi mã</button></div>`;
  return `<form class="acct" data-form="code"><label for="codein">Nhập mã học sinh để lưu sao lên mạng. Thầy cô và bố mẹ xem kết quả bằng chính mã này.</label>
    <div class="row"><input id="codein" maxlength="20" placeholder="AN0307" autocomplete="off"><button class="primary" type="submit">Lưu mã</button></div>
    <span class="fine" id="codeerr">Mã gồm 3–20 chữ cái hoặc chữ số, ví dụ tên và ngày sinh: AN0307. Không nhập mã thì sao chỉ lưu trên máy này.</span></form>`;
}
function renderMap(){
  G=null;
  const total=GAMES.reduce((a,g)=>a+size(g.id),0);
  $app.innerHTML=`<section class="hero"><h1>Chọn một trò chơi để luyện câu văn</h1>
  <p>Mỗi màu là một hòn đảo kỹ năng. Bé chơi trò nào trước cũng được: làm câu dài hơn, hay hơn, rồi viết thành đoạn văn hoàn chỉnh.</p></section>
  ${acct()}
  <div class="isl-legend">${ISLANDS.map((isl,k)=>`<span class="isl-tag c${k}"><span class="isle-dot" aria-hidden="true"></span>${isl.name}</span>`).join('')}</div>
  <div class="islands">${MIXED.map(g=>`<a class="island tinted c${g.is}" href="#${g.id}"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><p>${g.skill}</p><span class="count">${size(g.id)} ${unit(g.id)}</span>${stars(best[g.id]||0)}</a>`).join('')}</div>
  <p class="note">Ngân hàng có ${total} câu hỏi. Mỗi lượt chơi bốc ngẫu nhiên vài câu, nên mỗi lần chơi sẽ khác nhau.</p>`;
}
function bar(g,prog){return `<div class="bar"><a class="back" href="#">← Bản đồ</a><div class="gtitle"><span class="isl-tag c${g.is}">${ISLANDS[g.is].name}</span>${g.name}</div>${prog?`<div class="prog">${prog}</div>`:''}</div>`}
function msgHtml(m){if(!m)return '';const t={ok:'Đúng rồi!',bad:'Chưa đúng.',weak:'Gần đúng.',info:'Gợi ý:'}[m.k];return `<div class="msg ${m.k}" role="status"><b>${t}</b><span>${m.t}</span></div>`}
const nextBtn=(last,a,b)=>`<div class="actions"><button class="primary" data-act="next">${last?'Xem kết quả':a}</button></div>`;

/* ---------- Khung chung ---------- */
function startGame(g){
  G={g,i:0,correct:0,total:0,msg:null,shake:null};
  if(!bank(g.id).length){$app.innerHTML=bar(g)+'<div class="board"><p>Chưa tải được câu hỏi. Hãy tải lại trang.</p></div>';return}
  BUILD[g.id]();render();
}
function render(){if(!G)return renderMap();(G.view||renderQuiz)()}
function next(){
  if(G.onNext)G.onNext();else{G.total++;G.i++;resetQuiz()}
  render();window.scrollTo(0,0);
}
function renderEnd(){
  const st=starsFrom(G.correct,G.total);saveBest(G.g.id,st);
  const idx=GAMES.indexOf(G.g),nx=GAMES[idx+1];
  $app.innerHTML=bar(G.g)+`<div class="board end">
    <div class="stamp"><span><span class="big">${st}</span>sao</span></div>${stars(st,true)}
    <h2>Hoàn thành “${G.g.name}”!</h2>
    <p>Bé làm đúng ngay lần đầu ${G.correct}/${G.total} lần.${st<3?' Chơi lại để lấy đủ 3 sao nhé.':''}</p>
    <div class="actions" style="justify-content:center"><button class="ghost" data-act="again">Chơi lượt mới</button>${nx?`<a class="primary" href="#${nx.id}">Chơi tiếp: ${nx.name}</a>`:'<a class="primary" href="#">Về bản đồ</a>'}</div></div>`;
}

/* Trắc nghiệm dùng chung */
const opt=(label,ok,why)=>({label,ok,why});
const pt=o=>`<span class="pt ${o.ok===true?'good':o.ok==='weak'?'weak':'bad'}">${o.label}</span>`;
const BLANK='<span class="blank">?</span>';
function resetQuiz(){G.sel=null;G.tried=[];G.done=false;G.msg=null}
function quiz(id,map){G.qs=pick(rows(id),QUIZ_N).map(map);resetQuiz()}
function renderQuiz(){
  if(G.i>=G.qs.length)return renderEnd();
  const q=G.qs[G.i],sel=G.sel!=null?q.options[G.sel]:null;
  const opts=q.options.map((o,j)=>{let c='';if(G.done&&G.sel===j)c='on';else if(G.tried.includes(j))c=o.ok==='weak'?'weak':'bad';
    return `<button class="opt ${c}${G.shake===j?' shake':''}" data-act="pick" data-j="${j}" ${G.done||G.tried.includes(j)?'disabled':''}>${o.label}</button>`}).join('');
  $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.qs.length}`)+`<div class="board">${q.intro}
    <div class="sentence" aria-live="polite">${q.view(sel)}</div>
    <div class="opts${q.col?' col':''}">${opts}</div>${msgHtml(G.msg)}
    ${G.done?nextBtn(G.i+1>=G.qs.length,'Câu tiếp theo'):''}</div>`;
  G.shake=null;
}
function clickPick(j){
  if(G.done)return;const o=G.qs[G.i].options[j];G.sel=j;
  if(o.ok===true){if(!G.tried.length)G.correct++;G.done=true;G.msg={k:'ok',t:o.why}}
  else{G.tried.push(j);G.shake=j;G.msg={k:o.ok==='weak'?'weak':'bad',t:o.why}}
  render();
}

const BUILD={};

/* ---------- Cây câu ---------- */
const SL={t:{q:'Khi nào?',ph:'khi nào',c:'time'},p:{q:'Ở đâu?',ph:'ở đâu',c:'place'},m:{q:'Như thế nào?',ph:'như thế nào',c:'manner'},r:{q:'Để làm gì? Vì sao?',ph:'để làm gì',c:'reason'}};
BUILD['cay-cau']=()=>{
  G.rounds=pick(rows('cay-cau'),PER['cay-cau']).map(([core,t,p,m,r])=>{
    const src={t:t.split(';'),p:p.split(';'),m:m.split(';'),r:r.split(';')},opts={};
    for(const s of ['t','p','m','r']){
      const others=['t','p','m','r'].filter(x=>x!==s);let d,o,n=0;
      do{o=others[Math.floor(Math.random()*3)];d=src[o][Math.floor(Math.random()*src[o].length)];n++}while(src[s].some(x=>noComma(x).toLowerCase()===noComma(d).toLowerCase())&&n<20);
      opts[s]=shuffle([...src[s].map(x=>[x,s]),[d,o]]);
    }
    return {core,opts};
  });
  G.n=G.rounds.length;
  const reset=()=>{G.pick={};G.wrong={};G.res={};G.msg=null};reset();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const R=G.rounds[G.i];let first=true;const parts=[];
    for(const s of ['t','core','m','p','r']){
      if(s==='core'){parts.push(first?cap(R.core):R.core);first=false;continue}
      const j=G.pick[s];
      if(j!=null){let t=R.opts[s][j][0];t=first?cap(t):lc(t);parts.push(`<span class="pt ${SL[s].c}">${t}</span>`);first=false}
      else parts.push(`<span class="slot ${SL[s].c}">${SL[s].ph}</span>`);
    }
    const filled=Object.keys(G.pick).length;
    const rws=['t','p','m','r'].map(s=>`<div class="row"><span class="lg ${SL[s].c}">${SL[s].q}</span>${R.opts[s].map((o,j)=>{
      const c=G.pick[s]===j?'on':(G.wrong[s]||[]).includes(j)?'bad':'';
      return `<button class="opt ${c}${G.shake===s+j?' shake':''}" data-act="x" data-s="${s}" data-j="${j}">${lc(noComma(o[0]))}</button>`}).join('')}</div>`).join('');
    $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.n}`)+`<div class="board">
      <p class="ask">Câu gốc còn ngắn quá. Với mỗi câu hỏi, chọn một cụm từ trả lời đúng câu hỏi đó để câu văn lớn lên.</p>
      <div class="sentence" aria-live="polite">${parts.join(' ')}.</div>
      <div class="meter-row"><span>Độ hay của câu</span><div class="meter"><div style="width:${(filled+1)*20}%"></div></div><span>${filled+1}/5</span></div>
      <div class="rows">${rws}</div>${msgHtml(G.msg)}
      ${filled===4?`<div class="msg info"><b>Tuyệt!</b><span>Câu văn đã đủ 5 phần. Bé hãy đọc to cả câu lên nhé.</span></div>`+nextBtn(G.i+1>=G.n,'Câu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{
    const s=d.s,j=+d.j,o=G.rounds[G.i].opts[s][j],label=lc(noComma(o[0]));
    if(o[1]===s){G.pick[s]=j;if(!(s in G.res))G.res[s]=true;G.msg={k:'ok',t:`“${label}” trả lời câu hỏi ${SL[s].q}`}}
    else{G.wrong[s]=(G.wrong[s]||[]).concat(j);G.res[s]=false;G.shake=s+j;G.msg={k:'bad',t:`“${label}” trả lời câu hỏi ${SL[o[1]].q} Hãy tìm cụm từ trả lời câu hỏi ${SL[s].q}`}}
    render();
  };
  G.onNext=()=>{G.correct+=Object.values(G.res).filter(Boolean).length;G.total+=4;G.i++;reset()};
};

/* ---------- Tàu chữ ---------- */
const KINDS={time:{n:'Thời gian',c:'time',q:'Khi nào?'},place:{n:'Nơi chốn',c:'place',q:'Ở đâu?'},cause:{n:'Nguyên nhân',c:'reason',q:'Vì sao? Nhờ đâu?'},purpose:{n:'Mục đích',c:'purpose',q:'Để làm gì?'},means:{n:'Phương tiện',c:'manner',q:'Bằng gì? Với cái gì?'}};
const KLET={T:'time',P:'place',N:'cause',D:'purpose',C:'means',_:null};
BUILD['tau-chu']=()=>{
  G.trains=pick(bank('tau-chu'),PER['tau-chu']).map(s=>s.split('|').map(x=>[x.slice(2),KLET[x[0]]]));
  G.n=G.trains.length;G.k=0;G.tried=[];
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const R=G.trains[G.i],cars=R.filter(p=>p[1]),done=G.k>=cars.length,cur=cars[G.k];let ci=-1;
    const train=R.map(p=>{if(!p[1])return `<div class="car engine">${p[0]}</div>`;ci++;
      if(ci<G.k)return `<div class="car painted ${KINDS[p[1]].c}">${p[0]}</div>`;
      if(ci===G.k)return `<div class="car cur${G.shake?' shake':''}">${p[0]}</div>`;
      return `<div class="car">${p[0]}</div>`}).join('');
    const kinds=Object.entries(KINDS).map(([k,v])=>`<button class="opt${G.tried.includes(k)?' bad':''}" data-act="x" data-k="${k}" ${G.tried.includes(k)?'disabled':''}><span class="dot ${v.c}"></span>${v.n}</button>`).join('');
    $app.innerHTML=bar(G.g,`Đoàn tàu ${G.i+1}/${G.n}`)+`<div class="board">
      <p class="ask">${done?'Đoàn tàu đã sơn xong mọi toa!':`Toa đang chờ: <b>“${noComma(cur[0])}”</b>. Toa này là trạng ngữ chỉ gì? Chọn màu sơn cho toa.`}</p>
      <div class="train">${train}</div>${done?'':`<div class="kinds">${kinds}</div>`}${msgHtml(G.msg)}
      ${done?`<div class="sentence">${R.map(p=>p[1]?`<span class="pt ${KINDS[p[1]].c}">${p[0]}</span>`:p[0]).join(' ')}.</div>`+nextBtn(G.i+1>=G.n,'Đoàn tàu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{const c=G.trains[G.i].filter(p=>p[1])[G.k];if(!c)return;const k=d.k;
    if(k===c[1]){if(!G.tried.length)G.correct++;G.total++;G.k++;G.tried=[];G.msg={k:'ok',t:`“${noComma(c[0])}” trả lời câu hỏi ${KINDS[k].q} Đây là trạng ngữ chỉ ${KINDS[k].n.toLowerCase()}.`}}
    else{G.tried.push(k);G.shake=1;G.msg={k:'bad',t:`Toa này không trả lời câu hỏi ${KINDS[k].q} Thử đặt câu hỏi khác cho toa nhé.`}}
    render()};
  G.onNext=()=>{G.i++;G.k=0;G.tried=[];G.msg=null};
};

/* ---------- Thám tử câu ---------- */
const ROLES={tn:{n:'trạng ngữ',c:'time',ab:'TN',h:'Trạng ngữ là phần phụ, thường đứng đầu câu và ngăn cách với phần chính bằng dấu phẩy.'},cn:{n:'chủ ngữ',c:'purpose',ab:'CN',h:'Chủ ngữ trả lời câu hỏi Ai? Cái gì? Con gì?'},vn:{n:'vị ngữ',c:'place',ab:'VN',h:'Vị ngữ trả lời câu hỏi Làm gì? Thế nào? Là gì?'}};
const PHASES=['tn','cn','vn'],RLET={t:'tn',c:'cn',v:'vn'};
BUILD['tham-tu']=()=>{
  G.sents=pick(bank('tham-tu'),PER['tham-tu']).map(s=>s.split('|').map(x=>[x.slice(2),RLET[x[0]]]));
  G.n=G.sents.length;G.ph=0;G.tried=[];
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const S=G.sents[G.i],done=G.ph>=3,role=ROLES[PHASES[G.ph]];
    const chunks=S.map((c,j)=>PHASES.indexOf(c[1])<G.ph?`<span class="pt ${ROLES[c[1]].c}">${c[0]}<sup>${ROLES[c[1]].ab}</sup></span>`
      :`<button class="chunk${G.shake===j?' shake':''}${G.tried.includes(j)?' miss':''}" data-act="x" data-j="${j}">${c[0]}</button>`).join(' ');
    $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.n}`)+`<div class="board">
      <p class="ask">${done?'Bé đã tìm đủ các thành phần của câu.':`Chạm vào phần là <span class="lg ${role.c}">${role.n}</span> của câu.`}</p>
      <div class="sentence">${chunks}</div>${msgHtml(G.msg)}
      ${done?nextBtn(G.i+1>=G.n,'Câu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{if(G.ph>=3)return;const S=G.sents[G.i],j=+d.j,want=PHASES[G.ph];
    if(S[j][1]===want){if(!G.tried.length)G.correct++;G.total++;G.ph++;G.tried=[];G.msg={k:'ok',t:`“${noComma(S[j][0])}” là ${ROLES[want].n}. ${ROLES[want].h}`}}
    else{G.tried.push(j);G.shake=j;G.msg={k:'bad',t:`Đây chưa phải ${ROLES[want].n}. ${ROLES[want].h}`}}
    render()};
  G.onNext=()=>{G.i++;G.ph=0;G.tried=[];G.msg=null};
};

/* ---------- Ghép đôi câu ---------- */
const PAIRS=[
 {a:'vì',b:'nên',k:'nguyên nhân – kết quả',d:'Vế đầu là nguyên nhân, vế sau là kết quả.'},
 {a:'tuy',b:'nhưng',k:'tương phản (hai ý trái ngược nhau)',d:'Hai vế nêu hai ý trái ngược nhau.'},
 {a:'nếu',b:'thì',k:'giả thiết – kết quả (điều chưa xảy ra)',d:'Vế đầu là điều kiện hoặc giả thiết, vế sau là kết quả.'},
 {a:'không những',b:'mà còn',k:'tăng tiến (ý sau nâng cao ý trước)',d:'Ý ở vế sau nâng cao, bổ sung cho vế trước.'}
];
BUILD['ghep-cau']=()=>quiz('ghep-cau',([s1,s2,tpl,ans,why])=>{
  const fill=(A,a,b)=>tpl.replace('{A}',A).replace('{a}',a).replace('{b}',b);
  return {intro:`<div class="pair-src"><span>Câu 1: ${s1}</span><span>Câu 2: ${s2}</span></div><p class="ask">Chọn cặp quan hệ từ để nối hai câu thành một câu ghép.</p>`,
    options:PAIRS.map((p,k)=>({label:`${cap(p.a)} … ${p.b}`,ok:k===+ans,pair:p,why:k===+ans?(why||p.d):`Cặp “${p.a} … ${p.b}” dùng cho quan hệ ${p.k}. Hai câu này có quan hệ đó không? Thử cặp khác nhé.`})),
    view:o=>{if(!o)return fill(BLANK,BLANK,BLANK);const w=t=>`<span class="pt ${o.ok?'good':'bad'}">${t}</span>`;return fill(w(cap(o.pair.a)),w(o.pair.a),w(o.pair.b))}};
});

/* ---------- Cầu nối ---------- */
const marks=s=>s.replace(/\*([^*]+)\*/g,'<span class="nhu">$1</span>');
BUILD['cau-noi']=()=>quiz('cau-noi',([lead,r,wr,w1,y1,w2,y2])=>({intro:'<p class="ask">Chọn vế sau phù hợp để câu ghép có nghĩa.</p>',col:true,
  options:shuffle([opt(r,true,wr),opt(w1,false,y1),opt(w2,false,y2)]),view:o=>`${marks(lead)} ${o?pt(o):BLANK}.`}));

/* ---------- Sửa câu sai ---------- */
const DESC={'vì':'chỉ nguyên nhân, thường đi với “nên”','do':'chỉ nguyên nhân, thường đi với “nên”','bởi':'chỉ nguyên nhân, thường đi với “nên”','tại':'chỉ nguyên nhân dẫn tới điều không tốt','nhờ':'chỉ nguyên nhân dẫn tới kết quả tốt, thường đi với “mà”',
 'tuy':'chỉ sự trái ngược, thường đi với “nhưng”','mặc dù':'chỉ sự trái ngược, thường đi với “nhưng”','nếu':'chỉ điều kiện, giả thiết, thường đi với “thì”','giá':'chỉ điều kiện, giả thiết, thường đi với “thì”','hễ':'chỉ điều kiện lặp lại, thường đi với “là” hoặc “thì”',
 'không những':'chỉ sự tăng tiến, thường đi với “mà còn”','không chỉ':'chỉ sự tăng tiến, thường đi với “mà còn”','chẳng những':'chỉ sự tăng tiến, thường đi với “mà còn”',
 'nên':'chỉ kết quả, thường đi với “vì”, “do”','nhưng':'chỉ sự trái ngược','thì':'chỉ kết quả của điều kiện, thường đi với “nếu”','mà':'thường đi với “nhờ” hoặc trong cặp “không những … mà còn”','là':'thường đi với “hễ”',
 'và':'nối các ý ngang hàng, cùng chiều','hay':'chỉ sự lựa chọn','hoặc':'chỉ sự lựa chọn','của':'chỉ sự sở hữu','bằng':'chỉ chất liệu hoặc phương tiện','với':'chỉ người cùng làm hoặc đối tượng','để':'chỉ mục đích','cho':'chỉ người nhận, đối tượng hướng tới','rồi':'chỉ việc xảy ra nối tiếp'};
BUILD['sua-cau']=()=>quiz('sua-cau',([pre,w,post,r,why,d1,d2])=>({intro:'<p class="ask">Từ gạch chân bị dùng sai. Chọn từ đúng để sửa lại câu.</p>',
  options:shuffle([opt(r,true,why),...[d1,d2].map(d=>opt(d,false,`“${lc(d)}” ${DESC[lc(d)]||'không hợp với câu này'}, nên không hợp với câu này.`))]),
  view:o=>o?`${pre}<span class="was">${w}</span>${pt(o)}${post}`:`${pre}<span class="plain">${w}</span>${post}`}));

/* ---------- Xưởng so sánh ---------- */
BUILD['so-sanh']=()=>quiz('so-sanh',([lead,b,wb,k,wk,x,wx])=>({intro:'<p class="ask">Chọn hình ảnh so sánh hay nhất để hoàn thành câu.</p>',
  options:shuffle([opt(b,true,wb),opt(k,'weak',wk),opt(x,false,wx)]),view:o=>`${lead} <span class="nhu">như</span> ${o?pt(o):BLANK}.`}));

/* ---------- Phép thuật nhân hóa ---------- */
BUILD['nhan-hoa']=()=>quiz('nhan-hoa',([base,nh,words,ss,plain])=>({intro:`<p class="ask">Câu gốc: “${base}” Chọn cách viết lại có dùng phép nhân hóa.</p>`,col:true,
  options:shuffle([opt(nh,true,`Câu dùng từ ngữ vốn dành cho người: ${words}.`),opt(ss,false,'Câu này dùng so sánh (có từ “như”), chưa phải nhân hóa.'),opt(plain,false,'Câu này tả bình thường, chưa có từ ngữ dùng cho người.')]),
  view:o=>o?pt(o):BLANK}));

/* ---------- Kính lúp cảm thụ ---------- */
BUILD['cam-thu']=()=>quiz('cam-thu',([lines,by,q,r,wr,w1,y1,w2,y2])=>({intro:'<p class="ask">Đọc kĩ rồi chọn câu trả lời đúng nhất.</p>',col:true,
  options:shuffle([opt(r,true,wr),opt(w1,false,y1),opt(w2,false,y2)]),
  view:()=>`<div class="poem">${lines.split('/').map(s=>s.trim()).join('<br>')}${by?`<div class="by">${by}</div>`:''}<div class="q">${q}</div></div>`}));

/* ---------- Nối đôi bạn thân ---------- */
BUILD['noi-doi']=()=>{
  G.sets=pick(bank('noi-doi'),PER['noi-doi']).map(s=>s.split(';').map(p=>p.split('=')));
  G.n=G.sets.length;
  const init=()=>{const m=(G.sets[G.i]||[]).length;G.left=shuffle([...Array(m).keys()]);G.right=shuffle([...Array(m).keys()]);G.selL=null;G.matched=[];G.miss=[]};init();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const S=G.sets[G.i],done=G.matched.length===S.length;
    const L=G.left.map(j=>`<button class="opt${G.matched.includes(j)?' on':G.selL===j?' sel':''}" data-act="x" data-side="L" data-j="${j}" ${G.matched.includes(j)?'disabled':''}>${S[j][0]}</button>`).join('');
    const R=G.right.map(j=>`<button class="opt${G.matched.includes(j)?' on':''}${G.shake===j?' shake':''}" data-act="x" data-side="R" data-j="${j}" ${G.matched.includes(j)?'disabled':''}>${S[j][1]}</button>`).join('');
    $app.innerHTML=bar(G.g,`Lượt ${G.i+1}/${G.n}`)+`<div class="board">
      <p class="ask">Chạm một sự vật ở cột trái, rồi chạm từ gợi tả hợp với nó ở cột phải.</p>
      <div class="match"><div>${L}</div><div>${R}</div></div>${msgHtml(G.msg)}
      ${done?`<div class="msg info"><b>Đọc to:</b><span>${S.map(p=>p[0]+' '+p[1]).join(' · ')}</span></div>`+nextBtn(G.i+1>=G.n,'Lượt tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{const S=G.sets[G.i],j=+d.j;
    if(d.side==='L'){G.selL=j;G.msg=null;return render()}
    if(G.selL==null){G.msg={k:'info',t:'Chạm vào một sự vật ở cột trái trước nhé.'};return render()}
    if(j===G.selL){G.matched.push(j);G.total++;if(!G.miss.includes(j))G.correct++;G.msg={k:'ok',t:`${S[j][0]} ${S[j][1]}.`};G.selL=null}
    else{if(!G.miss.includes(G.selL))G.miss.push(G.selL);G.shake=j;G.msg={k:'bad',t:`“${S[G.selL][0]} ${S[j][1]}” nghe chưa hợp. Thử từ khác nhé.`}}
    render()};
  G.onNext=()=>{G.i++;init();G.msg=null};
};

/* ---------- Kính lúp từ ngữ ---------- */
BUILD['kinh-lup']=()=>quiz('kinh-lup',([pre,plain,post,b,wb,w1,y1,w2,y2])=>({intro:'<p class="ask">Từ gạch chân còn nhạt. Soi kính lúp và chọn từ gợi tả hay, đúng nghĩa để thay vào.</p>',
  options:shuffle([opt(b,true,wb),opt(w1,false,y1),opt(w2,false,y2)]),
  view:o=>o?`${pre}<span class="was">${plain}</span>${pt(o)}${post}`:`${pre}<span class="plain">${plain}</span>${post}`}));

/* ---------- Nhà máy từ láy ---------- */
const LAY={'âm đầu':'láy âm đầu (lặp lại âm đầu)','vần':'láy vần (lặp lại vần)','toàn bộ':'láy toàn bộ (lặp lại cả tiếng, có thể đổi thanh)'};
BUILD['tu-lay']=()=>quiz('tu-lay',([g,r,kind,d1,d2])=>({intro:'<p class="ask">Chọn tiếng ghép với tiếng gốc để tạo thành từ láy.</p>',
  options:shuffle([opt(r,true,`“${g} ${r}” là từ ${LAY[kind]||'láy'}.`),...[d1,d2].map(d=>d[0]==='+'?opt(d.slice(1),false,`“${g} ${d.slice(1)}” là từ ghép: hai tiếng đều có nghĩa, không lặp âm hay vần.`):opt(d,false,`Tiếng Việt không có từ “${g} ${d}”.`))]),
  view:o=>`<span class="pt time">${g}</span> + ${o?pt(o):BLANK}${o&&o.ok===true?` → <b>${g} ${o.label}</b>`:''}`}));

/* ---------- Giải mã thành ngữ ---------- */
BUILD['thanh-ngu']=()=>quiz('thanh-ngu',([text,ans,mean,d1,d2])=>{
  const end=s=>/[.!?…]$/.test(s)?s:s+'.';
  return {intro:'<p class="ask">Điền từ còn thiếu để hoàn thành câu thành ngữ, tục ngữ.</p>',
    options:shuffle([opt(ans,true,`“${end(text.replace('_',ans))}” ${mean}`),...[d1,d2].map(d=>opt(d,false,`Chưa đúng. Gợi ý: câu này nói về ${lc(mean)}`))]),
    view:o=>end(text.replace('_',o?pt(o):BLANK))};
});

/* ---------- Xếp đoạn văn ---------- */
BUILD['xep-doan']=()=>{
  G.paras=pick(rows('xep-doan'),PER['xep-doan']).map(([topic,...s])=>({topic,s}));
  G.n=G.paras.length;
  const init=()=>{if(G.i<G.n)G.order=shuffle(G.paras[G.i].s.map((_,j)=>j));G.placed=[];G.miss=false};init();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const X=G.paras[G.i],done=G.placed.length===X.s.length;
    const para=G.placed.length?G.placed.map(j=>X.s[j]).join(' '):'<span class="fine">Chạm vào câu mở đầu đoạn văn.</span>';
    const rest=G.order.filter(j=>!G.placed.includes(j)).map(j=>`<button class="opt${G.shake===j?' shake':''}" data-act="x" data-j="${j}">${X.s[j]}</button>`).join('');
    $app.innerHTML=bar(G.g,`Đoạn ${G.i+1}/${G.n}`)+`<div class="board">
      <p class="ask">Đề tài: <b>${X.topic}</b>. Chạm vào các câu theo đúng thứ tự để tạo thành đoạn văn.</p>
      <div class="sentence">${para}</div>${done?'':`<div class="opts col">${rest}</div>`}${msgHtml(G.msg)}
      ${done?nextBtn(G.i+1>=G.n,'Đoạn tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{const X=G.paras[G.i],j=+d.j,want=G.placed.length;
    if(j===want){G.placed.push(j);G.total++;if(!G.miss)G.correct++;G.miss=false;G.msg=G.placed.length===X.s.length?{k:'ok',t:'Đoạn văn đã mạch lạc. Bé đọc to cả đoạn nhé.'}:null}
    else{G.miss=true;G.shake=j;G.msg={k:'bad',t:want===0?'Câu này chưa phải câu mở đầu. Câu mở đầu thường giới thiệu thời gian hoặc sự vật được nói tới.':'Câu này chưa phải câu tiếp theo. Chú ý các từ nối như “đầu tiên”, “rồi”, “sau đó”, “cuối cùng”.'}}
    render()};
  G.onNext=()=>{G.i++;init();G.msg=null};
};

/* ---------- Phòng thi thử ---------- */
const PAIR_WORDS=[['vì','nên'],['do','nên'],['bởi','nên'],['nhờ','mà'],['tuy','nhưng'],['mặc dù','nhưng'],['nếu','thì'],['hễ','thì'],['hễ','là'],['giá mà','thì'],['không những','mà còn'],['chẳng những','mà còn'],['không chỉ','mà còn'],['càng','càng']];
const BND='(^|[\\s,;:"“(])',END='(?=$|[\\s,.;:!?…"”)])';
const reW=w=>new RegExp(BND+'('+w.replace(/ /g,'\\s+')+')'+END,'iu');
const reSS=new RegExp(BND+'(giống như|hệt như|tựa như|như là|tựa|như)'+END,'iu');
const reLK=/^(vì vậy|vì thế|do đó|do vậy|tuy nhiên|ngoài ra|bên cạnh đó|trước hết|trước tiên|đầu tiên|tiếp theo|tiếp đó|sau đó|cuối cùng|tóm lại|nhìn chung|hơn nữa|thật vậy|mặt khác|nhờ vậy|nhờ đó|rồi)(?=[\s,])/iu;
const NEED={tn:{n:'Trạng ngữ',h:'Thử mở đầu một câu bằng cụm chỉ thời gian hoặc nơi chốn, ví dụ: “Mỗi sáng đến trường, …”'},
  gh:{n:'Câu ghép có cặp quan hệ từ',h:'Thử dùng: “Tuy … nhưng …”, “Vì … nên …”, “Không những … mà còn …”'},
  ss:{n:'Hình ảnh so sánh',h:'Thử dùng từ “như”, “tựa như”, “giống như” để so sánh.'},
  lk:{n:'Từ ngữ nối liên kết câu',h:'Thử mở đầu câu bằng “Trước hết”, “Bên cạnh đó”, “Vì vậy”, “Cuối cùng”…'}};
function analyze(text){
  const sents=text.replace(/\s+/g,' ').trim().split(/(?<=[.!?…])\s+/).filter(s=>s.trim().length>1);
  const c={tn:0,gh:0,ss:0,lk:0};const html=[];
  for(const s of sents){
    const R=[];let pairAt=-1;
    const lk=reLK.exec(s);if(lk){R.push([0,lk[1].length,'m-lk']);c.lk++}
    for(const [a,b] of PAIR_WORDS){const m1=reW(a).exec(s);if(!m1)continue;const st=m1.index+m1[1].length,en=st+m1[2].length;
      const m2=reW(b).exec(s.slice(en));if(!m2)continue;const st2=en+m2.index+m2[1].length;
      R.push([st,en,'m-gh'],[st2,st2+m2[2].length,'m-gh']);pairAt=st;c.gh++;break}
    const ci=s.indexOf(',');
    if(!lk&&ci>0&&s.slice(0,ci).trim().split(/\s+/).length<=7&&!(pairAt>=0&&pairAt<ci)){R.push([0,ci,'m-tn']);c.tn++}
    const m=reSS.exec(s);
    if(m){const st=m.index+m[1].length;let en=s.slice(st).search(/[,;.!?…]/);en=en<0?s.length:st+en;R.push([st,en,'m-ss']);c.ss++}
    R.sort((x,y)=>x[0]-y[0]);let out='',cur=0;
    for(const [a,b,cl] of R){if(a<cur)continue;out+=esc(s.slice(cur,a))+`<mark class="${cl}">${esc(s.slice(a,b))}</mark>`;cur=b}
    html.push(out+esc(s.slice(cur)));
  }
  return {n:sents.length,c,html:html.join(' ')};
}
function checks(a){const D=G.de;return [
  {ok:a.n>=D.min&&a.n<=D.max,t:`Số câu: ${a.n} (đề yêu cầu ${D.min}–${D.max} câu)`,h:a.n<D.min?'Viết thêm vài câu nữa cho đủ ý.':a.n>D.max?'Đoạn văn hơi dài, thử gộp hoặc bớt câu.':''},
  ...D.needs.map(k=>({ok:a.c[k]>0,t:`${NEED[k].n}: ${a.c[k]}`,h:NEED[k].h}))]}
BUILD['thi-thu']=()=>{
  const all=rows('thi-thu');
  G.newDe=()=>{const [de,min,max,needs]=all[Math.floor(Math.random()*all.length)];G.de={de,min:+min,max:+max,needs:needs.split(',').filter(k=>NEED[k])};G.text=''};
  G.newDe();
  G.view=()=>{
    const D=G.de;
    $app.innerHTML=bar(G.g)+`<div class="board">
      <div class="de"><span class="lbl">Đề bài</span><p>${D.de}</p><p class="req">Đoạn văn từ ${D.min} đến ${D.max} câu, có dùng ít nhất: ${D.needs.map(k=>NEED[k].n.toLowerCase()).join('; ')}.</p></div>
      <label class="ask" for="essay">Bài làm của bé:</label>
      <textarea id="essay" spellcheck="false" placeholder="Bắt đầu viết đoạn văn ở đây…">${esc(G.text)}</textarea>
      <div class="actions"><button class="primary" data-act="submit">Nộp bài</button><button class="ghost" data-act="newde">Đổi đề khác</button></div>
      <div id="result"></div>
      <div class="split">
        <div class="panel"><h3>Bảng kiểm tra</h3><ul class="checks" id="checks"></ul></div>
        <div class="panel"><h3>Bài của bé, đã tô màu</h3><div class="preview" id="preview"></div>
          <div class="legend" style="margin-top:8px"><mark class="m-tn">trạng ngữ</mark><mark class="m-gh">quan hệ từ</mark><mark class="m-ss">so sánh</mark><mark class="m-lk">từ nối</mark></div></div>
      </div>
      <p class="fine">Máy chỉ kiểm tra các yêu cầu hình thức của đề. Nội dung, ý hay và chính tả cần thầy cô hoặc bố mẹ đọc lại.</p>
      <div id="essays"></div></div>`;
    const ta=document.getElementById('essay');ta.addEventListener('input',()=>{G.text=ta.value;document.getElementById('result').innerHTML='';updateThi()});
    updateThi();renderEssays();
  };
};
function updateThi(){
  const a=analyze(G.text);
  document.getElementById('checks').innerHTML=checks(a).map(c=>`<li class="${c.ok?'yes':'no'}"><span class="ic">${c.ok?'✓':'!'}</span><span>${c.t}${!c.ok&&c.h?`<small>${c.h}</small>`:''}</span></li>`).join('');
  document.getElementById('preview').innerHTML=a.html||'<span class="fine">Bài viết sẽ hiện ở đây.</span>';
  return a;
}
function submitThi(){
  if(G.text.trim().length<20){document.getElementById('result').innerHTML='<div class="msg weak"><b>Khoan đã.</b><span>Bé viết thêm rồi hãy nộp bài nhé.</span></div>';return}
  const a=updateThi(),cs=checks(a),met=cs.filter(c=>c.ok).length,n=cs.length,st=met===n?3:met===n-1?2:met>=1?1:0;
  saveBest('thi-thu',st,code?{de:G.de.de,text:G.text}:undefined);
  document.getElementById('result').innerHTML=`<div class="msg ${st===3?'ok':'weak'}"><b>${stars(st)}</b><span>${st===3?'Bài làm đạt đủ yêu cầu của đề. Giỏi lắm!':`Bài làm đạt ${met}/${n} yêu cầu. Xem bảng kiểm tra để sửa và nộp lại nhé.`}${code?' Bài đã được lưu.':''}</span></div>`;
}
function renderEssays(){
  const el=document.getElementById('essays');if(!el)return;
  if(!code){el.innerHTML='';return}
  el.innerHTML=essays.length?`<div class="panel"><h3>Bài đã nộp của mã ${esc(code)} (${essays.length})</h3>${essays.map(e=>`<details class="essay"><summary>${stars(e.stars||0)} <span>${esc(new Date(e.at).toLocaleDateString('vi-VN'))} · ${esc(e.de)}</span></summary><p>${esc(e.text)}</p></details>`).join('')}</div>`:'';
}

/* ---------- Sự kiện ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='chgcode'){setCode('');return}
  if(!G)return;
  if(a==='pick')clickPick(+b.dataset.j);
  else if(a==='x'&&G.onAct)G.onAct(b.dataset);
  else if(a==='next')next();
  else if(a==='again'){startGame(G.g);window.scrollTo(0,0)}
  else if(a==='submit')submitThi();
  else if(a==='newde'){G.newDe();render()}
});
document.addEventListener('submit',e=>{
  const f=e.target.closest('[data-form="code"]');if(!f)return;e.preventDefault();
  const v=document.getElementById('codein').value.trim().toUpperCase();
  if(!/^[A-Z0-9]{3,20}$/.test(v)){const er=document.getElementById('codeerr');er.textContent='Mã chỉ gồm 3–20 chữ cái không dấu hoặc chữ số, không có dấu cách.';er.classList.add('err');return}
  setCode(v);
});
function route(){const id=location.hash.slice(1);const g=GAMES.find(x=>x.id===id);if(g)startGame(g);else renderMap();window.scrollTo(0,0)}
addEventListener('hashchange',route);
renderTotal();route();loadServer();
