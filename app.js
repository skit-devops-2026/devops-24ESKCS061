/* ================================================================
   StudyOS — Application Logic
   All data below is YOURS: nothing is pre-filled. Everything you
   see was added through the UI and is saved to this browser via
   localStorage under the key "studyos_v1".
   ================================================================ */

const STORAGE_KEY = 'studyos_v1';

/* ================= STATE ================= */
function blankState(){
  return {
    user:{name:'', email:''},
    xp:0, level:1, streak:0,
    tasks:[],
    notes:[],
    subjects:['General'],
    timetable:{},              // { Mon:{ '9-10':{s:'Subject', c:'#hex'} } }
    goals:[],
    skills:[],
    expenses:[],
    budget:0,
    badges:[
      {name:'Early Bird',icon:'🌅',earned:false},
      {name:'7-Day Streak',icon:'🔥',earned:false},
      {name:'Task Slayer',icon:'⚔️',earned:false},
      {name:'Note Taker',icon:'📓',earned:false},
      {name:'Focus Master',icon:'🎯',earned:false},
      {name:'Goal Getter',icon:'🏆',earned:false},
    ],
    missions:[
      {text:'Complete 3 tasks today',xp:30,done:false},
      {text:'Study for 45 focus minutes',xp:40,done:false},
      {text:'Add 1 new note',xp:15,done:false},
    ],
    focusStats:{sessionsToday:0, minutesToday:0, weeklyMinutes:[0,0,0,0,0,0,0]},
  };
}
let state = blankState();
state.windowsOpen = [];
state.zTop = 20;

const appDefs = [
  {id:'dashboard', name:'Dashboard', icon:'🖥️', accent:'var(--violet)'},
  {id:'tasks', name:'Tasks', icon:'✅', accent:'var(--lime)'},
  {id:'notes', name:'Notes', icon:'📝', accent:'var(--gold)'},
  {id:'timetable', name:'Timetable', icon:'📅', accent:'var(--sky)'},
  {id:'goals', name:'Goals & Skills', icon:'🎯', accent:'var(--pink)'},
  {id:'analytics', name:'Analytics', icon:'📈', accent:'var(--violet)'},
  {id:'focus', name:'Focus Mode', icon:'⏱️', accent:'var(--coral)'},
  {id:'gamify', name:'Achievements', icon:'🎮', accent:'var(--gold)'},
  {id:'expenses', name:'Expenses', icon:'💰', accent:'var(--lime)'},
];

/* ================= PERSISTENCE ================= */
function saveState(){
  try{
    const {windowsOpen, zTop, ...persist} = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  }catch(e){ console.warn('StudyOS: could not save data', e); }
}
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return false;
    const saved = JSON.parse(raw);
    state = Object.assign(blankState(), saved);
    state.windowsOpen = [];
    state.zTop = 20;
    return true;
  }catch(e){ console.warn('StudyOS: could not load saved data', e); return false; }
}
function resetAllData(){
  if(!confirm('This clears everything you\'ve added and cannot be undone. Continue?')) return;
  localStorage.removeItem(STORAGE_KEY);
  state = blankState();
  state.windowsOpen = []; state.zTop = 20;
  document.getElementById('loginName').value='';
  document.getElementById('loginEmail').value='';
  document.getElementById('loginResetWrap').style.display='none';
  document.getElementById('loginHint').textContent='Your data is saved in this browser only.';
}

/* On script load, check for a returning user and prefill the login form */
(function initReturning(){
  const had = loadState();
  if(had && state.user.name){
    document.addEventListener('DOMContentLoaded', ()=>{
      document.getElementById('loginName').value = state.user.name;
      document.getElementById('loginEmail').value = state.user.email;
      document.getElementById('loginHint').textContent = `Welcome back, ${state.user.name.split(' ')[0]} — your saved data will load.`;
      document.getElementById('loginResetWrap').style.display='block';
    });
  } else {
    state = blankState(); state.windowsOpen=[]; state.zTop=20;
  }
})();

/* ================= LOGIN ================= */
function login(){
  const name = document.getElementById('loginName').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  if(!name){ document.getElementById('loginName').focus(); return; }
  state.user.name = name; state.user.email = email;
  saveState();
  document.getElementById('profileName').textContent = name.split(' ')[0];
  document.getElementById('avatarInitial').textContent = name[0].toUpperCase();
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('desktop').style.display='block';
  document.getElementById('taskbar').style.display='flex';
  buildDesktopIcons();
  updateClock(); setInterval(updateClock,1000);
  renderNotifPanel();
  openWindow('dashboard');
}

/* ================= DESKTOP ICONS ================= */
function buildDesktopIcons(){
  const grid = document.getElementById('iconGrid');
  grid.innerHTML='';
  appDefs.forEach(app=>{
    const el = document.createElement('button');
    el.className='desk-icon';
    el.ondblclick=()=>openWindow(app.id);
    el.onclick=()=>openWindow(app.id);
    el.innerHTML = `<div class="ico" style="background:${app.accent}22;border:1px solid ${app.accent}55;">${app.icon}</div><span>${app.name}</span>`;
    grid.appendChild(el);
  });
}

