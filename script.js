/* ================= SLIDE NAV =================
   Round 2: every slide fits one screen. 10 slides, grouped under the
   5 journey steps:
   Brief (1 Brief, 2 How this bot works, 3 Never type these)
   Why it matters (4 Why practice this, 5 Why this bot is gated)
   Meet the bot (6 Meet SwiftChat, 7 Pick your setting)
   Chat (8 SwiftChat — one exchange at a time)
   Result (9 Result, 10 Your 4-step check)
*/
var TOTAL = 10;
var current = 0;
var PICK_SLIDE = 6;
var CHAT_SLIDE = 7;
var RESULT_SLIDE = 8;
var pillIcons = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v6h6M20 20v-6h-6"/><path d="M20 10a8 8 0 0 0-14.7-4.7M4 14a8 8 0 0 0 14.7 4.7"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
];
var pillLabels = ["Brief","Why it matters","Meet the bot","Chat","Result"];
var pillSlides = [[0,1,2],[3,4],[5,6],[7],[8,9]];

function buildPills(){
  var bar = document.getElementById('journeyNav');
  bar.innerHTML = '<div class="journey-line"></div>';
  for(var i=0;i<pillLabels.length;i++){
    var p = document.createElement('div');
    p.className = 'journey-node';
    p.setAttribute('data-i', i);
    p.setAttribute('title', pillLabels[i]);
    p.onclick = (function(idx){ return function(){ goTo(pillSlides[idx][0]); }; })(i);
    p.innerHTML = '<div class="journey-circle">'+pillIcons[i]+'</div><span class="journey-label">' + pillLabels[i] + '</span>';
    bar.appendChild(p);
  }
  var dots = document.getElementById('pageDots');
  dots.innerHTML = '';
  for(var d=0; d<TOTAL; d++){ dots.appendChild(document.createElement('span')); }
}

function render(){
  document.querySelectorAll('.page').forEach(function(p){
    p.classList.toggle('active', parseInt(p.getAttribute('data-page')) === current);
  });
  document.querySelectorAll('.journey-node').forEach(function(p){
    var group = pillSlides[parseInt(p.getAttribute('data-i'))];
    p.classList.toggle('active', group.indexOf(current) !== -1);
    p.classList.toggle('done', group[group.length-1] < current);
  });
  document.querySelectorAll('#pageDots span').forEach(function(s, i){
    s.className = i < current ? 'is-done' : (i === current ? 'is-current' : '');
  });
  document.getElementById('pageCount').textContent = (current+1) + ' / ' + TOTAL;
  document.getElementById('backBtn').disabled = (current === 0);
  document.getElementById('nextBtn').disabled = (current === TOTAL-1);
  // Only one amber action per slide: the Pick-your-setting slide owns its Start button, and the last slide has no Next.
  document.getElementById('nextBtn').classList.toggle('is-quiet', current === PICK_SLIDE || current === TOTAL-1);
  paintGates();
  if(gateOpen(current)){ ['pickGateMsg','chatGateMsg'].forEach(function(id){ var m = document.getElementById(id); if(m) m.hidden = true; }); }
  if(current === CHAT_SLIDE && !chatStarted && currentLane){ launchChat(); }
}

function changePage(delta){
  var next = current + delta;
  if(next < 0 || next > TOTAL-1) return;
  if(delta > 0 && !gateOpen(current)){ showGateMsg(current); return; }
  current = next;
  render();
}

