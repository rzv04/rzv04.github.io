(() => {
  'use strict';
  const $=(q,r=document)=>r.querySelector(q);
  const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
  const icon=(id)=>`<svg class="icon" aria-hidden="true"><use href="#${id}"></use></svg>`;
  const motionMedia=window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : {matches:false,addEventListener:null};
  let systemReduced=Boolean(motionMedia.matches);

  function buildWave(el,count=42){
    if(!el) return;
    el.innerHTML='';
    for(let i=0;i<count;i++){
      const bar=document.createElement('span');
      bar.style.setProperty('--h',18+Math.round(Math.abs(Math.sin(i*.72)+Math.sin(i*.21)*.6)*42)+Math.floor(Math.random()*18));
      bar.style.setProperty('--d',i);
      el.appendChild(bar);
    }
  }
  $$('.wave-overlay').forEach(el=>buildWave(el,42));
  $$('.audio-captions:not(.transcribe-animation) .wave').forEach(el=>buildWave(el,16));
  $$('.transcribe-animation .wave').forEach(el=>buildWave(el,28));

  // Motion follows the operating system preference; there is no in-page animation override.
  const effectiveMotionOff=()=>systemReduced;
  function syncMotionUI(){
    if(systemReduced){video?.pause();setControlMotionPaused(true);$$('[data-motion-region]').forEach(el=>el.classList.remove('motion-live'))}
    else{tryAutoplay();setControlMotionPaused(false);$$('[data-motion-region]').forEach(el=>{const r=el.getBoundingClientRect();el.classList.toggle('motion-live',r.bottom>0&&r.top<window.innerHeight)})}
  }
  if(motionMedia.addEventListener) motionMedia.addEventListener('change',e=>{systemReduced=e.matches;syncMotionUI()});

  // Demo controls use real media state rather than decorative timestamps.
  const video=$('#demoVideo');
  const videoStage=$('#videoStage');
  const playerShell=$('#playerShell');
  const videoSkeleton=$('#videoSkeleton');
  const markVideoReady=()=>{videoStage?.classList.add('video-ready');videoSkeleton?.setAttribute('aria-hidden','true');window.setTimeout(()=>videoSkeleton?.remove(),220)};
  if(video){
    if(video.readyState>=2)markVideoReady();
    else{
      video.addEventListener('loadeddata',markVideoReady,{once:true});
      video.addEventListener('canplay',markVideoReady,{once:true});
      video.addEventListener('error',markVideoReady,{once:true});
    }
  }
  const playBtn=$('#playToggle');
  const timeline=$('#timeline');
  const currentTime=$('#currentTime');
  const durationTime=$('#durationTime');
  const volumeBtn=$('#volumeToggle');
  const fmt=(seconds)=>{if(!Number.isFinite(seconds))return '00:00';const m=Math.floor(seconds/60),sec=Math.floor(seconds%60);return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`};
  function syncPlayUI(){
    if(!playBtn||!video)return;
    const playing=!video.paused&&!video.ended;
    playBtn.innerHTML=icon(playing?'i-pause':'i-play');
    playBtn.setAttribute('aria-label',playing?'Pause demo':'Play demo');
    playBtn.setAttribute('aria-pressed',String(playing));
  }
  function syncVolumeUI(){
    if(!volumeBtn||!video)return;
    volumeBtn.innerHTML=icon(video.muted?'i-volume-off':'i-volume');
    volumeBtn.setAttribute('aria-label',video.muted?'Unmute demo':'Mute demo');
    volumeBtn.setAttribute('aria-pressed',String(video.muted));
  }
  function syncTimeline(){
    if(!video)return;
    const pct=video.duration?Math.min(100,Math.max(0,video.currentTime/video.duration*100)):0;
    timeline?.style.setProperty('--progress',`${pct}%`);
    timeline?.setAttribute('aria-valuenow',String(Math.round(pct)));
    timeline?.setAttribute('aria-valuetext',`${fmt(video.currentTime)} of ${fmt(video.duration)}`);
    if(currentTime)currentTime.textContent=fmt(video.currentTime);
    if(durationTime)durationTime.textContent=fmt(video.duration);
  }
  let demoWantedPlaying=true;
  let demoInView=true;
  function syncDemoPlayback(){
    if(!video)return;
    const shouldPlay=demoWantedPlaying&&demoInView&&!document.hidden&&!effectiveMotionOff();
    if(shouldPlay){if(video.paused)video.play().catch(()=>syncPlayUI())}
    else if(!video.paused)video.pause();
  }
  function tryAutoplay(){syncDemoPlayback()}
  if(video){
    ['play','pause','ended'].forEach(ev=>video.addEventListener(ev,syncPlayUI));
    ['timeupdate','loadedmetadata','durationchange'].forEach(ev=>video.addEventListener(ev,syncTimeline));
    video.addEventListener('volumechange',syncVolumeUI);
    syncPlayUI();syncVolumeUI();syncTimeline();
    if('IntersectionObserver' in window&&playerShell){
      const videoIO=new IntersectionObserver(entries=>entries.forEach(entry=>{demoInView=entry.isIntersecting&&entry.intersectionRatio>.12;syncDemoPlayback()}),{threshold:[0,.12,.5]});
      videoIO.observe(playerShell);
    }
    syncDemoPlayback();
  }
  playBtn?.addEventListener('click',()=>{if(!video)return;demoWantedPlaying=video.paused;syncDemoPlayback()});
  volumeBtn?.addEventListener('click',()=>{if(!video)return;video.muted=!video.muted});
  timeline?.addEventListener('click',e=>{if(!video||!Number.isFinite(video.duration))return;const r=timeline.getBoundingClientRect();video.currentTime=Math.max(0,Math.min(video.duration,((e.clientX-r.left)/r.width)*video.duration))});
  timeline?.addEventListener('keydown',e=>{
    if(!video||!Number.isFinite(video.duration))return;
    let target=null;
    if(e.key==='ArrowRight'||e.key==='ArrowUp')target=Math.min(video.duration,video.currentTime+5);
    if(e.key==='ArrowLeft'||e.key==='ArrowDown')target=Math.max(0,video.currentTime-5);
    if(e.key==='Home')target=0;
    if(e.key==='End')target=video.duration;
    if(target!==null){e.preventDefault();video.currentTime=target}
  });

  const caps=[
    ['Speech becomes a subtitle without leaving VLC.','Optional translation appears below the original.'],
    ['Seek, pause, resume — the captions stay with you.','Control playback without losing subtitle stability.'],
    ['Your audio stays on your machine.','Only finalized text leaves when translation is enabled.']
  ];
  let ci=0;
  window.setInterval(()=>{
    const heroMotion=$('.hero-audio-caption');
    if(effectiveMotionOff()||document.hidden||!heroMotion?.classList.contains('motion-live'))return;
    ci=(ci+1)%caps.length;
    const a=$('#capPrimary'),b=$('#capTranslation');
    [a,b].forEach(el=>el?.animate?.([{opacity:.2,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'}));
    if(a)a.textContent=caps[ci][0]; if(b)b.textContent=caps[ci][1];
  },4200);

  // 03 / Control: a self-contained timestamped caption timeline.
  const controlCard=$('#controlDemoCard');
  const controlTrack=$('#controlSeekTrack');
  const controlPause=$('#controlPause');
  const controlResume=$('#controlResume');
  const controlCurrent=$('#controlCurrent');
  const controlEnd=$('#controlEnd');
  const controlCaptionTime=$('#controlCaptionTime');
  const controlCaptionText=$('#controlCaptionText');
  const CONTROL_DURATION=46;
  const CONTROL_BASE=32*60+10;
  const controlCues=[
    {start:0,end:7,text:'Captions follow the media timeline, not the wall clock.'},
    {start:7,end:14,text:'Seek backward and this earlier caption returns.'},
    {start:14,end:21,text:'Pause freezes the active caption exactly here.'},
    {start:21,end:29,text:'Resume continues from the same media timestamp.'},
    {start:29,end:37,text:'Jump ahead and the next caption appears immediately.'},
    {start:37,end:46.01,text:'Seek anywhere — older and newer captions re-anchor.'}
  ];
  let controlTime=0;
  let controlPlaying=true;
  let controlInView=false;
  let controlMotionPaused=effectiveMotionOff();
  let controlLastFrame=0;
  let controlTimer=0;
  const CONTROL_TICK_MS=100;
  const fmtClock=(total)=>{const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=Math.floor(total%60);return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`};
  function controlCueAt(t){return controlCues.find(c=>t>=c.start&&t<c.end)||controlCues[controlCues.length-1]}
  function renderControlDemo(){
    if(!controlTrack)return;
    const pct=Math.max(0,Math.min(100,controlTime/CONTROL_DURATION*100));
    const absolute=CONTROL_BASE+controlTime;
    const cue=controlCueAt(controlTime);
    controlTrack.style.setProperty('--seek-progress',`${pct}%`);
    controlTrack.setAttribute('aria-valuenow',String(Math.round(controlTime)));
    controlTrack.setAttribute('aria-valuetext',fmtClock(absolute));
    if(controlCurrent)controlCurrent.textContent=fmtClock(absolute);
    if(controlEnd)controlEnd.textContent=fmtClock(CONTROL_BASE+CONTROL_DURATION);
    if(controlCaptionTime)controlCaptionTime.textContent=fmtClock(CONTROL_BASE+cue.start);
    if(controlCaptionText&&controlCaptionText.textContent!==cue.text){
      controlCaptionText.textContent=cue.text;
      if(!effectiveMotionOff()) controlCaptionText.animate?.([{opacity:.25,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
    }
    controlPause?.setAttribute('aria-pressed',String(!controlPlaying));
    controlResume?.setAttribute('aria-pressed',String(controlPlaying));
  }
  function controlShouldRun(){return controlPlaying&&controlInView&&!controlMotionPaused&&!document.hidden}
  function stopControlLoop(){if(controlTimer){clearTimeout(controlTimer);controlTimer=0}controlLastFrame=0}
  function startControlLoop(){if(!controlTimer&&controlShouldRun()){controlLastFrame=performance.now();controlTimer=window.setTimeout(tickControlDemo,CONTROL_TICK_MS)}}
  function setControlMotionPaused(paused){controlMotionPaused=paused;if(paused)stopControlLoop();else startControlLoop();renderControlDemo()}
  function tickControlDemo(){
    controlTimer=0;
    if(!controlShouldRun()){controlLastFrame=0;return}
    const now=performance.now();
    if(controlLastFrame){
      controlTime+=(now-controlLastFrame)/1000*1.55;
      if(controlTime>=CONTROL_DURATION)controlTime=0;
      renderControlDemo();
    }
    controlLastFrame=now;
    controlTimer=window.setTimeout(tickControlDemo,CONTROL_TICK_MS);
  }
  if(controlTrack){
    renderControlDemo();
    controlTrack.addEventListener('click',e=>{const r=controlTrack.getBoundingClientRect();controlTime=Math.max(0,Math.min(CONTROL_DURATION,(e.clientX-r.left)/r.width*CONTROL_DURATION));renderControlDemo()});
    controlTrack.addEventListener('keydown',e=>{let target=null;if(e.key==='ArrowRight'||e.key==='ArrowUp')target=Math.min(CONTROL_DURATION,controlTime+3);if(e.key==='ArrowLeft'||e.key==='ArrowDown')target=Math.max(0,controlTime-3);if(e.key==='Home')target=0;if(e.key==='End')target=CONTROL_DURATION;if(target!==null){e.preventDefault();controlTime=target;renderControlDemo()}});
    controlPause?.addEventListener('click',()=>{controlPlaying=false;stopControlLoop();renderControlDemo()});
    controlResume?.addEventListener('click',()=>{controlPlaying=true;controlLastFrame=0;startControlLoop();renderControlDemo()});
    if('IntersectionObserver' in window&&controlCard){
      const controlIO=new IntersectionObserver(entries=>entries.forEach(entry=>{controlInView=entry.isIntersecting&&entry.intersectionRatio>.18;if(controlInView)startControlLoop();else stopControlLoop()}),{threshold:[0,.18,.5]});
      controlIO.observe(controlCard);
    }else controlInView=true;
    startControlLoop();
  }

  // Continuous decorative CSS animations only run while their region is visible.
  const motionRegions=$$('[data-motion-region]');
  function setMotionRegionState(el,active){el.classList.toggle('motion-live',active&&!effectiveMotionOff()&&!document.hidden)}
  if('IntersectionObserver' in window){
    const motionIO=new IntersectionObserver(entries=>entries.forEach(entry=>setMotionRegionState(entry.target,entry.isIntersecting&&entry.intersectionRatio>.08)),{threshold:[0,.08,.25]});
    motionRegions.forEach(el=>motionIO.observe(el));
  }else motionRegions.forEach(el=>setMotionRegionState(el,true));

  // Progressive enhancement: do not hide content unless IntersectionObserver is available.
  if('IntersectionObserver' in window){
    document.documentElement.classList.add('reveal-ready');
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
    $$('.reveal').forEach(el=>{if(el.classList.contains('visible'))return;io.observe(el)});
  } else {
    $$('.reveal').forEach(el=>el.classList.add('visible'));
  }

  const nav=$('#navWrap');
  const onScroll=()=>nav?.classList.toggle('scrolled',window.scrollY>10);
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});

  const links=$$('.nav-links a');
  if('IntersectionObserver' in window){
    const sio=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}),{rootMargin:'-30% 0px -58% 0px'});
    links.map(a=>a.getAttribute('href')).filter(h=>h?.startsWith('#')).forEach(id=>{const el=$(id);if(el)sio.observe(el)});
  }

  // Card glow is intentionally static on hover to avoid pointer-driven repaints.

  // Accessible settings tabs: click + arrow/Home/End keyboard navigation.
  const tabs=$$('.mock-tab');
  function activateTab(tab,focus=false){
    tabs.forEach(t=>{const selected=t===tab;t.classList.toggle('active',selected);t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;const pane=$('#pane-'+t.dataset.tab);if(pane){pane.classList.toggle('active',selected);pane.hidden=!selected}});
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activateTab(tab));
    tab.addEventListener('keydown',e=>{
      let next=null;
      if(e.key==='ArrowRight')next=tabs[(index+1)%tabs.length];
      if(e.key==='ArrowLeft')next=tabs[(index-1+tabs.length)%tabs.length];
      if(e.key==='Home')next=tabs[0];
      if(e.key==='End')next=tabs[tabs.length-1];
      if(next){e.preventDefault();activateTab(next,true)}
    });
  });
  $$('.switch').forEach(sw=>sw.addEventListener('click',()=>{sw.classList.toggle('on');sw.setAttribute('aria-checked',String(sw.classList.contains('on')))}));

  // Mobile menu replaces the hidden desktop nav on tablets/phones.
  const menuBtn=$('#menuToggle'),mobileNav=$('#mobileNav');
  function setMenu(open){
    if(!menuBtn||!mobileNav)return;
    mobileNav.classList.toggle('open',open);mobileNav.inert=!open;
    mobileNav.setAttribute('aria-hidden',String(!open));menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Close navigation':'Open navigation');menuBtn.innerHTML=icon(open?'i-x':'i-menu');
  }
  menuBtn?.addEventListener('click',()=>setMenu(menuBtn.getAttribute('aria-expanded')!=='true'));
  $$('#mobileNav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  window.addEventListener('resize',()=>{if(window.innerWidth>980)setMenu(false)},{passive:true});

  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileNav?.classList.contains('open'))setMenu(false)});
  document.addEventListener('visibilitychange',()=>{
    syncDemoPlayback();
    if(document.hidden)stopControlLoop();else startControlLoop();
    motionRegions.forEach(el=>{
      if(document.hidden)el.classList.remove('motion-live');
      else{const r=el.getBoundingClientRect();setMotionRegionState(el,r.bottom>0&&r.top<window.innerHeight)}
    });
  });

  syncMotionUI();
})();
