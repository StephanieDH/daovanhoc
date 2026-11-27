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
const triedSet=()=>new Set(G&&G.g&&isStudent()?((((xu&&xu.stats)||{}).tried||{})[G.g.id]||[]):[]);
// bốc n câu: câu chưa gặp → câu đã từng sai → câu đã đúng; rồi trộn đều thứ tự trong lượt
function pickNew(a,n,kf){const S=solvedSet(),T=triedSet(),sh=shuffle(a);return shuffle([...sh.filter(x=>!S.has(kf(x))&&!T.has(kf(x))),...sh.filter(x=>!S.has(kf(x))&&T.has(kf(x))),...sh.filter(x=>S.has(kf(x)))].slice(0,n))}
const bank=id=>((window.BANK||{})[id]||[]);
const size=id=>baseId(id)==='noi-doi'?bank(id).reduce((a,s)=>a+s.split(';').length,0):baseId(id)==='nhieu-nghia'?bank(id).reduce((a,s)=>a+(s.startsWith('P|')?1:s.split('|').length-2),0):bank(id).length;
const unit=id=>(id=baseId(id))==='noi-doi'?'cặp':id==='thi-thu'?'đề':id==='xep-doan'?'đoạn':id==='doc-hieu'?'bài đọc':id==='cap-tu'?'lượt':'câu';
const rows=id=>bank(id).map(s=>s.split('|'));
// mức Nâng cao: ngân hàng BANK['<trò>-nc'], dùng chung cách chơi với trò gốc
let LV='';const qbank=id=>bank(id+LV),qrows=id=>qbank(id).map(s=>s.split('|'));
const baseId=id=>String(id).replace(/-(nc|tt)$/,'');
const NCG=()=>GAMES.filter(g=>bank(g.id+'-nc').length).map(g=>({...g,id:g.id+'-nc',base:g.id,nc:true}));
// Thử thách (Thách đấu): chỉ hiện khi đã có câu trong data/tt-*.js
const L3G=()=>GAMES.filter(g=>bank(g.id+'-tt').length).map(g=>({...g,id:g.id+'-tt',base:g.id,l3:true}));
const lvMul=g=>g&&g.l3?3:g&&g.nc?2:1;
const STAR='<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>';
function stars(n,big){let h=`<span class="stars${big?' big':''}" role="img" aria-label="${n} trên 3 sao">`;for(let i=0;i<3;i++)h+=`<svg viewBox="0 0 24 24" class="${i<n?'on':''}" aria-hidden="true">${STAR}</svg>`;return h+'</span>'}
const starsFrom=(c,n)=>c===n?3:c>=Math.ceil(n*.75)?2:c>=1?1:0;
// sao của trò = độ phủ + độ chính xác (khớp máy chủ): ★ ≥10% câu; ★★ ≥40% và lượt tốt nhất ≥2 sao; ★★★ ≥70% và đã có lượt đúng hết
function covStars(id,roundSt,extra){const st=(xu&&xu.stats)||{},n=bank(id).length,br=Math.max(((st.bestRound||{})[id])||0,roundSt||0);if(!n||baseId(id)==='thi-thu')return roundSt;const c=new Set([...((st.solved||{})[id]||[]),...(extra||[])]).size/n;return c>=.7&&br>=3?3:c>=.4&&br>=2?2:c>=.1&&br>=1?1:0}

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
    try{const d=await call('save',{game:id,stars:s,round:G&&G.roundSt!=null?G.roundSt:s,essay,xu:delta,solved,tried:G&&G.dirty?[...G.dirty]:[],maxStreak:G?G.maxStreak||0:0,perfect});essays=d.essays||essays;xu=d.xu||xu;renderTotal();if(G&&baseId(G.g.id)==='thi-thu')renderEssays();
      // thưởng xu cho huy hiệu mới mở (và huy hiệu mở từ trước khi có thưởng), mỗi huy hiệu một lần
      const now=badgeList(xu,essays),fresh=new Set(now.filter(b=>b.ok&&!before.has(b.id)).map(b=>b.id)),bonus=[...(d.bonus||[])];
      const unpaid=now.filter(b=>b.ok&&!(xu.paid||[]).includes(b.id));
      if(unpaid.length){try{const c=await call('badge.claim',{ids:unpaid.map(b=>b.id)});xu=c.xu||xu;renderTotal();
        (c.got||[]).forEach(([bid,n])=>{const b=unpaid.find(z=>z.id===bid),lab=(fresh.has(bid)?'Huy hiệu mới: ':'Thưởng huy hiệu: ')+(b?b.name:bid);bonus.push([lab,n]);toast(n,lab,'badge')})}catch(e){}}
      return {bonus,total:xu.total,badges:[],inJar:!!d.inJar,jarOpened:d.jarOpened||0}}
    catch(e){renderTotal();return {bonus:[],total:null,err:e.message}}
  }
  xu.total=Math.max(0,(xu.total||0)+delta);xu.peak=Math.max(xu.peak||0,xu.total);LS.set('dcv-xu-guest',{total:xu.total,peak:xu.peak});renderTotal();
  return {bonus:[],total:xu.total};
}
async function logout(){try{await call('logout',{})}catch(e){}me=null;essays=[];DASH=null;best=LS.get('dcv-best-guest',{})||{};xu=LS.get('dcv-xu-guest',{total:0,peak:0})||{total:0,peak:0};renderTotal();if(location.hash)location.hash='';else renderMap()}
function renderTotal(){
  // tổng sao gộp Cơ bản + Nâng cao (khớp với báo cáo)
  const ids=[...GAMES.map(g=>g.id),...NCG().map(g=>g.id),...L3G().map(g=>g.id)],t=ids.reduce((a,id)=>a+(best[id]||0),0);
  document.getElementById('total').innerHTML=(me?`<span class="who">${esc(isStudent()?me.name+' · '+me.code:me.name)}</span>`:'')+
    (isStaff()?`<a class="who-link" href="#theo-doi">${me.role==='parent'?'Báo cáo của con':'Bảng theo dõi'}</a>${aiPill()}`:`<svg viewBox="0 0 24 24" aria-hidden="true">${STAR}</svg>${t}/${ids.length*3}<a class="xu-link" href="#qua" title="Kệ quà">${COIN}<b>${Math.max(0,(xu.total||0)+(jarOn()?0:((G&&G.xu)||0)))}</b> xu</a>${isStudent()&&!xu.wrote?`<a class="jar-pill" href="#thi-thu" title="Viết 1 đoạn văn để mở hũ">🔒 Hũ hôm nay: <b>${Math.max(0,(xu.jar||0)+(jarOn()?((G&&G.xu)||0):0))}</b> xu</a>`:''}`);
}

let G=null;

/* ---------- Bản đồ ---------- */
/* Mục tiêu tiếp theo: món quà gần nhất chưa đủ xu và huy hiệu sắp đạt nhất */
function goalsHtml(L){
  const tot=xu.total||0,gifts=xu.gifts||[],g=gifts.find(x=>tot<x.m);
  const UNIT={'Bộ câu hỏi':'câu','Đảo':'trò','Chuỗi đúng':'câu liền','Hoàn hảo':'lượt','Chăm chỉ':'ngày','Viết văn':'bài','Tối thượng':'huy hiệu'};
  const b=L.filter(x=>!x.ok&&x.grp!=='Chăm chỉ').sort((a,c)=>(c.have/c.need-a.have/a.need)||((a.need-a.have)-(c.need-c.have)))[0];
  const giftRow=g?`<div class="gl"><span>Quà tiếp theo: <b>${esc(g.name)}</b> · còn ${vn(g.m-tot)} xu</span><div class="gbar"><i class="gold" style="width:${Math.min(100,Math.round(tot/g.m*100))}%"></i></div></div>`
    :gifts.length?'<div class="gl"><span>Em đã đủ xu cho mọi món quà. Vào Kệ quà để đổi nhé!</span></div>':'';
  const badgeRow=b?`<div class="gl"><span>Huy hiệu gần nhất: <b>${esc(b.name)}</b> · còn ${b.need-b.have} ${UNIT[b.grp]||''}</span><div class="gbar"><i style="width:${Math.round(b.have/b.need*100)}%"></i></div></div>`
    :`<div class="gl"><span>Em đã có đủ ${L.length} huy hiệu. Tuyệt vời!</span></div>`;
  // chuỗi chăm học: số ngày chơi liên tiếp, mốc thưởng mỗi 7 ngày
  const sk=xu.streak||0,left=7-(sk%7);
  const streakRow=`<div class="gl"><span>Chuỗi chăm học: <b>🔥 ${sk} ngày liên tiếp</b> · ${sk&&sk%7===0?'vừa nhận +100 xu, giữ chuỗi nhé!':`còn ${left} ngày tới +100 xu`}</span><div class="gbar"><i class="flame" style="width:${Math.round((sk%7||(sk?7:0))/7*100)}%"></i></div></div>`;
  // gợi ý kiếm thêm xu (máy chủ chọn trò bé ít chơi; xong một lượt có câu mới +50 xu, tối đa 3 lần/ngày)
  const gl=xu.goal,gg=gl&&([...GAMES,...NCG(),...L3G()].find(x=>x.id===gl.game)),gleft=xu.goalLeft??3;
  const goalRow=gg?`<div class="gl"><span>Gợi ý kiếm thêm xu</span><div class="goalbox"><span>Chơi 1 lượt <b>${esc(gg.name)}${gg.nc?' · Nâng cao':gg.l3?' · Thử thách':''}</b></span><a class="primary sm" href="#${gg.id}">Chơi ngay →</a></div><span class="fine">${gleft>0?`Xong một lượt có câu mới: +50 xu · hôm nay còn ${gleft} lần`:'Hôm nay đã nhận đủ 3 lần thưởng, mai thưởng tiếp nhé.'}</span></div>`:'';
  const jarRow=`<div class="gl"><span class="jar-t">🔒 Hũ xu hôm nay đang chờ mở</span><div class="goalbox"><span>Viết 1 đoạn văn ở Phòng thi thử để mở hũ <b>${vn(xu.jar||0)} xu</b> + thưởng <b>50 xu</b></span><a class="primary sm" href="#thi-thu">Viết ngay ✍️</a></div><span class="fine">Viết đủ số câu tối thiểu của đề là mở được. Hũ hôm qua (nếu có) cũng mở cùng lúc.</span></div>`;
  return `<div class="goals">${giftRow}${badgeRow}${streakRow}${isStudent()&&!xu.wrote?jarRow:goalRow}</div>`;
}
function rulesHtml(cls){
  const R=[['up','+10','Đúng ngay lần đầu'],['gr','1 lần','Mỗi câu chỉ trả lời 1 lần'],['dn','−2','Mỗi lần sai'],['gr','0','Câu đã làm đúng rồi'],['fl','+50','Đúng liền 5 câu'],['fl','+100','Đúng liền 10 câu'],['up','+10','Mỗi sao mới của trò'],['up','+15','Chơi mỗi ngày']];
  return `<div class="rules${cls?' '+cls:''}"><p class="rt">${COIN}Cách kiếm xu đổi quà</p><div class="rg">${R.map(([c,n,l])=>`<div class="rr ${c}"><b>${n}</b><span>${l}</span></div>`).join('')}</div><div class="rmul"><p>Hệ số xu theo đảo (nhân với số ở trên)</p><span class="isl-tag c4">Viết đoạn ×2</span><span class="isl-tag c0">Mở rộng câu ×1</span><span class="isl-tag c1">Câu ghép, Tu từ, Từ ngữ ×½</span></div><p class="rai">🤖 <b>Cô Chấm AI</b> (Phòng thi thử): 9–10 điểm +30, 7–8,9 điểm +15, 5–6,9 điểm +5, nhân hệ số đảo Viết đoạn; mỗi đề tính lần điểm cao nhất.</p><p class="rjar">🔒 <b>Hũ xu mỗi ngày:</b> xu kiếm được trong ngày vào hũ; viết 1 đoạn văn ở Phòng thi thử để mở hũ (+50 xu). Hũ chưa mở giữ được 2 ngày, sau đó còn 50%.</p><p class="rgi">Mức Nâng cao: xu thưởng gấp đôi, sai trừ 4 xu. Đủ xu thì đổi quà ngay hoặc để dành. Đổi quà sẽ trừ xu.</p></div>`;
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
  const NC=NCG(),L3=L3G(),total=[...GAMES,...NC,...L3].reduce((a,g)=>a+size(g.id),0),sv=((xu&&xu.stats)||{}).solved||{};
  const pct=id=>{const n=bank(id).length;return n&&isStudent()&&baseId(id)!=='thi-thu'?' · '+Math.round(Math.min(1,(sv[id]||[]).length/n)*100)+'%':''},st3=starTxt;
  // nút mức: tên + % (hoặc ✓ Xong), thanh tiến độ, dòng đã làm/tổng · Kỷ lục sao
  const lvBtn=(id,cls,name,u)=>{const n=bank(id).length,sz=size(id),tr=n&&isStudent()&&baseId(id)!=='thi-thu',f=tr?Math.min(1,(sv[id]||[]).length/n):0,p=Math.round(f*100),done=tr&&f>=1;
    return `<a class="lv ${cls}" href="#${id}"><span class="lvr"><b>${name}</b>${done?'<span class="lvdone">✓ Xong</span>':tr?`<span class="lvp">${p}%</span>`:''}</span>${tr?`<span class="lvtrack"><i class="${done?'g':''}" style="width:${p}%"></i></span>`:''}<small><span>${tr?Math.min(sz,Math.round(f*sz))+'/':''}${sz} ${u}</span><span>Kỷ lục ${st3(best[id])}</span></small></a>`};
  const card=g=>{const nc=NC.find(x=>x.base===g.id);if(!nc)return `<a class="island tinted c${g.is}" href="#${g.id}"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><p>${g.skill}</p><span class="count">${size(g.id)} ${unit(g.id)}</span>${stars(best[g.id]||0)}</a>`;
    return `<div class="island tinted c${g.is}"><span class="card-isl">${ISLANDS[g.is].name}</span><h3>${g.name}</h3><p>${g.skill}</p><div class="lvs">${lvBtn(g.id,'b','Cơ bản',unit(g.id))}${lvBtn(nc.id,'n','Nâng cao',unit(g.id))}${(l3=>l3?lvBtn(l3.id,'l','Thử thách',unit(g.id)):'')(L3.find(x=>x.base===g.id))}</div></div>`};
  $app.innerHTML=`<section class="hero"><h1>Chọn một trò chơi để luyện câu văn</h1>
  <p>Mỗi màu là một hòn đảo kỹ năng. Bé chơi trò nào trước cũng được: làm câu dài hơn, hay hơn, rồi viết thành đoạn văn hoàn chỉnh.</p></section>
  ${acct()}
  <div class="isl-legend">${ISLANDS.map((isl,k)=>`<span class="isl-tag c${k}">${islIco(k)}${isl.name}</span>`).join('')}</div>
  <div class="islands">${MIXED.map(card).join('')}</div>
  <p class="note">Ngân hàng có ${total} câu hỏi. Mỗi lượt chơi bốc ngẫu nhiên vài câu, nên mỗi lần chơi sẽ khác nhau.</p>`;
}
const streakHtml=()=>G&&G.streak>=2?`${FLAME}Chuỗi ${G.streak}`:'';
function bar(g,prog){return `<div class="bar"><a class="back" href="#">← Bản đồ</a><div class="gtitle"><span class="isl-tag c${g.is}">${ISLANDS[g.is].name}</span>${g.name}${g.nc?'<span class="nc-tag">Nâng cao</span>':g.l3?'<span class="nc-tag l3">Thử thách</span>':''}</div><span class="streak" id="streak" aria-live="polite">${streakHtml()}</span>${prog?`<div class="prog">${prog}</div>`:''}</div>`}
function msgHtml(m){if(!m)return '';const t={ok:'Đúng rồi!',bad:'Chưa đúng.',weak:'Gần đúng.',info:'Gợi ý:'}[m.k];return `<div class="msg ${m.k}" role="status"><b>${t}</b><span>${m.t}</span></div>`}
const nextBtn=(last,a,b)=>`<div class="actions"><button class="primary" data-act="next">${last?'Xem kết quả':a}</button></div>`;