/* ---- gates (QA fix, Oct 2026): the same check for Next and for the journey bar ---- */
function pageEl(i){ return document.querySelector('.page[data-page="'+i+'"]'); }
function gateOpen(i){
  var pg = pageEl(i);
  if(pg && pg.querySelector('.saa-kit[data-required]:not(.is-done)')) return false;
  if(i === PICK_SLIDE && !currentLane) return false;
  if(i === CHAT_SLIDE && !chatDone) return false;
  return true;
}
/* the shared kit dims Next while the screen carries data-saa-locked */
function paintGates(){
  var pick = pageEl(PICK_SLIDE), chat = pageEl(CHAT_SLIDE);
  if(pick) pick.toggleAttribute('data-saa-locked', !currentLane);
  if(chat) chat.toggleAttribute('data-saa-locked', !chatDone);
}
function showGateMsg(i){
  var m = null;
  if(i === PICK_SLIDE) m = document.getElementById('pickGateMsg');
  if(i === CHAT_SLIDE) m = document.getElementById('chatGateMsg');
  if(m){ m.hidden = false; clearTimeout(m._t); m._t = setTimeout(function(){ m.hidden = true; }, 4000); }
}
/* Jump from the journey bar: back is always fine; forward stops at the first slide that is still locked. */
function goTo(target){
  if(target <= current){ current = target; render(); return; }
  while(current < target){
    if(!gateOpen(current)){
      render();
      if(current === PICK_SLIDE || current === CHAT_SLIDE){ showGateMsg(current); }
      else { var nb = document.getElementById('nextBtn'); if(nb) nb.click(); }   /* the kit lock shows what is left */
      return;
    }
    current++;
  }
  render();
}

/* ================= ICONS ================= */
var ICON_BOT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>';
// Game 16 designer assets (Oct 2026): the same SwiftChat avatar as Practice Bot - Framing and Refining.
var BOT_AVATAR = '<img class="g16-pavatar" src="assets/logo-swiftchat-64.webp" width="24" height="24" alt="">';
var ICON_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/></svg>';
var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