/* ================= CLOCK ================= */
function updateClock(){
  const now = new Date();
  document.getElementById('clockTime').textContent = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  document.getElementById('clockDate').textContent = now.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
}

/* ================= WINDOW MANAGER ================= */
const windowRenderers = {
  dashboard: renderDashboard, tasks: renderTasks, notes: renderNotes,
  timetable: renderTimetable, goals: renderGoals, analytics: renderAnalytics,
  focus: renderFocus, gamify: renderGamify, expenses: renderExpenses,
};

function openWindow(id){
  let win = document.getElementById('win-'+id);
  const app = appDefs.find(a=>a.id===id);
  if(!win){
    win = document.createElement('div');
    win.className='win';
    win.id='win-'+id;
    win.style.left = (60 + appDefs.findIndex(a=>a.id===id)*26 % 300) + 'px';
    win.style.top = (40 + appDefs.findIndex(a=>a.id===id)*18 % 160) + 'px';
    win.style.width = '620px';
    win.style.height = '520px';
    win.style.setProperty('--accent', app.accent);
    win.innerHTML = `
      <div class="win-titlebar" onmousedown="startDrag(event,'${id}')">
        <span class="wt-icon">${app.icon}</span>
        <span class="wt-title">${app.name}</span>
        <div class="win-controls">
          <button onclick="minimizeWindow('${id}')" title="Minimize">–</button>
          <button class="wc-close" onclick="closeWindow('${id}')" title="Close">✕</button>
        </div>
      </div>
      <div class="win-body" id="body-${id}"></div>
    `;
    document.getElementById('windowsLayer').appendChild(win);
    win.addEventListener('mousedown', ()=>focusWindow(id));
  }
  win.classList.add('open');
  win.style.display='flex';
  focusWindow(id);
  if(windowRenderers[id]) windowRenderers[id]();
  if(!state.windowsOpen.includes(id)) state.windowsOpen.push(id);
  syncTaskbar();
}
function closeWindow(id){
  const win = document.getElementById('win-'+id);
  if(win){win.classList.remove('open'); win.style.display='none';}
  state.windowsOpen = state.windowsOpen.filter(w=>w!==id);
  syncTaskbar();
}
function minimizeWindow(id){
  const win = document.getElementById('win-'+id);
  if(win) win.style.display='none';
  syncTaskbar();
}
function focusWindow(id){
  const win = document.getElementById('win-'+id);
  if(!win) return;
  state.zTop++;
  win.style.zIndex = state.zTop;
  document.querySelectorAll('.tb-app').forEach(b=>b.classList.remove('active'));
  const tb = document.getElementById('tb-'+id);
  if(tb) tb.classList.add('active');
}
function syncTaskbar(){
  const bar = document.getElementById('taskbarApps');
  bar.innerHTML='';
  state.windowsOpen.forEach(id=>{
    const app = appDefs.find(a=>a.id===id);
    const b = document.createElement('button');
    b.className='tb-app'; b.id='tb-'+id;
    b.innerHTML = `${app.icon} ${app.name}`;
    b.onclick = ()=>{
      const win = document.getElementById('win-'+id);
      if(win.style.display==='none'){win.style.display='flex'; focusWindow(id);}
      else{win.style.display='none';}
    };
    bar.appendChild(b);
  });
}

let dragCtx=null;
function startDrag(e,id){
  const win = document.getElementById('win-'+id);
  focusWindow(id);
  dragCtx = {win, offX: e.clientX - win.offsetLeft, offY: e.clientY - win.offsetTop};
}
document.addEventListener('mousemove', e=>{
  if(!dragCtx) return;
  dragCtx.win.style.left = Math.max(0, e.clientX - dragCtx.offX) + 'px';
  dragCtx.win.style.top = Math.max(0, e.clientY - dragCtx.offY) + 'px';
});
document.addEventListener('mouseup', ()=> dragCtx=null);

