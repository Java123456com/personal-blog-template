import dipperStates from "./dipper-states.json";
import zodiacStates from "./zodiac-states.json";
import { mountCosmicGalaxy } from "./cosmic-galaxy";

const links: ReadonlyArray<readonly [string, string]> = [
  ["首页", "/"],
  ["简历", "/resume/"], ["友链", "/friends/"],
  ["工具", "/tools/"], ["关于", "/about/"],
];
const journalLinks: ReadonlyArray<readonly [string, string]> = [
  ["技术学习记录", "/moments/tech/"],
  ["日常生活记录", "/moments/life/"],
];
const searchLinks = [...links, ...journalLinks];

function paintGalaxy(container: HTMLElement) {
  const canvas = container.querySelector<HTMLCanvasElement>(".galaxy canvas");
  if (!canvas) return () => {};
  const disposeCosmic = mountCosmicGalaxy(container);
  const buttons=container.querySelectorAll<HTMLButtonElement>(".slh-btn");
  const scrollGalaxy=()=>container.querySelector(".slh-nav")?.scrollIntoView({behavior:"smooth"});
  const scrollGame=()=>container.querySelector(".slh-tech")?.scrollIntoView({behavior:"smooth"});
  buttons[0]?.addEventListener("click",scrollGalaxy);buttons[1]?.addEventListener("click",scrollGame);
  const dipperStars=Array.from(container.querySelectorAll<SVGGElement>(".dipper-star"));
  const dipperPanel=container.querySelector<HTMLElement>(".dipper-panel");
  const dipperCursor=container.querySelector<SVGCircleElement>(".dipper-cursor");
  let activeDipper=0, dipperSwap=0, dipperAnimation:Animation|null=null;
  const selectDipper=(index:number)=>{
    if(index===activeDipper)return;
    activeDipper=index;
    dipperStars.forEach((item,i)=>item.classList.toggle("active",i===index));
    const selected=dipperStars[index];
    if(dipperCursor && selected){dipperCursor.style.transform=selected.style.transform;dipperCursor.style.setProperty("--accent",selected.style.getPropertyValue("--star"));}
    if(!dipperPanel)return;
    const swap=++dipperSwap;
    dipperAnimation?.cancel();
    const nextCard=dipperStates[index].replace(/\sdip-swap-[^"\s]+/g, "");
    const oldCard=dipperPanel.querySelector<HTMLElement>(".dp-card");
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!oldCard){dipperPanel.innerHTML=nextCard;return;}
    const leave=oldCard.animate(
      [{opacity:1,transform:"translate(0) scale(1)"},{opacity:0,transform:"translate(-14px) scale(.985)"}],
      {duration:300,easing:"ease"},
    );
    dipperAnimation=leave;
    void leave.finished.then(()=>{
      if(swap!==dipperSwap)return;
      dipperPanel.innerHTML=nextCard;
      const newCard=dipperPanel.querySelector<HTMLElement>(".dp-card");
      if(!newCard)return;
      const enter=newCard.animate(
        [{opacity:0,transform:"translate(22px) scale(.98)"},{opacity:1,transform:"translate(0) scale(1)"}],
        {duration:300,easing:"ease"},
      );
      dipperAnimation=enter;
      void enter.finished.then(()=>{if(swap===dipperSwap)dipperAnimation=null;}).catch(()=>{});
    }).catch(()=>{});
  };
  const dipperListeners=dipperStars.map((item,index)=>{const click=()=>selectDipper(index);const key=(e:KeyboardEvent)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();}};item.addEventListener("click",click);item.addEventListener("keydown",key);return()=>{item.removeEventListener("click",click);item.removeEventListener("keydown",key);};});
  const zodiacIcons=Array.from(container.querySelectorAll<SVGGElement>(".zod-icn"));
  const zodiacSectors=Array.from(container.querySelectorAll<SVGGElement>(".zod-sector"));
  const wheel=container.querySelector<SVGElement>(".zod-wheel");
  const zodiacPointer=container.querySelector<HTMLElement>(".zod-pointer");
  const spin=container.querySelector<HTMLButtonElement>(".zod-spin");
  const zodiacSound=container.querySelector<HTMLButtonElement>(".zod-snd");
  let shownZodiac=0, cardZodiac=0, passingZodiac=-1, wheelAngle=345, wheelFrame=0, pointerTimer=0, spinning=false, lastTickAt=0;
  let wheelMuted=false, zodiacAudioContext:AudioContext|null=null;
  if(wheel){wheel.style.transition="none";wheel.style.transform=`rotate(${wheelAngle}deg)`;}
  const wheelSoundEnabled=()=>!wheelMuted&&document.documentElement.dataset.soundEffects!=="off";
  const playZodiacTone=(type:OscillatorType,frequency:number,duration:number,gainValue:number,delay=0)=>{
    if(!wheelSoundEnabled())return;
    try{
      zodiacAudioContext??=new AudioContext();
      if(zodiacAudioContext.state==="suspended")void zodiacAudioContext.resume();
      const master=Number(document.documentElement.dataset.soundVolume??"1");
      const volume=Number.isFinite(master)?Math.min(1,Math.max(0,master)):1;
      const began=zodiacAudioContext.currentTime+delay;
      const oscillator=zodiacAudioContext.createOscillator(),gain=zodiacAudioContext.createGain();
      oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,began);
      gain.gain.setValueAtTime(.0001,began);gain.gain.linearRampToValueAtTime(gainValue*volume,began+.008);gain.gain.exponentialRampToValueAtTime(.0001,began+duration);
      oscillator.connect(gain).connect(zodiacAudioContext.destination);oscillator.start(began);oscillator.stop(began+duration+.03);
    }catch{/* Web Audio may be unavailable in a restricted browser. */}
  };
  const playZodiacTick=()=>playZodiacTone("square",920,.05,.05);
  const playZodiacHit=()=>{
    playZodiacTone("triangle",392,.12,.1);
    playZodiacTone("triangle",587,.14,.1,.08);
    playZodiacTone("sine",784,.24,.09,.16);
    playZodiacTone("sine",1568,.3,.03,.24);
  };
  const updateZodiacHub=(index:number)=>{
    const hub=container.querySelector<HTMLElement>(".zod-hub");
    if(hub)hub.outerHTML=zodiacStates[index].hub;
  };
  const showZodiac=(index:number,showCard=true)=>{
    if(index!==shownZodiac){
      shownZodiac=index;
      zodiacIcons.forEach((item,i)=>item.classList.toggle("sel",i===index));
      zodiacSectors.forEach((item,i)=>item.classList.toggle("sel",i===index));
    }
    passingZodiac=-1;
    zodiacIcons.forEach(item=>item.classList.remove("pass"));
    zodiacSectors.forEach(item=>item.classList.remove("pass"));
    updateZodiacHub(index);
    if(showCard&&index!==cardZodiac){
      cardZodiac=index;
      const card=container.querySelector<HTMLElement>(".zd-card");
      if(card)card.outerHTML=zodiacStates[index].card;
    }
  };
  const showPassingZodiac=(index:number,now:number)=>{
    if(index===passingZodiac)return;
    passingZodiac=index;
    zodiacIcons.forEach((item,i)=>item.classList.toggle("pass",i===index));
    zodiacSectors.forEach((item,i)=>item.classList.toggle("pass",i===index));
    updateZodiacHub(index);
    if(now-lastTickAt>=36){lastTickAt=now;playZodiacTick();}
  };
  const zodiacAtAngle=(angle:number)=>{
    const normalized=((angle%360)+360)%360;
    return ((Math.round((345-normalized)/30)%12)+12)%12;
  };
  const selectZodiac=(index:number)=>{
    if(!wheel||spinning)return;
    window.cancelAnimationFrame(wheelFrame);
    spinning=true;if(spin)spin.disabled=true;
    zodiacPointer?.classList.remove("flick");window.clearTimeout(pointerTimer);
    const start=wheelAngle;
    const target=((345-index*30)%360+360)%360;
    const current=((start%360)+360)%360;
    const advance=(target-current+360)%360;
    const turns=4+Math.floor(Math.random()*3);
    const finish=start+turns*360+advance;
    const duration=4300;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      wheelAngle=target;wheel.style.transform=`rotate(${wheelAngle}deg)`;
      showZodiac(index);playZodiacHit();spinning=false;if(spin)spin.disabled=false;return;
    }
    const began=performance.now();
    const frame=(now:number)=>{
      const progress=Math.min(1,(now-began)/duration);
      const eased=1-Math.pow(1-progress,3);
      wheelAngle=start+(finish-start)*eased;
      wheel.style.transform=`rotate(${wheelAngle}deg)`;
      const passing=zodiacAtAngle(wheelAngle);
      showPassingZodiac(passing,now);
      if(progress<1)wheelFrame=window.requestAnimationFrame(frame);
      else{
        wheelAngle=target;wheel.style.transform=`rotate(${wheelAngle}deg)`;
        showZodiac(index);playZodiacHit();spinning=false;if(spin)spin.disabled=false;
        if(zodiacPointer){void zodiacPointer.offsetWidth;zodiacPointer.classList.add("flick");pointerTimer=window.setTimeout(()=>zodiacPointer.classList.remove("flick"),700);}
      }
    };
    wheelFrame=window.requestAnimationFrame(frame);
  };
  const zodiacListeners=[...zodiacIcons,...zodiacSectors].map((item,index)=>{const zodiacIndex=index%12;const click=()=>selectZodiac(zodiacIndex);item.addEventListener("click",click);return()=>item.removeEventListener("click",click);});
  const turn=()=>selectZodiac(Math.floor(Math.random()*12));
  const toggleZodiacSound=()=>{wheelMuted=!wheelMuted;zodiacSound?.classList.toggle("off",wheelMuted);if(zodiacSound){zodiacSound.title=wheelMuted?"开启轮盘音效":"关闭轮盘音效";const icon=zodiacSound.querySelector("span");if(icon)icon.textContent=wheelMuted?"🔇":"🔊";}if(!wheelMuted)playZodiacTone("triangle",784,.1,.06);};
  spin?.addEventListener("click",turn);
  zodiacSound?.addEventListener("click",toggleZodiacSound);
  return ()=>{disposeCosmic();window.cancelAnimationFrame(wheelFrame);window.clearTimeout(pointerTimer);void zodiacAudioContext?.close();dipperSwap++;dipperAnimation?.cancel();buttons[0]?.removeEventListener("click",scrollGalaxy);buttons[1]?.removeEventListener("click",scrollGame);dipperListeners.forEach(fn=>fn());zodiacListeners.forEach(fn=>fn());spin?.removeEventListener("click",turn);zodiacSound?.removeEventListener("click",toggleZodiacSound);};
}