/* ================= CLUSTER DATA ================= */
var laneData = {
  iti: {
    clusters: [
      {
        title:"Round 1 · Spot what to check",
        scenarios:[
          {text:'The AI wrote: "The workshop received 20 new helmets on 3 August, supplied by Trident Safety Gear."', q:"Which part is a FIGURE that you need to check?",
           options:["20 new helmets","the workshop","supplied by","received"], correct:0,
           feedback:["Yes. A count like this must match a real record before you trust it.","Not quite. Look for the count of an item, not a place or an action word."],
           hint:"A figure is a number or a count. Look for digits in the sentence."},
          {text:'The AI wrote: "The tool room logged 8 spanners returned on 5 August, checked by the shift supervisor."', q:"Which part is a FIGURE that you need to check?",
           options:["the tool room","8 spanners","checked by","shift supervisor"], correct:1,
           feedback:["Yes. This count must match the tool room's own log before anyone uses it.","Not quite. Look for the count of an item."],
           hint:"A figure is a number or a count. Look for digits in the sentence."}
        ]
      },
      {
        title:"Round 2 · Supported or not",
        scenarios:[
          {text:'The register says: "Tools returned: 15 of 15." The AI wrote: "All 15 tools were returned, and every tool is in excellent condition."', q:"Is the part \"every tool is in excellent condition\" SUPPORTED or UNSUPPORTED by the register?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Yes. The register only shows how many tools came back. It says nothing about their condition, so the claim is unsupported, not false.","Not quite. The register only gives the number of tools. Does it say anything about their condition?"],
           hint:"Look at what the register records. Is it a count or a condition?"},
          {text:'The attendance register says: "28 of 28 present." The AI wrote: "All 28 were present, and everyone understood today’s safety demo well."', q:"Is the part \"everyone understood today's safety demo well\" SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Yes. The register only shows who was present, not who understood. So the claim is unsupported, not false.","Not quite. The register only shows who was present. Does it show what they understood?"],
           hint:"Attendance and understanding are two different things. Which one does the register show?"}
        ]
      },
      {
        title:"Round 3 · Unsupported or definitely false",
        scenarios:[
          {text:'The register says: "Store closes at 5:00 PM." The AI wrote: "The store closes at 7:00 PM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Yes. The register gives an exact time, and the AI claim says something different. So the claim is definitely false, not just unsupported.","Not quite. Here a record says the opposite of the claim. That is stronger than unsupported."],
           hint:"Compare the two times. Do they match, or do they clash?"},
          {text:'The notice says: "Hostel gates lock at 10:00 PM." The AI wrote: "Hostel gates lock at 11:00 PM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Yes. The notice gives an exact time, and the claim says something different. So the claim is definitely false.","Not quite. A clear record says the opposite of the claim. That is stronger than unsupported."],
           hint:"Compare the two times."}
        ]
      },
      {
        title:"Round 4 · Choose the action",
        scenarios:[
          {text:'The AI wrote: "This machine never needs servicing." No maintenance log says if this is true or not.', q:"What should you do with this claim?",
           options:["Trust it. It sounds right.","Replace it with today's date.","Qualify it as not confirmed, or remove it.","Report the AI tool as broken."], correct:2,
           feedback:["Yes. You have no record to check it against. So you say it is not confirmed, or you remove it if you do not need it.","Not quite. Think about what you do with a claim that you cannot check at all."],
           hint:"Remember the four actions: verify, replace, qualify or remove. Which one fits when there is no record?"},
          {text:'The AI wrote: "This is the safest machine in the entire workshop." There is no record to compare the machines.', q:"What should you do with this claim?",
           options:["Trust it. It sounds right.","Replace it with a serial number.","Qualify it as not confirmed, or remove it.","Report the AI tool as broken."], correct:2,
           feedback:["Yes. This claim compares machines, but there is no record to compare them. So you qualify it or remove it.","Not quite. Think about what fits a claim that you cannot check."],
           hint:"There is no record to compare the machines. What is the safest action?"}
        ]
      }
    ]
  },
  higher: {
    clusters: [
      {
        title:"Round 1 · Spot what to check",
        scenarios:[
          {text:'The AI wrote: "45 students attended the seminar on 10 March, hosted by Prof. Neha Kulkarni."', q:"Which part is a DATE that you need to check?",
           options:["45 students","10 March","the seminar","hosted by"], correct:1,
           feedback:["Yes. A date like this must match the official notice before you trust it.","Not quite. Look for a day and a month, not a number of people."],
           hint:"A date has a day and a month. Look closely."},
          {text:'The AI wrote: "The workshop was rescheduled to 14 March, confirmed by the placement office."', q:"Which part is a DATE that you need to check?",
           options:["the workshop","14 March","placement office","confirmed by"], correct:1,
           feedback:["Yes. This date must match what the placement office confirmed.","Not quite. Look for a day and a month."],
           hint:"A date has a day and a month."}
        ]
      },
      {
        title:"Round 2 · Supported or not",
        scenarios:[
          {text:'The submission log says: "42 of 45 submitted." The AI wrote: "42 students submitted, and all of them followed the formatting guidelines correctly."', q:"Is the part \"all of them followed the formatting guidelines\" SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Yes. The log only counts the submissions. It says nothing about formatting, so the claim is unsupported, not false.","Not quite. The log only shows how many students submitted. Does it show how they formatted their work?"],
           hint:"Look at what the log records. Is it a count or a quality check?"},
          {text:'The registration sheet says: "190 attendees." The AI wrote: "190 attended, and everyone rated the session excellent."', q:"Is the part \"everyone rated the session excellent\" SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Yes. The sheet only counts the people who attended. It shows no ratings, so the claim is unsupported, not false.","Not quite. Attendance and ratings are two different things. Which one does the sheet show?"],
           hint:"Attendance and ratings are two different things."}
        ]
      },
      {
        title:"Round 3 · Unsupported or definitely false",
        scenarios:[
          {text:'The notice says: "Deadline: 5 PM, 12 March." The AI wrote: "Deadline: 5 PM, 14 March."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Yes. The notice gives an exact date, and the claim says something different. So the claim is definitely false.","Not quite. A clear record says the opposite of the claim. That is stronger than unsupported."],
           hint:"Compare the two dates."},
          {text:'The timetable says: "Exam starts at 10:00 AM." The AI wrote: "Exam starts at 11:00 AM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Yes. The timetable gives an exact time, and the claim says something different. So the claim is definitely false.","Not quite. A clear record says the opposite of the claim, so it is more than unsupported."],
           hint:"Compare the two times."}
        ]
      },
      {
        title:"Round 4 · Choose the action",
        scenarios:[
          {text:'The AI wrote: "This is the most popular elective in college history." There is no data to compare the electives.', q:"What should you do with this claim?",
           options:["Trust it. It sounds right.","Replace it with last year's number.","Qualify it as not confirmed, or remove it.","Report the AI tool as broken."], correct:2,
           feedback:["Yes. This is a big claim with no record to compare. So you qualify it or remove it.","Not quite. Think about what fits a claim that you have nothing to check against."],
           hint:"Remember the four actions: verify, replace, qualify or remove. Which one fits when there is no record?"},
          {text:'The AI wrote: "This professor has the best rating in the department." There is no record of ratings.', q:"What should you do with this claim?",
           options:["Trust it. It sounds right.","Replace it with a made-up score.","Qualify it as not confirmed, or remove it.","Report the AI tool as broken."], correct:2,
           feedback:["Yes. There is no rating record to check. So you qualify it or remove it.","Not quite. Think about the safest action for a comparison that you cannot check."],
           hint:"There is no rating data anywhere. What is the safest action?"}
        ]
      }
    ]
  }
};

