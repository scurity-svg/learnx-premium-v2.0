const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const boot=$('#boot'), gate=$('#authGate'), intro=$('#intro'), app=$('#app'), video=$('#introVideo'), nextWrap=$('#nextWrap');

setTimeout(()=>boot.classList.add('hidden'),850);

function startIntroVideo(){
  nextWrap.classList.remove('show');
  $('#videoError').classList.add('hidden');
  video.muted=true;
  video.controls=false;
  video.currentTime=0;
  video.load();
  const playPromise=video.play();
  if(playPromise && playPromise.catch){
    playPromise.catch(()=>{
      video.muted=true;
      video.play().catch(()=>$('#videoError').classList.remove('hidden'));
    });
  }
}

$('#fingerprint').addEventListener('click',()=>{
  const status=$('#authStatus');
  status.innerHTML='<i style="background:#b77cff;box-shadow:0 0 14px #b77cff"></i> MEMINDAI...';
  $('#fingerprint').style.pointerEvents='none';
  setTimeout(()=>{
    status.innerHTML='<i></i> AKSES TERVERIFIKASI';
    gate.style.opacity='0';
    gate.style.transition='.45s';
    setTimeout(()=>{
      gate.classList.add('hidden');
      intro.classList.remove('hidden');
      startIntroVideo();
    },450);
  },1300);
});

video.addEventListener('error',()=>$('#videoError').classList.remove('hidden'));
video.addEventListener('loadeddata',()=>$('#videoError').classList.add('hidden'));

$('#introMute').addEventListener('click',()=>{
  video.muted=!video.muted;
  $('#introMute').innerHTML=video.muted?'<span class="svg-icon" data-icon="volume-off"></span>':'<span class="svg-icon" data-icon="volume"></span>'; mountIcons();
});
video.addEventListener('ended',()=>nextWrap.classList.add('show'));
$('#nextBtn').addEventListener('click',()=>{
  intro.classList.add('hidden');
  app.classList.remove('hidden');
  window.scrollTo({top:0,behavior:'instant'});
  setTimeout(()=>speakWelcomeThenPlay(),120);
  toast('Learning OS siap digunakan');
});

function openSection(id){
  $$('.page').forEach(p=>p.classList.toggle('active-page',p.id===id));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.section===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-section]').forEach(el=>el.addEventListener('click',e=>{
  const id=el.dataset.section;
  if(id) openSection(id);
}));

const search=$('#globalSearch');
search.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    const q=search.value.trim().toLowerCase();
    const map=[['jepang','japanese'],['japan','japanese'],['iq','iq'],['psikologi','psychology'],['fokus','focus'],['catatan','notes'],['progress','progress'],['kurikulum','curriculum']];
    const hit=map.find(([k])=>q.includes(k));
    openSection(hit?hit[1]:'curriculum');
    toast(hit?`Membuka ${hit[0]}`:'Membuka kurikulum');
  }
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();}
});

const musicDock=$('#musicDock');
$('#musicOpen').onclick=()=>musicDock.classList.add('open');
$('#musicClose').onclick=()=>musicDock.classList.remove('open');
$('#themeBtn').onclick=()=>document.body.classList.toggle('light');
const tracks=['ambient','night','zen']; let trackIndex=0, playing=false, audioCtx=null, osc=null, gain=null;
const names={ambient:'Ambient Focus',night:'Night Study',zen:'Zen Notes'};
function updateTrack(){ $('#trackName').textContent=names[tracks[trackIndex]]; $('#trackMeta').textContent='LearnX Sound Engine • Generated locally'; }
function stopTone(){ if(osc){try{osc.stop()}catch{} osc=null} if(audioCtx){audioCtx.close();audioCtx=null} }
function startTone(){
  stopTone();
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  gain=audioCtx.createGain(); gain.gain.value=Number($('#volume').value)*.05; gain.connect(audioCtx.destination);
  osc=audioCtx.createOscillator(); osc.type=trackIndex===2?'sine':'triangle'; osc.frequency.value=trackIndex===1?174:trackIndex===2?220:196; osc.connect(gain); osc.start();
}
$('#play').onclick=()=>{playing=!playing;$('#play').innerHTML=playing?'<span class="svg-icon" data-icon="pause"></span>':'<span class="svg-icon" data-icon="play"></span>'; mountIcons();if(playing)startTone();else stopTone()};
$('#prev').onclick=()=>{trackIndex=(trackIndex+tracks.length-1)%tracks.length;updateTrack();if(playing)startTone()};
$('#next').onclick=()=>{trackIndex=(trackIndex+1)%tracks.length;updateTrack();if(playing)startTone()};
$('#volume').oninput=e=>{if(gain)gain.gain.value=Number(e.target.value)*.05};
$$('#trackList button').forEach((b,i)=>b.onclick=()=>{trackIndex=i;updateTrack();playing=true;$('#play').innerHTML='<span class="svg-icon" data-icon="pause"></span>'; mountIcons();startTone()});
$('#musicSearch').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  $$('#trackList button').forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?'block':'none');
});

