'use strict';
/* Đảo Câu Văn — phần chạy game. Câu hỏi nằm trong data/*.js (window.BANK). */

const ISLANDS=[
 {name:'Đảo Mở rộng câu',blurb:'Làm câu ngắn dài ra, hiểu từng thành phần của câu.'},
 {name:'Đảo Câu ghép',blurb:'Nối các ý bằng kết từ, cặp kết từ cho đúng nghĩa.'},
 {name:'Đảo Tu từ',blurb:'So sánh, nhân hóa, điệp ngữ và cảm nhận cái hay của câu thơ.'},
 {name:'Đảo Từ ngữ',blurb:'Từ gợi tả, từ láy, thành ngữ và tục ngữ.'},
 {name:'Đảo Viết đoạn',blurb:'Ghép câu thành đoạn văn và làm bài thi thử.'}
];
const GAMES=[
 {id:'cay-cau',is:0,name:'Cây câu',skill:'Thêm thành phần phụ: khi nào, ở đâu, như thế nào, để làm gì.'},
 {id:'tau-chu',is:0,name:'Tàu chữ',skill:'Nhận ra trạng ngữ chỉ thời gian, nơi chốn, nguyên nhân, mục đích, phương tiện.'},
 {id:'tham-tu',is:0,name:'Thám tử câu',skill:'Tìm trạng ngữ, chủ ngữ và vị ngữ trong câu.'},
 {id:'ghep-cau',is:1,name:'Ghép đôi câu',skill:'Nối hai câu đơn thành câu ghép bằng cặp kết từ đúng nghĩa.'},
 {id:'cau-noi',is:1,name:'Cầu nối',skill:'Chọn vế sau hợp nghĩa với cặp kết từ, cặp từ hô ứng.'},
 {id:'sua-cau',is:1,name:'Sửa câu sai',skill:'Phát hiện và sửa kết từ bị dùng sai.'},
 {id:'so-sanh',is:2,name:'Xưởng so sánh',skill:'Chọn hình ảnh so sánh vừa hợp lý, vừa gợi tả.'},
 {id:'nhan-hoa',is:2,name:'Phép thuật nhân hóa',skill:'Phân biệt nhân hóa với so sánh, chọn câu nhân hóa hay.'},
 {id:'cam-thu',is:2,name:'Kính lúp cảm thụ',skill:'Hiểu cái hay của hình ảnh, biện pháp tu từ, nghĩa của từ và dấu câu.'},
 {id:'noi-doi',is:3,name:'Nối đôi bạn thân',skill:'Nối sự vật với từ gợi tả phù hợp.'},
 {id:'kinh-lup',is:3,name:'Kính lúp từ ngữ',skill:'Thay từ còn nhạt bằng từ gợi tả hay và đúng nghĩa.'},
 {id:'tu-lay',is:3,name:'Nhà máy từ láy',skill:'Ghép tiếng thành từ láy, phân biệt với từ ghép.'},
 {id:'thanh-ngu',is:3,name:'Giải mã thành ngữ',skill:'Hoàn thành thành ngữ, tục ngữ và hiểu nghĩa.'},
 {id:'xep-doan',is:4,name:'Xếp đoạn văn',skill:'Sắp xếp các câu thành đoạn văn mạch lạc, có liên kết.'},
 {id:'thi-thu',is:4,name:'Phòng thi thử',skill:'Viết đoạn văn theo đề, máy kiểm tra các yêu cầu của đề.'},
 {id:'dau-cau',is:0,name:'Nhà máy dấu câu',skill:'Đặt dấu câu đúng chỗ, nhận biết câu kể, câu hỏi, câu cảm, câu khiến.'},
 {id:'phan-loai',is:3,name:'Phân loại từ',skill:'Xếp từ vào giỏ: danh từ, động từ, tính từ, đại từ.'},
 {id:'nhieu-nghia',is:3,name:'Một từ, nhiều nghĩa',skill:'Phân biệt nghĩa gốc, nghĩa chuyển của từ đa nghĩa; từ đồng âm (mở rộng).'},
 {id:'cap-tu',is:3,name:'Cặp từ đối đầu',skill:'Tìm từ đồng nghĩa, trái nghĩa và chọn từ đúng sắc thái.'},
 {id:'chinh-ta',is:3,name:'Thợ săn chính tả',skill:'Bắt lỗi l/n, s/x, tr/ch, dấu hỏi/ngã và viết hoa.'},
 {id:'doc-hieu',is:4,name:'Đọc hiểu nhanh',skill:'Đọc đoạn văn, đoạn thơ ngắn và trả lời câu hỏi như trong đề thi.'}
];
const MIXED=(()=>{const by=ISLANDS.map((_,k)=>GAMES.filter(g=>g.is===k)),out=[];for(let r=0;out.length<GAMES.length;r++)by.forEach(a=>{if(a[r])out.push(a[r])});return out})();
/* Số câu mỗi lượt chơi */
const PER={'cay-cau':3,'tau-chu':4,'tham-tu':5,'noi-doi':3,'xep-doan':3,'phan-loai':4,'chinh-ta':6,'dau-cau':5,'doc-hieu':2};
const QUIZ_N=6;

const $app=document.getElementById('app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const lc=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
const noComma=s=>s.replace(/[,.]$/,'');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=(a,n)=>shuffle(a).slice(0,n);
// câu (số thứ tự trong ngân hàng) em đã trả lời đúng ngay lần đầu ở trò đang chơi
const solvedSet=()=>new Set(G&&G.g&&isStudent()?((((xu&&xu.stats)||{}).solved||{})[G.g.id]||[]):[]);
// bốc n câu, ưu tiên câu chưa làm đúng; hết câu mới mới lấy lại câu cũ
function pickNew(a,n,kf){const S=solvedSet(),sh=shuffle(a);return [...sh.filter(x=>!S.has(kf(x))),...sh.filter(x=>S.has(kf(x)))].slice(0,n)}
const bank=id=>((window.BANK||{})[id]||[]);
const size=id=>baseId(id)==='noi-doi'?bank(id).reduce((a,s)=>a+s.split(';').length,0):baseId(id)==='nhieu-nghia'?bank(id).reduce((a,s)=>a+(s.startsWith('P|')?1:s.split('|').length-2),0):bank(id).length;
const unit=id=>(id=baseId(id))==='noi-doi'?'cặp':id==='thi-thu'?'đề':id==='xep-doan'?'đoạn':id==='doc-hieu'?'bài đọc':id==='cap-tu'?'lượt':'câu';
const rows=id=>bank(id).map(s=>s.split('|'));
// mức Nâng cao: ngân hàng BANK['<trò>-nc'], dùng chung cách chơi với trò gốc
let LV='';const qbank=id=>bank(id+LV),qrows=id=>qbank(id).map(s=>s.split('|'));
const baseId=id=>String(id).replace(/-nc$/,'');
const NCG=()=>GAMES.filter(g=>bank(g.id+'-nc').length).map(g=>({...g,id:g.id+'-nc',base:g.id,nc:true}));
const STAR='<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>';
function stars(n,big){let h=`<span class="stars${big?' big':''}" role="img" aria-label="${n} trên 3 sao">`;for(let i=0;i<3;i++)h+=`<svg viewBox="0 0 24 24" class="${i<n?'on':''}" aria-hidden="true">${STAR}</svg>`;return h+'</span>'}
const starsFrom=(c,n)=>c===n?3:c>=Math.ceil(n*.75)?2:c>=1?1:0;

/* ---------- Tài khoản và lưu sao (dùng chung tài khoản với app tiếng Anh) ---------- */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let me=null;   /* {role:'student'|'teacher'|'parent'|'admin', ...}; null = chơi thử, không đăng nhập */
let net='';    /* 'ok' có máy chủ, 'off' không kết nối được */
let best=LS.get('dcv-best-guest',{})||{};
let essays=[];
const COIN='<svg class="coin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/></svg>';
const FLAME='<svg class="flame" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 3.4 4.5 5.2 4.5 10a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2.2-4.4-.1 1.6.6 2.7 1.7 3.1C11.2 9 10.9 5.6 12 2.5z"/></svg>';
const XU={first:10,second:5,later:0,wrong:-2,s5:50,s10:100,star:10,thiSubmit:20,thiFull:30};
let xu=LS.get('dcv-xu-guest',{total:0,peak:0})||{total:0,peak:0};
const isStudent=()=>!!me&&me.role==='student';
const isStaff=()=>!!me&&['teacher','admin','parent'].includes(me.role);
const ROLE_VI={student:'Học sinh',teacher:'Thầy cô',parent:'Phụ huynh',admin:'Admin'};
async function call(a,body,q){
  const r=await fetch('api/app?a='+a+(q||''),{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,credentials:'same-origin'});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error(d.error||'Không kết nối được máy chủ.');e.status=r.status;throw e}
  return d;
}
async function boot(){
  try{const m=await call('me');me=m.role?m:null;net='ok'}catch(e){me=null;net='off'}
  if(isStudent())await loadMine();else best=me?{}:(LS.get('dcv-best-guest',{})||{});
  renderTotal();route();
}
async function loadMine(){
  best=LS.get('dcv-best-'+me.code,{})||{};xu={total:0,peak:0,gifts:[],req:[]};
  try{const d=await call('progress');for(const k in d.best)if(!(best[k]>=d.best[k]))best[k]=d.best[k];essays=d.essays||[];xu=d.xu||xu;LS.set('dcv-best-'+me.code,best)}catch(e){}
}
async function saveRound(id,s,essay){
  const delta=G?G.xu:0;if(G)G.xu=0;
  if(isStaff())return {bonus:[],total:null};   /* thầy cô, phụ huynh chơi thử: không lưu */
  if(!(best[id]>=s))best[id]=s;LS.set(isStudent()?'dcv-best-'+me.code:'dcv-best-guest',best);
  if(isStudent()){
    const before=new Set(badgeList(xu,essays).filter(b=>b.ok).map(b=>b.id));
    const solved=solvedKeys(),perfect=!!(G&&G.seen&&G.seen.size&&!G.anyDirty&&baseId(id)!=='thi-thu');
    try{const d=await call('save',{game:id,stars:s,essay,xu:delta,solved,maxStreak:G?G.maxStreak||0:0,perfect});essays=d.essays||essays;xu=d.xu||xu;renderTotal();if(G&&baseId(G.g.id)==='thi-thu')renderEssays();
      // thưởng xu cho huy hiệu mới mở (và huy hiệu mở từ trước khi có thưởng), mỗi huy hiệu một lần
      const now=badgeList(xu,essays),fresh=new Set(now.filter(b=>b.ok&&!before.has(b.id)).map(b=>b.id)),bonus=[...(d.bonus||[])];
      const unpaid=now.filter(b=>b.ok&&!(xu.paid||[]).includes(b.id));
      if(unpaid.length){try{const c=await call('badge.claim',{ids:unpaid.map(b=>b.id)});xu=c.xu||xu;renderTotal();
        (c.got||[]).forEach(([bid,n])=>{const b=unpaid.find(z=>z.id===bid),lab=(fresh.has(bid)?'Huy hiệu mới: ':'Thưởng huy hiệu: ')+(b?b.name:bid);bonus.push([lab,n]);toast(n,lab,'badge')})}catch(e){}}
      return {bonus,total:xu.total,badges:[]}}
    catch(e){renderTotal();return {bonus:[],total:null,err:e.message}}
  }
  xu.total=Math.max(0,(xu.total||0)+delta);xu.peak=Math.max(xu.peak||0,xu.total);LS.set('dcv-xu-guest',{total:xu.total,peak:xu.peak});renderTotal();
  return {bonus:[],total:xu.total};
}
async function logout(){try{await call('logout',{})}catch(e){}me=null;essays=[];DASH=null;best=LS.get('dcv-best-guest',{})||{};xu=LS.get('dcv-xu-guest',{total:0,peak:0})||{total:0,peak:0};renderTotal();if(location.hash)location.hash='';else renderMap()}
function renderTotal(){
  const t=GAMES.reduce((a,g)=>a+(best[g.id]||0),0);
  document.getElementById('total').innerHTML=(me?`<span class="who">${esc(isStudent()?me.name+' · '+me.code:me.name)}</span>`:'')+
    (isStaff()?`<a class="who-link" href="#theo-doi">${me.role==='parent'?'Báo cáo của con':'Bảng theo dõi'}</a>`:`<svg viewBox="0 0 24 24" aria-hidden="true">${STAR}</svg>${t}/${GAMES.length*3}<a class="xu-link" href="#qua" title="Kệ quà">${COIN}<b>${Math.max(0,(xu.total||0)+((G&&G.xu)||0))}</b> xu</a>`);
}