/* ================= STATE ================= */
var currentLane = null;
var chatStarted = false;
var chatDone = false;
var awaiting = false;        // a question (with option chips) is open
var clusterIndex = 0;
var attemptIndex = 0;
var clusterResults = [];
var idleTimer = null;
var hintEl = null;
var transcript = [];         // full conversation, kept in memory (the screen shows one exchange)
var body = document.getElementById('phoneBody');
var chatGen = 0;             // bumps when the chat restarts, so old timers do nothing
var roundStart = [0,0,0,0];  // which example each round starts with (a Retry starts with the next one)
var tries = 0;               // wrong answers in the current round
var introWait = false;       // the first turn waits for the slide's intro narration to finish
/* setTimeout that is cancelled when the chat restarts (setting changed) */
function later(fn, ms){ var g = chatGen; return setTimeout(function(){ if(g === chatGen) fn(); }, ms); }

/* keep the newest message and its answer buttons in view */
function scrollLatest(){
  requestAnimationFrame(function(){
    if(current !== CHAT_SLIDE) return;
    /* small screens: the slide scrolls so the whole phone (chat, answers, help and skip) is on screen */
    var ph = body.closest('.phone');
    if(ph && body.childElementCount){ try { ph.scrollIntoView({block:'nearest', behavior:'smooth'}); } catch(e){ ph.scrollIntoView(false); } }
    var max = body.scrollHeight - body.clientHeight;
    if(max <= 0) return;
    try { body.scrollTo({top: max, behavior: 'smooth'}); } catch(e){ body.scrollTop = max; }
  });
}
if(window.MutationObserver){ new MutationObserver(scrollLatest).observe(body, {childList:true}); }
window.addEventListener('resize', scrollLatest);

/* Narration (QA fix): when a turn is complete, its bot lines become the text that is read.
   The first turn waits until the slide intro has been read. */
function markTurn(){
  var g = chatGen, until = Date.now() + 20000;   /* never wait more than 20 seconds */
  function apply(){
    if(g !== chatGen) return;
    if(introWait){
      var playing = document.querySelector('.saa-vo-listen.playing');
      if(playing && current === CHAT_SLIDE && Date.now() < until){ setTimeout(apply, 300); return; }
      introWait = false;
    }
    body.querySelectorAll('.pmsg.bot .pbubble:not(.k-help)').forEach(function(b){ b.setAttribute('data-saa-say', ''); });
    body.setAttribute('data-saa-lead', '');
  }
  apply();
}

document.getElementById('laneSelect').addEventListener('change', function(){
  currentLane = this.value;
  // QA fix: changing the setting after the chat started restarts the chat in the new setting.
  if(chatStarted){ resetChat(); }
  paintGates();
  document.getElementById('startBotBtn').disabled = !currentLane;
  // Game 16 designer assets: show the picture of the chosen setting beside the dropdown.
  var laneIco = document.getElementById('g16LaneIco');
  if(laneIco){
    if(currentLane){ laneIco.src = 'assets/icons/icon-lane-' + (currentLane === 'iti' ? 'iti' : 'college') + '.webp'; laneIco.hidden = false; }
    else { laneIco.hidden = true; }
  }
});

document.getElementById('startBotBtn').addEventListener('click', function(){
  current = CHAT_SLIDE;
  render();
});

document.getElementById('helpBtn').addEventListener('click', function(){ showHint(); resetIdle(); });
document.getElementById('skipBtn').addEventListener('click', function(){ openSkipPanel(); resetIdle(); });