export function enhanceNav(root: HTMLElement, starMarkup: string) {
  const isHome = root.classList.contains("wasteland");
  const nav = document.querySelector<HTMLElement>(".nav-switcher");
  const navButton = nav?.querySelector<HTMLButtonElement>(".ns-btn");
  const sound = document.querySelector<HTMLElement>(".sound-toggle");
  const soundButton = sound?.querySelector<HTMLButtonElement>(".st-btn");
  const appContent = root.parentElement;
  let star: HTMLElement | null = appContent?.querySelector<HTMLElement>(".slh") || null;
  let disposeGalaxy = () => {}, galaxyReady = false, createdStar = false;
  const themeStorageKey = "clone-site-theme";
  const themeDefaultKey = "clone-site-theme-default";
  const themeDefaultVersion = "starry-default-v2";
  const orbitVideoMarkup = '<video class="slh-video" muted loop playsinline preload="auto" disablepictureinpicture><source src="/media/starlight-orbit.mp4" type="video/mp4"></video>';
  if (window.localStorage.getItem(themeDefaultKey) !== themeDefaultVersion) {
    window.localStorage.setItem(themeStorageKey, "星空极光");
    window.localStorage.setItem(themeDefaultKey, themeDefaultVersion);
  }
  let themeChoice = window.localStorage.getItem(themeStorageKey) || "星空极光";
  const selectTheme = (name: string) => {
    themeChoice = name;
    window.localStorage.setItem(themeStorageKey, name);
    const starry = name === "星空极光";
    document.documentElement.dataset.docTheme = starry ? "starry" : "cyber";
    if (isHome) root.style.display = starry ? "none" : "";
    else {
      root.querySelector(".doc-bg")?.classList.toggle("starry-theme", starry);
      root.querySelector(".doc-bg")?.classList.toggle("cyber-theme", !starry);
      root.querySelectorAll<HTMLElement>("[data-theme]").forEach(node => node.dataset.theme = starry ? "starry" : "cyber");
    }
    if (starry && isHome && appContent) {
      if (!star) {
        const holder = document.createElement("div");holder.innerHTML=starMarkup;
        star=holder.firstElementChild as HTMLElement;
        const videoLayer=document.createElement("div");
        videoLayer.className="slh-video-layer";
        videoLayer.setAttribute("aria-hidden","true");
        videoLayer.innerHTML=orbitVideoMarkup;
        star.prepend(videoLayer);
        appContent.append(star);createdStar=true;
      }
      if (!galaxyReady) { disposeGalaxy=paintGalaxy(star); galaxyReady=true; }
    }
    if (!starry && galaxyReady) {
      disposeGalaxy();
      disposeGalaxy = () => {};
      galaxyReady = false;
    }
    if (star) star.style.display = starry ? "" : "none";
    const activeVideo = star?.querySelector("video");
    if (activeVideo) {
      if (starry && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void activeVideo.play().catch(() => {});
      else activeVideo.pause();
    }
    nav?.classList.remove("open");nav?.querySelector(".ns-panel")?.remove();
    navButton?.setAttribute("title", "切换背景主题");
    window.scrollTo({top:0,behavior:"instant"});
  };
  selectTheme(themeChoice);
  const syncOrbitPlayback = () => {
    const video = star?.querySelector<HTMLVideoElement>(".slh-video");
    if (!video) return;
    if (!document.hidden && themeChoice === "星空极光" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => {});
    else video.pause();
  };
  document.addEventListener("visibilitychange", syncOrbitPlayback);
  const toggleTheme = () => {
    if (!nav) return;
    const open=!nav.classList.contains("open");nav.classList.toggle("open",open);
    navButton?.setAttribute("title",open?"收起":"切换背景主题");
    nav.querySelector(".ns-panel")?.remove();if(!open)return;
    const panel=document.createElement("div");panel.className="ns-panel";panel.setAttribute("data-v-deb9fdfc","");
    panel.innerHTML=`<div data-v-deb9fdfc class="ns-title">背景主题</div>${[["✦","星空极光"],["⚡","赛博编程"]].map(([icon,name])=>`<button data-v-deb9fdfc class="ns-opt ${name===themeChoice?"active":""}"><span data-v-deb9fdfc class="ns-opt-icon">${icon}</span><span data-v-deb9fdfc class="ns-opt-label">${name}</span>${name===themeChoice?'<span data-v-deb9fdfc class="ns-opt-check">✓</span>':""}</button>`).join("")}`;
    nav.append(panel);panel.querySelectorAll<HTMLButtonElement>(".ns-opt").forEach(button=>button.addEventListener("click",()=>selectTheme(button.querySelector(".ns-opt-label")?.textContent||"赛博编程")));
  };
  navButton?.addEventListener("click",toggleTheme);

  let effects=window.localStorage.getItem("clone-sound-effects")!=="off";
  let music=window.localStorage.getItem("clone-background-music")==="on";
  const storedVolume=Number(window.localStorage.getItem("clone-sound-volume")??"100");
  let soundVolume=Number.isFinite(storedVolume)?Math.min(100,Math.max(0,storedVolume)):100;
  document.documentElement.dataset.soundEffects=effects?"on":"off";
  document.documentElement.dataset.soundVolume=String(soundVolume/100);
  const audio = new Audio("/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/audio/bgm.mp3");
  audio.loop = true; audio.volume = soundVolume/100;
  document.documentElement.dataset.backgroundMusic=music?"loading":"off";
  const markMusicPlaying=()=>{document.documentElement.dataset.backgroundMusic="playing";};
  const markMusicPaused=()=>{document.documentElement.dataset.backgroundMusic=music?"paused":"off";};
  audio.addEventListener("playing",markMusicPlaying);
  audio.addEventListener("pause",markMusicPaused);
  const savedMusicTime=Number(window.sessionStorage.getItem("clone-background-music-time")||"0");
  const restoreMusicTime=()=>{if(Number.isFinite(savedMusicTime)&&savedMusicTime>0&&Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=savedMusicTime%audio.duration;};
  audio.addEventListener("loadedmetadata",restoreMusicTime,{once:true});
  let resumeMusic:((event:Event)=>void)|null=null;
  const tryPlayMusic=()=>{
    if(!music)return;
    void audio.play().catch(()=>{
      if(resumeMusic)return;
      resumeMusic=()=>{resumeMusic=null;if(music)void audio.play().catch(()=>{});};
      document.addEventListener("pointerdown",resumeMusic,{once:true});
    });
  };
  const saveMusicProgress=()=>{if(Number.isFinite(audio.currentTime))window.sessionStorage.setItem("clone-background-music-time",String(audio.currentTime));};
  audio.addEventListener("timeupdate",saveMusicProgress);
  window.addEventListener("beforeunload",saveMusicProgress);
  if(music)tryPlayMusic();
  let audioContext: AudioContext | null = null;
  const playTone=(type:OscillatorType,from:number,to:number,duration:number,level:number,delay=0)=>{
    audioContext??=new AudioContext();
    if(audioContext.state==="suspended")void audioContext.resume();
    const began=audioContext.currentTime+delay;
    const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();
    oscillator.type=type;oscillator.frequency.setValueAtTime(from,began);oscillator.frequency.exponentialRampToValueAtTime(Math.max(30,to),began+duration);
    gain.gain.setValueAtTime(.0001,began);gain.gain.exponentialRampToValueAtTime(level*(soundVolume/100),began+.015);gain.gain.exponentialRampToValueAtTime(.0001,began+duration);
    oscillator.connect(gain).connect(audioContext.destination);oscillator.start(began);oscillator.stop(began+duration+.02);
  };
  const clickTone = (event: MouseEvent) => {
    if (!effects || (event.target as HTMLElement).closest(".cosmic-nexus") || !(event.target as HTMLElement).closest("button,a")) return;
    try {
      const anchor=(event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if(anchor){
        playTone("sawtooth",170,760,.22,.085);playTone("sine",980,260,.3,.075,.035);playTone("triangle",1280,620,.2,.04,.075);
        const url=new URL(anchor.href,location.href);
        if(url.origin===location.origin&&!anchor.target&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){
          event.preventDefault();saveMusicProgress();window.setTimeout(()=>{location.href=url.href;},150);
        }
      }else{
        playTone("sine",520,840,.11,.065);playTone("triangle",1040,690,.16,.035,.025);
      }
    } catch { /* Audio may be unavailable in a restricted browser. */ }
  };
  document.addEventListener("click", clickTone);
  const toggleSound = () => {
    if(!sound)return;const open=!sound.classList.contains("open");sound.classList.toggle("open",open);
    soundButton?.setAttribute("title",open?"收起声音设置":"声音设置");sound.querySelector(".st-panel")?.remove();if(!open)return;
    const panel=document.createElement("div");panel.className="st-panel";panel.setAttribute("data-v-316b056f","");
    panel.innerHTML=`<div data-v-316b056f class="st-title">声音设置</div><button data-v-316b056f class="st-row ${effects?"on":""}"><span data-v-316b056f class="st-row-ico">🔔</span><span data-v-316b056f class="st-row-label">交互音效</span><span data-v-316b056f class="st-row-state">${effects?"ON":"OFF"}</span></button><button data-v-316b056f class="st-row ${music?"on":""}"><span data-v-316b056f class="st-row-ico">🎶</span><span data-v-316b056f class="st-row-label">背景音乐</span><span data-v-316b056f class="st-row-state">${music?"ON":"OFF"}</span></button><div data-v-316b056f class="st-vol"><span data-v-316b056f class="st-vol-ico">🔊</span><input data-v-316b056f class="st-range" type="range" min="0" max="100" step="1" aria-label="音量 ${soundVolume}%" value="${soundVolume}"><span data-v-316b056f class="st-vol-num">${soundVolume}</span></div><div data-v-316b056f class="st-tip">音乐状态与播放进度会跨页面保持</div>`;
    sound.append(panel);
    panel.querySelectorAll<HTMLButtonElement>(".st-row").forEach((button,index)=>button.addEventListener("click",()=>{if(index===0){effects=!effects;window.localStorage.setItem("clone-sound-effects",effects?"on":"off");document.documentElement.dataset.soundEffects=effects?"on":"off";}else {music=!music;window.localStorage.setItem("clone-background-music",music?"on":"off");if(music)tryPlayMusic();else {saveMusicProgress();audio.pause();}}const on=index===0?effects:music;button.classList.toggle("on",on);button.querySelector(".st-row-state")!.textContent=on?"ON":"OFF";}));
    panel.querySelector<HTMLInputElement>(".st-range")?.addEventListener("input",e=>{soundVolume=Number((e.target as HTMLInputElement).value);panel.querySelector(".st-vol-num")!.textContent=String(soundVolume);audio.volume=soundVolume/100;document.documentElement.dataset.soundVolume=String(soundVolume/100);window.localStorage.setItem("clone-sound-volume",String(soundVolume));});
  };
  soundButton?.addEventListener("click",toggleSound);

  const burger=document.querySelector<HTMLButtonElement>(".VPNavBarHamburger");let mobile:HTMLElement|null=null;
  const toggleMobile=()=>{const open=burger?.getAttribute("aria-expanded")!=="true";burger?.setAttribute("aria-expanded",String(open));document.querySelector(".VPNavBar")?.classList.toggle("screen-open",open);mobile?.remove();mobile=null;if(open){mobile=document.createElement("div");mobile.className="clone-mobile-menu";mobile.innerHTML=links.map(([name,href])=>name==="博客"?`<details class="clone-mobile-blog"><summary>博客 <span aria-hidden="true">⌄</span></summary>${journalLinks.map(([label,url])=>`<a href="${url}">${label}</a>`).join("")}</details>`:`<a href="${href}">${name}</a>`).join("");document.body.append(mobile);}};
  burger?.addEventListener("click",toggleMobile);
  const blogMenu=document.querySelector<HTMLButtonElement>(".VPNavBarMenuGroup button");
  const toggleBlogMenu=()=>{const expanded=blogMenu?.getAttribute("aria-expanded")!=="true";blogMenu?.setAttribute("aria-expanded",String(expanded));blogMenu?.closest(".VPFlyout")?.classList.toggle("clone-flyout-open",expanded);};
  blogMenu?.addEventListener("click",toggleBlogMenu);

  const searchButton=document.querySelector<HTMLButtonElement>(".DocSearch-Button");let search:HTMLElement|null=null;
  const closeSearch=()=>{search?.remove();search=null;};
  const openSearch=()=>{if(search)return;search=document.createElement("div");search.className="clone-search-mask";
    search.innerHTML='<div class="clone-search-box"><div class="clone-search-input"><span>⌕</span><input placeholder="搜索文档" aria-label="搜索文档"><button class="clone-search-close">ESC</button></div><div class="clone-search-results"></div><div class="clone-search-foot">搜索站内页面</div></div>';
    document.body.append(search);const layer=search,input=layer.querySelector<HTMLInputElement>("input")!,results=layer.querySelector<HTMLElement>(".clone-search-results")!;
    const update=()=>{const q=input.value.toLowerCase();results.innerHTML=searchLinks.filter(([name])=>!q||name.toLowerCase().includes(q)).map(([name,href])=>`<a href="${href}">▤ &nbsp; ${name}<span>↗</span></a>`).join("")||"<p>❌ 未找到相关结果</p>";};
    input.addEventListener("input",update);update();input.focus();layer.querySelector(".clone-search-close")?.addEventListener("click",closeSearch);layer.addEventListener("click",e=>{if(e.target===layer)closeSearch();});};
  searchButton?.addEventListener("click",openSearch);
  const keydown=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch();}if(e.key==="Escape")closeSearch();};
  document.addEventListener("keydown",keydown);
  return ()=>{navButton?.removeEventListener("click",toggleTheme);soundButton?.removeEventListener("click",toggleSound);burger?.removeEventListener("click",toggleMobile);blogMenu?.removeEventListener("click",toggleBlogMenu);searchButton?.removeEventListener("click",openSearch);document.removeEventListener("keydown",keydown);document.removeEventListener("click",clickTone);document.removeEventListener("visibilitychange",syncOrbitPlayback);if(resumeMusic)document.removeEventListener("pointerdown",resumeMusic);window.removeEventListener("beforeunload",saveMusicProgress);audio.removeEventListener("timeupdate",saveMusicProgress);audio.removeEventListener("playing",markMusicPlaying);audio.removeEventListener("pause",markMusicPaused);saveMusicProgress();audio.pause();star?.querySelector("video")?.pause();void audioContext?.close();closeSearch();mobile?.remove();if(createdStar)star?.remove();disposeGalaxy();};
}