let G=null;

/* ---------- Bản đồ ---------- */
/* Mục tiêu tiếp theo: món quà gần nhất chưa đủ xu và huy hiệu sắp đạt nhất */
function goalsHtml(L){
  const tot=xu.total||0,gifts=xu.gifts||[],g=gifts.find(x=>tot<x.m);
  const UNIT={'Bộ câu hỏi':'câu','Đảo':'trò','Chuỗi đúng':'câu liền','Hoàn hảo':'lượt','Chăm chỉ':'ngày','Viết văn':'bài','Tối thượng':'Chúa đảo'};
  const b=L.filter(x=>!x.ok).sort((a,c)=>(c.have/c.need-a.have/a.need)||((a.need-a.have)-(c.need-c.have)))[0];
  const giftRow=g?`<div class="gl"><span>Quà tiếp theo: <b>${esc(g.name)}</b> · còn ${vn(g.m-tot)} xu</span><div class="gbar"><i class="gold" style="width:${Math.min(100,Math.round(tot/g.m*100))}%"></i></div></div>`
    :gifts.length?'<div class="gl"><span>Em đã đủ xu cho mọi món quà. Vào Kệ quà để đổi nhé!</span></div>':'';
  const badgeRow=b?`<div class="gl"><span>Huy hiệu gần nhất: <b>${esc(b.name)}</b> · còn ${b.need-b.have} ${UNIT[b.grp]||''}</span><div class="gbar"><i style="width:${Math.round(b.have/b.need*100)}%"></i></div></div>`
    :'<div class="gl"><span>Em đã có đủ 80 huy hiệu. Tuyệt vời!</span></div>';
  return `<div class="goals">${giftRow}${badgeRow}</div>`;
}
function rulesHtml(cls){
  const R=[['up','+10','Đúng ngay lần đầu'],['up','+5','Đúng ở lần thử 2'],['dn','−2','Mỗi lần sai'],['gr','0','Câu đã làm đúng rồi'],['fl','+50','Đúng liền 5 câu'],['fl','+100','Đúng liền 10 câu'],['up','+10','Mỗi sao mới của trò'],['up','+15','Chơi mỗi ngày']];
  return `<div class="rules${cls?' '+cls:''}"><p class="rt">${COIN}Cách kiếm xu đổi quà</p><div class="rg">${R.map(([c,n,l])=>`<div class="rr ${c}"><b>${n}</b><span>${l}</span></div>`).join('')}</div><div class="rmul"><p>Hệ số xu theo đảo (nhân với số ở trên)</p><span class="isl-tag c4">Viết đoạn ×2</span><span class="isl-tag c0">Mở rộng câu ×1</span><span class="isl-tag c1">Câu ghép, Tu từ, Từ ngữ ×½</span></div><p class="rgi">Mức Nâng cao: xu thưởng gấp đôi, sai trừ 4 xu. Đủ xu thì đổi quà ngay hoặc để dành. Đổi quà sẽ trừ xu.</p></div>`;
}
function acct(){
  if(isStudent()){const L=badgeList(xu,essays);
    return `<div class="acct hello"><div class="top2"><div><p class="hi">Xin chào <b>${esc(me.name)}</b></p><p class="sub">Sao, xu và huy hiệu của em được lưu ở đây.</p>
      <div class="row"><a class="pill main" href="#qua">${COIN}Kệ quà · ${vn(xu.total)} xu</a><a class="pill" href="#huy-hieu">${MEDAL}Huy hiệu · ${L.filter(b=>b.ok).length}/${L.length}</a></div>${goalsHtml(L)}</div>${rulesHtml()}</div>
      <div class="foot"><span class="fine">Mã của em: ${esc(me.code)}</span><button class="out" data-act="logout"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg>Đăng xuất</button></div></div>`}
  if(isStaff())return `<div class="acct"><span>Đang đăng nhập: <b>${esc(me.name)}</b> · ${ROLE_VI[me.role]}.</span><span class="fine">Chơi thử ở đây không lưu sao.</span><a class="primary sm" href="#theo-doi">${me.role==='parent'?'Xem báo cáo của con':'Bảng theo dõi'}</a><button class="ghost sm" data-act="logout">Đăng xuất</button></div>`;
  return `<div class="doors">
    <form class="acct door" data-form="student"><b>Em là học sinh</b><span class="fine">Nhập mã thầy cô đã cho, đúng mã em dùng ở app tiếng Anh.</span>
      <div class="row"><input id="codein" maxlength="20" placeholder="AN0307" autocomplete="off" aria-label="Mã học sinh"><button class="primary" type="submit">Vào chơi</button></div><span class="fine err" id="err-s"></span></form>
    <form class="acct door" data-form="staff"><b>Thầy cô · Bố mẹ · Admin</b><span class="fine">Đăng nhập bằng tài khoản của app tiếng Anh.</span>
      <div class="row"><input id="login" class="plain-in" placeholder="Tên đăng nhập" autocomplete="username" aria-label="Tên đăng nhập"><input id="pw" class="plain-in" type="password" placeholder="Mật khẩu" autocomplete="current-password" aria-label="Mật khẩu"><button class="primary" type="submit">Đăng nhập</button></div><span class="fine err" id="err-t"></span></form>
  </div><p class="fine guest">${net==='off'?'Chưa kết nối được máy chủ. ':''}Chưa đăng nhập vẫn chơi thử được, nhưng sao và xu chỉ lưu trên máy này và chưa đổi được quà.</p>`;
}
// sao dạng chữ: sao đã đạt tô vàng, sao chưa đạt mờ
const starTxt=n=>`<span class="sy">${'★'.repeat(n||0)}</span><span class="se">${'☆'.repeat(3-(n||0))}</span>`;
function renderMap(){
  G=null;LV='';
  const NC=NCG(),total=[...GAMES,...NC].reduce((a,g)=>a+size(g.id),0),sv=((xu&&xu.stats)||{}).solved||{};
  const pct=id=>{const n=bank(id).length;return n&&isStudent()&&baseId(id)!=='thi-thu'?' · xong '+Math.round(Math.min(1,(sv[id]||[]).length/n)*100)+'%':''},st3=starTxt;
  const card=g=>{const nc=NC.find(x=>x.base===g.id);if(!nc)return `<a class="island tinted c${g.is}" href="#${g.id}"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><p>${g.skill}</p><span class="count">${size(g.id)} ${unit(g.id)}</span>${stars(best[g.id]||0)}</a>`;
    return `<div class="island tinted c${g.is}"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><p>${g.skill}</p><div class="lvs"><a class="lv b" href="#${g.id}">Cơ bản · ${size(g.id)} ${unit(g.id)}<small>${st3(best[g.id])}${pct(g.id)}</small></a><a class="lv n" href="#${nc.id}">Nâng cao · ${size(nc.id)} ${unit(g.id)}<small>${st3(best[nc.id])}${pct(nc.id)}</small></a></div></div>`};
  $app.innerHTML=`<section class="hero"><h1>Chọn một trò chơi để luyện câu văn</h1>
  <p>Mỗi màu là một hòn đảo kỹ năng. Bé chơi trò nào trước cũng được: làm câu dài hơn, hay hơn, rồi viết thành đoạn văn hoàn chỉnh.</p></section>
  ${acct()}
  <div class="isl-legend">${ISLANDS.map((isl,k)=>`<span class="isl-tag c${k}"><span class="isle-dot" aria-hidden="true"></span>${isl.name}</span>`).join('')}</div>
  <div class="islands">${MIXED.map(card).join('')}</div>
  <p class="note">Ngân hàng có ${total} câu hỏi. Mỗi lượt chơi bốc ngẫu nhiên vài câu, nên mỗi lần chơi sẽ khác nhau.</p>`;
}
const streakHtml=()=>G&&G.streak>=2?`${FLAME}Chuỗi ${G.streak}`:'';
function bar(g,prog){return `<div class="bar"><a class="back" href="#">← Bản đồ</a><div class="gtitle"><span class="isl-tag c${g.is}">${ISLANDS[g.is].name}</span>${g.name}${g.nc?'<span class="nc-tag">Nâng cao</span>':''}</div><span class="streak" id="streak" aria-live="polite">${streakHtml()}</span>${prog?`<div class="prog">${prog}</div>`:''}</div>`}
function msgHtml(m){if(!m)return '';const t={ok:'Đúng rồi!',bad:'Chưa đúng.',weak:'Gần đúng.',info:'Gợi ý:'}[m.k];return `<div class="msg ${m.k}" role="status"><b>${t}</b><span>${m.t}</span></div>`}
const nextBtn=(last,a,b)=>`<div class="actions"><button class="primary" data-act="next">${last?'Xem kết quả':a}</button></div>`;