function buildClusterProgress(){
  var wrap = document.getElementById('clusterProgress');
  wrap.innerHTML = '';
  for(var i=0;i<4;i++){
    var d = document.createElement('div');
    d.className = 'cdot';
    d.id = 'cdot-'+i;
    wrap.appendChild(d);
  }
}
buildClusterProgress();

function updateClusterProgress(){
  for(var i=0;i<4;i++){
    var d = document.getElementById('cdot-'+i);
    d.className = 'cdot';
    if(i === clusterIndex && !chatDone) d.classList.add('active');
    if(clusterResults[i] === 'pass') d.classList.add('pass');
    if(clusterResults[i] === 'fail') d.classList.add('fail');
  }
}

function setInputText(t){ document.querySelector('.fake-input').textContent = t; }

function plain(html){ var d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); }
function log(who, html){ transcript.push({who: who, text: plain(html)}); }
window.getPracticeBotTranscript = function(){ return transcript.slice(); };

/* One exchange on screen at a time: each new turn replaces the last. */
function newTurn(){
  body.innerHTML = '';
  body.scrollTop = 0;
  hintEl = null;
  currentChipRow = null;
}

function addPBot(html, kind){
  var msg = document.createElement('div');
  msg.className = 'pmsg bot';
  msg.innerHTML = '<div class="pavatar">'+BOT_AVATAR+'</div><div class="pbubble'+(kind?' k-'+kind:'')+'">'+html+'</div>';
  body.appendChild(msg);
  log('SwiftChat', html);
  return msg;
}

/* The learner's previous reply stays as a small line at the top of the turn. */
function addPrevReply(html){
  var line = document.createElement('div');
  line.className = 'prev-reply';
  line.innerHTML = '<span class="prev-who">You</span><span class="prev-text">'+html+'</span>';
  body.appendChild(line);
  log('You', html);
}

function addTyping(){
  var msg = document.createElement('div');
  msg.className = 'pmsg bot';
  msg.id = 'typingMsg';
  msg.innerHTML = '<div class="pavatar">'+BOT_AVATAR+'</div><div class="ptyping"><span></span><span></span><span></span></div>';
  body.appendChild(msg);
}
function removeTyping(){
  var t = document.getElementById('typingMsg');
  if(t) t.remove();
}

var currentChipRow = null;
function addChips(options, onPick, extraClass){
  var row = document.createElement('div');
  row.className = 'chip-row' + (extraClass ? ' ' + extraClass : '');
  options.forEach(function(opt, idx){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quick-chip';
    btn.textContent = opt;
    btn.onclick = function(){
      row.querySelectorAll('button').forEach(function(b){ b.disabled = true; });
      resetIdle();
      onPick(idx);
    };
    row.appendChild(btn);
  });
  body.appendChild(row);
  currentChipRow = row;
  markTurn();
  return row;
}

/* After feedback the learner taps Continue, so the feedback stays readable
   instead of being replaced straight away. */
function addContinue(onGo){
  addChips(['Continue'], function(){ onGo(); }, 'continue-row');
}

/* ================= LAUNCH / CLUSTER FLOW ================= */
function resetChat(){
  chatGen++;
  chatStarted = false;
  chatDone = false;
  awaiting = false;
  transcript = [];
  clearTimeout(idleTimer);
  closeSkipPanel();
  newTurn();
  body.removeAttribute('data-saa-lead');
  updateGateResultEmpty();
}

function launchChat(){
  chatGen++;
  chatStarted = true;
  chatDone = false;
  clusterIndex = 0;
  attemptIndex = 0;
  tries = 0;
  roundStart = [0,0,0,0];
  clusterResults = [null,null,null,null];
  introWait = true;
  newTurn();
  body.removeAttribute('data-saa-lead');
  setInputText('Choose an option above…');
  updateClusterProgress();

  var toast = document.getElementById('phoneToast');
  toast.style.display = '';
  toast.textContent = 'Connecting to SwiftChat…';
  later(function(){
    toast.textContent = 'Connected';
    later(function(){ toast.style.display='none'; }, 1200);
  }, 900);

  later(function(){
    addPBot("Hi! I am SwiftChat. We will do 4 short rounds together. Read each example, then tap your answer below.", 'info');
    later(function(){ presentCluster(); }, 700);
  }, 1000);

  resetIdle();
}