/* ================= SEARCH ================= */
function toggleSearch(){
  const ov = document.getElementById('searchOverlay');
  const show = ov.style.display!=='flex';
  ov.style.display = show?'flex':'none';
  if(show){ document.getElementById('searchInput').value=''; document.getElementById('searchResults').style.display='none'; document.getElementById('searchInput').focus(); }
}
function runSearch(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const box = document.getElementById('searchResults');
  if(!q){ box.style.display='none'; return; }
  let results=[];
  state.tasks.forEach(t=>{ if(t.title.toLowerCase().includes(q)||t.subject.toLowerCase().includes(q)) results.push({type:'Task',color:'var(--lime)',label:t.title,go:'tasks'}); });
  state.notes.forEach(n=>{ if(n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q)||n.subject.toLowerCase().includes(q)) results.push({type:'Note',color:'var(--gold)',label:n.title,go:'notes'}); });
  state.goals.forEach(g=>{ if(g.title.toLowerCase().includes(q)) results.push({type:'Goal',color:'var(--pink)',label:g.title,go:'goals'}); });
  state.subjects.forEach(s=>{ if(s.toLowerCase().includes(q)) results.push({type:'Subject',color:'var(--sky)',label:s,go:'timetable'}); });
  box.innerHTML = results.length ? results.map(r=>`
    <div class="sr-item" onclick="openWindow('${r.go}');toggleSearch();">
      <span class="sr-tag" style="background:${r.color}22;color:${r.color};">${r.type}</span>
      <span>${r.label}</span>
    </div>`).join('') : `<div class="sr-item" style="color:var(--text-faint);">No results for "${q}"</div>`;
  box.style.display='block';
}

/* ================= NOTIFICATIONS (computed live from your data) ================= */
function computeNotifications(){
  const notifs=[];
  state.tasks.filter(t=>!t.done).forEach(t=>{
    const type = t.priority==='high' ? 'danger' : t.priority==='medium' ? 'gold' : 'mint';
    notifs.push({msg:`${t.title} — ${t.due}`, time:t.subject, type});
  });
  state.goals.filter(g=>g.progress>=100).forEach(g=>{
    notifs.push({msg:`Goal complete: ${g.title}`, time:'🏆', type:'mint'});
  });
  return notifs;
}
function toggleNotif(){
  const p = document.getElementById('notifPanel');
  const show = p.style.display!=='block';
  p.style.display = show ? 'block':'none';
  if(show) renderNotifPanel();
}
function renderNotifPanel(){
  const notifs = computeNotifications();
  document.getElementById('notifBadge').textContent = notifs.length;
  const colors={danger:'var(--coral)',sky:'var(--sky)',gold:'var(--gold)',mint:'var(--lime)'};
  document.getElementById('notifList').innerHTML = notifs.length ? notifs.map(n=>`
    <div class="notif-item">
      <div class="notif-dot" style="background:${colors[n.type]}"></div>
      <div><div>${n.msg}</div><div class="t">${n.time||''}</div></div>
    </div>`).join('') : `<div class="notif-item">Nothing here yet — add tasks or goals to see reminders.</div>`;
}

/* ================= GAMIFICATION HELPERS ================= */
function addXP(amount){
  state.xp += amount;
  const needed = state.level*100;
  if(state.xp>=needed){ state.xp-=needed; state.level++; }
  saveState();
  if(document.getElementById('body-dashboard')) renderDashboard();
  if(document.getElementById('body-gamify')) renderGamify();
}