/* ---------- Khung chung ---------- */
function startGame(g){
  G={g,i:0,correct:0,total:0,msg:null,shake:null,xu:0,xuLines:[],streak:0,since:0};
  LV=g.nc?'-nc':'';
  if(!qbank(g.base||g.id).length){$app.innerHTML=bar(g)+'<div class="board"><p>Chưa tải được câu hỏi. Hãy tải lại trang.</p></div>';return}
  BUILD[g.base||g.id]();render();
}
function render(){if(!G)return renderMap();(G.view||renderQuiz)()}
function rowKey(){return G.qs?(G.qs[G.i]||{}).key:(G.rowKeys||[])[G.i]}
function markDirty(){const k=rowKey();if(k!=null)(G.dirty=G.dirty||new Set()).add(k);G.anyDirty=true}
function markRow(){const k=rowKey();if(k!=null)(G.seen=G.seen||new Set()).add(k)}
function solvedKeys(){return G?[...(G.seen||[])].filter(k=>!(G.dirty||new Set()).has(k)):[]}
function pickK(arr,n){const p=pickNew(arr.map((r,ix)=>[r,ix]),n,x=>x[1]);G.rowKeys=p.map(x=>x[1]);return p.map(x=>x[0])}
function next(){
  markRow();
  if(G.onNext)G.onNext();else{G.total++;G.i++;resetQuiz()}
  render();window.scrollTo(0,0);
}
function toast(n,label,cls){
  let box=document.getElementById('toasts');if(!box){box=document.createElement('div');box.id='toasts';box.setAttribute('aria-live','polite');document.body.appendChild(box)}
  while(box.children.length>=2)box.firstChild.remove();
  const el=document.createElement('div');el.className='toast '+(cls||(n>0?'up':n<0?'down':'zero'));el.textContent=cls==='badge'?label+' · +'+n+' xu':(n>0?'+'+n+' xu · ':n<0?n+' xu · ':'')+label;box.appendChild(el);setTimeout(()=>el.remove(),2300);
}
// hệ số xu theo đảo (phương án A, 25/11/2026): Mở rộng câu ×1; Câu ghép, Tu từ, Từ ngữ ×½; Viết đoạn ×2
const ISL_MUL=[1,0.5,0.5,0.5,2];
const gameIsl=id=>{const g=GAMES.find(x=>x.id===String(id).replace(/-nc$/,''));return g?g.is:0};
function xuAdd(n,label,quiet){if(!G||isStaff())return;if(G.g&&G.g.nc)n*=2;if(n>0&&G.g)n=Math.floor(n*(ISL_MUL[G.g.is]??1));  /* hệ số xu theo đảo (chỉ áp cho xu cộng) */  /* mức Nâng cao: xu thưởng và xu trừ đều gấp đôi */G.xu+=n;G.xuLines.push([label,n]);if(!quiet)toast(n,label);renderTotal()}
function xuJudge(prev){
  if(!G||isStaff()||G.ended)return;const m=G.msg;if(!m||m===prev)return;
  // đơn vị tính xu: mỗi câu hỏi; trò nhiều bước (một câu có nhiều bước) chỉ tính xu một lần, ở bước đúng đầu tiên
  const u=G.qs?'q'+G.i:rowKey(),paid=(G.paidU=G.paidU||new Set());
  if(m.k==='ok'){const tries=G.since;G.since=0;
    if(u!=null&&paid.has(u)){if(tries>0)G.streak=0}
    else{if(u!=null)paid.add(u);
      const k=rowKey(),old=k!=null&&solvedSet().has(k);
      if(old){if(tries===0&&!(G.oldNoted=G.oldNoted||new Set()).has(k)){G.oldNoted.add(k);toast(0,'Câu này em đã làm đúng rồi · không cộng xu')}if(tries>0)G.streak=0}
      else if(tries===0){xuAdd(XU.first,'Đúng ngay lần đầu');G.streak++;G.maxStreak=Math.max(G.maxStreak||0,G.streak);if(G.streak%10===0)xuAdd(XU.s10,`Chuỗi ${G.streak} câu đúng liên tiếp!`);else if(G.streak%5===0)xuAdd(XU.s5,`Chuỗi ${G.streak} câu đúng liên tiếp!`)}
      else{if(tries===1)xuAdd(XU.second,'Đúng ở lần thử thứ hai');else toast(0,'Đúng sau nhiều lần thử · không cộng xu');G.streak=0}}}
  else if(m.k==='bad'||m.k==='weak'){G.since++;markDirty();const w=m.k==='weak'?'Gần đúng':'Trả lời sai';xuAdd(XU.wrong,G.streak>=2?w+', mất chuỗi':w);G.streak=0}
  const el=document.getElementById('streak');if(el)el.innerHTML=streakHtml();
}
function groupLines(L){const m=new Map();L.forEach(([l,n])=>{const k=l+'|'+n,o=m.get(k)||{l,n,c:0};o.c++;m.set(k,o)});return [...m.values()]}
function xuSumHtml(lines,delta,r){
  const rows=lines.map(o=>`<li><span>${esc(o.l)}${o.c>1?` × ${o.c}`:''}</span><b class="${o.n<0?'neg':''}">${o.n>0?'+':''}${o.n*o.c}</b></li>`).join('');
  const bon=r?(r.bonus||[]).map(([l,n])=>`<li class="bonus"><span>${esc(l)}</span><b>+${n}</b></li>`).join(''):'';
  const sum=delta+(r?(r.bonus||[]).reduce((a,b)=>a+b[1],0):0);
  return `<h3>Xu của lượt này</h3><ul>${rows||'<li><span>Chưa có xu nào</span><b>0</b></li>'}${bon}</ul><p class="xu-total">${sum>=0?'+':''}${sum} xu${r&&r.total!=null?` · Tổng: ${r.total} xu`:r&&r.err?' · Chưa lưu được, kiểm tra mạng.':r?'':' · Đang lưu…'}</p>${r&&r.badges&&r.badges.length?`<p class="newb">Huy hiệu mới: ${r.badges.map(esc).join(', ')}</p>`:''}${isStudent()?'<a class="ghost sm" href="#qua">Xem kệ quà</a> <a class="ghost sm" href="#huy-hieu">Xem huy hiệu</a>':me?'':'<p class="fine">Nhập mã học sinh ở trang chủ để được đổi quà.</p>'}`;
}
function renderEnd(){
  if(G.endHtml){$app.innerHTML=G.endHtml;return}
  const st=starsFrom(G.correct,G.total);
  // xu sao: chỉ thưởng phần sao vượt kỷ lục cũ của trò này (chơi lại để đạt lại số sao cũ thì không có xu)
  const gain=Math.max(0,st-(best[G.g.id]||0));
  if(gain&&!isStaff())xuAdd(gain*XU.star,`Thêm ${gain} sao mới (kỷ lục ${st} sao)`,true);
  G.ended=true;const lines=groupLines(G.xuLines),delta=G.xu,gid=G.g.id;
  const lst=G.g.nc?NCG():GAMES,idx=lst.findIndex(x=>x.id===G.g.id),nx=lst[idx+1];
  $app.innerHTML=bar(G.g)+`<div class="board end">
    <div class="stamp"><span><span class="big">${st}</span>sao</span></div>${stars(st,true)}
    <h2>Hoàn thành “${G.g.name}”!</h2>
    <p>Bé làm đúng ngay lần đầu ${G.correct}/${G.total} lần.${st<3?' Chơi lại để lấy đủ 3 sao nhé.':''}</p>
    ${isStaff()?'':`<div class="xu-sum" id="xusum">${xuSumHtml(lines,delta,null)}</div>`}
    <div class="actions" style="justify-content:center"><button class="ghost" data-act="again">Chơi lượt mới</button>${nx?`<a class="primary" href="#${nx.id}">Chơi tiếp: ${nx.name}</a>`:'<a class="primary" href="#">Về bản đồ</a>'}</div></div>`;
  const g0=G;saveRound(gid,st).then(r=>{const el=document.getElementById('xusum');if(el)el.innerHTML=xuSumHtml(lines,delta,r);if(G===g0)G.endHtml=$app.innerHTML});
}

/* Trắc nghiệm dùng chung */
const opt=(label,ok,why)=>({label,ok,why});
const pt=o=>`<span class="pt ${o.ok===true?'good':o.ok==='weak'?'weak':'bad'}">${o.label}</span>`;
const BLANK='<span class="blank">?</span>';
function resetQuiz(){G.sel=null;G.tried=[];G.done=false;G.msg=null}
function quiz(id,map){G.qs=pickNew(qrows(id).map((r,ix)=>[r,ix]),QUIZ_N,x=>x[1]).map(([r,ix])=>Object.assign(map(r),{key:ix}));resetQuiz()}
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
  G.rounds=pickK(qrows('cay-cau'),PER['cay-cau']).map(([core,t,p,m,r])=>{
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
    if(o[1]===s){const had=G.pick[s]!=null;G.pick[s]=j;if(!(s in G.res))G.res[s]=true;G.msg=had?{k:'info',t:`Đã đổi sang “${label}”, câu vẫn đúng.`}:{k:'ok',t:`“${label}” trả lời câu hỏi ${SL[s].q}`}}
    else{G.wrong[s]=(G.wrong[s]||[]).concat(j);G.res[s]=false;G.shake=s+j;G.msg={k:'bad',t:`“${label}” trả lời câu hỏi ${SL[o[1]].q} Hãy tìm cụm từ trả lời câu hỏi ${SL[s].q}`}}
    render();
  };
  G.onNext=()=>{G.correct+=Object.values(G.res).filter(Boolean).length;G.total+=4;G.i++;reset()};
};