/* ---------- Khung chung ---------- */
function startGame(g){
  G={g,i:0,correct:0,total:0,msg:null,shake:null,xu:0,xuLines:[],streak:0,since:0};
  LV=g.l3?'-tt':g.nc?'-nc':'';
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
// hũ xu: chưa viết đoạn văn hôm nay thì xu cộng (ngoài Phòng thi thử) vào hũ
const jarOn=()=>isStudent()&&!(xu&&xu.wrote)&&!(G&&G.g&&baseId(G.g.id)==='thi-thu');
function toast(n,label,cls){
  let box=document.getElementById('toasts');if(!box){box=document.createElement('div');box.id='toasts';box.setAttribute('aria-live','polite');document.body.appendChild(box)}
  while(box.children.length>=2)box.firstChild.remove();
  const el=document.createElement('div');el.className='toast '+(cls||(n>0?'up':n<0?'down':'zero'));const J=jarOn()?' vào hũ 🔒':'';el.textContent=cls==='badge'?label+' · +'+n+' xu'+J:(n>0?'+'+n+' xu'+J+' · ':n<0?n+' xu · ':'')+label;if(J&&n>0&&cls!=='badge')el.className='toast jarT';box.appendChild(el);setTimeout(()=>el.remove(),2300);
}
// hệ số xu theo đảo (phương án A, 25/11/2026): Mở rộng câu ×1; Câu ghép, Tu từ, Từ ngữ ×½; Viết đoạn ×2
const ISL_MUL=[1,0.5,0.5,0.5,2];
const gameIsl=id=>{const g=GAMES.find(x=>x.id===baseId(id));return g?g.is:0};
function xuAdd(n,label,quiet){if(!G||isStaff())return;if(G.g)n*=lvMul(G.g);if(n>0&&G.g)n=Math.floor(n*(ISL_MUL[G.g.is]??1));  /* hệ số xu theo đảo (chỉ áp cho xu cộng) */  /* mức Nâng cao: xu thưởng và xu trừ đều gấp đôi */G.xu+=n;G.xuLines.push([label,n]);if(!quiet)toast(n,label);renderTotal()}
function xuJudge(prev){
  if(!G||isStaff()||G.ended)return;const m=G.msg;if(!m||m===prev)return;
  // đơn vị tính xu: mỗi câu hỏi; trò nhiều bước (một câu có nhiều bước) chỉ tính xu một lần, ở bước đúng đầu tiên
  const u=G.qs?'q'+G.i:rowKey(),paid=(G.paidU=G.paidU||new Set());
  if(G.lastU!==u){G.lastU=u;G.since=0}  // sang câu mới thì đếm lại số lần trả lời
  if(m.k==='ok'){const tries=G.since;G.since=0;
    if(u!=null&&paid.has(u)){if(tries>0)G.streak=0}
    else{if(u!=null)paid.add(u);
      const k=rowKey(),old=k!=null&&solvedSet().has(k);
      if(old){if(tries===0&&!(G.oldNoted=G.oldNoted||new Set()).has(k)){G.oldNoted.add(k);toast(0,'Câu này em đã làm đúng rồi · không cộng xu')}if(tries>0)G.streak=0}
      else if(tries===0){xuAdd(XU.first,'Đúng ngay lần đầu');G.streak++;G.maxStreak=Math.max(G.maxStreak||0,G.streak);if(G.streak%10===0)xuAdd(XU.s10,`Chuỗi ${G.streak} câu đúng liên tiếp!`);else if(G.streak%5===0)xuAdd(XU.s5,`Chuỗi ${G.streak} câu đúng liên tiếp!`)}
      else G.streak=0}}  // mỗi câu chỉ trả lời 1 lần: đã sai thì không còn xu cho câu đó
  else if(m.k==='bad'||m.k==='weak'){G.since++;markDirty();const w=m.k==='weak'?'Gần đúng':'Trả lời sai';xuAdd(XU.wrong,G.streak>=2?w+', mất chuỗi':w);G.streak=0}
  const el=document.getElementById('streak');if(el)el.innerHTML=streakHtml();
}
function groupLines(L){const m=new Map();L.forEach(([l,n])=>{const k=l+'|'+n,o=m.get(k)||{l,n,c:0};o.c++;m.set(k,o)});return [...m.values()]}
function xuSumHtml(lines,delta,r){
  const rows=lines.map(o=>`<li><span>${esc(o.l)}${o.c>1?` × ${o.c}`:''}</span><b class="${o.n<0?'neg':''}">${o.n>0?'+':''}${o.n*o.c}</b></li>`).join('');
  const bon=r?(r.bonus||[]).map(([l,n])=>`<li class="bonus"><span>${esc(l)}</span><b>+${n}</b></li>`).join(''):'';
  const sum=delta+(r?(r.bonus||[]).reduce((a,b)=>a+b[1],0):0);
  return `<h3>Xu của lượt này</h3><ul>${rows||'<li><span>Chưa có xu nào</span><b>0</b></li>'}${bon}</ul><p class="xu-total">${sum>=0?'+':''}${sum} xu${r&&r.inJar?` · đã vào hũ 🔒 (hũ hôm nay: ${vn(xu.jar||0)} xu, viết 1 đoạn văn để mở)`:r&&r.total!=null?` · Tổng: ${r.total} xu`:r&&r.err?' · Chưa lưu được, kiểm tra mạng.':r?'':' · Đang lưu…'}</p>${r&&r.badges&&r.badges.length?`<p class="newb">Huy hiệu mới: ${r.badges.map(esc).join(', ')}</p>`:''}${isStudent()?'<a class="ghost sm" href="#qua">Xem kệ quà</a> <a class="ghost sm" href="#huy-hieu">Xem huy hiệu</a>':me?'':'<p class="fine">Nhập mã học sinh ở trang chủ để được đổi quà.</p>'}`;
}
function renderEnd(){
  if(G.endHtml){$app.innerHTML=G.endHtml;return}
  const rst=starsFrom(G.correct,G.total),st=isStudent()?covStars(G.g.id,rst,solvedKeys()):rst;G.roundSt=rst;
  // xu sao: chỉ thưởng sao mới chưa từng được trả (theo luật sao độ phủ + độ chính xác)
  const gain=Math.max(0,st-Math.max(best[G.g.id]||0,(((xu&&xu.stats&&xu.stats.starPaid)||{})[G.g.id])||0));
  if(gain&&!isStaff())xuAdd(gain*XU.star,`Thêm ${gain} sao mới (kỷ lục ${st} sao)`,true);
  G.ended=true;const lines=groupLines(G.xuLines),delta=G.xu,gid=G.g.id;
  const lst=G.g.l3?L3G():G.g.nc?NCG():GAMES,idx=lst.findIndex(x=>x.id===G.g.id),nx=lst[idx+1];
  $app.innerHTML=bar(G.g)+`<div class="board end">
    <div class="stamp"><span><span class="big">${st}</span>sao</span></div>${stars(st,true)}
    <h2>Hoàn thành “${G.g.name}”!</h2>
    <p>Bé làm đúng ngay lần đầu ${G.correct}/${G.total} lần (lượt này ${rst} sao).${isStudent()&&baseId(G.g.id)!=='thi-thu'?` Sao của trò tính theo số câu đã làm đúng: ${Math.round(Math.min(1,new Set([...((((xu&&xu.stats)||{}).solved||{})[G.g.id]||[]),...solvedKeys()]).size/Math.max(1,bank(G.g.id).length))*100)}% (★ 10% · ★★ 40% · ★★★ 70% và có lượt đúng hết).`:st<3?' Chơi lại để lấy đủ 3 sao nhé.':''}</p>
    ${isStaff()?'':`<div class="xu-sum" id="xusum">${xuSumHtml(lines,delta,null)}</div>`}
    <div class="actions" style="justify-content:center"><button class="ghost" data-act="again">Chơi lượt mới</button>${nx?`<a class="primary" href="#${nx.id}">Chơi tiếp: ${nx.name}</a>`:'<a class="primary" href="#">Về bản đồ</a>'}</div></div>`;
  const g0=G;saveRound(gid,st).then(r=>{const el=document.getElementById('xusum');if(el)el.innerHTML=xuSumHtml(lines,delta,r);if(G===g0)G.endHtml=$app.innerHTML});
}

/* Trắc nghiệm dùng chung */
const opt=(label,ok,why)=>({label,ok,why});
const pt=o=>`<span class="pt ${o.ok===true?'good':o.ok==='weak'?'weak':'bad'}">${o.label}</span>`;
const BLANK='<span class="blank">?</span>';
function resetQuiz(){G.sel=null;G.tried=[];G.done=false;G.msg=null;G.tlText='';G.tlRes=null;G.tlWait=false;G.tlErr=''}
function quiz(id,map){G.qs=pickNew(qrows(id).map((r,ix)=>[r,ix]),QUIZ_N,x=>x[1]).map(([r,ix])=>Object.assign(map(r),{key:ix}));resetQuiz()}
// câu tự luận ngắn mức Thử thách (bảng <trò>-tt-tl): thay câu cuối của lượt, ưu tiên câu chưa làm
function addTL(id,keep){
  const T=LV==='-tt'?bank(id+'-tt-tl'):[];if(!T.length||!G.qs.length)return;
  const lk='dcv-tl-'+(me&&me.code||'guest')+'-'+id,done=new Set(LS.get(lk,[])||[]),fresh=T.map((r,ix)=>ix).filter(ix=>!done.has(ix)),pool=fresh.length?fresh:T.map((r,ix)=>ix),ix=pool[Math.floor(Math.random()*pool.length)];
  const [p,src,q,rub,ref]=T[ix].split('|');if(!keep)G.qs=G.qs.slice(0,QUIZ_N-1);G.qs.push({tl:{p,src,q,rub,ref,ix,lk}});
}
function renderTL(q){
  const T=q.tl,R=G.tlRes;
  const yh=R?R.y.map((y,i)=>`<div class="tly ${y.diem>=1?'ok':y.diem>0?'half':'no'}"><b>${y.diem>=1?'✓':y.diem>0?'½':'✗'}</b><span><i>${esc(T.rub.split('~')[i]||'')}</i><br>${esc(y.nhan_xet)}</span></div>`).join(''):'';
  $app.innerHTML=bar(G.g,`Câu ${G.i+1}/${G.qs.length}`)+`<div class="board"><p class="ask"><span class="tltag">Tự luận ngắn</span> Đọc kĩ rồi viết câu trả lời của em.</p>
    <div class="sentence"><div class="poem">${esc(T.p).split('/').map(x=>x.trim()).join('<br>')}${T.src&&T.src!=='Câu mẫu'?`<div class="by">${esc(T.src)}</div>`:''}<div class="q">${esc(T.q)}</div></div></div>
    ${R?`<div class="tlans"><b>Bài của em:</b> ${esc(G.tlText)}</div><div class="tlres"><div class="tlsc">${String(R.score).replace('.',',')} / 3 ý</div>${yh}${R.tong?`<p class="aitong">${esc(R.tong)}</p>`:''}<div class="tlref"><b>Gợi ý câu trả lời đủ ý:</b> ${esc(T.ref)}</div></div>${nextBtn(G.i+1>=G.qs.length,'Câu tiếp theo')}`
    :`<textarea id="tltext" rows="4" placeholder="Em viết 2–3 câu trả lời ở đây…" ${G.tlWait?'disabled':''}>${esc(G.tlText||'')}</textarea>
    <div class="actions"><button class="primary" data-act="tlsend" ${G.tlWait?'disabled':''}>${G.tlWait?'Cô Chấm AI đang đọc…':'Nộp câu trả lời'}</button></div>${G.tlErr?`<div class="msg weak"><span>${esc(G.tlErr)}</span></div>`:''}
    <p class="fine">Mỗi câu chỉ nộp một lần. Cô Chấm AI chấm theo 3 ý: gọi đúng biện pháp, chỉ ra cái hay, nêu cảm xúc hoặc ý nghĩa.</p>`}</div>`;
  const ta=document.getElementById('tltext');if(ta)ta.addEventListener('input',()=>{G.tlText=ta.value});
}
async function sendTL(){
  const q=G.qs[G.i];if(!q||!q.tl||G.tlWait||G.tlRes)return;const T=q.tl,text=(G.tlText||'').trim();
  if(text.length<15){G.tlErr='Em viết thêm rồi hãy nộp nhé.';return render()}
  G.tlWait=true;G.tlErr='';render();
  try{const d=await call('tlgrade',{game:G.g.id,p:T.p,q:T.q,rub:T.rub,text});G.tlRes=d;G.done=true;if(d.score>=2)G.correct++;
    const done=new Set(LS.get(T.lk,[])||[]);
    // xu tự luận ngắn: 10 xu mỗi điểm (×3 Thử thách, × hệ số đảo), chỉ lần đầu làm câu này, không trừ
    if(!done.has(T.ix)&&d.score>0)xuAdd(Math.round(d.score*10),`Cô Chấm: ${String(d.score).replace('.',',')}/3 điểm`);
    done.add(T.ix);LS.set(T.lk,[...done])}
  catch(e){G.tlErr=e.message}
  G.tlWait=false;render();
}
function renderQuiz(){
  if(G.i>=G.qs.length)return renderEnd();
  if(G.qs[G.i].tl)return renderTL(G.qs[G.i]);
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
  else{const opts=G.qs[G.i].options,r=opts.findIndex(x=>x.ok===true);G.tried.push(j);G.shake=j;G.sel=r;G.done=true;  // chỉ trả lời 1 lần
    G.msg={k:o.ok==='weak'?'weak':'bad',t:`${String(o.why).replace(/\s*(Thử|Hãy thử|Hãy nghĩ lại|Thử nghĩ)[^.]*[.?]\s*$/,'')} Đáp án đúng: “${opts[r].label}”.`}}
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
    const s=d.s,j=+d.j,o=G.rounds[G.i].opts[s][j],label=lc(noComma(o[0]));if(G.res[s]===false)return;
    if(o[1]===s){const had=G.pick[s]!=null;G.pick[s]=j;if(!(s in G.res))G.res[s]=true;G.msg=had?{k:'info',t:`Đã đổi sang “${label}”, câu vẫn đúng.`}:{k:'ok',t:`“${label}” trả lời câu hỏi ${SL[s].q}`}}
    else{const R=G.rounds[G.i].opts[s],r=R.findIndex(x=>x[1]===s);G.wrong[s]=(G.wrong[s]||[]).concat(j);G.res[s]=false;G.pick[s]=r;G.shake=s+j;G.msg={k:'bad',t:`“${label}” trả lời câu hỏi ${SL[o[1]].q} Cụm đúng cho câu hỏi ${SL[s].q} là “${lc(noComma(R[r][0]))}”.`}}
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
    else{G.total++;G.k++;G.tried=[];G.shake=1;G.msg={k:'bad',t:`Toa “${noComma(c[0])}” trả lời câu hỏi ${KINDS[c[1]].q} Đây là trạng ngữ chỉ ${KINDS[c[1]].n.toLowerCase()}.`}}
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
    else{const r=S.find(c=>c[1]===want);G.total++;G.ph++;G.tried=[];G.shake=j;G.msg={k:'bad',t:`Đây chưa phải ${ROLES[want].n}. ${cap(ROLES[want].n)} là “${noComma(r[0])}”. ${ROLES[want].h}`}}
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
BUILD['cam-thu']=()=>{quiz('cam-thu',([lines,by,q,r,wr,w1,y1,w2,y2])=>({intro:'<p class="ask">Đọc kĩ rồi chọn câu trả lời đúng nhất.</p>',col:true,
  options:shuffle([opt(r,true,wr),opt(w1,false,y1),opt(w2,false,y2)]),
  view:()=>`<div class="poem">${lines.split('/').map(s=>s.trim()).join('<br>')}${by?`<div class="by">${by}</div>`:''}<div class="q">${q}</div></div>`}));
  addTL('cam-thu');};

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
    else{const L=G.selL;G.miss.push(L);G.matched.push(L);G.total++;G.shake=j;G.selL=null;G.msg={k:'bad',t:`“${S[L][0]} ${S[j][1]}” nghe chưa hợp. Đúng là: ${S[L][0]} ${S[L][1]}.`}}
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
    else{G.placed.push(want);G.total++;G.miss=false;G.shake=j;G.msg={k:'bad',t:`${want===0?'Câu này chưa phải câu mở đầu.':'Câu này chưa phải câu tiếp theo.'} Câu đúng ở vị trí này: “${X.s[want]}”`}}
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
  G.newDe=()=>{const sub=new Set((essays||[]).map(e=>e.de)),fresh=all.filter(r=>!sub.has(r[0])),pool=fresh.length?fresh:all;const [de,min,max,needs]=pool[Math.floor(Math.random()*pool.length)];G.de={de,min:+min,max:+max,needs:needs.split(',').filter(k=>NEED[k])};G.text='';G.hintOpen=false;G.usedHint=false};
  G.newDe();
  G.view=()=>{
    const D=G.de;
    $app.innerHTML=bar(G.g)+`<div class="board">
      <div class="de"><span class="lbl">Đề bài</span><p>${D.de}</p><p class="req">Đoạn văn từ ${D.min} đến ${D.max} câu, có dùng ít nhất: ${D.needs.map(k=>NEED[k].n.toLowerCase()).join('; ')}.</p></div>
      ${GOIY[D.de]?`<div class="hb"><button class="hint-btn${G.hintOpen?' on':''}" data-act="hint" aria-expanded="${G.hintOpen}">💡 ${G.hintOpen?'Ẩn gợi ý dàn bài':'Gợi ý dàn bài'}</button></div>${G.hintOpen?hintHtml(D):''}`:''}
      <label class="ask" for="essay">Bài làm của bé:</label>
      <textarea id="essay" spellcheck="false" placeholder="Bắt đầu viết đoạn văn ở đây…">${esc(G.text)}</textarea>
      <div class="actions"><button class="primary" data-act="submit">Nộp bài</button><button class="ghost" data-act="newde">Đổi đề khác</button></div>
      <div id="result"></div><div id="aibox"></div>
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
// gợi ý dàn bài: câu hỏi dẫn ý (không có bài mẫu); nhãn yêu cầu chỉ hiện khi đề cần; Nâng cao không hiện từ ngữ gợi ý
function hintHtml(D){
  const g=GOIY[D.de],[mo,ket]=GOIY_MAU[g[0]],nc=/-(nc|tt)$/.test(G.g.id),NL={tn:'trạng ngữ',gh:'kết từ',ss:'so sánh',lk:'từ nối'};
  const q=t=>{const used=[];const txt=t.replace(/\{s\}/g,g[1]).replace(/\s*\[(tn|gh|ss|lk)\]/g,(m,k)=>{if(D.needs.includes(k))used.push(k);return ''});return `<li>${esc(txt)}${used.map(k=>`<span class="need n-${k}">${NL[k]}</span>`).join('')}</li>`};
  const a=Math.max(1,D.min-2),b=Math.max(a,D.max-2);
  return `<div class="hint"><p class="ht">💡 Dàn bài gợi ý</p>
    <div class="hstep"><span class="htag t1">Mở đoạn<br>1 câu</span><ul>${q(mo)}</ul></div>
    <div class="hstep"><span class="htag t2">Thân đoạn<br>${a===b?a:a+'–'+b} câu</span><ul>${g[2].map(q).join('')}</ul></div>
    <div class="hstep"><span class="htag t3">Kết đoạn<br>1 câu</span><ul>${q(ket)}</ul></div>
    ${nc?'':`<div class="hwords"><b>Từ ngữ có thể dùng:</b> ${g[3].map(w=>`<span class="hchip">${esc(w)}</span>`).join('')}</div>`}
    <p class="fine">Gợi ý chỉ là câu hỏi dẫn ý, không có bài mẫu để chép. Em tự trả lời bằng câu văn của mình nhé.</p></div>`;
}
// Cô Chấm AI: chấm nội dung sau khi bài đã lưu
function aiHtml(ai,gain,note){
  const v=n=>String(n).replace('.',','),row=(t,n,m)=>`<span>${t}<span class="aibar"><i style="width:${Math.round(n/m*100)}%"></i></span></span><b>${v(n)}/${m}</b>`;
  const lv=ai.score>=9?'Giỏi':ai.score>=7?'Khá':ai.score>=5?'Đạt':'Cần cố gắng';
  return `<div class="aibox"><div class="aihd"><span class="ailbl">🤖 Cô Chấm AI nhận xét</span><span class="aipill">${lv}${gain?' · +'+gain+' xu':''}</span></div>
    <div class="aiscore">${v(ai.score)} <small>/ 10 điểm nội dung</small></div>
    <div class="aicrit">${row('Đúng đề, đủ ý',ai.dung_de,3)}${row('Câu văn, từ ngữ gợi tả',ai.cau_van,3)}${row('Liên kết, trình tự',ai.lien_ket,2)}${row('Chính tả, dấu câu',ai.chinh_ta,2)}</div>
    ${ai.tong?`<p class="aitong">${esc(ai.tong)}</p>`:''}
    <div class="aitwo"><div class="aiok"><b>👍 Em làm tốt</b><ul>${ai.tot.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
    <div class="aifix"><b>✏️ Em sửa thêm</b><ul>${ai.sua.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>Bài viết tốt rồi!</li>'}</ul></div></div>
    ${ai.loi.length?`<div class="ailoi"><b>Chính tả:</b> ${ai.loi.map(l=>`<span><s>${esc(l.sai)}</s> → ${esc(l.dung)}</span>`).join(' · ')}</div>`:''}
    <p class="fine">${note?note+' ':''}Cô Chấm AI chỉ gợi ý chỗ sửa, không viết lại bài thay em. Điểm do AI chấm có thể chưa chính xác, bố mẹ hoặc thầy cô có thể xem lại.</p></div>`;
}
async function aiGradeThi(de,text){
  const el=()=>document.getElementById('aibox');if(!el())return;
  el().innerHTML='<div class="aibox aiwait">🤖 Cô Chấm AI đang đọc bài của em…</div>';
  const D=G.de,yc=`Từ ${D.min} đến ${D.max} câu; dùng: ${D.needs.map(k=>NEED[k].n.toLowerCase()).join(', ')}`;
  try{const d=await call('grade',{game:G.g.id,de,text,yc});if(d.xu){xu=d.xu;renderTotal()}
    if(d.gain)toast(d.gain,'Cô Chấm AI: '+String(d.ai.score).replace('.',',')+' điểm');
    if(el())el().innerHTML=aiHtml(d.ai,d.gain,d.again?'Bài này cô đã chấm rồi, đây là kết quả lần trước.':d.left!=null?`Đề này em còn ${d.left} lần nhờ cô chấm.`:'');
    const i=(essays||[]).findIndex(e=>e.de===de&&e.text===text);if(i>=0){essays[i]={...essays[i],ai:d.ai};renderEssays()}
  }catch(e){if(el())el().innerHTML=`<div class="aibox aiwait">🤖 ${esc(e.message)}</div>`}
}
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
  const sDe=G.de.de,sText=G.text;if(document.getElementById('aibox'))document.getElementById('aibox').innerHTML='';
  saveRound(G.g.id,st,isStudent()?{de:sDe,text:sText,hint:!!G.usedHint}:undefined).then(r=>{if(isStudent()&&r)aiGradeThi(sDe,sText);const el=document.getElementById('xusum');if(el)el.innerHTML=(r&&r.jarOpened!=null&&(r.bonus||[]).some(b=>b[0]==='Thưởng mở hũ')?`<div class="jar-open"><b>🎉 Hũ đã mở!</b><span>+${vn(r.jarOpened)} xu từ hũ · +50 xu thưởng mở hũ. Từ giờ đến hết ngày, xu cộng thẳng vào tài khoản.</span></div>`:'')+xuSumHtml(lines,delta,r);if(r&&(r.bonus||[]).some(b=>b[0]==='Thưởng mở hũ'))toast(r.jarOpened+50,'🎉 Hũ đã mở','badge')});
}
function renderEssays(){
  const el=document.getElementById('essays');if(!el)return;
  if(!isStudent()){el.innerHTML='';return}
  el.innerHTML=essays.length?`<div class="panel"><h3>Bài đã nộp (${essays.length})</h3>${essays.map(e=>`<details class="essay"${e.comment?' open':''}><summary>${stars(e.stars||0)} <span>${esc(new Date(e.at).toLocaleDateString('vi-VN'))} · ${esc(e.de)}</span>${e.ai?`<span class="badge soft">AI ${String(e.ai.score).replace('.',',')}/10</span>`:''}${e.comment?'<span class="badge soft">có nhận xét</span>':''}</summary><p>${esc(e.text)}</p>${e.ai?aiHtml(e.ai,0,''):''}${e.comment?`<div class="msg info"><b>${esc(e.commentBy||'Thầy cô')}:</b><span>${esc(e.comment)}</span></div>`:''}</details>`).join('')}</div>`:'';
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
    else{G.miss[j]=true;G.placed[j]=true;G.total++;G.sel=null;G.shake=k;G.msg={k:'bad',t:`“${p.w}” không phải ${WK[k].n.toLowerCase()}, mà là ${WK[p.k].n.toLowerCase()}. ${WK[p.k].h}`}}
    render();
  };
  G.onNext=()=>{G.i++;reset()};
};

/* ---------- Một từ, nhiều nghĩa ---------- */
const hl=s=>s.replace(/\*([^*]+)\*/g,'<span class="nhu">$1</span>');
BUILD['nhieu-nghia']=()=>{
  const all=qbank('nhieu-nghia'),sets=all.filter(s=>!s.startsWith('P|')),pairs=all.filter(s=>s.startsWith('P|')),qs=[];
  // mỗi lượt: 4 từ, mỗi từ chỉ hỏi 1 câu (không hỏi liền nghĩa gốc rồi nghĩa chuyển của cùng một từ)
  pickNew(sets,4,s=>all.indexOf(s)).forEach(s=>{const [w,gloss,...ss]=s.split('|');shuffle(ss).slice(0,1).forEach(x=>{const [sent,a]=x.split('=');
    qs.push({intro:`<p class="ask">Từ <b>“${w}”</b> trong câu dưới đây mang nghĩa gốc hay nghĩa chuyển?</p>`,
      options:[opt('Nghĩa gốc',a==='g',a==='g'?`Đây là nghĩa gốc của “${w}”: ${gloss}.`:`Nghĩa gốc của “${w}” là ${gloss}. Ở câu này, từ đã chuyển sang chỉ sự vật khác có nét giống.`),
               opt('Nghĩa chuyển',a==='c',a==='c'?`Đây là nghĩa chuyển: từ nghĩa gốc (${gloss}) chuyển sang chỉ sự vật khác có nét giống.`:`Ở câu này, “${w}” dùng đúng nghĩa gốc: ${gloss}.`)],
      view:()=>hl(sent),key:all.indexOf(s)})})});
  pickNew(pairs,2,s=>all.indexOf(s)).forEach(s=>{const [,two,a,why]=s.split('|');
    qs.push({intro:'<p class="ask">Hai từ được tô màu là từ nhiều nghĩa hay từ đồng âm?</p>',
      options:[opt('Từ nhiều nghĩa',a==='nn',a==='nn'?why:'Thử nghĩ: hai nghĩa này có liên quan gì với nhau không?'),opt('Từ đồng âm',a==='da',a==='da'?why:'Hai nghĩa này có nét liên quan với nhau, hãy nghĩ lại.')],
      view:()=>two.split(' / ').map(hl).join('<br>'),key:all.indexOf(s)})});
  G.qs=shuffle(qs);resetQuiz();
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
      else{G.bad.push(c);G.total+=(G.got.s?0:1)+(G.got.a?0:1);G.got.s=G.got.a=true;G.missed=false;G.shake=j;G.msg={k:'bad',t:`“${c}” không đồng nghĩa, cũng không trái nghĩa với “${it.w}”. Đáp án: đồng nghĩa “${it.s}”, trái nghĩa “${it.a}”.`}}
    }else{
      if(c===it.ans){G.got.t=true;G.total++;if(!G.missed)G.correct++;G.msg={k:'ok',t:it.why[c]}}
      else{G.bad.push(c);G.got.t=true;G.total++;G.missed=false;G.shake=j;G.msg={k:'bad',t:`${it.why[c]} Từ đúng: “${it.ans}”.`}}
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
      else{G.missed=true;G.ph=1;G.tried=[];G.shake=j;G.msg={k:'bad',t:`Chữ “${t.x.replace(/[.,!?;:]+$/,'')}” viết đúng rồi. Chữ viết sai là “${it.wrong}”. Giờ chọn cách viết đúng.`}}
      return render();
    }
    if(G.ph===1&&d.o!=null){const o=it.opts[+d.o];
      if(o===it.right){G.ph=2;G.total++;if(!G.missed)G.correct++;G.msg={k:'ok',t:`Viết đúng là “${it.right}”. ${it.tip}`}}
      else{G.ph=2;G.total++;G.missed=false;G.shake='o'+d.o;G.msg={k:'bad',t:`“${o}” chưa đúng. Viết đúng là “${it.right}”. ${it.tip}`}}
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
      else{G.total++;G.missed=false;G.tried=[];G.k++;G.shake=1;G.msg={k:'bad',t:`Chỗ này cần dấu “${want}”, không phải “${d.m}”. ${MHINT[want]}`}}
      return render();
    }
    if(d.kind){const want=it.kind;
      if(d.kind===want){G.kdone=true;G.total++;if(!G.missed)G.correct++;G.missed=false;G.msg={k:'ok',t:KIEU[want][1]}}
      else{G.kdone=true;G.total++;G.missed=false;G.msg={k:'bad',t:`Chưa phải ${KIEU[d.kind][0].toLowerCase()}. Đây là ${KIEU[want][0].toLowerCase()}: ${KIEU[want][1]}`}}
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
  G.qs=qs;resetQuiz();addTL('doc-hieu',true);
};

/* ---------- Bảng theo dõi: thầy cô, Admin, phụ huynh ---------- */
let DASH=null,TAB='hs';
const ENG_APP='https://english-exam-web-roan.vercel.app';
// ---------- Tiền chấm AI (admin): số dư gốc nhập ở app tiếng Anh, trừ chi phí AI của cả hai app
const usd=(n,d=2)=>'$'+(n||0).toFixed(d).replace('.',',');
const aiLevel=c=>!c||!c.on?'':c.noCredit?'bad':c.left!=null&&c.left<c.warn?'low':'';
function aiPill(){if(!me||me.role!=='admin')return '';const c=DASH&&DASH.aicredit;if(!c||!c.on)return '';const l=aiLevel(c);return `<button class="aip ${l}" data-act="d-ai" title="Tiền chấm AI (dùng chung với app tiếng Anh)">🤖 AI ${c.noCredit?'$0':c.left==null?'?':usd(c.left)}</button>`}
function aiBanner(){const c=DASH&&DASH.aicredit,l=aiLevel(c);if(!l)return '';
  return l==='bad'?'<div class="aiban bad">⛔ Hết tiền chấm AI: Cô Chấm AI đang tạm dừng (gợi ý dàn bài vẫn dùng được). Nạp thêm ở console.anthropic.com rồi nhập số dư mới ở app tiếng Anh.</div>'
  :`<div class="aiban low">⚠️ Tiền chấm AI sắp hết: còn ${usd(c.left)} (khoảng ${Math.floor(c.left/c.per)} bài Đảo Câu Văn). Nạp thêm ở console.anthropic.com rồi nhập số dư mới ở app tiếng Anh.</div>`}
function aiCard(){const c=DASH&&DASH.aicredit;if(!c)return '';
  if(!c.on)return '<div class="board aic" id="aic"><h3>🤖 Tiền chấm AI</h3><p class="fine">Cô Chấm AI chưa bật: chưa có khóa ANTHROPIC_API_KEY trên Vercel.</p></div>';
  const l=aiLevel(c),d=c.at?new Date(c.at).toLocaleDateString('vi-VN'):'',vnd=n=>'≈ '+(Math.round(n*25000/10)*10).toLocaleString('vi-VN')+'đ';
  return `<div class="board aic" id="aic"><h3>🤖 Tiền chấm AI · dùng chung 2 app</h3>
  ${c.left==null?`<p>Chưa có số dư gốc. Nhập số dư đang hiện ở console.anthropic.com → Billing trong <a href="${ENG_APP}" target="_blank" rel="noopener">app tiếng Anh</a> (Admin → AI credit).</p>`
  :`<p class="aibig ${l}">${c.noCredit?'$0,00':usd(c.left)} <small>≈ ${c.noCredit?0:Math.floor(c.left/c.per)} bài nữa</small></p>
  <div class="aicalc"><span>Số dư gốc (nhập ở app tiếng Anh ngày ${d})</span><b>${usd(c.balance)}</b>
  <span>− App tiếng Anh đã dùng từ hôm đó · ${c.enTests} bài</span><b>−${usd(c.enUsed)}</b>
  <span>− Đảo Câu Văn đã dùng từ hôm đó · ${c.dcvTests} bài</span><b>−${usd(c.dcvUsed)}</b>
  <span class="sum">Còn lại (ước tính)</span><b class="sum ${l}">${usd(c.left)}</b></div>`}
  <div class="aig"><div>Mỗi bài Đảo Câu Văn<b>${usd(c.per,3)}</b>${vnd(c.per)}</div><div>Mỗi bài tiếng Anh<b>${usd(c.enPer,3)}</b>${vnd(c.enPer)}</div><div>Đảo Câu Văn tháng này<b>${usd(c.month)}</b>${c.monthTests} bài</div><div>Cảnh báo khi dưới<b>${usd(c.warn)}</b>đặt ở app tiếng Anh</div></div>
  <p><a class="ghost sm" href="${ENG_APP}" target="_blank" rel="noopener">Nạp thêm? Nhập số dư mới ở app tiếng Anh ↗</a></p>
  <p class="fine">Số dư gốc và mức cảnh báo chỉ nhập ở app tiếng Anh, Đảo Câu Văn chỉ đọc. Hai app cùng trừ chi phí của nhau nên hiện cùng một số. Đây là ước tính theo số token, thỉnh thoảng nhập lại số dư thật trên console cho khớp.</p></div>`}
const islPct=b=>ISLANDS.map((_,k)=>{const gs=GAMES.filter(g=>g.is===k);return {k,got:gs.reduce((a,g)=>a+((b||{})[g.id]||0),0),max:gs.length*3}});
// tổng sao gộp Cơ bản + Nâng cao của mỗi đảo (báo cáo học sinh)
const islPctAll=b=>ISLANDS.map((_,k)=>{const ids=GAMES.filter(g=>g.is===k).flatMap(g=>[g.id,...['-nc','-tt'].filter(x=>bank(g.id+x).length).map(x=>g.id+x)]);return {k,got:ids.reduce((a,id)=>a+((b||{})[id]||0),0),max:ids.length*3}});
const fmtDate=s=>s?new Date(s).toLocaleDateString('vi-VN'):'chưa chơi';
const shortIsl=k=>ISLANDS[k].name.replace('Đảo ','');
async function renderDash(h){
  G=null;
  if(!isStaff()){$app.innerHTML=`<div class="board"><p>Trang này dành cho thầy cô, phụ huynh và Admin. Hãy đăng nhập ở trang chủ.</p><div class="actions"><a class="primary" href="#">Về trang chủ</a></div></div>`;return}
  if(!DASH){$app.innerHTML='<p class="fine">Đang tải bảng theo dõi…</p>';try{DASH=await call('dash');renderTotal()}catch(e){$app.innerHTML=`<div class="board"><p>${esc(e.message)}</p></div>`;return}}
  const S=DASH.students;
  if(h.startsWith('hs-')){const st=S.find(s=>s.code===h.slice(3));if(st)return renderKid(st,{back:me.role!=='parent'||S.length>1,canComment:me.role!=='parent',canGift:true});h='theo-doi'}
  if(me.role==='parent'){if(S.length===1)return renderKid(S[0],{back:false,canComment:false,canGift:true});return listParent(S)}
  const wait=S.reduce((a,s)=>a+s.essays.filter(e=>!e.comment).length,0);
  const pend=S.reduce((a,s)=>a+(s.xu.req||[]).filter(r=>r.status==='pending').length,0);
  const tabs=[['hs','Học sinh'],['bai',`Bài viết chờ nhận xét${wait?` <span class="badge">${wait}</span>`:''}`],['qua',`Đổi quà${pend?` <span class="badge">${pend}</span>`:''}`]].concat(me.role==='admin'?[['ql','Quản lý']]:[]);
  if(TAB==='ql'&&me.role!=='admin')TAB='hs';
  const body=TAB==='hs'?tableStudents(S):TAB==='bai'?essayFeed(S):TAB==='qua'?giftFeed(S):adminPanel(S);
  $app.innerHTML=`<div class="dhead"><h1>Bảng theo dõi</h1><span class="fine">${esc(me.name)} · ${ROLE_VI[me.role]}</span><button class="ghost sm" data-act="d-refresh">Tải lại</button></div>
    ${me.role==='admin'?aiBanner():''}<div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button class="tab${TAB===k?' on':''}" role="tab" aria-selected="${TAB===k}" data-act="d-tab" data-k="${k}">${t}</button>`).join('')}</div>${body}`;
}
// tổng câu đã làm đúng (ngay lần đầu) của mức Cơ bản (nc=false) hoặc Nâng cao (nc=true), không tính thi thử
function lvSum(x,nc){const sv=((x&&x.stats)||{}).solved||{},gs=nc?NCG().filter(g=>g.base!=='thi-thu'):GAMEB();
  const n=gs.reduce((a,g)=>a+bank(g.id).length,0),got=gs.reduce((a,g)=>a+Math.min((sv[g.id]||[]).length,bank(g.id).length),0);return {n,got,p:n?Math.round(got/n*100):0}}
function tableStudents(S){
  const act=S.filter(s=>s.active);
  if(!act.length)return `<div class="board"><p>Chưa có học sinh nào. Thêm học sinh trong <a href="${ENG_APP}" target="_blank" rel="noopener">app tiếng Anh</a>, mã sẽ tự có ở đây.</p></div>`;
  return `<div class="tablewrap"><table class="dt"><thead><tr><th>Học sinh</th>${ISLANDS.map((x,k)=>`<th class="c${k}"><span class="isle-dot"></span>${shortIsl(k)}</th>`).join('')}<th>Sao tổng</th><th>Xu</th><th>Huy hiệu</th><th>Chơi gần nhất</th></tr></thead><tbody>
    ${act.map(s=>{const p=islPctAll(s.best),t=p.reduce((a,x)=>a+x.got,0),tm=p.reduce((a,x)=>a+x.max,0),bl=badgeList(s.xu,s.essays),w=s.essays.filter(e=>!e.comment).length;
      return `<tr class="link" data-act="d-open" data-code="${esc(s.code)}" tabindex="0"><td><b>${esc(s.name)}</b>${w?` <span class="badge" title="Bài chờ nhận xét">${w}</span>`:''}<br><span class="fine">${esc(s.code)}</span></td>${p.map(x=>`<td class="c${x.k}"><div class="pbar"><i style="width:${Math.round(x.got/x.max*100)}%"></i></div><span class="fine"><span class="sy">★</span> ${x.got}/${x.max}</span></td>`).join('')}<td><span class="sy">★</span> <b>${t}</b>/${tm}</td><td>${vn(s.xu.total)}${(s.xu.req||[]).some(r=>r.status==='pending')?' <span class="badge soft">xin quà</span>':''}</td><td><b>${bl.filter(b=>b.ok).length}</b>/${bl.length}</td><td>${fmtDate(s.updated)}</td></tr>`}).join('')}
    </tbody></table></div><p class="fine">Bấm vào một học sinh để xem từng trò chơi, bài thi thử, xu và quà.</p>`;
}
function essayFeed(S){
  const all=[];S.forEach(s=>s.essays.forEach(e=>all.push({s,e})));
  all.sort((x,y)=>(!!x.e.comment-!!y.e.comment)||(x.e.at<y.e.at?1:-1));
  if(!all.length)return '<div class="board"><p>Chưa có bài thi thử nào được nộp.</p></div>';
  return all.map(({s,e})=>essayCard(s,e,true)).join('');
}
function essayCard(s,e,canComment){
  return `<div class="board ecard"><div class="ehead"><b>${esc(s.name)}</b><span class="fine">${esc(s.code)} · ${fmtDate(e.at)}</span>${stars(e.stars||0)}${e.ai?`<span class="badge soft">AI ${String(e.ai.score).replace('.',',')}/10</span>`:''}${e.hint?'<span class="badge soft">có xem gợi ý</span>':''}${e.comment?'':'<span class="badge soft">chờ nhận xét</span>'}</div>
    <p class="de-t">${esc(e.de)}</p><p class="etext">${esc(e.text)}</p>
    ${canComment?`<form class="cform" data-form="comment" data-code="${esc(s.code)}" data-at="${esc(e.at)}"><textarea rows="2" aria-label="Nhận xét" placeholder="Nhận xét cho bài viết, ví dụ: Bài có hình ảnh so sánh đẹp, cần thêm câu kết nêu cảm xúc.">${esc(e.comment)}</textarea>
      <div class="actions"><button class="primary sm" type="submit">${e.comment?'Sửa nhận xét':'Gửi nhận xét'}</button>${me&&me.role==='admin'?`<button class="ghost sm" type="button" data-act="d-delessay" data-code="${esc(s.code)}" data-at="${esc(e.at)}">Xóa bài</button>`:''}<span class="fine saved" role="status"></span></div></form>`
    :(e.comment?`<div class="msg info"><b>${esc(e.commentBy||'Thầy cô')}:</b><span>${esc(e.comment)}</span></div>`:'<p class="fine">Thầy cô chưa nhận xét bài này.</p>')}</div>`;
}
function adminPanel(S){
  return aiCard()+`<div class="board"><p>Thêm, khóa hay xóa học sinh, tài khoản thầy cô và phụ huynh: làm trong <a href="${ENG_APP}" target="_blank" rel="noopener">app tiếng Anh</a>. Thay đổi bên đó có hiệu lực ngay ở đây.</p>
    <div class="tablewrap"><table class="dt"><thead><tr><th>Học sinh</th><th>Link riêng cho phụ huynh</th><th>Dữ liệu trò chơi</th></tr></thead><tbody>
    ${S.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="fine">${esc(s.code)}${s.active?'':' · đang khóa'}</span></td>
      <td>${s.plink?`<button class="ghost sm" data-act="d-copy" data-link="${esc(location.origin+location.pathname+'?p='+s.plink)}">Sao chép link</button>`:'<span class="fine">Chưa có. Tạo link phụ huynh trong app tiếng Anh.</span>'}</td>
      <td><button class="ghost sm" data-act="d-reset" data-code="${esc(s.code)}">Xóa tiến độ</button></td></tr>`).join('')}</tbody></table></div>
    <p class="fine">Link riêng dùng chung mã bí mật với link phụ huynh của app tiếng Anh: tắt hoặc đổi link bên đó thì link ở đây cũng đổi theo.</p></div>`;
}
function listParent(S){
  $app.innerHTML=`<div class="dhead"><h1>Báo cáo của các con</h1><span class="fine">${esc(me.name)} · Phụ huynh</span></div>
    <div class="islands">${S.map(s=>{const P=islPctAll(s.best),t=P.reduce((a,x)=>a+x.got,0),tm=P.reduce((a,x)=>a+x.max,0);return `<a class="island" href="#hs-${esc(s.code)}"><h3>${esc(s.name)}</h3><p>Mã ${esc(s.code)} · ★ ${t}/${tm} sao · chơi gần nhất: ${fmtDate(s.updated)}</p></a>`}).join('')||'<p>Chưa có con nào được gắn với tài khoản này.</p>'}</div>`;
}
function renderKid(st,o){
  G=null;
  const p=islPct(st.best),t=p.reduce((a,x)=>a+x.got,0),weak=GAMES.filter(g=>(st.best[g.id]||0)<2).map(g=>g.name),ncAll=NCG(),ncOk=ncAll.filter(g=>(st.best[g.id]||0)>=2).length;
  $app.innerHTML=`${o.back?'<div class="bar"><a class="back" href="#theo-doi">← Bảng theo dõi</a></div>':''}${o.top||''}
    <div class="board"><div class="dhead"><h1>Báo cáo của ${esc(st.name)}</h1><span class="fine">Mã ${esc(st.code)} · chơi gần nhất: ${fmtDate(st.updated)} · <span class="sy">★</span> ${islPctAll(st.best).reduce((a,x)=>a+x.got,0)}/${islPctAll(st.best).reduce((a,x)=>a+x.max,0)} sao</span></div>
      <p class="lvsum">Câu đã làm đúng: <b>Cơ bản ${(q=>`${vn(q.got)}/${vn(q.n)} (${q.p}%)`)(lvSum(st.xu,false))}</b> · <b>Nâng cao ${(q=>`${vn(q.got)}/${vn(q.n)} (${q.p}%)`)(lvSum(st.xu,true))}</b></p>
      <div class="isl-sum">${islPctAll(st.best).map(x=>`<span class="isl-tag c${x.k}">${islIco(x.k)}${shortIsl(x.k)} <span class="sy" aria-hidden="true">★</span> ${x.got}/${x.max} sao</span>`).join('')}</div>
      ${weak.length?`<div class="msg weak"><b>Cơ bản chưa đạt 2 sao:</b><span>${weak.join(', ')}.</span></div>`:'<div class="msg ok"><b>Cơ bản:</b><span>Bé đã đạt từ 2 sao trở lên ở mọi trò chơi.</span></div>'}<div class="msg ${ncOk===ncAll.length?'ok':'info'}"><b>Nâng cao:</b><span>${ncOk}/${ncAll.length} trò đạt từ 2 sao.</span></div>
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
// ---------- Bộ icon: 5 đảo, 5 bậc huy hiệu đảo, Vua Đảo Câu Văn (quần đảo), Huyền thoại (sao có cánh)
const ISL_BG=['#E6F1FB','#EAF3DE','#EEEDFE','#FAEEDA','#FBEAF0'],ISL_DK=['#185FA5','#3B6D11','#534AB7','#854F0B','#993556'];
const ISL_ART=[
 '<rect x="13" y="18" width="14" height="6" rx="3" fill="#0C447C"/><rect x="13" y="29" width="24" height="6" rx="3" fill="#185FA5"/><rect x="13" y="40" width="34" height="6" rx="3" fill="#378ADD"/><path d="M43 20 L51 20 M47 16 L51 20 L47 24" stroke="#0C447C" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 '<rect x="9" y="24" width="26" height="16" rx="8" fill="none" stroke="#3B6D11" stroke-width="5"/><rect x="29" y="24" width="26" height="16" rx="8" fill="none" stroke="#639922" stroke-width="5"/>',
 '<path d="M16 50 L38 28" stroke="#3C3489" stroke-width="6" stroke-linecap="round"/><path d="M38 28 L41 25" stroke="#EF9F27" stroke-width="6" stroke-linecap="round"/><path d="M45 10 L47.5 16.5 L54 19 L47.5 21.5 L45 28 L42.5 21.5 L36 19 L42.5 16.5 Z" fill="#EF9F27"/><circle cx="24" cy="18" r="2.5" fill="#7F77DD"/><circle cx="52" cy="38" r="2" fill="#7F77DD"/>',
 '<path d="M32 20 C26 15 17 15 11 17 L11 47 C17 45 26 45 32 50 Z" fill="#FAC775"/><path d="M32 20 C38 15 47 15 53 17 L53 47 C47 45 38 45 32 50 Z" fill="#EF9F27"/><path d="M32 20 L32 50" stroke="#854F0B" stroke-width="2"/><text x="21" y="38" font-size="11" font-weight="700" fill="#633806" text-anchor="middle" font-family="sans-serif">Aa</text>',
 '<rect x="12" y="12" width="30" height="40" rx="4" fill="#F4C0D1"/><path d="M18 22 H36 M18 29 H36 M18 36 H30" stroke="#993556" stroke-width="2.5" stroke-linecap="round"/><path d="M50 22 L34 46 L31 52 L37 48 L53 24 Z" fill="#D4537E"/><path d="M50 22 L53 24" stroke="#72243E" stroke-width="3"/>'];
const TIER_ART={
 'isl-1':'<path d="M14 36 C14 24 50 24 50 36 Z" fill="#F1EFE8"/><rect x="12" y="36" width="40" height="6" rx="3" fill="#185FA5"/><path d="M20 30 H44" stroke="#378ADD" stroke-width="3"/><path d="M38 42 L44 52 M42 42 L50 50" stroke="#85B7EB" stroke-width="3" stroke-linecap="round"/>',
 'isl-3':'<circle cx="32" cy="32" r="18" fill="#F1EFE8" stroke="#BA7517" stroke-width="3"/><path d="M32 16 L37 32 L32 48 L27 32 Z" fill="#E24B4A"/><path d="M32 32 L37 32 L32 48 L27 32 Z" fill="#888780"/><circle cx="32" cy="32" r="2.5" fill="#2C2C2A"/>',
 'isl-2':'<path d="M12 18 L24 14 L40 18 L52 14 L52 46 L40 50 L24 46 L12 50 Z" fill="#FAC775"/><path d="M24 14 V46 M40 18 V50" stroke="#BA7517" stroke-width="1.5"/><path d="M18 40 C24 34 28 38 32 30" stroke="#854F0B" stroke-width="2" stroke-dasharray="3 3" fill="none"/><path d="M38 24 L46 32 M46 24 L38 32" stroke="#E24B4A" stroke-width="3.5" stroke-linecap="round"/>',
 'nisl-1':'<path d="M14 40 L46 20" stroke="#BA7517" stroke-width="9" stroke-linecap="round"/><path d="M40 24 L50 18" stroke="#FAC775" stroke-width="11" stroke-linecap="round"/><path d="M14 40 L20 36" stroke="#854F0B" stroke-width="7" stroke-linecap="round"/><path d="M30 34 L26 50 M30 34 L36 50" stroke="#D3D1C7" stroke-width="3" stroke-linecap="round"/>',
 'nisl-3':'<circle cx="32" cy="32" r="14" fill="none" stroke="#FAC775" stroke-width="5"/><g stroke="#FAC775" stroke-width="4" stroke-linecap="round"><path d="M32 10V54M10 32H54M16 16L48 48M48 16L16 48"/></g><circle cx="32" cy="32" r="5" fill="#BA7517"/>',
 'lisl-1':'<path d="M8 48 C16 40 48 40 56 48 C48 54 16 54 8 48 Z" fill="#FAC775"/><path d="M30 44 V12" stroke="#F1EFE8" stroke-width="2.5"/><path d="M30 12 L48 18 L30 24 Z" fill="#E24B4A"/><path d="M34 22 L36 18 L39 21 L42 17 L44 22 Z" fill="#FAC775"/>',
 'lisl-3':'<path d="M4 50 C12 44 18 54 26 48 C34 42 40 54 48 48 C54 44 58 48 60 50 L60 60 L4 60 Z" fill="#185FA5"/><path d="M16 50 C14 36 22 26 32 22 C38 20 44 22 46 16" stroke="#1D9E75" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M42 18 C44 10 54 10 56 16 C57 20 53 22 48 21 Z" fill="#1D9E75"/><path d="M48 21 L58 24 L50 25 Z" fill="#FAC775"/><circle cx="51" cy="15" r="2" fill="#FAC775"/><path d="M22 30 L16 26 M26 26 L22 20 M30 23 L28 17" stroke="#5DCAA5" stroke-width="3" stroke-linecap="round"/>',
 'lisl-2':'<path d="M6 50 C14 44 18 54 26 48 C34 42 38 54 46 48 C52 44 56 48 58 50 L58 58 L6 58 Z" fill="#378ADD"/><path d="M32 50 V18" stroke="#FAC775" stroke-width="4" stroke-linecap="round"/><path d="M20 12 V22 C20 28 44 28 44 22 V12 M32 10 V22" stroke="#FAC775" stroke-width="4" fill="none" stroke-linecap="round"/>',
 'nisl-2':'<path d="M10 38 C14 22 50 22 54 38 Z" fill="#2C2C2A"/><rect x="10" y="38" width="44" height="6" rx="3" fill="#2C2C2A"/><path d="M12 40 H52" stroke="#FAC775" stroke-width="2"/><path d="M32 24 L34 29 L39 29 L35 32 L36.5 37 L32 34 L27.5 37 L29 32 L25 29 L30 29 Z" fill="#FAC775"/>',
 king:'<circle cx="32" cy="32" r="22" fill="none" stroke="#85B7EB" stroke-width="1.5" stroke-dasharray="3 3"/><ellipse cx="32" cy="11" rx="7" ry="4" fill="#378ADD"/><ellipse cx="52" cy="25" rx="7" ry="4" fill="#639922"/><ellipse cx="45" cy="49" rx="7" ry="4" fill="#7F77DD"/><ellipse cx="19" cy="49" rx="7" ry="4" fill="#EF9F27"/><ellipse cx="12" cy="25" rx="7" ry="4" fill="#D4537E"/><path d="M32 20 L35.5 28.5 L44.5 28.5 L37.5 34 L40 43 L32 37.5 L24 43 L26.5 34 L19.5 28.5 L28.5 28.5 Z" fill="#FAC775" stroke="#EF9F27" stroke-width="1.5" stroke-linejoin="round"/>',
 god:'<path d="M4 50 C12 42 18 54 26 46 C34 38 40 54 48 46 C54 40 58 46 60 48 L60 60 L4 60 Z" fill="#185FA5"/><path d="M32 52 V20" stroke="#FAC775" stroke-width="4" stroke-linecap="round"/><path d="M20 14 V24 C20 30 44 30 44 24 V14 M32 12 V24" stroke="#FAC775" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M22 10 L26 4 L32 9 L38 4 L42 10 Z" fill="#E24B4A" stroke="#FAC775" stroke-width="1.5"/>',
 legend:'<path d="M8 30 C16 22 22 24 26 30 C22 30 16 32 12 38 Z M56 30 C48 22 42 24 38 30 C42 30 48 32 52 38 Z" fill="#AFA9EC"/><path d="M32 12 L37 25 L51 25 L40 33 L44 47 L32 39 L20 47 L24 33 L13 25 L27 25 Z" fill="#FAC775" stroke="#EF9F27" stroke-width="2" stroke-linejoin="round"/>'};
const FLAME_ART=(a,b)=>`<path d="M32 54 C20 54 15 45 17 36 C19 29 25 26 26 18 C31 23 32 28 31 33 C35 30 38 25 38 20 C46 27 49 36 47 43 C45 50 39 54 32 54 Z" fill="${a}"/><path d="M32 54 C26 54 23 49 25 44 C27 40 30 38 31 34 C35 38 39 42 38 47 C37 51 35 54 32 54 Z" fill="${b}"/>`;
const CAL=(c1,c2,c3,n,fs)=>`<rect x="15" y="17" width="34" height="32" rx="5" fill="${c1}"/><rect x="15" y="17" width="34" height="9" rx="4" fill="${c2}"/><rect x="22" y="13" width="4" height="8" rx="2" fill="${c3}"/><rect x="38" y="13" width="4" height="8" rx="2" fill="${c3}"/><text x="32" y="44" font-size="${fs}" font-weight="700" fill="${c3}" text-anchor="middle" font-family="sans-serif">${n}</text>`;
const OTHER_ICO={
 streak10:['#4A1B0C','<path d="M32 46 C24 46 21 40 23 34 C24 30 27 28 28 24 C31 28 31 31 30 34 C33 32 35 29 35 26 C40 30 42 36 40 40 C38 44 35 46 32 46 Z" fill="#EF9F27"/><path d="M32 46 C29 46 27 43 28 40 C29 38 31 37 32 35 C34 38 36 40 35 43 C34 45 33 46 32 46 Z" fill="#FAC775"/>'],
 streak20:['#4A1B0C',FLAME_ART('#D85A30','#EF9F27')],
 streak30:['#26215C',FLAME_ART('#7F77DD','#85B7EB')+'<path d="M48 12 L49.5 16 L53.5 17.5 L49.5 19 L48 23 L46.5 19 L42.5 17.5 L46.5 16 Z" fill="#FAC775"/>'],
 perfect5:['#04342C','<path d="M8 32 C16 20 48 20 56 32 C48 44 16 44 8 32 Z" fill="#E1F5EE"/><circle cx="32" cy="32" r="9" fill="#E24B4A"/><circle cx="32" cy="32" r="5" fill="#E1F5EE"/><circle cx="32" cy="32" r="2" fill="#E24B4A"/>'],
 perfect10:['#04342C','<path d="M22 10 C40 18 40 46 22 54" stroke="#BA7517" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M22 10 L22 54" stroke="#F1EFE8" stroke-width="1.5"/><path d="M22 32 L52 32" stroke="#D3D1C7" stroke-width="3" stroke-linecap="round"/><path d="M52 32 L45 27 M52 32 L45 37" stroke="#D3D1C7" stroke-width="3" stroke-linecap="round"/>'],
 perfect20:['#04342C','<circle cx="30" cy="34" r="17" fill="#E1F5EE"/><circle cx="30" cy="34" r="11" fill="#E24B4A"/><circle cx="30" cy="34" r="5" fill="#E1F5EE"/><path d="M30 34 L50 14" stroke="#412402" stroke-width="3" stroke-linecap="round"/><path d="M46 12 L52 12 L52 18" stroke="#1D9E75" stroke-width="3" fill="none" stroke-linecap="round"/>'],
 perfect35:['#04342C','<circle cx="30" cy="36" r="16" fill="#E1F5EE"/><circle cx="30" cy="36" r="10" fill="#E24B4A"/><circle cx="30" cy="36" r="4" fill="#E1F5EE"/><g stroke="#412402" stroke-width="2.5" stroke-linecap="round"><path d="M30 36 L50 12"/><path d="M28 34 L44 10"/><path d="M32 38 L54 20"/></g><g stroke="#1D9E75" stroke-width="2.5" stroke-linecap="round"><path d="M48 10 L52 10 L52 14"/><path d="M42 8 L46 8 L46 12"/><path d="M52 18 L56 18 L56 22"/></g>'],
 perfect50:['#412402','<g stroke="#FAC775" stroke-width="2" stroke-linecap="round"><path d="M32 4V9M32 55V60M4 32H9M55 32H60M12 12L15 15M52 12L49 15M12 52L15 49M52 52L49 49"/></g><circle cx="32" cy="32" r="18" fill="#FAEEDA"/><circle cx="32" cy="32" r="12" fill="#EF9F27"/><circle cx="32" cy="32" r="6" fill="#FAC775"/><circle cx="32" cy="32" r="2.5" fill="#E24B4A"/>'],
 perfect100:['#4A1B0C','<path d="M10 24 C16 18 22 20 24 26 C18 26 14 28 12 34 Z M10 44 C16 50 22 48 24 42 C18 42 14 40 12 34 Z" fill="#F0997B"/><path d="M14 34 L52 34" stroke="#FAC775" stroke-width="4" stroke-linecap="round"/><path d="M56 34 L46 27 L46 41 Z" fill="#FAC775"/><path d="M40 34 C44 24 50 22 52 16 C54 24 58 28 56 34" fill="#EF9F27"/><path d="M42 34 C45 28 49 27 50 23 C52 28 54 30 53 34" fill="#E24B4A"/>'],
 days7:['#042C53',CAL('#E6F1FB','#378ADD','#0C447C',7,15)],
 days30:['#412402',CAL('#FAEEDA','#EF9F27','#854F0B',30,14)],
 write5:['#4B1528','<path d="M42 16 L48 22 L26 44 L20 38 Z" fill="#FAC775"/><path d="M20 38 L26 44 L16 48 Z" fill="#F1EFE8"/><path d="M16 48 L18 46" stroke="#2C2C2A" stroke-width="2"/><path d="M42 16 L48 22 L51 19 L45 13 Z" fill="#ED93B1"/>'],
 write2s:['#4B1528','<path d="M42 16 L48 22 L26 44 L20 38 Z" fill="#EF9F27"/><path d="M20 38 L26 44 L16 48 Z" fill="#F1EFE8"/><path d="M42 16 L48 22 L51 19 L45 13 Z" fill="#ED93B1"/><path d="M18 20 L20 15 L22 20 L27 22 L22 24 L20 29 L18 24 L13 22 Z" fill="#FAC775"/>'],
 write3s:['#4B1528','<path d="M42 16 L48 22 L26 44 L20 38 Z" fill="#D4537E"/><path d="M20 38 L26 44 L16 48 Z" fill="#F1EFE8"/><path d="M42 16 L48 22 L51 19 L45 13 Z" fill="#FAC775"/><path d="M12 30 C18 24 22 18 26 12 M30 52 C36 48 42 46 52 42" stroke="#FAC775" stroke-width="2.5" stroke-linecap="round" fill="none" stroke-dasharray="1 5"/><path d="M50 32 L51.5 36 L55.5 37.5 L51.5 39 L50 43 L48.5 39 L44.5 37.5 L48.5 36 Z" fill="#FAC775"/>'],
 writeN5:['#26215C','<path d="M32 22 C26 17 17 17 11 19 L11 47 C17 45 26 45 32 50 Z" fill="#EEEDFE"/><path d="M32 22 C38 17 47 17 53 19 L53 47 C47 45 38 45 32 50 Z" fill="#CECBF6"/><path d="M16 26 H27 M16 32 H27 M37 26 H48 M37 32 H48" stroke="#7F77DD" stroke-width="2" stroke-linecap="round"/>'],
 writeN10:['#26215C','<path d="M32 26 C26 21 17 21 11 23 L11 51 C17 49 26 49 32 54 Z" fill="#EEEDFE"/><path d="M32 26 C38 21 47 21 53 23 L53 51 C47 49 38 49 32 54 Z" fill="#CECBF6"/><path d="M32 20 C26 14 18 16 18 22 C18 27 24 30 32 36 C40 30 46 27 46 22 C46 16 38 14 32 20 Z" fill="#E24B4A"/>'],
 writeL10:['#042C53','<path d="M48 10 C38 14 30 24 26 40 L30 42 C36 28 42 20 48 10 Z" fill="#E6F1FB"/><path d="M26 40 L24 48 L30 42 Z" fill="#2C2C2A"/><rect x="14" y="46" width="16" height="10" rx="3" fill="#185FA5"/><rect x="17" y="43" width="10" height="4" rx="1" fill="#0C447C"/>'],
 writeL20:['#042C53','<path d="M14 46 C10 36 12 26 18 18 M50 46 C54 36 52 26 46 18" stroke="#5DCAA5" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 12 C34 16 28 26 26 42 L30 43 C34 30 38 22 42 12 Z" fill="#E6F1FB"/><path d="M26 42 L25 50 L30 43 Z" fill="#2C2C2A"/>'],
 writeL35:['#412402','<path d="M14 46 C10 36 12 26 18 18 M50 46 C54 36 52 26 46 18" stroke="#EF9F27" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M42 12 C34 16 28 26 26 42 L30 43 C34 30 38 22 42 12 Z" fill="#FAC775"/><path d="M26 42 L25 50 L30 43 Z" fill="#854F0B"/><rect x="22" y="50" width="20" height="5" rx="2" fill="#EF9F27"/>'],
 writeN20:['#26215C','<rect x="17" y="18" width="30" height="36" rx="3" fill="#7F77DD"/><rect x="17" y="18" width="5" height="36" fill="#534AB7"/><path d="M34.5 26 L37 32 L43 32.5 L38.5 36.5 L40 42.5 L34.5 39 L29 42.5 L30.5 36.5 L26 32.5 L32 32 Z" fill="#FAC775"/><path d="M14 12 L16 16 M50 12 L48 16 M32 6 V11" stroke="#FAC775" stroke-width="2.5" stroke-linecap="round"/>']};
const svgIco=(bg,art,cls)=>`<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="${bg}"/>${art}</svg>`;
const islIco=(k,cls='isl-ico')=>svgIco(ISL_BG[k],ISL_ART[k],cls);
// icon riêng cho huy hiệu đảo và tối thượng; các huy hiệu khác giữ huy chương / ổ khóa
function badgeIco(b){const m=/^([nl]?isl)(\d)-(\d)$/.exec(b.id);
  if(m)return svgIco(ISL_DK[+m[2]],TIER_ART[m[1]+'-'+m[3]],'bico');
  if(b.id==='king')return svgIco('#0C447C',TIER_ART.king,'bico');
  if(b.id==='legend')return svgIco('#26215C',TIER_ART.legend,'bico');
  if(b.id==='god')return svgIco('#042C53',TIER_ART.god,'bico');
  if(OTHER_ICO[b.id])return svgIco(OTHER_ICO[b.id][0],OTHER_ICO[b.id][1],'bico');
  return '';}
const MEDAL='<svg class="medal-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2h8l-2.5 6h-3z"/><circle cx="12" cy="15" r="6"/></svg>';
const LOCK='<svg class="medal-ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const TIERS=[['dong','Đồng',.4],['bac','Bạc',.7],['vang','Vàng',1]];
// chuỗi bậc Nâng cao tiếp nối Đồng–Bạc–Vàng: id vẫn là <trò>-nc-dong/bac/vang
const NTIERS=[['dong','Titan',.4,'titan'],['bac','Platinum',.7,'plat'],['vang','Emerald',1,'emer']];
// Thử thách tiếp nối: Sapphire–Ruby–Diamond, id <trò>-tt-dong/bac/vang
const LTIERS=[['dong','Sapphire',.4,'saph'],['bac','Ruby',.7,'ruby'],['vang','Diamond',1,'kc']];
const GAMEB=()=>GAMES.filter(g=>g.id!=='thi-thu');
function badgeList(x,ess){
  const st=(x&&x.stats)||{},sv=st.solved||{},E=ess||[],out=[];
  for(const g of GAMEB()){const n=bank(g.id).length,got=(sv[g.id]||[]).length;
    TIERS.forEach(([k,name,p])=>{const need=Math.ceil(n*p);out.push({id:g.id+'-'+k,grp:'Bộ câu hỏi',tier:k,isl:g.is,name:name+' · '+g.name,how:`Trả lời đúng ngay lần đầu ${need}/${n} câu khác nhau của trò ${g.name}.`,have:Math.min(got,need),need,ok:got>=need})})}
  for(const g of NCG().filter(g=>g.base!=='thi-thu')){const n=bank(g.id).length,got=(sv[g.id]||[]).length;
    NTIERS.forEach(([k,name,p,t])=>{const need=Math.ceil(n*p);out.push({id:g.id+'-'+k,grp:'Bộ câu hỏi',tier:t,isl:g.is,name:name+' · '+g.name,how:`Trả lời đúng ngay lần đầu ${need}/${n} câu Nâng cao của trò ${g.name}.`,have:Math.min(got,need),need,ok:got>=need})})}
  // chuỗi huy hiệu đảo (phiêu lưu biển): Thủy thủ nhí (Đồng) → Nhà thám hiểm (Bạc) → Thợ săn kho báu (Vàng) → Hoa tiêu (Titan) → Thuyền trưởng (Platinum) → Đô đốc (Emerald); Thử thách thêm Chúa đảo → Chủ nhân Rồng biển → Thần biển
  ISLANDS.forEach((isl,k)=>{const gs=GAMEB().filter(g=>g.is===k),has=id=>gs.filter(g=>(out.find(b=>b.id===g.id+id)||{}).ok).length,short=isl.name.replace('Đảo ','');
    [['isl'+k+'-1','dong','Thủy thủ nhí','-dong','Đồng'],['isl'+k+'-3','bac','Nhà thám hiểm','-bac','Bạc'],['isl'+k+'-2','vang','Thợ săn kho báu','-vang','Vàng'],
     ['nisl'+k+'-1','titan','Hoa tiêu','-nc-dong','Titan'],['nisl'+k+'-3','plat','Thuyền trưởng','-nc-bac','Platinum'],['nisl'+k+'-2','emer','Đô đốc','-nc-vang','Emerald'],
     ['lisl'+k+'-1','saph','Chúa đảo','-tt-dong','Sapphire'],['lisl'+k+'-3','ruby','Chủ nhân Rồng biển','-tt-bac','Ruby'],['lisl'+k+'-2','kc','Thần biển','-tt-vang','Diamond']]
    .forEach(([id,tier,name,suf,tn])=>{{const lv=(/^-(nc|tt)-/.exec(suf)||[])[1];if(lv&&!gs.every(g=>bank(g.id+'-'+lv).length))return}const hv=has(suf);out.push({id,grp:'Đảo',tier,isl:k,name:name+' '+isl.name,short:name,hs:`${tn} ở cả ${gs.length} trò`,how:`${tn} ở cả ${gs.length} trò của ${isl.name}.`,have:hv,need:gs.length,ok:hv===gs.length})})});
  for(const g of L3G().filter(g=>g.base!=='thi-thu')){const n=bank(g.id).length,got=(sv[g.id]||[]).length;
    LTIERS.forEach(([k,name,p,t])=>{const need=Math.ceil(n*p);out.push({id:g.id+'-'+k,grp:'Bộ câu hỏi',tier:t,isl:g.is,name:name+' · '+g.name,how:`Trả lời đúng ngay lần đầu ${need}/${n} câu Thử thách của trò ${g.name}.`,have:Math.min(got,need),need,ok:got>=need})})}
  const ms=st.maxStreak||0;[[10,'Ngọn lửa nhỏ'],[20,'Ngọn lửa lớn'],[30,'Ngọn lửa bất diệt']].forEach(([n,name],i)=>out.push({id:'streak'+n,grp:'Chuỗi đúng',tier:TIERS[i][0],name,hs:`Chuỗi ${n} câu đúng`,how:`Đúng liên tiếp ${n} câu trong một lượt chơi.`,have:Math.min(ms,n),need:n,ok:ms>=n}));
  // Hoàn hảo: chuỗi cung thủ, đếm tổng số lượt chơi không sai câu nào (khác Chuỗi đúng: đúng liền trong một lượt)
  const pf=st.perfect||0;[[5,'Mắt tinh','dong'],[10,'Tay vững','bac'],[20,'Xạ thủ','vang'],[35,'Thiện xạ','titan'],[50,'Bách phát bách trúng','plat'],[100,'Thần tiễn','emer']]
  .forEach(([n,name,tier])=>out.push({id:'perfect'+n,grp:'Hoàn hảo',tier,name,hs:`${n} lượt không sai câu nào`,how:`Có ${n} lượt chơi đúng hết, không sai câu nào.`,have:Math.min(pf,n),need:n,ok:pf>=n}));
  const bd=st.bestDays||0;[[7,'Chăm học 7 ngày','bac'],[30,'Chăm học 30 ngày','vang']].forEach(([n,name,tier])=>out.push({id:'days'+n,grp:'Chăm chỉ',tier,name,hs:`Chơi liên tục ${n} ngày`,how:`Chơi liên tục ${n} ngày.`,have:Math.min(bd,n),need:n,ok:bd>=n}));
  // chuỗi Viết văn: đếm số đề khác nhau (nộp lại cùng một đề chỉ tính một lần)
  const de=f=>new Set(E.filter(f).map(e=>e.de)).size,sub=de(()=>true),s2=de(e=>(e.stars||0)>=2),full=de(e=>e.stars===3),nc3=de(e=>e.nc&&e.stars===3),l33=de(e=>e.tt&&e.stars===3),hasL3=bank('thi-thu-tt').length>0;
  [['write5','dong','Cây bút tập sự','Nộp bài cho 5 đề thi thử khác nhau.',sub,5,'Nộp 5 đề khác nhau'],
   ['write2s','bac','Cây bút nhí','Có 10 đề thi thử đạt từ 2 sao trở lên.',s2,10,'10 đề từ 2 sao'],
   ['write3s','vang','Cây bút triển vọng','Có 10 đề thi thử đạt đủ yêu cầu (3 sao).',full,10,'10 đề đạt 3 sao'],
   ['writeN5','titan','Tác giả nhí','Có 10 đề thi thử Nâng cao đạt 3 sao.',nc3,10,'10 đề Nâng cao 3 sao'],
   ['writeN10','plat','Tác giả được yêu thích','Có 20 đề thi thử Nâng cao đạt 3 sao.',nc3,20,'20 đề Nâng cao 3 sao'],
   ['writeN20','emer','Tác giả nổi tiếng','Có 35 đề thi thử Nâng cao đạt 3 sao.',nc3,35,'35 đề Nâng cao 3 sao'],
   ...(hasL3?[['writeL10','saph','Nhà văn trẻ','Có 10 đề thi thử Thử thách đạt 3 sao.',l33,10,'10 đề Thử thách đạt 3 sao'],
   ['writeL20','ruby','Nhà văn tài năng','Có 20 đề thi thử Thử thách đạt 3 sao.',l33,20,'20 đề Thử thách đạt 3 sao'],
   ['writeL35','kc','Đại văn hào','Có 35 đề thi thử Thử thách đạt 3 sao.',l33,35,'35 đề Thử thách đạt 3 sao']]:[])]
  .forEach(([id,tier,name,how,have,need,hs])=>out.push({id,grp:'Viết văn',tier,name,how,hs,have:Math.min(have,need),need,ok:have>=need}));
  const kings=out.filter(b=>/^isl\d-2$/.test(b.id)&&b.ok).length;
  out.push({id:'king',grp:'Tối thượng',tier:'vang',name:'Vua Đảo Câu Văn',hs:'Đủ 5 huy hiệu Thợ săn kho báu',how:'Có đủ 5 huy hiệu Thợ săn kho báu (Vàng ở mọi trò của cả 5 đảo).',have:kings,need:5,ok:kings>=5});
  const legends=out.filter(b=>/^nisl\d-2$/.test(b.id)&&b.ok).length;
  out.push({id:'legend',grp:'Tối thượng',tier:'emer',name:'Huyền thoại Đảo Câu Văn',hs:'Đủ 5 huy hiệu Đô đốc',how:'Có đủ 5 huy hiệu Đô đốc (Emerald ở mọi trò của cả 5 đảo).',have:legends,need:5,ok:legends>=5});
  if(L3G().length){const gods=out.filter(b=>/^lisl\d-2$/.test(b.id)&&b.ok).length;
    out.push({id:'god',grp:'Tối thượng',tier:'kc',name:'Thủy Thần Đảo Câu Văn',hs:'Đủ 5 huy hiệu Thần biển',how:'Có đủ 5 huy hiệu Thần biển (Diamond ở mọi trò của cả 5 đảo).',have:gods,need:5,ok:gods>=5})}
  return out;
}
function BREWARD(id){let m=/^([a-z-]+)-tt-(dong|bac|vang)$/.exec(id);if(m)return {dong:350,bac:400,vang:450}[m[2]]*ISL_MUL[gameIsl(m[1])];m=/^lisl(\d)-([123])$/.exec(id);if(m)return {1:700,3:800,2:900}[m[2]]*ISL_MUL[+m[1]];m=/^([a-z-]+)-nc-(dong|bac|vang)$/.exec(id);if(m)return {dong:200,bac:250,vang:300}[m[2]]*ISL_MUL[gameIsl(m[1])];m=/^nisl(\d)-([123])$/.exec(id);if(m)return {1:400,3:500,2:600}[m[2]]*ISL_MUL[+m[1]];m=/^([a-z-]+)-(dong|bac|vang)$/.exec(id);if(m)return {dong:50,bac:100,vang:150}[m[2]]*ISL_MUL[gameIsl(m[1])];m=/^isl(\d)-([123])$/.exec(id);if(m)return {1:100,3:200,2:300}[m[2]]*ISL_MUL[+m[1]];return {streak10:100,streak20:200,streak30:300,perfect5:200,perfect10:250,perfect20:300,perfect35:350,perfect50:400,perfect100:450,days7:150,days30:300,write5:200,write2s:300,write3s:400,writeN5:600,writeN10:800,writeN20:1200,king:1000,legend:2000,god:3000,writeL10:1500,writeL20:2000,writeL35:3000}[id]||0}
function badgeHtml(b,paid){const n=BREWARD(b.id);return `<div class="bdg ${b.ok?'on':'off'} t-${b.tier}" title="${esc(b.name+': '+b.how)}"><span class="medal">${badgeIco(b)||(b.ok?MEDAL:LOCK)}</span><b>${esc(b.short||b.name)}</b><span class="fine">${esc(b.hs||b.how)}</span><div class="bfoot"><div class="meter sm${b.ok?' full':''}"><div style="width:${b.ok?100:Math.round(b.have/b.need*100)}%"></div></div>${b.ok?'<span class="fine got">✓ Đã mở khóa</span>':`<span class="fine">${b.have}/${b.need}</span>`}<span class="rw">${b.ok?((paid||[]).includes(b.id)?`Đã nhận ${vn(n)} xu`:`Sẽ nhận ${vn(n)} xu sau lượt chơi tới`):`Thưởng ${vn(n)} xu`}</span></div></div>`}
function gameBadgeCard(g,sv){const n=bank(g.id).length,got=Math.min((sv[g.id]||[]).length,n),nid=g.id+'-nc',nn=bank(nid).length,ng=Math.min((sv[nid]||[]).length,nn),lid=g.id+'-tt',ln=bank(lid).length,lg=Math.min((sv[lid]||[]).length,ln);
  const bar=(lbl,a,t)=>`<div class="lvbar"><span>${lbl}</span><div class="meter sm"><div style="width:${t?Math.round(a/t*100):0}%"></div></div><span class="fine">${a}/${t}</span></div>`;
  return `<div class="gbdg c${g.is}"><b>${g.name}</b>${bar('Cơ bản',got,n)}${nn?bar('Nâng cao',ng,nn):''}${ln?bar('Thử thách',lg,ln):''}<span class="pips">${TIERS.map(([k,name,p])=>`<span class="pip t-${k}${got>=Math.ceil(n*p)?' on':''}" title="${name}: ${Math.ceil(n*p)} câu Cơ bản">${name}</span>`).join('')}</span><span class="pips">${nn?NTIERS.map(([k,name,p,t])=>`<span class="pip t-${t}${ng>=Math.ceil(nn*p)?' on':''}" title="${name}: ${Math.ceil(nn*p)} câu Nâng cao">${name}</span>`).join(''):''}</span>${ln?`<span class="pips">${LTIERS.map(([k,name,p,t])=>`<span class="pip t-${t}${lg>=Math.ceil(ln*p)?' on':''}" title="${name}: ${Math.ceil(ln*p)} câu Thử thách">${name}</span>`).join('')}</span>`:''}</div>`}
function badgePanel(x,ess){
  const L=badgeList(x,ess),sv=((x&&x.stats)||{}).solved||{};
  return `<p class="bsum">${MEDAL}<b>${L.filter(b=>b.ok).length}</b>/${L.length} huy hiệu</p>
    <h3 class="bgrp">Bộ câu hỏi</h3><p class="fine">Mỗi câu chỉ tính một lần, khi trả lời đúng ngay lần đầu (trò nhiều bước: đúng hết các bước). Đồng / Bạc / Vàng: 40% / 70% / 100% câu Cơ bản của trò; Titan / Platinum / Emerald: 40% / 70% / 100% câu Nâng cao. Thưởng: 50 · 100 · 150 · 200 · 250 · 300 xu, nhân hệ số của đảo (Viết đoạn ×2, Mở rộng câu ×1, Câu ghép, Tu từ, Từ ngữ ×½).</p>
    <div class="gbdgs">${GAMEB().map(g=>gameBadgeCard(g,sv)).join('')}</div>
    ${[...new Set(L.filter(b=>!b.grp.startsWith('Bộ câu hỏi')).map(b=>b.grp))].map(gp=>`<h3 class="bgrp">${gp}</h3>`+(gp==='Đảo'?ISLANDS.map((isl,k)=>{const r=L.filter(b=>b.grp===gp&&b.isl===k);return r.length?`<p class="isl-row c${k}">${islIco(k)}${isl.name}</p><div class="bdgs five">${r.map(b=>badgeHtml(b,(x&&x.paid)||[])).join('')}</div>`:''}).join(''):`<div class="bdgs">${L.filter(b=>b.grp===gp).map(b=>badgeHtml(b,(x&&x.paid)||[])).join('')}</div>`)).join('')}`;
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
  if(a==='d-ai'){TAB='ql';if(location.hash!=='#theo-doi')location.hash='theo-doi';else renderDash('theo-doi');setTimeout(()=>{const c=document.getElementById('aic');if(c)c.scrollIntoView({block:'start'})},300);return}
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
  else if(a==='tlsend')sendTL();
  else if(a==='newde'){G.newDe();render()}
  else if(a==='hint'){G.hintOpen=!G.hintOpen;if(G.hintOpen)G.usedHint=true;const t=G.text;render();const ta=document.getElementById('essay');if(ta&&ta.value!==t){ta.value=t}}
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
  const g=GAMES.find(x=>x.id===h)||NCG().find(x=>x.id===h)||L3G().find(x=>x.id===h);if(g)startGame(g);else renderMap();window.scrollTo(0,0);
}
addEventListener('hashchange',route);
$app.innerHTML='<p class="fine">Đang tải…</p>';
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