const iq=[
 ['Jika semua A adalah B, dan semua B adalah C, maka...',['Semua A adalah C','Semua C adalah A','Tidak ada A yang C','Tidak dapat ditentukan'],0],
 ['Pola: 2, 4, 8, 16, ...',['18','24','32','36'],2],
 ['Mana yang berbeda?',['Segitiga','Persegi','Lingkaran','Kubus'],3],
 ['Jika 3 buku = 30.000, maka 5 buku = ...',['40.000','45.000','50.000','60.000'],2],
 ['Urutan huruf: A, C, F, J, O, ...',['R','S','T','U'],3]
];
let iqStep=0,iqScore=0;
function renderIQ(){
  const [q,a]=iq[iqStep];$('#iqQuestion').textContent=q;$('#iqNum').textContent=iqStep+1;$('#iqBar').style.width=((iqStep+1)/iq.length*100)+'%';
  $('#iqAnswers').innerHTML=a.map((x,i)=>`<button class="answer" data-i="${i}">${x}</button>`).join('');
  $$('#iqAnswers .answer').forEach(b=>b.onclick=()=>{
    if(+b.dataset.i===iq[iqStep][2])iqScore++;
    iqStep++;
    if(iqStep<iq.length)renderIQ();else{
      $('#iqAnswers').innerHTML='';
      $('#iqResult').classList.remove('hidden');
      $('#iqResult').innerHTML=`<b>Simulasi selesai — ${iqScore}/${iq.length}</b><br><small>Gunakan skor ini sebagai latihan logika, bukan diagnosis IQ resmi.</small>`;
    }
  });
}
renderIQ();

let secs=1500,timerInt=null;
function showTime(){let m=Math.floor(secs/60),s=secs%60;$('#timer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
$('#timerStart').onclick=()=>{
  if(timerInt){clearInterval(timerInt);timerInt=null;$('#timerStart').textContent='Mulai';return}
  $('#timerStart').textContent='Jeda';timerInt=setInterval(()=>{secs=Math.max(0,secs-1);showTime();if(secs===0){clearInterval(timerInt);timerInt=null;toast('Sesi fokus selesai')}} ,1000)
};
$('#timerReset').onclick=()=>{clearInterval(timerInt);timerInt=null;secs=1500;showTime();$('#timerStart').textContent='Mulai'};

const notes=$('#notesArea');notes.value=localStorage.getItem('learnx_notes')||'';
notes.addEventListener('input',()=>{localStorage.setItem('learnx_notes',notes.value);toast('Catatan tersimpan')});

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1300)}

document.addEventListener('pointerdown',e=>{
  if(!$('#touchToggle').checked)return;
  const r=document.createElement('span');r.className='touch-ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),650);
});
$('#liveToggle').addEventListener('change',e=>document.body.style.setProperty('--live',e.target.checked?'1':'0'));
updateTrack();


// Dashboard welcome voice + dashboard video sequencing.
// The greeting is spoken first; the dashboard video starts only after it finishes.
const dashboardVideo = $('#dashboardVideo');
const dashboardMute = $('#dashboardMute');
let dashboardStarted = false;

function updateDashboardMuteIcon(){
  if(!dashboardMute || !dashboardVideo) return;
  dashboardMute.innerHTML = dashboardVideo.muted
    ? '<span class="svg-icon" data-icon="volume-off"></span>'
    : '<span class="svg-icon" data-icon="volume"></span>';
  mountIcons();
}

function speakWelcomeThenPlay(){
  if(!dashboardVideo || dashboardStarted) return;
  dashboardStarted = true;
  dashboardVideo.pause();
  dashboardVideo.currentTime = 0;
  dashboardVideo.muted = false;
  updateDashboardMuteIcon();

  const play = () => {
    const p = dashboardVideo.play();
    if(p && p.catch) p.catch(() => {
      // Mobile browsers may require one more tap; the video remains visible with controls disabled.
      dashboardVideo.muted = true;
      updateDashboardMuteIcon();
      dashboardVideo.play().catch(()=>{});
    });
  };

  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance('Hello everyone, welcome to LearnX');
    utter.lang = 'en-US';
    utter.rate = 0.88;
    utter.pitch = 1.04;
    utter.volume = 0.72;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      /female|samantha|zira|aria|jenny|ava|google us english/i.test(v.name)
    ) || voices.find(v => /^en(-|_)/i.test(v.lang));
    if(preferred) utter.voice = preferred;

    utter.onend = play;
    utter.onerror = play;
    window.speechSynthesis.speak(utter);

    // Some Android WebViews need a voice list warm-up.
    if(!voices.length){
      setTimeout(() => {
        const refreshed = window.speechSynthesis.getVoices();
        if(refreshed.length && !window.speechSynthesis.speaking){
          window.speechSynthesis.speak(utter);
        }
      }, 250);
    }
  }else{
    setTimeout(play, 500);
  }
}

dashboardMute?.addEventListener('click',()=>{
  dashboardVideo.muted = !dashboardVideo.muted;
  updateDashboardMuteIcon();
});

dashboardVideo?.addEventListener('play',()=>dashboardStarted=true);
dashboardVideo?.addEventListener('ended',()=>dashboardVideo.currentTime=0);