/* ---------- Tàu chữ ---------- */
const KINDS={time:{n:'Thời gian',c:'time',q:'Khi nào?'},place:{n:'Nơi chốn',c:'place',q:'Ở đâu?'},cause:{n:'Nguyên nhân',c:'reason',q:'Vì sao? Nhờ đâu?'},purpose:{n:'Mục đích',c:'purpose',q:'Để làm gì?'},means:{n:'Phương tiện',c:'manner',q:'Bằng gì? Với cái gì?'}};
const KLET={T:'time',P:'place',N:'cause',D:'purpose',C:'means',_:null};
BUILD['tau-chu']=()=>{
  G.trains=pickK(qbank('tau-chu'),PER['tau-chu']).map(s=>s.split('|').map(x=>[x.slice(2),KLET[x[0]]]));
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
  G.sents=pickK(qbank('tham-tu'),PER['tham-tu']).map(s=>s.split('|').map(x=>[x.slice(2),RLET[x[0]]]));
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
  return {intro:`<div class="pair-src"><span>Câu 1: ${s1}</span><span>Câu 2: ${s2}</span></div><p class="ask">Chọn cặp kết từ để nối hai câu thành một câu ghép.</p>`,
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
  G.sets=pickK(qbank('noi-doi'),PER['noi-doi']).map(s=>s.split(';').map(p=>p.split('=')));
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
  G.paras=pickK(qrows('xep-doan'),PER['xep-doan']).map(([topic,...s])=>({topic,s}));
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
    if(j===want){G.placed.push(j);G.total++;if(!G.miss)G.correct++;G.miss=false;G.msg=G.placed.length===X.s.length?{k:'ok',t:'Đoạn văn đã mạch lạc. Bé đọc to cả đoạn nhé.'}:{k:'ok',t:'Câu này đúng vị trí. Câu tiếp theo là câu nào?'}}
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
  gh:{n:'Câu ghép có cặp kết từ',h:'Thử dùng: “Tuy … nhưng …”, “Vì … nên …”, “Không những … mà còn …”'},
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
  const all=qrows('thi-thu');
  G.newDe=()=>{const sub=new Set((essays||[]).map(e=>e.de)),fresh=all.filter(r=>!sub.has(r[0])),pool=fresh.length?fresh:all;const [de,min,max,needs]=pool[Math.floor(Math.random()*pool.length)];G.de={de,min:+min,max:+max,needs:needs.split(',').filter(k=>NEED[k])};G.text=''};
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
          <div class="legend" style="margin-top:8px"><mark class="m-tn">trạng ngữ</mark><mark class="m-gh">kết từ</mark><mark class="m-ss">so sánh</mark><mark class="m-lk">từ nối</mark></div></div>
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
  if(!isStaff()){
    // mỗi đề: +20 ở lần nộp đầu; +10 cho mỗi sao vượt kỷ lục cũ của đề; +30 lần đầu bài đạt đủ yêu cầu (3 sao)
    G.subs=G.subs||{};const k=G.de.de,old=(essays||[]).filter(e=>e.de===k),first=!old.length&&!(k in G.subs);
    const prev=Math.max(0,G.subs[k]||0,...old.map(e=>e.stars||0)),gain=Math.max(0,st-prev);G.subs[k]=Math.max(prev,st);
    if(first)xuAdd(XU.thiSubmit,'Nộp bài thi thử',true);
    if(gain)xuAdd(gain*XU.star,first?`Đạt ${st} sao`:`Bài tăng thêm ${gain} sao so với lần trước`,true);
    if(st===3&&prev<3)xuAdd(XU.thiFull,'Bài đạt đủ yêu cầu của đề',true);
    if(!first&&!gain)toast(0,'Bài chưa tăng sao so với lần trước · không cộng xu')}
  const lines=groupLines(G.xuLines),delta=G.xu;G.xuLines=[];
  document.getElementById('result').innerHTML=`<div class="msg ${st===3?'ok':'weak'}"><b>${stars(st)}</b><span>${st===3?'Bài làm đạt đủ yêu cầu của đề. Giỏi lắm!':`Bài làm đạt ${met}/${n} yêu cầu. Xem bảng kiểm tra để sửa và nộp lại nhé.`}${isStudent()?' Bài đã được lưu, thầy cô sẽ đọc và nhận xét.':isStaff()?' (Chơi thử: bài không được lưu.)':''}</span></div>${isStaff()?'':`<div class="xu-sum" id="xusum">${xuSumHtml(lines,delta,null)}</div>`}`;
  saveRound(G.g.id,st,isStudent()?{de:G.de.de,text:G.text}:undefined).then(r=>{const el=document.getElementById('xusum');if(el)el.innerHTML=xuSumHtml(lines,delta,r)});
}
function renderEssays(){
  const el=document.getElementById('essays');if(!el)return;
  if(!isStudent()){el.innerHTML='';return}
  el.innerHTML=essays.length?`<div class="panel"><h3>Bài đã nộp (${essays.length})</h3>${essays.map(e=>`<details class="essay"${e.comment?' open':''}><summary>${stars(e.stars||0)} <span>${esc(new Date(e.at).toLocaleDateString('vi-VN'))} · ${esc(e.de)}</span>${e.comment?'<span class="badge soft">có nhận xét</span>':''}</summary><p>${esc(e.text)}</p>${e.comment?`<div class="msg info"><b>${esc(e.commentBy||'Thầy cô')}:</b><span>${esc(e.comment)}</span></div>`:''}</details>`).join('')}</div>`:'';
}

/* ---------- Phân loại từ ---------- */
const WK={n:{n:'Danh từ',c:'place',h:'Danh từ chỉ sự vật: người, con vật, đồ vật, cây cối, hiện tượng, khái niệm.'},v:{n:'Động từ',c:'time',h:'Động từ chỉ hoạt động, trạng thái; thường đi sau “đã, đang, sẽ”.'},t:{n:'Tính từ',c:'manner',h:'Tính từ chỉ đặc điểm, tính chất như màu sắc, hình dáng, tính nết; thường đi sau “rất”.'},r:{n:'Đại từ',c:'purpose',h:'Đại từ dùng để xưng hô (tôi, chúng em, nó, họ), để hỏi (ai, gì, đâu) hoặc để thay thế.'}};
const parseTags=s=>{const out=[];let last=0;s.replace(/\{([^|}]+)\|([nvtr])\}/g,(m,w,k,i)=>{if(i>last)out.push({x:s.slice(last,i)});out.push({w,k});last=i+m.length;return m});if(last<s.length)out.push({x:s.slice(last)});return out};
BUILD['phan-loai']=()=>{
  G.sents=pickK(qbank('phan-loai'),PER['phan-loai']).map(parseTags);G.n=G.sents.length;
  const reset=()=>{G.sel=null;G.placed={};G.miss={};G.msg=null};reset();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const S=G.sents[G.i],tags=S.map((p,j)=>p.w?j:-1).filter(j=>j>=0),done=tags.every(j=>G.placed[j]);
    const sent=S.map((p,j)=>p.w?(G.placed[j]?`<span class="pt ${WK[p.k].c}">${p.w}<sup>${WK[p.k].n}</sup></span>`:`<button class="chunk${G.sel===j?' sel':''}" data-act="x" data-w="${j}">${p.w}</button>`):esc(p.x)).join('');
    const baskets=Object.entries(WK).map(([k,v])=>`<button class="basket ${v.c}${G.shake===k?' shake':''}" data-act="x" data-b="${k}"><b>${v.n}</b><span>${tags.filter(j=>G.placed[j]&&S[j].k===k).map(j=>S[j].w).join(', ')||'&nbsp;'}</span></button>`).join('');
    $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.n}`)+`<div class="board"><p class="ask">${done?'Bé đã xếp đúng hết các từ.':'Chạm một từ có viền trong câu, rồi chạm vào giỏ đúng loại từ.'}</p>
      <div class="sentence">${sent}</div><div class="baskets">${baskets}</div>${msgHtml(G.msg)}${done?nextBtn(G.i+1>=G.n,'Câu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{
    const S=G.sents[G.i];
    if(d.w!=null){G.sel=+d.w;G.msg=null;return render()}
    if(G.sel==null){G.msg={k:'info',t:'Chạm vào một từ có viền trong câu trước nhé.'};return render()}
    const j=G.sel,p=S[j],k=d.b;
    if(p.k===k){G.placed[j]=true;G.total++;if(!G.miss[j])G.correct++;G.sel=null;G.msg={k:'ok',t:`“${p.w}” là ${WK[k].n.toLowerCase()}. ${WK[k].h}`}}
    else{G.miss[j]=true;G.shake=k;G.msg={k:'bad',t:`“${p.w}” không phải ${WK[k].n.toLowerCase()}. Nhớ lại: ${WK[k].h}`}}
    render();
  };
  G.onNext=()=>{G.i++;reset()};
};

/* ---------- Một từ, nhiều nghĩa ---------- */
const hl=s=>s.replace(/\*([^*]+)\*/g,'<span class="nhu">$1</span>');
BUILD['nhieu-nghia']=()=>{
  const all=qbank('nhieu-nghia'),sets=all.filter(s=>!s.startsWith('P|')),pairs=all.filter(s=>s.startsWith('P|')),qs=[];
  pickNew(sets,2,s=>all.indexOf(s)).forEach(s=>{const [w,gloss,...ss]=s.split('|');shuffle(ss).forEach(x=>{const [sent,a]=x.split('=');
    qs.push({intro:`<p class="ask">Từ <b>“${w}”</b> trong câu dưới đây mang nghĩa gốc hay nghĩa chuyển?</p>`,
      options:[opt('Nghĩa gốc',a==='g',a==='g'?`Đây là nghĩa gốc của “${w}”: ${gloss}.`:`Nghĩa gốc của “${w}” là ${gloss}. Ở câu này, từ đã chuyển sang chỉ sự vật khác có nét giống.`),
               opt('Nghĩa chuyển',a==='c',a==='c'?`Đây là nghĩa chuyển: từ nghĩa gốc (${gloss}) chuyển sang chỉ sự vật khác có nét giống.`:`Ở câu này, “${w}” dùng đúng nghĩa gốc: ${gloss}.`)],
      view:()=>hl(sent),key:all.indexOf(s)})})});
  pickNew(pairs,2,s=>all.indexOf(s)).forEach(s=>{const [,two,a,why]=s.split('|');
    qs.push({intro:'<p class="ask">Hai từ được tô màu là từ nhiều nghĩa hay từ đồng âm?</p>',
      options:[opt('Từ nhiều nghĩa',a==='nn',a==='nn'?why:'Thử nghĩ: hai nghĩa này có liên quan gì với nhau không?'),opt('Từ đồng âm',a==='da',a==='da'?why:'Hai nghĩa này có nét liên quan với nhau, hãy nghĩ lại.')],
      view:()=>two.split(' / ').map(hl).join('<br>'),key:all.indexOf(s)})});
  G.qs=qs;resetQuiz();
};