/* ================= DASHBOARD ================= */
function renderDashboard(){
  const el = document.getElementById('body-dashboard'); if(!el) return;
  const pendingTasks = state.tasks.filter(t=>!t.done);
  const completedToday = state.tasks.filter(t=>t.done).length;
  el.innerHTML = `
    <div class="app-header">
      <div><h2>Welcome back, ${state.user.name.split(' ')[0]||'there'} 👋</h2><p>Here's your day at a glance.</p></div>
      <button class="btn ghost small" onclick="openWindow('focus')">Start Focus Session</button>
    </div>
    <div class="grid-cards">
      <div class="stat-card"><div class="sc-label">Tasks Pending</div><div class="sc-value">${pendingTasks.length}</div><div class="sc-sub">${completedToday} completed</div></div>
      <div class="stat-card"><div class="sc-label">Study Streak</div><div class="sc-value">${state.streak} 🔥</div><div class="sc-sub">days in a row</div></div>
      <div class="stat-card"><div class="sc-label">Level</div><div class="sc-value">Lv ${state.level}</div><div class="sc-sub">${state.xp}/${state.level*100} XP</div></div>
      <div class="stat-card"><div class="sc-label">Subjects</div><div class="sc-value" style="font-size:16px;">${state.subjects.join(', ')}</div></div>
    </div>
    <div class="section-title">📌 Your Tasks</div>
    ${pendingTasks.length ? pendingTasks.slice(0,5).map(t=>`
      <div class="task-row">
        <div class="task-check" onclick="toggleTask(${t.id})">✓</div>
        <div class="task-title">${t.title}</div>
        <div class="task-meta"><span>${t.subject}</span><span>· ${t.due}</span></div>
      </div>`).join('') : `<div class="empty-state">No tasks yet. Open the <strong>Tasks</strong> app to add your first one.</div>`}
    <div class="section-title">🎯 Your Goals</div>
    ${state.goals.length ? state.goals.map(g=>`
      <div class="goal-card">
        <div class="gc-top"><h4>${g.title}</h4><span style="font-family:var(--font-mono);font-size:12px;color:var(--text-dim);">${g.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%"></div></div>
      </div>`).join('') : `<div class="empty-state">No goals yet. Open <strong>Goals & Skills</strong> to set one.</div>`}
  `;
}

/* ================= TASKS ================= */
function renderTasks(){
  const el = document.getElementById('body-tasks'); if(!el) return;
  el.innerHTML = `
    <div class="app-header"><div><h2>Task Manager</h2><p>${state.tasks.filter(t=>!t.done).length} pending · ${state.tasks.filter(t=>t.done).length} done</p></div></div>
    <div class="form-row">
      <input type="text" id="newTaskTitle" placeholder="Add a new task...">
      <select id="newTaskSubject">${state.subjects.map(s=>`<option>${s}</option>`).join('')}</select>
      <select id="newTaskPriority"><option value="high">High</option><option value="medium" selected>Medium</option><option value="low">Low</option></select>
      <input type="text" id="newTaskDue" placeholder="Due (e.g. Fri)" style="width:110px;">
      <button class="btn" onclick="addTask()">Add Task</button>
      <button class="btn ghost small" onclick="addSubject()">+ Subject</button>
    </div>
    <div id="taskListWrap"></div>
  `;
  renderTaskList();
}
function renderTaskList(){
  const wrap = document.getElementById('taskListWrap'); if(!wrap) return;
  const prioColor={high:'var(--coral)',medium:'var(--gold)',low:'var(--lime)'};
  const sorted = [...state.tasks].sort((a,b)=>a.done-b.done);
  wrap.innerHTML = sorted.length ? sorted.map(t=>`
    <div class="task-row ${t.done?'done':''}">
      <div class="task-check" onclick="toggleTask(${t.id})">✓</div>
      <div class="task-title">${t.title}</div>
      <span class="pill-tag" style="background:${prioColor[t.priority]}22;color:${prioColor[t.priority]}">${t.priority}</span>
      <div class="task-meta"><span>${t.subject}</span><span>· ${t.due}</span></div>
      <button class="task-del" onclick="deleteTask(${t.id})">✕</button>
    </div>`).join('') : `<div class="empty-state">No tasks yet. Add your first one above.</div>`;
}
function addTask(){
  const title = document.getElementById('newTaskTitle').value.trim();
  if(!title) return;
  const subject = document.getElementById('newTaskSubject').value;
  const priority = document.getElementById('newTaskPriority').value;
  const due = document.getElementById('newTaskDue').value.trim() || 'No due date';
  state.tasks.push({id:Date.now(), title, subject, priority, due, done:false});
  document.getElementById('newTaskTitle').value='';
  document.getElementById('newTaskDue').value='';
  saveState();
  renderTaskList();
  renderNotifPanel();
}
function toggleTask(id){
  const t = state.tasks.find(t=>t.id===id);
  t.done = !t.done;
  if(t.done) addXP(10);
  saveState();
  renderTaskList();
  renderNotifPanel();
  if(document.getElementById('body-dashboard')) renderDashboard();
}
function deleteTask(id){
  state.tasks = state.tasks.filter(t=>t.id!==id);
  saveState();
  renderTaskList();
  renderNotifPanel();
}

/* ================= SUBJECT MANAGEMENT ================= */
function addSubject(){
  const name = prompt('New subject name:'); if(!name || !name.trim()) return;
  if(!state.subjects.includes(name.trim())) state.subjects.push(name.trim());
  saveState();
  if(document.getElementById('body-tasks')) renderTasks();
  if(document.getElementById('body-notes')) renderNotes();
  if(document.getElementById('body-timetable')) renderTimetable();
}

/* ================= NOTES ================= */
let activeFolder = 'All';
function renderNotes(){
  const el = document.getElementById('body-notes'); if(!el) return;
  el.classList.add('no-pad');
  el.innerHTML = `
    <div style="display:flex;height:100%;">
      <div class="notes-sidebar" style="padding:16px 10px;border-right:1px solid var(--line-soft);">
        <div class="folder-item ${activeFolder==='All'?'active':''}" onclick="setFolder('All')">All Notes <span>${state.notes.length}</span></div>
        ${state.subjects.map(s=>`<div class="folder-item ${activeFolder===s?'active':''}" onclick="setFolder('${s}')">${s} <span>${state.notes.filter(n=>n.subject===s).length}</span></div>`).join('')}
        <button class="btn ghost small" style="width:100%;margin-top:8px;" onclick="addSubject()">+ Subject</button>
      </div>
      <div class="notes-main" style="padding:16px 18px;">
        <div class="form-row">
          <input type="text" id="noteSearch" placeholder="Search notes..." oninput="renderNoteList()">
          <button class="btn small" onclick="openNoteEditor()">+ New Note</button>
        </div>
        <div id="noteListWrap"></div>
      </div>
    </div>
  `;
  renderNoteList();
}
function setFolder(f){ activeFolder=f; renderNotes(); }
function renderNoteList(){
  const wrap = document.getElementById('noteListWrap'); if(!wrap) return;
  const q = (document.getElementById('noteSearch')?.value||'').toLowerCase();
  let list = state.notes.filter(n=> activeFolder==='All' || n.subject===activeFolder);
  if(q) list = list.filter(n=>n.title.toLowerCase().includes(q)||n.body.toLowerCase().includes(q));
  wrap.innerHTML = list.length ? list.map(n=>`
    <div class="note-card">
      <h4>${n.title}</h4><p>${n.body.slice(0,140)}${n.body.length>140?'…':''}</p>
      <div class="nc-foot"><span>${n.subject} · ${n.date}</span>
        <span><button class="task-del" onclick="openNoteEditor(${n.id})">✎</button><button class="task-del" onclick="deleteNote(${n.id})">✕</button></span>
      </div>
    </div>`).join('') : `<div class="empty-state">No notes here yet. Click "+ New Note" to start.</div>`;
}
function openNoteEditor(id){
  const note = id ? state.notes.find(n=>n.id===id) : null;
  const wrap = document.getElementById('noteListWrap');
  wrap.innerHTML = `
    <div class="form-row"><input type="text" id="edTitle" placeholder="Title" value="${note?note.title:''}" style="flex:1"></div>
    <div class="form-row"><select id="edSubject">${state.subjects.map(s=>`<option ${note&&note.subject===s?'selected':''}>${s}</option>`).join('')}</select></div>
    <div class="form-row"><textarea id="edBody" rows="8" style="flex:1;width:100%;" placeholder="Write your note...">${note?note.body:''}</textarea></div>
    <div class="form-row"><button class="btn" onclick="saveNote(${id||0})">Save Note</button><button class="btn ghost" onclick="renderNoteList()">Cancel</button></div>
  `;
}
function saveNote(id){
  const title = document.getElementById('edTitle').value.trim() || 'Untitled';
  const subject = document.getElementById('edSubject').value;
  const body = document.getElementById('edBody').value;
  const date = new Date().toLocaleDateString([], {month:'short', day:'numeric'});
  if(id){ const n = state.notes.find(n=>n.id===id); Object.assign(n,{title,subject,body,date}); }
  else{ state.notes.unshift({id:Date.now(),title,subject,body,date}); addXP(15); }
  saveState();
  renderNoteList();
}
function deleteNote(id){ state.notes = state.notes.filter(n=>n.id!==id); saveState(); renderNoteList(); }

/* ================= TIMETABLE ================= */
const TT_PALETTE = ['#9B5CFF','#FF4FA3','#3DD9FF','#B9FF3D','#FFC24B','#FF5C5C'];
function renderTimetable(){
  const el = document.getElementById('body-timetable'); if(!el) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const slots = ['9-10','10-11','11-12','1-2','2-3','3-4'];
  el.innerHTML = `
    <div class="app-header"><div><h2>Weekly Timetable</h2><p>Click any empty cell to add a class · click a filled one to remove it.</p></div></div>
    <div class="tt-grid">
      <div></div>${days.map(d=>`<div class="tt-head">${d}</div>`).join('')}
      ${slots.map(slot=>`
        <div class="tt-time">${slot}</div>
        ${days.map(d=>{
          const cls = state.timetable[d] && state.timetable[d][slot];
          return `<div class="tt-cell" onclick="timetableCellClick('${d}','${slot}')">${cls?`<div class="tt-class" style="background:${cls.c}">${cls.s}</div>`:''}</div>`;
        }).join('')}
      `).join('')}
    </div>
    <div class="section-title">⏰ Reminders</div>
    ${state.tasks.filter(t=>!t.done).length ? state.tasks.filter(t=>!t.done).slice(0,4).map(t=>`
      <div class="task-row"><div class="task-check" style="border-color:var(--sky)"></div><div class="task-title">${t.title} — ${t.due}</div></div>
    `).join('') : `<div class="empty-state">Add tasks to see reminders here.</div>`}
  `;
}
function timetableCellClick(day, slot){
  const existing = state.timetable[day] && state.timetable[day][slot];
  if(existing){
    if(confirm(`Remove "${existing.s}" from ${day} ${slot}?`)){
      delete state.timetable[day][slot];
      saveState();
      renderTimetable();
    }
    return;
  }
  const subject = prompt('Class / subject name:');
  if(!subject || !subject.trim()) return;
  const color = TT_PALETTE[Math.floor(Math.random()*TT_PALETTE.length)];
  if(!state.timetable[day]) state.timetable[day] = {};
  state.timetable[day][slot] = {s:subject.trim(), c:color};
  saveState();
  renderTimetable();
}

/* ================= GOALS & SKILLS ================= */
function renderGoals(){
  const el = document.getElementById('body-goals'); if(!el) return;
  const levelColor={Mastered:'var(--lime)',Proficient:'var(--sky)',Learning:'var(--gold)',Locked:'var(--text-faint)'};
  el.innerHTML = `
    <div class="app-header"><div><h2>Goal & Skill Center</h2><p>Track long-term academic and career goals.</p></div>
      <button class="btn small" onclick="addGoal()">+ New Goal</button></div>
    <div class="section-title">🎯 Goals</div>
    ${state.goals.length ? state.goals.map(g=>`
      <div class="goal-card">
        <div class="gc-top"><h4>${g.title} <span class="pill-tag" style="background:var(--violet-dim);color:#fff;margin-left:6px;">${g.type}</span></h4>
        <span style="font-family:var(--font-mono);font-size:12px;">${g.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${g.progress}%"></div></div>
        <div style="margin-top:8px;display:flex;gap:6px;">
          <button class="btn small ghost" onclick="bumpGoal(${g.id})">+10% progress</button>
          <button class="task-del" onclick="deleteGoal(${g.id})">✕</button>
        </div>
      </div>`).join('') : `<div class="empty-state">No goals yet. Click "+ New Goal" to add one.</div>`}
    <div class="section-title">🌳 Skills <button class="btn ghost small" style="margin-left:auto;" onclick="addSkill()">+ Add Skill</button></div>
    <div class="skill-tree">
      ${state.skills.length ? state.skills.map(s=>`
        <div class="skill-node ${s.level==='Mastered'?'mastered':''}">
          <span style="color:${levelColor[s.level]||'var(--text-faint)'}">●</span> ${s.name} <span style="color:var(--text-faint)">· ${s.level}</span>
          <button class="task-del" onclick="deleteSkill('${s.name.replace(/'/g,"\\'")}')" style="padding:0 0 0 4px;">✕</button>
        </div>`).join('') : `<div class="empty-state">No skills tracked yet.</div>`}
    </div>
  `;
}
function addGoal(){
  const title = prompt('New goal title:'); if(!title || !title.trim()) return;
  const type = prompt('Goal type (Academic / Career / Skill):','Academic') || 'Academic';
  state.goals.push({id:Date.now(), title:title.trim(), type, progress:0});
  saveState();
  renderGoals();
}
function bumpGoal(id){
  const g = state.goals.find(g=>g.id===id);
  g.progress = Math.min(100, g.progress+10);
  if(g.progress===100) addXP(25);
  saveState();
  renderGoals();
}
function deleteGoal(id){ state.goals = state.goals.filter(g=>g.id!==id); saveState(); renderGoals(); }
function addSkill(){
  const name = prompt('Skill name:'); if(!name || !name.trim()) return;
  const level = prompt('Level — Locked, Learning, Proficient, or Mastered:','Learning') || 'Learning';
  state.skills.push({name:name.trim(), level:level.trim()});
  saveState();
  renderGoals();
}
function deleteSkill(name){
  state.skills = state.skills.filter(s=>s.name!==name);
  saveState();
  renderGoals();
}

/* ================= ANALYTICS ================= */
function renderAnalytics(){
  const el = document.getElementById('body-analytics'); if(!el) return;
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const max = Math.max(...state.focusStats.weeklyMinutes,1);
  const completedTasks = state.tasks.filter(t=>t.done).length;
  const totalTasks = state.tasks.length;
  el.innerHTML = `
    <div class="app-header"><div><h2>Progress Analytics</h2><p>Your study performance this week.</p></div></div>
    <div class="grid-cards">
      <div class="stat-card"><div class="sc-label">Study Hours (wk)</div><div class="sc-value">${(state.focusStats.weeklyMinutes.reduce((a,b)=>a+b,0)/60).toFixed(1)}h</div></div>
      <div class="stat-card"><div class="sc-label">Tasks Completed</div><div class="sc-value">${completedTasks}/${totalTasks}</div></div>
      <div class="stat-card"><div class="sc-label">Study Streak</div><div class="sc-value">${state.streak} days</div></div>
      <div class="stat-card"><div class="sc-label">Completion Rate</div><div class="sc-value">${totalTasks?Math.round(completedTasks/totalTasks*100):0}%</div></div>
    </div>
    <div class="section-title">📊 Focus Minutes This Week</div>
    <div class="bar-chart">
      ${state.focusStats.weeklyMinutes.map((m,i)=>`
        <div class="bar-col"><div class="bar-fill" style="height:${max?(m/max*100):0}%"></div><div class="bar-label">${days[i]}</div></div>
      `).join('')}
    </div>
    <div class="section-title">📚 Subject-wise Task Completion</div>
    ${state.subjects.map(s=>{
      const subjTasks = state.tasks.filter(t=>t.subject===s);
      const pct = subjTasks.length ? Math.round(subjTasks.filter(t=>t.done).length/subjTasks.length*100) : 0;
      return `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span>${s}</span><span style="color:var(--text-dim)">${pct}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
    }).join('') || `<div class="empty-state">Add subjects to see progress here.</div>`}
  `;
}

/* ================= FOCUS MODE ================= */
let focusTimer=null, focusSeconds=25*60, focusTotal=25*60, focusRunning=false, stopwatchMode=false, stopwatchSeconds=0;
function renderFocus(){
  const el = document.getElementById('body-focus'); if(!el) return;
  el.innerHTML = `
    <div class="focus-wrap">
      <div class="focus-modes">
        <button class="fm-btn ${!stopwatchMode?'active':''}" onclick="setFocusMode(false,25)">Pomodoro 25</button>
        <button class="fm-btn" onclick="setFocusMode(false,5)">Short Break 5</button>
        <button class="fm-btn ${stopwatchMode?'active':''}" onclick="setFocusMode(true)">Stopwatch</button>
      </div>
      <div class="timer-ring" id="timerRing"><div class="timer-display" id="timerDisplay">25:00</div></div>
      <div class="focus-controls">
        <button class="btn" id="focusToggleBtn" onclick="toggleFocus()">Start</button>
        <button class="btn ghost" onclick="resetFocus()">Reset</button>
      </div>
      <div class="section-title" style="align-self:flex-start;">Today's Focus Stats</div>
      <div class="grid-cards" style="width:100%;">
        <div class="stat-card"><div class="sc-label">Sessions</div><div class="sc-value">${state.focusStats.sessionsToday}</div></div>
        <div class="stat-card"><div class="sc-label">Minutes Focused</div><div class="sc-value">${state.focusStats.minutesToday}</div></div>
      </div>
    </div>
  `;
  updateTimerDisplay();
}
function setFocusMode(sw, mins){
  clearInterval(focusTimer); focusRunning=false;
  stopwatchMode = sw;
  if(!sw){ focusTotal=mins*60; focusSeconds=focusTotal; } else { stopwatchSeconds=0; }
  renderFocus();
}
function toggleFocus(){
  focusRunning = !focusRunning;
  document.getElementById('focusToggleBtn').textContent = focusRunning?'Pause':'Start';
  if(focusRunning){
    focusTimer = setInterval(()=>{
      if(stopwatchMode){ stopwatchSeconds++; }
      else{
        focusSeconds--;
        if(focusSeconds<=0){ clearInterval(focusTimer); focusRunning=false; sessionComplete(); }
      }
      updateTimerDisplay();
    },1000);
  } else clearInterval(focusTimer);
}
function resetFocus(){
  clearInterval(focusTimer); focusRunning=false; stopwatchSeconds=0; focusSeconds=focusTotal;
  const btn=document.getElementById('focusToggleBtn'); if(btn) btn.textContent='Start';
  updateTimerDisplay();
}
function sessionComplete(){
  state.focusStats.sessionsToday++;
  state.focusStats.minutesToday += Math.round(focusTotal/60);
  const dow = (new Date().getDay()+6)%7; // Mon=0..Sun=6
  state.focusStats.weeklyMinutes[dow] += Math.round(focusTotal/60);
  addXP(20);
  const btn=document.getElementById('focusToggleBtn'); if(btn) btn.textContent='Start';
  saveState();
  renderFocus();
}
function updateTimerDisplay(){
  const disp = document.getElementById('timerDisplay'); if(!disp) return;
  let secs, pct;
  if(stopwatchMode){ secs=stopwatchSeconds; pct=0; }
  else{ secs=focusSeconds; pct = 100 - Math.round((focusSeconds/focusTotal)*100); }
  const m = String(Math.floor(secs/60)).padStart(2,'0');
  const s = String(secs%60).padStart(2,'0');
  disp.textContent = `${m}:${s}`;
  const ring = document.getElementById('timerRing');
  if(ring) ring.style.setProperty('--pct', stopwatchMode?0:pct);
}

/* ================= GAMIFICATION ================= */
function renderGamify(){
  const el = document.getElementById('body-gamify'); if(!el) return;
  const needed = state.level*100;
  el.innerHTML = `
    <div class="app-header"><div><h2>Achievements</h2><p>XP, streaks, badges and daily missions.</p></div></div>
    <div class="xp-bar-wrap" style="display:flex;align-items:center;gap:14px;">
      <div class="level-badge">Lv${state.level}</div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px;"><span>XP Progress</span><span style="font-family:var(--font-mono)">${state.xp}/${needed}</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${(state.xp/needed*100)}%;background:linear-gradient(90deg,var(--gold),#FF8A3D);"></div></div>
      </div>
      <div style="text-align:center;"><div style="font-size:20px;">🔥</div><div style="font-size:11px;color:var(--text-dim)">${state.streak}-day streak</div></div>
    </div>
    <div class="section-title">🎯 Daily Missions</div>
    ${state.missions.map((m,i)=>`
      <div class="mission-item">
        <div class="task-check ${m.done?'done':''}" style="${m.done?'background:var(--lime);border-color:var(--lime);':''}" onclick="toggleMission(${i})">${m.done?'✓':''}</div>
        <span style="${m.done?'text-decoration:line-through;color:var(--text-faint);':''}">${m.text}</span>
        <span class="mission-xp">+${m.xp} XP</span>
      </div>`).join('')}
    <div class="section-title">🏅 Badges</div>
    <div class="badges-grid">
      ${state.badges.map(b=>`
        <div class="badge-item ${b.earned?'':'locked'}"><div class="badge-icon">${b.icon}</div>${b.name}</div>
      `).join('')}
    </div>
  `;
}
function toggleMission(i){
  const m = state.missions[i];
  if(!m.done){ m.done=true; addXP(m.xp); }
  saveState();
  renderGamify();
}

/* ================= EXPENSES ================= */
function renderExpenses(){
  const el = document.getElementById('body-expenses'); if(!el) return;
  const spent = state.expenses.reduce((a,e)=>a+e.amt,0);
  const pct = state.budget ? Math.min(100, Math.round(spent/state.budget*100)) : 0;
  const cats = {};
  state.expenses.forEach(e=>{ cats[e.cat]=(cats[e.cat]||0)+e.amt; });
  el.innerHTML = `
    <div class="app-header"><div><h2>Expense Tracker</h2><p>${state.budget ? `Monthly budget: ₹${state.budget}` : 'No budget set yet'}</p></div>
      <button class="btn ghost small" onclick="setBudget()">${state.budget?'Edit Budget':'Set Budget'}</button></div>
    <div class="grid-cards">
      <div class="stat-card"><div class="sc-label">Spent this month</div><div class="sc-value">₹${spent}</div>${state.budget?`<div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${pct>85?'var(--coral)':'linear-gradient(90deg,var(--pink),var(--violet),var(--sky))'}"></div></div>`:''}</div>
      <div class="stat-card"><div class="sc-label">Remaining</div><div class="sc-value">${state.budget?`₹${state.budget-spent}`:'—'}</div></div>
    </div>
    <div class="form-row">
      <input type="text" id="expLabel" placeholder="What did you spend on?">
      <select id="expCat"><option>Food</option><option>Study</option><option>Transport</option><option>Fun</option><option>Other</option></select>
      <input type="number" id="expAmt" placeholder="₹ amount" style="width:100px;">
      <button class="btn" onclick="addExpense()">Add</button>
    </div>
    <div class="section-title">Category Breakdown</div>
    ${Object.keys(cats).length ? `<div class="grid-cards">${Object.entries(cats).map(([c,v])=>`<div class="stat-card"><div class="sc-label">${c}</div><div class="sc-value" style="font-size:16px;">₹${v}</div></div>`).join('')}</div>` : `<div class="empty-state">No expenses logged yet.</div>`}
    <div class="section-title">Recent Expenses</div>
    <div id="expenseListWrap"></div>
  `;
  renderExpenseList();
}
function renderExpenseList(){
  const wrap = document.getElementById('expenseListWrap'); if(!wrap) return;
  wrap.innerHTML = state.expenses.length ? [...state.expenses].reverse().map(e=>`
    <div class="expense-row"><div class="cat-dot" style="background:${e.color}"></div>${e.label} <span style="color:var(--text-faint);font-size:11px;">· ${e.cat}</span><div class="expense-amt">₹${e.amt}</div>
    <button class="task-del" onclick="deleteExpense(${e.id})">✕</button></div>
  `).join('') : `<div class="empty-state">No expenses logged yet.</div>`;
}
function addExpense(){
  const label = document.getElementById('expLabel').value.trim(); if(!label) return;
  const cat = document.getElementById('expCat').value;
  const amt = parseFloat(document.getElementById('expAmt').value)||0;
  const colors={Food:'#FFC24B',Study:'#9B5CFF',Transport:'#3DD9FF',Fun:'#FF4FA3',Other:'#B9FF3D'};
  state.expenses.push({id:Date.now(),label,cat,amt,color:colors[cat]});
  document.getElementById('expLabel').value=''; document.getElementById('expAmt').value='';
  saveState();
  renderExpenses();
}
function deleteExpense(id){ state.expenses = state.expenses.filter(e=>e.id!==id); saveState(); renderExpenses(); }
function setBudget(){
  const val = prompt('Set your monthly budget (₹):', state.budget || '');
  if(val===null) return;
  const num = parseFloat(val);
  if(!isNaN(num) && num>=0){ state.budget = num; saveState(); renderExpenses(); }
}

/* ================= KEYBOARD SHORTCUTS ================= */
document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey) && e.key==='k'){ e.preventDefault(); toggleSearch(); }
  if(e.key==='Escape'){
    document.getElementById('searchOverlay').style.display='none';
    document.getElementById('notifPanel').style.display='none';
  }
});