function presentCluster(){
  tries = 0;
  attemptIndex = roundStart[clusterIndex] % 2;
  updateClusterProgress();
  addTyping();
  later(function(){
    removeTyping();
    presentScenario(true);
  }, 700);
}

/* withTitle: the round title heads the scenario bubble (was its own bubble). */
function presentScenario(withTitle){
  var cluster = laneData[currentLane].clusters[clusterIndex];
  var sc = cluster.scenarios[attemptIndex];
  addTyping();
  later(function(){
    removeTyping();
    addPBot((withTitle ? '<b>'+cluster.title+'</b>' : '') + sc.text);
    later(function(){
      addPBot(sc.q);
      addChips(sc.options, function(pickedIdx){ handleAnswer(pickedIdx); });
      awaiting = true;
    }, 500);
  }, 700);
}

function handleAnswer(pickedIdx){
  awaiting = false;
  var cluster = laneData[currentLane].clusters[clusterIndex];
  var sc = cluster.scenarios[attemptIndex];
  newTurn();
  addPrevReply(sc.options[pickedIdx]);

  var isRight = (pickedIdx === sc.correct);
  addTyping();
  later(function(){
    removeTyping();
    if(isRight){
      addPBot(ICON_CHECK+' '+sc.feedback[0], 'good');
      clusterResults[clusterIndex] = 'pass';
      updateClusterProgress();
      addContinue(advanceCluster);
    } else {
      var wb = addPBot(ICON_X+' '+sc.feedback[1], 'soft').querySelector('.pbubble');
      wb.classList.add('is-wrong');   /* QA fix: the soft "wrong" sound plays (a right answer already chimes via the round dot) */
      tries++;
      if(tries < cluster.scenarios.length){
        later(function(){
          addPBot("Here is a new example like the last one. Try again.", 'info');
          addContinue(function(){
            attemptIndex = (attemptIndex + 1) % cluster.scenarios.length;
            newTurn();
            presentScenario(false);
          });
        }, 800);
      } else {
        clusterResults[clusterIndex] = 'fail';
        roundStart[clusterIndex] = attemptIndex + 1;   /* a Retry starts with the other example */
        updateClusterProgress();
        later(function(){
          addPBot("That is okay. This round needs more practice. We will move on now, and you can come back to it later.", 'soft');
          addContinue(advanceCluster);
        }, 800);
      }
    }
  }, 700);
}

/* Next round still to do. After a Retry this skips rounds already cleared
   (previously a retry replayed every later round, even passed ones). */
function advanceCluster(){
  var next = -1;
  for(var j = clusterIndex + 1; j < 4; j++){
    if(clusterResults[j] !== 'pass'){ next = j; break; }
  }
  newTurn();
  if(next === -1){
    finishChat();
  } else {
    clusterIndex = next;
    presentCluster();
  }
}

function finishChat(){
  chatDone = true;
  awaiting = false;
  clearTimeout(idleTimer);
  updateClusterProgress();
  addTyping();
  later(function(){
    removeTyping();
    var passed = clusterResults.filter(function(r){return r==='pass';}).length;
    addPBot("You have finished all 4 rounds. You cleared "+passed+" of 4 rounds. Tap Next to see your full result.", 'info');
    setInputText('Chat complete');
    markTurn();
  }, 700);
  updateGateResult();
  render();
}

/* ================= HELP / SKIP ================= */
function showHint(){
  if(!chatStarted || chatDone || !awaiting) return;
  var sc = laneData[currentLane].clusters[clusterIndex].scenarios[attemptIndex];
  var html = '<b>Hint:</b> '+sc.hint;
  // One hint bubble per turn, shown above the options (tapping again does not stack more).
  if(!hintEl){
    hintEl = document.createElement('div');
    hintEl.className = 'pmsg bot';
    hintEl.innerHTML = '<div class="pavatar">'+BOT_AVATAR+'</div><div class="pbubble k-help" data-saa-say-open hidden></div>';
    body.insertBefore(hintEl, currentChipRow);
    hintEl.querySelector('.pbubble').innerHTML = html;
    log('SwiftChat', html);
    /* shown one moment later, so the narration reads it as something the learner opened */
    var hb = hintEl.querySelector('.pbubble');
    setTimeout(function(){ hb.hidden = false; scrollLatest(); }, 30);
  }
}