/* ---------- Cặp từ đối đầu ---------- */
BUILD['cap-tu']=()=>{
  const all=qrows('cap-tu').map((r,ix)=>Object.assign(r,{ix})),pairs=all.filter(r=>r[0]!=='T'),tones=all.filter(r=>r[0]==='T');
  const pp=pickNew(pairs,4,r=>r.ix),tt=pickNew(tones,2,r=>r.ix);G.rowKeys=[...pp,...tt].map(r=>r.ix);
  G.items=[...pp.map(([w,s,a,d])=>({type:'p',w,s,a,chips:shuffle([s,a,...d.split(',')])})),
    ...tt.map(([,sent,r,why,w1,y1,w2,y2])=>({type:'t',sent,ans:r,chips:shuffle([r,w1,w2]),why:{[r]:why,[w1]:y1,[w2]:y2}}))];
  G.n=G.items.length;const reset=()=>{G.got={};G.bad=[];G.missed=false;G.msg=null};reset();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const it=G.items[G.i];let body,done;
    if(it.type==='p'){done=!!(G.got.s&&G.got.a);
      body=`<div class="sentence center">Từ gốc: <b class="nhu">${it.w}</b></div>
        <div class="slots"><div class="slotbox">Đồng nghĩa: ${G.got.s?`<span class="pt good">${it.s}</span>`:BLANK}</div><div class="slotbox">Trái nghĩa: ${G.got.a?`<span class="pt good">${it.a}</span>`:BLANK}</div></div>`}
    else{done=!!G.got.t;body=`<div class="sentence">${it.sent.replace('___',G.got.t?`<span class="pt good">${it.ans}</span>`:BLANK)}</div>`}
    const chips=it.chips.map((c,j)=>{const used=it.type==='p'?((G.got.s&&c===it.s)||(G.got.a&&c===it.a)):(G.got.t&&c===it.ans);
      return `<button class="opt${used?' on':G.bad.includes(c)?' bad':''}${G.shake===j?' shake':''}" data-act="x" data-j="${j}" ${used||G.bad.includes(c)||done?'disabled':''}>${c}</button>`}).join('');
    $app.innerHTML=bar(G.g,`Lượt ${G.i+1}/${G.n}`)+`<div class="board"><p class="ask">${it.type==='p'?'Tìm một từ đồng nghĩa và một từ trái nghĩa với từ gốc.':'Chọn từ vừa đúng nghĩa, vừa hợp sắc thái để điền vào chỗ trống.'}</p>${body}<div class="opts">${chips}</div>${msgHtml(G.msg)}${done?nextBtn(G.i+1>=G.n,'Lượt tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{
    const it=G.items[G.i],j=+d.j,c=it.chips[j];
    if(it.type==='p'){
      if(c===it.s||c===it.a){const k=c===it.s?'s':'a';G.got[k]=true;G.total++;if(!G.missed)G.correct++;G.missed=false;G.msg={k:'ok',t:`“${c}” ${k==='s'?'đồng nghĩa':'trái nghĩa'} với “${it.w}”.`}}
      else{G.bad.push(c);G.missed=true;G.shake=j;G.msg={k:'bad',t:`“${c}” không đồng nghĩa, cũng không trái nghĩa với “${it.w}”.`}}
    }else{
      if(c===it.ans){G.got.t=true;G.total++;if(!G.missed)G.correct++;G.msg={k:'ok',t:it.why[c]}}
      else{G.bad.push(c);G.missed=true;G.shake=j;G.msg={k:'bad',t:it.why[c]}}
    }
    render();
  };
  G.onNext=()=>{G.i++;reset()};
};

/* ---------- Thợ săn chính tả ---------- */
BUILD['chinh-ta']=()=>{
  G.items=pickK(qrows('chinh-ta'),PER['chinh-ta']).map(([s,tip,d])=>{
    const m=/\{([^>}]+)>([^}]+)\}/.exec(s),pre=s.slice(0,m.index),post=s.slice(m.index+m[0].length),sp=t=>t.split(/(\s+)/).filter(x=>x).map(x=>({x}));
    return {toks:[...sp(pre),{x:m[1],bad:true},...sp(post)],wrong:m[1],right:m[2],tip,opts:shuffle([m[2],m[1],d])};
  });
  G.n=G.items.length;const reset=()=>{G.ph=0;G.missed=false;G.tried=[];G.msg=null};reset();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const it=G.items[G.i],done=G.ph===2;
    const sent=it.toks.map((t,j)=>/^\s+$/.test(t.x)?t.x:(t.bad&&G.ph>0)?`<span class="pt ${done?'good':'bad'}">${esc(done?it.right:it.wrong)}</span>`
      :G.ph===0?`<button class="chunk word${G.shake===j?' shake':''}${G.tried.includes(j)?' miss':''}" data-act="x" data-j="${j}">${esc(t.x)}</button>`:esc(t.x)).join('');
    const opts=G.ph===1?`<div class="opts">${it.opts.map((o,j)=>`<button class="opt${G.tried.includes('o'+j)?' bad':''}${G.shake==='o'+j?' shake':''}" data-act="x" data-o="${j}" ${G.tried.includes('o'+j)?'disabled':''}>${esc(o)}</button>`).join('')}</div>`:'';
    $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.n}`)+`<div class="board"><p class="ask">${G.ph===0?'Câu có một chữ viết sai chính tả. Chạm vào chữ đó.':G.ph===1?'Chọn cách viết đúng.':'Đã sửa xong.'}</p>
      <div class="sentence">${sent}</div>${opts}${msgHtml(G.msg)}${done?nextBtn(G.i+1>=G.n,'Câu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{
    const it=G.items[G.i];
    if(G.ph===0&&d.j!=null){const j=+d.j,t=it.toks[j];
      if(t.bad){G.ph=1;G.tried=[];G.msg={k:'info',t:`Đúng là chữ “${t.x}” viết sai. Giờ chọn cách viết đúng.`}}
      else{G.missed=true;if(!G.tried.includes(j))G.tried.push(j);G.shake=j;G.msg={k:'bad',t:`Chữ “${t.x.replace(/[.,!?;:]+$/,'')}” viết đúng rồi. Tìm chữ khác nhé.`}}
      return render();
    }
    if(G.ph===1&&d.o!=null){const o=it.opts[+d.o];
      if(o===it.right){G.ph=2;G.total++;if(!G.missed)G.correct++;G.msg={k:'ok',t:`Viết đúng là “${it.right}”. ${it.tip}`}}
      else{G.missed=true;G.tried.push('o'+d.o);G.shake='o'+d.o;G.msg={k:'bad',t:`“${o}” chưa đúng. Gợi ý: ${it.tip}`}}
      render();
    }
  };
  G.onNext=()=>{G.i++;reset()};
};

/* ---------- Nhà máy dấu câu ---------- */
const MARKS=['.',',','?','!',':',';','–','“','”','(',')'];
const MHINT={'.':'Dấu chấm đặt cuối câu kể.',',':'Dấu phẩy ngăn trạng ngữ với chủ ngữ – vị ngữ, ngăn các từ cùng loại, ngăn các vế câu ghép, hoặc đặt sau từ cảm thán.','?':'Dấu chấm hỏi đặt cuối câu hỏi.','!':'Dấu chấm than đặt cuối câu cảm hoặc câu khiến.',':':'Dấu hai chấm báo hiệu phần liệt kê, giải thích hoặc lời nói trực tiếp đứng sau.',';':'Dấu chấm phẩy ngăn các vế câu ghép có cấu tạo giống nhau.','–':'Dấu gạch ngang đánh dấu phần chú thích hoặc nối các tên trong một liên danh.','“':'Dấu ngoặc kép mở đầu lời nói trực tiếp hoặc tên tác phẩm.','”':'Dấu ngoặc kép đóng lại lời nói trực tiếp hoặc tên tác phẩm.','(':'Dấu ngoặc đơn mở đầu phần chú thích.',')':'Dấu ngoặc đơn đóng lại phần chú thích.'};
const KIEU={ke:['Câu kể','Câu kể dùng để kể, tả, giới thiệu; cuối câu thường có dấu chấm.'],hoi:['Câu hỏi','Câu hỏi dùng để hỏi điều chưa biết; cuối câu có dấu chấm hỏi.'],cam:['Câu cảm','Câu cảm bộc lộ cảm xúc, thường có “ôi, chà, trời ơi…”; cuối câu có dấu chấm than.'],khien:['Câu khiến','Câu khiến dùng để yêu cầu, đề nghị, khuyên bảo, thường có “hãy, đừng, nhé, đi, thôi”.']};
BUILD['dau-cau']=()=>{
  G.items=pickK(qrows('dau-cau'),PER['dau-cau']).map(([s,kind])=>{const parts=[];let last=0;s.replace(/\{([^}]+)\}/g,(m,mk,i)=>{parts.push({x:s.slice(last,i)});parts.push({m:mk});last=i+m.length;return m});parts.push({x:s.slice(last)});return {parts,kind}});
  G.n=G.items.length;const reset=()=>{G.k=0;G.missed=false;G.kdone=false;G.tried=[];G.msg=null};reset();
  G.view=()=>{
    if(G.i>=G.n)return renderEnd();
    const it=G.items[G.i],slots=it.parts.filter(p=>p.m),marksDone=G.k>=slots.length,askKind=marksDone&&it.kind!=='-'&&!G.kdone,done=marksDone&&!askKind;
    let si=-1;
    const sent=it.parts.map(p=>{if(!p.m)return esc(p.x);si++;return si<G.k?`<span class="mark ok">${esc(p.m)}</span>`:`<span class="mark${si===G.k?' cur':''}${si===G.k&&G.shake?' shake':''}">${si===G.k?'?':''}</span>`}).join('');
    let ctl='';
    if(!marksDone)ctl=`<div class="opts marks">${MARKS.map(m=>`<button class="opt mk${G.tried.includes(m)?' bad':''}" data-act="x" data-m="${esc(m)}" ${G.tried.includes(m)?'disabled':''} aria-label="Dấu ${esc(m)}">${esc(m)}</button>`).join('')}</div>`;
    else if(askKind)ctl=`<div class="opts">${Object.entries(KIEU).map(([k,v])=>`<button class="opt${G.tried.includes('k'+k)?' bad':''}" data-act="x" data-kind="${k}" ${G.tried.includes('k'+k)?'disabled':''}>${v[0]}</button>`).join('')}</div>`;
    $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.n}`)+`<div class="board"><p class="ask">${!marksDone?`Chọn dấu câu cho ô có dấu hỏi (ô ${G.k+1}/${slots.length}).`:askKind?'Câu này thuộc kiểu câu nào?':'Đã hoàn thành câu này.'}</p>
      <div class="sentence">${sent}</div>${ctl}${msgHtml(G.msg)}${done?nextBtn(G.i+1>=G.n,'Câu tiếp theo'):''}</div>`;
    G.shake=null;
  };
  G.onAct=d=>{
    const it=G.items[G.i],slots=it.parts.filter(p=>p.m);
    if(d.m!=null&&G.k<slots.length){const want=slots[G.k].m;
      if(d.m===want){G.total++;if(!G.missed)G.correct++;G.missed=false;G.tried=[];G.k++;G.msg={k:'ok',t:MHINT[want]}}
      else{G.missed=true;G.tried.push(d.m);G.shake=1;G.msg={k:'bad',t:`Dấu “${d.m}”: ${MHINT[d.m]} Chỗ này cần dấu khác.`}}
      return render();
    }
    if(d.kind){const want=it.kind;
      if(d.kind===want){G.kdone=true;G.total++;if(!G.missed)G.correct++;G.missed=false;G.msg={k:'ok',t:KIEU[want][1]}}
      else{G.missed=true;G.tried.push('k'+d.kind);G.msg={k:'bad',t:`Chưa phải ${KIEU[d.kind][0].toLowerCase()}. ${KIEU[d.kind][1]}`}}
      render();
    }
  };
  G.onNext=()=>{G.i++;reset()};
};

/* ---------- Đọc hiểu nhanh ---------- */
const READ_MISS='Đọc lại đoạn văn và tìm chi tiết liên quan nhé.';
BUILD['doc-hieu']=()=>{
  const qs=[];
  pickNew(qrows('doc-hieu').map((r,ix)=>Object.assign(r,{ix})),PER['doc-hieu'],r=>r.ix).forEach(row=>{const [p,by,qq]=row,qa=qq.split('#');qa.forEach((q,n)=>{const [qt,r,why,w1,w2]=q.split('~');
    qs.push({key:row.ix,intro:`<p class="ask">Đọc kĩ đoạn văn rồi trả lời câu hỏi ${n+1}/${qa.length}.</p>`,col:true,
      options:shuffle([opt(r,true,why),opt(w1,false,READ_MISS),opt(w2,false,READ_MISS)]),
      view:()=>`<div class="poem passage">${esc(p).split('/').join('<br>')}${by?`<div class="by">${esc(by)}</div>`:''}<div class="q">${esc(qt)}</div></div>`})})});
  G.qs=qs;resetQuiz();
};

