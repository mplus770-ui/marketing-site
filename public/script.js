// ── SPACE PARTICLES (warp speed stars) ──
(function(){
  const canvas = document.getElementById('space-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy;
  const COUNT = window.innerWidth < 600 ? 180 : 320;
  const MAX_SPD = 5;
  const TRAIL = 9;

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cx = W/2; cy = H/2;
  }
  resize();
  window.addEventListener('resize', resize);

  let mouse = {x:null,y:null};
  window.addEventListener('mousemove', e => { mouse.x=e.clientX; mouse.y=e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x=null; mouse.y=null; });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouse.x = t.clientX; mouse.y = t.clientY;
  },{passive:true});

  function makeStar(){
    const a = Math.random()*Math.PI*2;
    const d = Math.random()*Math.min(W,H)*0.05;
    return {
      x: cx+Math.cos(a)*d, y: cy+Math.sin(a)*d,
      spd: 0.3+Math.pow(Math.random(),2)*MAX_SPD,
      sz: 0.3+Math.random()*1.4,
      trail: [],
      hue: 190+Math.random()*60,
      al: 0.4+Math.random()*0.6
    };
  }

  let stars = Array.from({length:COUNT}, makeStar);

  function frame(){
    ctx.clearRect(0,0,W,H);
    for(const s of stars){
      if(mouse.x !== null){
        const mx=s.x-mouse.x, my=s.y-mouse.y;
        const md=Math.sqrt(mx*mx+my*my);
        if(md<120){ const f=(120-md)/120*1.5; s.x+=mx/md*f; s.y+=my/md*f; }
      }
      const dx=s.x-cx, dy=s.y-cy;
      const len=Math.sqrt(dx*dx+dy*dy)||0.001;
      s.trail.unshift({x:s.x,y:s.y});
      if(s.trail.length>TRAIL) s.trail.pop();
      s.x+=dx/len*s.spd;
      s.y+=dy/len*s.spd;
      if(s.x<-20||s.x>W+20||s.y<-20||s.y>H+20){
        Object.assign(s,makeStar());
      }
      const prog=Math.min(Math.sqrt((s.x-cx)**2+(s.y-cy)**2)/Math.sqrt(cx*cx+cy*cy),1);
      const al=s.al*(0.2+prog*0.8);
      const sz=s.sz*(0.5+prog*1.5);
      if(s.trail.length>1&&s.spd>1){
        ctx.beginPath();
        ctx.moveTo(s.trail[0].x,s.trail[0].y);
        for(let i=1;i<s.trail.length;i++) ctx.lineTo(s.trail[i].x,s.trail[i].y);
        ctx.strokeStyle=`hsla(${s.hue},85%,75%,${al*0.4*(s.spd/MAX_SPD)})`;
        ctx.lineWidth=sz*0.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(s.x,s.y,sz,0,Math.PI*2);
      ctx.fillStyle=`hsla(${s.hue},80%,90%,${al})`;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();

// ── SCROLL REVEAL ──
(function(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const d = parseFloat(e.target.dataset.d||0);
        e.target.style.transitionDelay = d*65+'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },{threshold:0.07,rootMargin:'0px 0px -30px 0px'});
  els.forEach(el=>io.observe(el));
})();

// ── TYPEWRITER ──
(function(){
  const target = document.getElementById('typeTarget');
  if(!target) return;
  const words = ['Amazon (AWS) 🚀','שרתים מהירים ⚡','קוד נקי ✦','בעלות מלאה 🏆','ללא WordPress ✓'];
  let wi=0,ci=0,typing=true,wait=false;
  function tick(){
    if(wait){wait=false;setTimeout(tick,1600);return;}
    const w=words[wi];
    if(typing){
      if(ci<w.length){ci++;target.textContent=w.slice(0,ci);setTimeout(tick,55+Math.random()*40);}
      else{typing=false;wait=true;setTimeout(tick,1600);}
    }else{
      if(ci>0){ci--;target.textContent=w.slice(0,ci);setTimeout(tick,22);}
      else{typing=true;wi=(wi+1)%words.length;setTimeout(tick,280);}
    }
  }
  setTimeout(tick,800);
})();

// ── HAMBURGER ──
(function(){
  const btn=document.getElementById('navHamburger');
  const links=document.getElementById('navLinks');
  if(!btn||!links)return;
  btn.addEventListener('click',()=>{
    const open=links.classList.toggle('open');
    btn.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open);
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    links.classList.remove('open');btn.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('click',e=>{
    if(!btn.contains(e.target)&&!links.contains(e.target)){
      links.classList.remove('open');btn.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });
})();

// ── PRICING TABS ──
function switchTab(btn, panel){
  document.querySelectorAll('.pricing-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.pricing-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-'+panel).classList.add('active');
}

// ── HERO PROMPT → BUILDER ──
function go() {
  const value = document.getElementById("prompt").value;
  if (!value.trim()) return;
  localStorage.setItem("prompt", value);
  window.location.href = "/builder.html";
}
document.getElementById("prompt") && document.getElementById("prompt").addEventListener("keydown", function(e){
  if(e.key === "Enter") go();
});

// ── FAQ ACCORDION ──
(function(){
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!isOpen){
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
      }
    });
  });
})();

// ── LANGUAGE MENU ──
(function(){
  const selector = document.getElementById('langSelector');
  const btn = document.getElementById('langBtn');

  if(!selector || !btn) return;

  // Create menu dynamically
  const menu = document.createElement('div');
  menu.className = 'lang-menu';
  menu.innerHTML = `
    <a href="/index.html">🇮🇱 עברית</a>
    <a href="/en/index.html">🇬🇧 English</a>
    <a href="/fr/index.html">🇫🇷 Français</a>
    <a href="/es/index.html">🇪🇸 Español</a>
    <a href="/pt/index.html">🇧🇷 Português</a>
    <a href="/ru/index.html">🇷🇺 Русский</a>
    <a href="/zh/index.html">🇨🇳 中文</a>
    <a href="/ar/index.html">🇸🇦 العربية</a>
    <a href="/de/index.html">🇩🇪 Deutsch</a>
  `;
  selector.appendChild(menu);

  // Toggle menu
  btn.addEventListener('click', () => {
    selector.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if(!selector.contains(e.target)){
      selector.classList.remove('open');
    }
  });
})();