function openSkipPanel(){
  if(!chatStarted || chatDone || !awaiting) return;
  document.getElementById('skipPanel').classList.add('show');
}
function closeSkipPanel(){
  document.getElementById('skipPanel').classList.remove('show');
  document.getElementById('skipReason').value = '';
}
function confirmSkip(){
  var sel = document.getElementById('skipReason');
  var reason = sel.value;
  if(!reason) return;
  var reasonLabel = sel.options[sel.selectedIndex].text;
  closeSkipPanel();
  awaiting = false;
  newTurn();
  addPrevReply('Skip this round: '+reasonLabel);
  clusterResults[clusterIndex] = 'fail';
  roundStart[clusterIndex] = attemptIndex + 1;
  updateClusterProgress();
  addPBot("No problem. You can come back to this round later from your result page.", 'info');
  addContinue(advanceCluster);
}

/* ================= IDLE / INACTIVE SESSION ================= */
/* The nudge shows in the phone's status strip so it never pushes the turn off screen. */
function resetIdle(){
  clearTimeout(idleTimer);
  var toast = document.getElementById('phoneToast');
  if(toast.classList.contains('is-idle')){ toast.classList.remove('is-idle'); toast.style.display = 'none'; }
  if(chatDone || !chatStarted) return;
  idleTimer = later(function(){
    var msg = "Are you still there? Take your time. Tap an option when you are ready.";
    toast.textContent = msg;
    toast.classList.add('is-idle');
    toast.style.display = '';
  }, 20000);
}

/* ================= RESULT / GATE ================= */
function updateGateResult(){
  var box = document.getElementById('gateResult');
  var passCount = clusterResults.filter(function(r){return r==='pass';}).length;
  var passed = (passCount === 4);
  box.className = 'result-card ' + (passed ? 'pass' : 'fail');
  document.getElementById('gateHeadline').textContent = passed ? 'You have reached mastery.' : 'You need a little more practice.';
  document.getElementById('gateSub').textContent =
    'You cleared ' + passCount + ' of 4 rounds. ' +
    (passed
      ? 'You cleared every round, so you meet mastery for this gated step.'
      : 'This gate needs all 4 rounds cleared. Tap Retry next to each round below.');

  var lane = laneData[currentLane];
  var list = document.getElementById('clusterStatusList');
  list.innerHTML = '';
  lane.clusters.forEach(function(c, i){
    var row = document.createElement('div');
    var st = clusterResults[i];
    row.className = 'cs-row ' + (st === 'pass' ? 'pass' : 'fail');
    row.innerHTML = (st === 'pass' ? ICON_CHECK : ICON_X) + '<span>'+c.title+'</span>' +
      (st !== 'pass' ? '<button type="button" onclick="retryCluster('+i+')">Retry</button>' : '');
    list.appendChild(row);
  });
}

function updateGateResultEmpty(){
  document.getElementById('gateResult').className = 'result-card';
  document.getElementById('gateHeadline').textContent = 'Finish all 4 rounds first.';
  document.getElementById('gateSub').textContent = 'Your result appears here when you finish the chat.';
  document.getElementById('clusterStatusList').innerHTML = '';
}

function retryCluster(i){
  chatGen++;
  current = CHAT_SLIDE;
  clusterIndex = i;
  clusterResults[i] = null;
  chatDone = false;
  tries = 0;
  // Bug fix: the input placeholder used to stay on "Chat complete" after Retry.
  setInputText('Choose an option above…');
  render();
  updateClusterProgress();
  newTurn();
  addPBot("We are going back to this round.<b>"+laneData[currentLane].clusters[i].title+"</b>", 'info');
  later(function(){ attemptIndex = roundStart[i] % 2; presentScenario(false); }, 600);
  resetIdle();
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', function(){
  buildPills();
  render();
});