/* ---------- Bảng theo dõi: thầy cô, Admin, phụ huynh ---------- */
let DASH=null,TAB='hs';
const ENG_APP='https://english-exam-web-roan.vercel.app';
const islPct=b=>ISLANDS.map((_,k)=>{const gs=GAMES.filter(g=>g.is===k);return {k,got:gs.reduce((a,g)=>a+((b||{})[g.id]||0),0),max:gs.length*3}});
// tổng sao gộp Cơ bản + Nâng cao của mỗi đảo (báo cáo học sinh)
const islPctAll=b=>ISLANDS.map((_,k)=>{const ids=GAMES.filter(g=>g.is===k).flatMap(g=>bank(g.id+'-nc').length?[g.id,g.id+'-nc']:[g.id]);return {k,got:ids.reduce((a,id)=>a+((b||{})[id]||0),0),max:ids.length*3}});
const fmtDate=s=>s?new Date(s).toLocaleDateString('vi-VN'):'chưa chơi';
const shortIsl=k=>ISLANDS[k].name.replace('Đảo ','');
async function renderDash(h){
  G=null;
  if(!isStaff()){$app.innerHTML=`<div class="board"><p>Trang này dành cho thầy cô, phụ huynh và Admin. Hãy đăng nhập ở trang chủ.</p><div class="actions"><a class="primary" href="#">Về trang chủ</a></div></div>`;return}
  if(!DASH){$app.innerHTML='<p class="fine">Đang tải bảng theo dõi…</p>';try{DASH=await call('dash')}catch(e){$app.innerHTML=`<div class="board"><p>${esc(e.message)}</p></div>`;return}}
  const S=DASH.students;
  if(h.startsWith('hs-')){const st=S.find(s=>s.code===h.slice(3));if(st)return renderKid(st,{back:me.role!=='parent'||S.length>1,canComment:me.role!=='parent',canGift:true});h='theo-doi'}
  if(me.role==='parent'){if(S.length===1)return renderKid(S[0],{back:false,canComment:false,canGift:true});return listParent(S)}
  const wait=S.reduce((a,s)=>a+s.essays.filter(e=>!e.comment).length,0);
  const pend=S.reduce((a,s)=>a+(s.xu.req||[]).filter(r=>r.status==='pending').length,0);
  const tabs=[['hs','Học sinh'],['bai',`Bài viết chờ nhận xét${wait?` <span class="badge">${wait}</span>`:''}`],['qua',`Đổi quà${pend?` <span class="badge">${pend}</span>`:''}`]].concat(me.role==='admin'?[['ql','Quản lý']]:[]);
  if(TAB==='ql'&&me.role!=='admin')TAB='hs';
  const body=TAB==='hs'?tableStudents(S):TAB==='bai'?essayFeed(S):TAB==='qua'?giftFeed(S):adminPanel(S);
  $app.innerHTML=`<div class="dhead"><h1>Bảng theo dõi</h1><span class="fine">${esc(me.name)} · ${ROLE_VI[me.role]}</span><button class="ghost sm" data-act="d-refresh">Tải lại</button></div>
    <div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button class="tab${TAB===k?' on':''}" role="tab" aria-selected="${TAB===k}" data-act="d-tab" data-k="${k}">${t}</button>`).join('')}</div>${body}`;
}
// tổng câu đã làm đúng (ngay lần đầu) của mức Cơ bản (nc=false) hoặc Nâng cao (nc=true), không tính thi thử
function lvSum(x,nc){const sv=((x&&x.stats)||{}).solved||{},gs=nc?NCG().filter(g=>g.base!=='thi-thu'):GAMEB();
  const n=gs.reduce((a,g)=>a+bank(g.id).length,0),got=gs.reduce((a,g)=>a+Math.min((sv[g.id]||[]).length,bank(g.id).length),0);return {n,got,p:n?Math.round(got/n*100):0}}
function tableStudents(S){
  const act=S.filter(s=>s.active);
  if(!act.length)return `<div class="board"><p>Chưa có học sinh nào. Thêm học sinh trong <a href="${ENG_APP}" target="_blank" rel="noopener">app tiếng Anh</a>, mã sẽ tự có ở đây.</p></div>`;
  return `<div class="tablewrap"><table class="dt"><thead><tr><th>Học sinh</th>${ISLANDS.map((x,k)=>`<th class="c${k}"><span class="isle-dot"></span>${shortIsl(k)}</th>`).join('')}<th>Sao</th><th>Nâng cao</th><th>Xu</th><th>Huy hiệu</th><th>Chơi gần nhất</th></tr></thead><tbody>
    ${act.map(s=>{const p=islPct(s.best),t=p.reduce((a,x)=>a+x.got,0),w=s.essays.filter(e=>!e.comment).length;
      return `<tr class="link" data-act="d-open" data-code="${esc(s.code)}" tabindex="0"><td><b>${esc(s.name)}</b>${w?` <span class="badge" title="Bài chờ nhận xét">${w}</span>`:''}<br><span class="fine">${esc(s.code)}</span></td>${p.map(x=>`<td class="c${x.k}"><div class="pbar"><i style="width:${Math.round(x.got/x.max*100)}%"></i></div><span class="fine">${x.got}/${x.max}</span></td>`).join('')}<td><b>${t}</b>/${GAMES.length*3}</td>${(()=>{const q=lvSum(s.xu,true);return `<td><div class="pbar"><i style="width:${q.p}%"></i></div><span class="fine">${vn(q.got)}/${vn(q.n)} câu · ${q.p}%</span></td>`})()}<td>${vn(s.xu.total)}${(s.xu.req||[]).some(r=>r.status==='pending')?' <span class="badge soft">xin quà</span>':''}</td><td>${badgeList(s.xu,s.essays).filter(b=>b.ok).length}</td><td>${fmtDate(s.updated)}</td></tr>`}).join('')}
    </tbody></table></div><p class="fine">Bấm vào một học sinh để xem từng trò chơi, bài thi thử, xu và quà.</p>`;
}
function essayFeed(S){
  const all=[];S.forEach(s=>s.essays.forEach(e=>all.push({s,e})));
  all.sort((x,y)=>(!!x.e.comment-!!y.e.comment)||(x.e.at<y.e.at?1:-1));
  if(!all.length)return '<div class="board"><p>Chưa có bài thi thử nào được nộp.</p></div>';
  return all.map(({s,e})=>essayCard(s,e,true)).join('');
}
function essayCard(s,e,canComment){
  return `<div class="board ecard"><div class="ehead"><b>${esc(s.name)}</b><span class="fine">${esc(s.code)} · ${fmtDate(e.at)}</span>${stars(e.stars||0)}${e.comment?'':'<span class="badge soft">chờ nhận xét</span>'}</div>
    <p class="de-t">${esc(e.de)}</p><p class="etext">${esc(e.text)}</p>
    ${canComment?`<form class="cform" data-form="comment" data-code="${esc(s.code)}" data-at="${esc(e.at)}"><textarea rows="2" aria-label="Nhận xét" placeholder="Nhận xét cho bài viết, ví dụ: Bài có hình ảnh so sánh đẹp, cần thêm câu kết nêu cảm xúc.">${esc(e.comment)}</textarea>
      <div class="actions"><button class="primary sm" type="submit">${e.comment?'Sửa nhận xét':'Gửi nhận xét'}</button>${me&&me.role==='admin'?`<button class="ghost sm" type="button" data-act="d-delessay" data-code="${esc(s.code)}" data-at="${esc(e.at)}">Xóa bài</button>`:''}<span class="fine saved" role="status"></span></div></form>`
    :(e.comment?`<div class="msg info"><b>${esc(e.commentBy||'Thầy cô')}:</b><span>${esc(e.comment)}</span></div>`:'<p class="fine">Thầy cô chưa nhận xét bài này.</p>')}</div>`;
}
function adminPanel(S){
  return `<div class="board"><p>Thêm, khóa hay xóa học sinh, tài khoản thầy cô và phụ huynh: làm trong <a href="${ENG_APP}" target="_blank" rel="noopener">app tiếng Anh</a>. Thay đổi bên đó có hiệu lực ngay ở đây.</p>
    <div class="tablewrap"><table class="dt"><thead><tr><th>Học sinh</th><th>Link riêng cho phụ huynh</th><th>Dữ liệu trò chơi</th></tr></thead><tbody>
    ${S.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="fine">${esc(s.code)}${s.active?'':' · đang khóa'}</span></td>
      <td>${s.plink?`<button class="ghost sm" data-act="d-copy" data-link="${esc(location.origin+location.pathname+'?p='+s.plink)}">Sao chép link</button>`:'<span class="fine">Chưa có. Tạo link phụ huynh trong app tiếng Anh.</span>'}</td>
      <td><button class="ghost sm" data-act="d-reset" data-code="${esc(s.code)}">Xóa tiến độ</button></td></tr>`).join('')}</tbody></table></div>
    <p class="fine">Link riêng dùng chung mã bí mật với link phụ huynh của app tiếng Anh: tắt hoặc đổi link bên đó thì link ở đây cũng đổi theo.</p></div>`;
}
function listParent(S){
  $app.innerHTML=`<div class="dhead"><h1>Báo cáo của các con</h1><span class="fine">${esc(me.name)} · Phụ huynh</span></div>
    <div class="islands">${S.map(s=>{const t=islPct(s.best).reduce((a,x)=>a+x.got,0);return `<a class="island" href="#hs-${esc(s.code)}"><h3>${esc(s.name)}</h3><p>Mã ${esc(s.code)} · ${t}/${GAMES.length*3} sao · chơi gần nhất: ${fmtDate(s.updated)}</p></a>`}).join('')||'<p>Chưa có con nào được gắn với tài khoản này.</p>'}</div>`;
}
function renderKid(st,o){
  G=null;
  const p=islPct(st.best),t=p.reduce((a,x)=>a+x.got,0),weak=GAMES.filter(g=>(st.best[g.id]||0)<2).map(g=>g.name);
  $app.innerHTML=`${o.back?'<div class="bar"><a class="back" href="#theo-doi">← Bảng theo dõi</a></div>':''}${o.top||''}
    <div class="board"><div class="dhead"><h1>Báo cáo của ${esc(st.name)}</h1><span class="fine">Mã ${esc(st.code)} · chơi gần nhất: ${fmtDate(st.updated)} · <span class="sy">★</span> ${islPctAll(st.best).reduce((a,x)=>a+x.got,0)}/${islPctAll(st.best).reduce((a,x)=>a+x.max,0)} sao</span></div>
      <p class="lvsum">Câu đã làm đúng: <b>Cơ bản ${(q=>`${vn(q.got)}/${vn(q.n)} (${q.p}%)`)(lvSum(st.xu,false))}</b> · <b>Nâng cao ${(q=>`${vn(q.got)}/${vn(q.n)} (${q.p}%)`)(lvSum(st.xu,true))}</b></p>
      <div class="isl-sum">${islPctAll(st.best).map(x=>`<span class="isl-tag c${x.k}"><span class="isle-dot" aria-hidden="true"></span>${shortIsl(x.k)} <span class="sy" aria-hidden="true">★</span> ${x.got}/${x.max} sao</span>`).join('')}</div>
      ${weak.length?`<div class="msg weak"><b>Chưa đạt 2 sao:</b><span>${weak.join(', ')}.</span></div>`:'<div class="msg ok"><b>Tuyệt vời!</b><span>Bé đã đạt từ 2 sao trở lên ở mọi trò chơi.</span></div>'}
      <div class="islands">${MIXED.map(g=>{const sv=((st.xu&&st.xu.stats)||{}).solved||{},nc=bank(g.id+'-nc').length,cnt=id=>g.id==='thi-thu'?'':`<span>${Math.min((sv[id]||[]).length,bank(id).length)}/${bank(id).length}</span>`,st3=starTxt;
        return nc?`<div class="island tinted c${g.is} mini"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><div class="lvrow"><span>Cơ bản ${st3(st.best[g.id])}</span>${cnt(g.id)}</div><div class="lvrow"><span>Nâng cao ${st3(st.best[g.id+'-nc'])}</span>${cnt(g.id+'-nc')}</div></div>`
          :`<div class="island tinted c${g.is} mini"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3>${stars(st.best[g.id]||0)}</div>`}).join('')}</div></div>
    <h2 class="sec">Xu và quà</h2><div class="board">${shelfHtml(st.xu,{code:st.code,canDecide:!!o.canGift})}${o.canGift?giftEditor(st):''}</div>
    <h2 class="sec">Huy hiệu</h2><div class="board">${badgePanel(st.xu,st.essays)}</div>
    <h2 class="sec">Bài thi thử đã nộp (${st.essays.length})</h2>
    ${st.essays.length?st.essays.map(e=>essayCard(st,e,o.canComment)).join(''):'<p class="fine">Chưa có bài nào.</p>'}`;
  window.scrollTo(0,0);
}
function giftState(g,x){if((x.req||[]).some(q=>q.m===g.m&&q.status==='pending'))return 'pending';return (x.total||0)>=g.m?'open':'locked'}
const vn=n=>Number(n||0).toLocaleString('vi-VN');
function shelfHtml(x,o){
  x=x||{};const gifts=x.gifts||[],tot=x.total||0,nextG=gifts.find(g=>tot<g.m),prevG=[...gifts].reverse().find(g=>tot>=g.m),base=prevG?prevG.m:0;
  const pct=nextG?Math.max(0,Math.min(100,Math.round((tot-base)/(nextG.m-base)*100))):100;
  return `<div class="xu-head">${COIN}<b>${vn(tot)}</b> xu${x.streak?`<span class="fine">Chơi liên tục ${x.streak} ngày</span>`:''}</div>
    ${nextG?`<div class="meter-row"><span>Còn ${vn(nextG.m-tot)} xu nữa tới mốc ${vn(nextG.m)}</span><div class="meter"><div style="width:${pct}%"></div></div></div>`:gifts.length?'<p class="fine">Đã đủ xu cho mọi mốc quà!</p>':''}
    <div class="gifts">${gifts.map(g=>{const s=giftState(g,x),req=(x.req||[]).filter(q=>q.m===g.m&&q.status==='pending').slice(-1)[0],times=(x.req||[]).filter(q=>q.m===g.m&&q.status==='given').length;
      const act=o.student?(s==='open'?`<button class="primary sm" data-act="g-req" data-m="${g.m}">Đổi ngay</button>`:'')
        :(o.canDecide&&req?`<div class="actions"><button class="primary sm" data-act="g-ok" data-code="${esc(o.code)}" data-id="${esc(req.id)}">Đã trao quà</button><button class="ghost sm" data-act="g-no" data-code="${esc(o.code)}" data-id="${esc(req.id)}">Chưa đồng ý, trả lại xu</button></div>`:'');
      const lab={pending:'Đang chờ người lớn duyệt (đã tạm trừ xu)',open:o.student?'Đủ xu: đổi ngay hoặc tích tiếp':'Bé đã đủ xu',locked:`Còn thiếu ${vn(g.m-tot)} xu`}[s];
      return `<div class="gift ${s}"><b>${vn(g.m)} xu</b><span>${esc(g.name)}</span><span class="fine">${lab}${times?` · đã đổi ${times} lần`:''}</span>${act}</div>`}).join('')}</div>`;
}
function renderShelf(){
  G=null;
  if(!isStudent()){$app.innerHTML='<div class="board"><p>Kệ quà dành cho học sinh đã nhập mã. Hãy nhập mã ở trang chủ.</p><div class="actions"><a class="primary" href="#">Về trang chủ</a></div></div>';return}
  $app.innerHTML=`<div class="bar"><a class="back" href="#">← Bản đồ</a><div class="gtitle">Kệ quà của ${esc(me.name)}</div></div>
    <div class="board">${rulesHtml('wide')}${shelfHtml(xu,{student:true})}<div id="shelfmsg" role="status"></div>
    </div>`;
}
function giftFeed(S){
  const all=[];S.forEach(s=>(s.xu.req||[]).forEach(r=>all.push({s,r})));
  const pend=all.filter(x=>x.r.status==='pending'),done=all.filter(x=>x.r.status!=='pending').sort((a,b)=>(b.r.doneAt||'')>(a.r.doneAt||'')?1:-1).slice(0,10);
  const row=({s,r})=>`<div class="board grq"><div><b>${esc(s.name)}</b> <span class="fine">${esc(s.code)} · ${fmtDate(r.at)}</span><br>Xin đổi: <b>${esc(r.name)}</b> (mốc ${r.m} xu)</div>
    ${r.status==='pending'?`<div class="actions"><button class="primary sm" data-act="g-ok" data-code="${esc(s.code)}" data-id="${esc(r.id)}">Đã trao quà</button><button class="ghost sm" data-act="g-no" data-code="${esc(s.code)}" data-id="${esc(r.id)}">Chưa đồng ý</button></div>`
    :`<span class="fine">${r.status==='given'?'Đã trao':'Chưa đồng ý, đã trả lại xu'} · ${esc(r.by||'')}</span>`}</div>`;
  return (pend.length?pend.map(row).join(''):'<div class="board"><p>Không có yêu cầu đổi quà nào đang chờ.</p></div>')+(done.length?'<h2 class="sec">Đã xử lí gần đây</h2>'+done.map(row).join(''):'');
}
function giftEditor(st){
  const g=(st.xu&&st.xu.gifts)||[],rows=[...g,...Array(Math.max(0,8-g.length)).fill({m:'',name:''})].slice(0,10);
  return `<details class="gedit"><summary>Sửa danh sách quà của ${esc(st.name)}</summary><form data-form="gifts" data-code="${esc(st.code)}">
    <div class="grows">${rows.map((r,i)=>`<div class="grow"><input type="number" min="10" step="10" class="plain-in" name="m${i}" value="${r.m}" placeholder="Mốc xu" aria-label="Mốc xu ${i+1}"><input class="plain-in" name="n${i}" value="${esc(r.name||'')}" placeholder="Tên quà" aria-label="Tên quà ${i+1}" maxlength="80"></div>`).join('')}</div>
    <div class="actions"><button class="primary sm" type="submit">Lưu danh sách quà</button><span class="fine saved" role="status"></span></div>
    <p class="fine">Dòng nào để trống sẽ bị bỏ qua. Xóa hết rồi lưu thì quay về danh sách quà mặc định.</p></form></details>`;
}
async function giftAct(a,b){
  if(a==='g-req'){const msg=document.getElementById('shelfmsg');
    if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent=`Bấm lần nữa: trừ ${vn(b.dataset.m)} xu`;return}
    try{const d=await call('gift.request',{m:+b.dataset.m});xu=d.xu;renderShelf();const m2=document.getElementById('shelfmsg');if(m2)m2.innerHTML='<div class="msg ok"><b>Đã gửi!</b><span>Bố mẹ hoặc thầy cô sẽ duyệt yêu cầu đổi quà của em.</span></div>'}catch(e){if(msg)msg.innerHTML=`<div class="msg bad"><b>Chưa gửi được.</b><span>${esc(e.message)}</span></div>`}return}
  try{const d=await call('gift.decide',{code:b.dataset.code,id:b.dataset.id,ok:a==='g-ok'});const st=DASH&&DASH.students.find(s=>s.code===b.dataset.code);if(st)st.xu=d.xu;renderDash(location.hash.slice(1)||'theo-doi')}
  catch(e){b.textContent=e.message}
}
async function saveGifts(f){
  const msg=f.querySelector('.saved'),gifts=[];
  for(let i=0;i<10;i++){const m=f.elements['m'+i],n=f.elements['n'+i];if(!m||!n)break;if(m.value&&n.value.trim())gifts.push({m:+m.value,name:n.value.trim()})}
  try{const d=await call('gift.set',{code:f.dataset.code,gifts});const st=DASH&&DASH.students.find(s=>s.code===f.dataset.code);if(st)st.xu=d.xu;renderDash(location.hash.slice(1)||'theo-doi')}
  catch(e){msg.textContent=e.message}
}
/* ---------- Huy hiệu ---------- */
const MEDAL='<svg class="medal-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8l-2.5 6h-3z"/><circle cx="12" cy="15" r="6"/></svg>';
const LOCK='<svg class="medal-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const TIERS=[['dong','Đồng',.4],['bac','Bạc',.7],['vang','Vàng',1]];
// chuỗi bậc Nâng cao tiếp nối Đồng–Bạc–Vàng: id vẫn là <trò>-nc-dong/bac/vang
const NTIERS=[['dong','Titan',.4,'titan'],['bac','Ruby',.7,'ruby'],['vang','Diamond',1,'kc']];
const GAMEB=()=>GAMES.filter(g=>g.id!=='thi-thu');
function badgeList(x,ess){
  const st=(x&&x.stats)||{},sv=st.solved||{},E=ess||[],out=[];
  for(const g of GAMEB()){const n=bank(g.id).length,got=(sv[g.id]||[]).length;
    TIERS.forEach(([k,name,p])=>{const need=Math.ceil(n*p);out.push({id:g.id+'-'+k,grp:'Bộ câu hỏi',tier:k,isl:g.is,name:name+' · '+g.name,how:`Trả lời đúng ngay lần đầu ${need}/${n} câu khác nhau của trò ${g.name}.`,have:Math.min(got,need),need,ok:got>=need})})}
  for(const g of NCG().filter(g=>g.base!=='thi-thu')){const n=bank(g.id).length,got=(sv[g.id]||[]).length;
    NTIERS.forEach(([k,name,p,t])=>{const need=Math.ceil(n*p);out.push({id:g.id+'-'+k,grp:'Bộ câu hỏi',tier:t,isl:g.is,name:name+' · '+g.name,how:`Trả lời đúng ngay lần đầu ${need}/${n} câu Nâng cao của trò ${g.name}.`,have:Math.min(got,need),need,ok:got>=need})})}
  // chuỗi huy hiệu đảo: Nhà thám hiểm (Đồng) → Chúa đảo (Vàng) → Chiến thần (Titan) → Out trình (Ruby) → Trùm cuối (Diamond)
  ISLANDS.forEach((isl,k)=>{const gs=GAMEB().filter(g=>g.is===k),has=id=>gs.filter(g=>(out.find(b=>b.id===g.id+id)||{}).ok).length,short=isl.name.replace('Đảo ','');
    [['isl'+k+'-1','dong','Nhà thám hiểm '+isl.name,'-dong','Đồng'],['isl'+k+'-2','vang','Chúa đảo '+short,'-vang','Vàng'],
     ['nisl'+k+'-1','titan','Chiến thần '+isl.name,'-nc-dong','Titan'],['nisl'+k+'-3','ruby','Out trình '+isl.name,'-nc-bac','Ruby'],['nisl'+k+'-2','kc','Trùm cuối '+isl.name,'-nc-vang','Diamond']]
    .forEach(([id,tier,name,suf,tn])=>{if(suf.startsWith('-nc')&&!bank(gs[0].id+'-nc').length)return;const hv=has(suf);out.push({id,grp:'Đảo',tier,isl:k,name,how:`Có huy hiệu ${tn} ở cả ${gs.length} trò của ${isl.name}.`,have:hv,need:gs.length,ok:hv===gs.length})})});
  const ms=st.maxStreak||0;[[10,'Ngọn lửa nhỏ'],[20,'Ngọn lửa lớn'],[30,'Ngọn lửa bất diệt']].forEach(([n,name],i)=>out.push({id:'streak'+n,grp:'Chuỗi đúng',tier:TIERS[i][0],name,how:`Đúng liên tiếp ${n} câu trong một lượt chơi.`,have:Math.min(ms,n),need:n,ok:ms>=n}));
  out.push({id:'perfect5',grp:'Hoàn hảo',tier:'vang',name:'Không một lỗi',how:'Có 5 lượt chơi đúng hết ngay lần đầu.',have:Math.min(st.perfect||0,5),need:5,ok:(st.perfect||0)>=5});
  const bd=st.bestDays||0;[[7,'Chăm học 7 ngày','bac'],[30,'Chăm học 30 ngày','vang']].forEach(([n,name,tier])=>out.push({id:'days'+n,grp:'Chăm chỉ',tier,name,how:`Chơi liên tục ${n} ngày.`,have:Math.min(bd,n),need:n,ok:bd>=n}));
  // chuỗi Viết văn: đếm số đề khác nhau (nộp lại cùng một đề chỉ tính một lần)
  const de=f=>new Set(E.filter(f).map(e=>e.de)).size,sub=de(()=>true),s2=de(e=>(e.stars||0)>=2),full=de(e=>e.stars===3),nc3=de(e=>e.nc&&e.stars===3);
  [['write5','dong','Content creator nhí','Nộp bài cho 5 đề thi thử khác nhau.',sub,5],
   ['write2s','bac','Bài viết hot','Có 10 đề thi thử đạt từ 2 sao trở lên.',s2,10],
   ['write3s','vang','Bài viết viral','Có 10 đề thi thử đạt đủ yêu cầu (3 sao).',full,10],
   ['writeN5','titan','Bút Pro Max','Có 10 đề thi thử Nâng cao đạt 3 sao.',nc3,10],
   ['writeN10','ruby','Idol viết văn','Có 20 đề thi thử Nâng cao đạt 3 sao.',nc3,20],
   ['writeN20','kc','KOL văn chương','Có 35 đề thi thử Nâng cao đạt 3 sao.',nc3,35]]
  .forEach(([id,tier,name,how,have,need])=>out.push({id,grp:'Viết văn',tier,name,how,have:Math.min(have,need),need,ok:have>=need}));
  const kings=out.filter(b=>/^isl\d-2$/.test(b.id)&&b.ok).length;
  out.push({id:'king',grp:'Tối thượng',tier:'vang',name:'Vua Đảo Câu Văn',how:'Có đủ 5 huy hiệu Chúa đảo.',have:kings,need:5,ok:kings>=5});
  const legends=out.filter(b=>/^nisl\d-2$/.test(b.id)&&b.ok).length;
  out.push({id:'legend',grp:'Tối thượng',tier:'kc',name:'Huyền thoại Đảo Câu Văn',how:'Có đủ 5 huy hiệu Trùm cuối (Diamond ở mọi trò).',have:legends,need:5,ok:legends>=5});
  return out;
}
function BREWARD(id){let m=/^([a-z-]+)-nc-(dong|bac|vang)$/.exec(id);if(m)return {dong:250,bac:300,vang:400}[m[2]]*ISL_MUL[gameIsl(m[1])];m=/^nisl(\d)-([123])$/.exec(id);if(m)return {1:400,3:500,2:600}[m[2]]*ISL_MUL[+m[1]];m=/^([a-z-]+)-(dong|bac|vang)$/.exec(id);if(m)return {dong:50,bac:100,vang:200}[m[2]]*ISL_MUL[gameIsl(m[1])];m=/^isl(\d)-([12])$/.exec(id);if(m)return (m[2]==='1'?150:300)*ISL_MUL[+m[1]];return {streak10:100,streak20:200,streak30:300,perfect5:200,days7:150,days30:300,write5:200,write2s:300,write3s:400,writeN5:600,writeN10:800,writeN20:1200,king:1000,legend:3000}[id]||0}
function badgeHtml(b,paid){const n=BREWARD(b.id);return `<div class="bdg ${b.ok?'on':'off'} t-${b.tier}"><span class="medal">${b.ok?MEDAL:LOCK}</span><b>${esc(b.name)}</b><span class="fine">${esc(b.how)}</span>${b.ok?'<span class="fine got">Đã mở khóa</span>':`<div class="meter sm"><div style="width:${Math.round(b.have/b.need*100)}%"></div></div><span class="fine">${b.have}/${b.need}</span>`}<span class="rw">${b.ok?((paid||[]).includes(b.id)?`Đã nhận ${vn(n)} xu`:`Sẽ nhận ${vn(n)} xu sau lượt chơi tới`):`Thưởng ${vn(n)} xu`}</span></div>`}
function gameBadgeCard(g,sv){const n=bank(g.id).length,got=Math.min((sv[g.id]||[]).length,n),nid=g.id+'-nc',nn=bank(nid).length,ng=Math.min((sv[nid]||[]).length,nn);
  const bar=(lbl,a,t)=>`<div class="lvbar"><span>${lbl}</span><div class="meter sm"><div style="width:${t?Math.round(a/t*100):0}%"></div></div><span class="fine">${a}/${t}</span></div>`;
  return `<div class="gbdg c${g.is}"><b>${g.name}</b>${bar('Cơ bản',got,n)}${nn?bar('Nâng cao',ng,nn):''}<span class="pips">${TIERS.map(([k,name,p])=>`<span class="pip t-${k}${got>=Math.ceil(n*p)?' on':''}" title="${name}: ${Math.ceil(n*p)} câu Cơ bản">${name}</span>`).join('')}</span><span class="pips">${nn?NTIERS.map(([k,name,p,t])=>`<span class="pip t-${t}${ng>=Math.ceil(nn*p)?' on':''}" title="${name}: ${Math.ceil(nn*p)} câu Nâng cao">${name}</span>`).join(''):''}</span></div>`}
function badgePanel(x,ess){
  const L=badgeList(x,ess),sv=((x&&x.stats)||{}).solved||{};
  return `<p class="bsum">${MEDAL}<b>${L.filter(b=>b.ok).length}</b>/${L.length} huy hiệu</p>
    <h3 class="bgrp">Bộ câu hỏi</h3><p class="fine">Mỗi câu chỉ tính một lần, khi trả lời đúng ngay lần đầu (trò nhiều bước: đúng hết các bước). Đồng / Bạc / Vàng: 40% / 70% / 100% câu Cơ bản của trò; Titan / Ruby / Diamond: 40% / 70% / 100% câu Nâng cao. Thưởng: 50 · 100 · 200 · 250 · 300 · 400 xu, nhân hệ số của đảo (Viết đoạn ×2, Mở rộng câu ×1, Câu ghép, Tu từ, Từ ngữ ×½).</p>
    <div class="gbdgs">${GAMEB().map(g=>gameBadgeCard(g,sv)).join('')}</div>
    ${[...new Set(L.filter(b=>!b.grp.startsWith('Bộ câu hỏi')).map(b=>b.grp))].map(gp=>`<h3 class="bgrp">${gp}</h3><div class="bdgs">${L.filter(b=>b.grp===gp).map(b=>badgeHtml(b,(x&&x.paid)||[])).join('')}</div>`).join('')}`;
}
function renderBadges(){
  G=null;
  if(!isStudent()){$app.innerHTML='<div class="board"><p>Bộ sưu tập huy hiệu dành cho học sinh đã nhập mã. Hãy nhập mã ở trang chủ.</p><div class="actions"><a class="primary" href="#">Về trang chủ</a></div></div>';return}
  $app.innerHTML=`<div class="bar"><a class="back" href="#">← Bản đồ</a><div class="gtitle">Huy hiệu của ${esc(me.name)}</div></div><div class="board">${badgePanel(xu,essays)}</div>`;
}
async function renderPlink(token){
  G=null;$app.innerHTML='<p class="fine">Đang tải báo cáo…</p>';
  try{const d=await call('plink',null,'&p='+encodeURIComponent(token));
    renderKid(d.student,{back:false,canComment:false,top:'<div class="acct"><span>Báo cáo chỉ để xem, dành cho phụ huynh.</span><a class="ghost sm" href="/">Về trang trò chơi</a></div>'})}
  catch(e){$app.innerHTML=`<div class="board"><p>${esc(e.message)}</p><div class="actions"><a class="primary" href="/">Về trang trò chơi</a></div></div>`}
}
async function dashAct(a,b){
  if(a==='d-tab'){TAB=b.dataset.k;renderDash('theo-doi')}
  else if(a==='d-refresh'){DASH=null;renderDash(location.hash.slice(1)||'theo-doi')}
  else if(a==='d-open'){location.hash='hs-'+b.dataset.code}
  else if(a==='d-copy'){const l=b.dataset.link;try{await navigator.clipboard.writeText(l);b.textContent='Đã sao chép'}catch(e){const i=document.createElement('input');i.readOnly=true;i.value=l;i.className='plain-in linkbox';b.replaceWith(i);i.select()}}
  else if(a==='d-reset'||a==='d-delessay'){
    if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent=a==='d-reset'?'Bấm lần nữa: xóa hết sao và bài viết':'Bấm lần nữa để xóa';b.classList.add('danger');return}
    try{
      if(a==='d-reset'){await call('reset',{code:b.dataset.code});DASH=null}
      else{const d=await call('essay.remove',{code:b.dataset.code,at:b.dataset.at});const st=DASH.students.find(s=>s.code===b.dataset.code);if(st)st.essays=d.essays}
      renderDash(location.hash.slice(1)||'theo-doi');
    }catch(e){b.textContent=e.message}
  }
}
async function saveComment(f){
  const text=f.querySelector('textarea').value,msg=f.querySelector('.saved');
  try{const d=await call('comment',{code:f.dataset.code,at:f.dataset.at,text});const st=DASH&&DASH.students.find(s=>s.code===f.dataset.code);if(st)st.essays=d.essays;msg.textContent='Đã lưu nhận xét.'}
  catch(e){msg.textContent=e.message}
}

/* ---------- Sự kiện ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act;
  if(a==='logout'){logout();return}
  if(a.startsWith('d-')){dashAct(a,b);return}
  if(a.startsWith('g-')){giftAct(a,b);return}
  if(!G)return;
  const prev=G.msg;
  if(a==='pick'){clickPick(+b.dataset.j);xuJudge(prev)}
  else if(a==='x'&&G.onAct){G.onAct(b.dataset);xuJudge(prev)}
  else if(a==='next')next();
  else if(a==='again'){startGame(G.g);window.scrollTo(0,0)}
  else if(a==='submit')submitThi();
  else if(a==='newde'){G.newDe();render()}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'){const r=e.target.closest&&e.target.closest('tr[data-act="d-open"]');if(r)dashAct('d-open',r)}});
document.addEventListener('submit',async e=>{
  const f=e.target.closest('form[data-form]');if(!f)return;e.preventDefault();
  const kind=f.dataset.form;
  if(kind==='student'){
    const er=document.getElementById('err-s'),v=document.getElementById('codein').value.trim().toUpperCase();
    if(!v){er.textContent='Em nhập mã trước nhé.';return}
    try{me=await call('login.student',{code:v});essays=[];await loadMine();renderTotal();renderMap()}catch(x){er.textContent=x.message}
  }else if(kind==='staff'){
    const er=document.getElementById('err-t'),login=document.getElementById('login').value.trim(),password=document.getElementById('pw').value;
    if(!login||!password){er.textContent='Nhập tên đăng nhập và mật khẩu.';return}
    try{await call('login.staff',{login,password});const m=await call('me');me=m.role?m:null;best={};DASH=null;renderTotal();if(location.hash==='#theo-doi')route();else location.hash='theo-doi'}catch(x){er.textContent=x.message}
  }else if(kind==='comment')saveComment(f);
  else if(kind==='gifts')saveGifts(f);
});
function route(){
  const p=new URLSearchParams(location.search).get('p');if(p)return renderPlink(p);
  const h=location.hash.slice(1);
  if(h==='theo-doi'||h.startsWith('hs-'))return renderDash(h);
  if(h==='qua')return renderShelf();
  if(h==='huy-hieu')return renderBadges();
  const g=GAMES.find(x=>x.id===h)||NCG().find(x=>x.id===h);if(g)startGame(g);else renderMap();window.scrollTo(0,0);
}
addEventListener('hashchange',route);
$app.innerHTML='<p class="fine">Đang tải…</p>';
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
