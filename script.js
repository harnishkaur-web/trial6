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
    p.onclick = (function(idx){ return function(){ current = pillSlides[idx][0]; render(); }; })(i);
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
  if(current === CHAT_SLIDE && !chatStarted && currentLane){ launchChat(); }
}

function changePage(delta){
  var next = current + delta;
  if(next < 0 || next > TOTAL-1) return;
  current = next;
  render();
}

/* ================= ICONS ================= */
var ICON_BOT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>';
var ICON_USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/></svg>';
var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
var ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>';

/* ================= CLUSTER DATA ================= */
var laneData = {
  iti: {
    clusters: [
      {
        title:"Round 1 . Spot what to check",
        scenarios:[
          {text:'"The workshop received 20 new helmets on 3 August, supplied by Trident Safety Gear."', q:"Which part is a FIGURE that needs checking?",
           options:["20 new helmets","the workshop","supplied by","received"], correct:0,
           feedback:["Right, a count like this must always be checked against a real record before you trust it.","Not quite. Look for the exact count of an item, not a place or an action word."],
           hint:"A figure is a number or a count. Look for digits in the sentence."},
          {text:'"The tool room logged 8 spanners returned on 5 August, checked by the shift supervisor."', q:"Which part is a FIGURE that needs checking?",
           options:["the tool room","8 spanners","checked by","shift supervisor"], correct:1,
           feedback:["Right, that count needs to match the tool room's own log before anyone relies on it.","Not quite. Look for the exact count of an item."],
           hint:"A figure is a number or a count. Look for digits in the sentence."}
        ]
      },
      {
        title:"Round 2 . Supported or not",
        scenarios:[
          {text:'Register shows: "Tools returned: 15 of 15." AI wrote: "All 15 tools were returned, and every tool is in excellent condition."', q:"Is 'every tool is in excellent condition' SUPPORTED or UNSUPPORTED by the register?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Right. The register only shows the count returned, nothing about condition. Unsupported just means we cannot confirm it yet, not that it's false.","Not quite. The register only mentions the count of tools, nothing about their condition."],
           hint:"Check what the register actually records, a count, or a condition?"},
          {text:'Attendance register shows: "28 of 28 present." AI wrote: "All 28 were present, and everyone understood today\u2019s safety demo well."', q:"Is 'everyone understood today's safety demo well' SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Right. The register only tracks attendance, not understanding. That makes this unsupported, not false.","Not quite. The register only tracks who was present, not what they understood."],
           hint:"Attendance and understanding are two different things, check which one the register actually covers."}
        ]
      },
      {
        title:"Round 3 . Unsupported vs definitely false",
        scenarios:[
          {text:'Register clearly states: "Store closes at 5:00 PM." AI wrote: "The store closes at 7:00 PM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Right, the register gives an exact time, and the AI's claim contradicts it directly. That makes it definitely false, not just unsupported.","Not quite. When a record directly contradicts a claim, that is stronger than 'unsupported', it is definitely false."],
           hint:"Compare the two times directly. Do they match, or do they clash?"},
          {text:'Notice says: "Hostel gates lock at 10:00 PM." AI wrote: "Hostel gates lock at 11:00 PM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Right, the notice states an exact time that the claim contradicts. That is definitely false.","Not quite. A direct contradiction with a clear record is definitely false, not just unsupported."],
           hint:"Compare the two timings directly."}
        ]
      },
      {
        title:"Round 4 . Choose the action",
        scenarios:[
          {text:'AI wrote: "This machine never needs servicing." No maintenance log confirms or denies this.', q:"What should you do with this claim?",
           options:["Trust it, it sounds reasonable","Replace it with today's date","Qualify it as unconfirmed, or remove it if not needed","Report the AI tool as broken"], correct:2,
           feedback:["Right. With nothing to verify it against, the safest move is to mark it unconfirmed, or drop it if it isn't essential.","Not quite. Think about what you'd actually do with a claim you cannot check either way."],
           hint:"Remember the four moves: verify, replace, qualify, or remove. Which fits when there is no record at all?"},
          {text:'AI wrote: "This is the safest machine in the entire workshop." No comparison record exists.', q:"What should you do with this claim?",
           options:["Trust it, it sounds reasonable","Replace it with a serial number","Qualify it as unconfirmed, or remove it if not needed","Report the AI tool as broken"], correct:2,
           feedback:["Right. A comparison claim with nothing to compare against should be qualified or removed.","Not quite. Think about what fits a claim you cannot verify."],
           hint:"There is no comparison data anywhere here, what's the safest move?"}
        ]
      }
    ]
  },
  higher: {
    clusters: [
      {
        title:"Round 1 . Spot what to check",
        scenarios:[
          {text:'"45 students attended the seminar on 10 March, hosted by Prof. Neha Kulkarni."', q:"Which part is a DATE that needs checking?",
           options:["45 students","10 March","the seminar","hosted by"], correct:1,
           feedback:["Right, dates like this must match the official notice before you trust them.","Not quite. Look for a day and month, not a number of people."],
           hint:"A date includes a day and a month. Look closely."},
          {text:'"The workshop was rescheduled to 14 March, confirmed by the placement office."', q:"Which part is a DATE that needs checking?",
           options:["the workshop","14 March","placement office","confirmed by"], correct:1,
           feedback:["Right, this date needs to match the placement office's own confirmation.","Not quite. Look for a day and month."],
           hint:"A date includes a day and a month."}
        ]
      },
      {
        title:"Round 2 . Supported or not",
        scenarios:[
          {text:'Submission log shows: "42 of 45 submitted." AI wrote: "42 students submitted, and all of them followed the formatting guidelines correctly."', q:"Is 'all of them followed the formatting guidelines' SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Right. The log only counts submissions, not formatting quality. That makes it unsupported, not false.","Not quite. The log only records how many submitted, not how well they followed guidelines."],
           hint:"Check what the log actually records, a count, or a quality check?"},
          {text:'Registration sheet shows: "190 attendees." AI wrote: "190 attended, and everyone rated the session excellent."', q:"Is 'everyone rated the session excellent' SUPPORTED or UNSUPPORTED?",
           options:["Supported","Unsupported","Definitely false","Cannot be a claim"], correct:1,
           feedback:["Right. The sheet only counts attendance, not ratings. Unsupported, not false.","Not quite. Attendance and rating are two different things, check which one the sheet covers."],
           hint:"Attendance and satisfaction are two different things."}
        ]
      },
      {
        title:"Round 3 . Unsupported vs definitely false",
        scenarios:[
          {text:'Notice says: "Deadline: 5 PM, 12 March." AI wrote: "Deadline: 5 PM, 14 March."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Right, the notice gives an exact date that the claim contradicts. That is definitely false.","Not quite. A direct contradiction with a clear record is definitely false, not unsupported."],
           hint:"Compare the two dates directly."},
          {text:'Timetable says: "Exam starts at 10:00 AM." AI wrote: "Exam starts at 11:00 AM."', q:"Is this claim UNSUPPORTED or DEFINITELY FALSE?",
           options:["Unsupported","Definitely false","Supported","Cannot tell"], correct:1,
           feedback:["Right, the timetable gives an exact time that directly contradicts the claim. Definitely false.","Not quite. This directly contradicts a clear record, so it's definitely false."],
           hint:"Compare the two times directly."}
        ]
      },
      {
        title:"Round 4 . Choose the action",
        scenarios:[
          {text:'AI wrote: "This is the most popular elective in college history." No comparison data exists.', q:"What should you do with this claim?",
           options:["Trust it, it sounds reasonable","Replace it with last year's number","Qualify it as unconfirmed, or remove it if not needed","Report the AI tool as broken"], correct:2,
           feedback:["Right. A big claim with no comparison record should be qualified or dropped.","Not quite. Think about what fits a claim with nothing to check it against."],
           hint:"Remember: verify, replace, qualify, or remove. Which fits when there's no record at all?"},
          {text:'AI wrote: "This professor has the best rating in the department." No rating record exists.', q:"What should you do with this claim?",
           options:["Trust it, it sounds reasonable","Replace it with a made-up score","Qualify it as unconfirmed, or remove it if not needed","Report the AI tool as broken"], correct:2,
           feedback:["Right. With no rating record to check, qualify it or remove it.","Not quite. Think about what's safest for an unverifiable comparison claim."],
           hint:"There's no rating data anywhere, what's the safest move?"}
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

document.getElementById('laneSelect').addEventListener('change', function(){
  currentLane = this.value;
  document.getElementById('startBotBtn').disabled = !currentLane;
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
  hintEl = null;
  currentChipRow = null;
}

function addPBot(html, kind){
  var msg = document.createElement('div');
  msg.className = 'pmsg bot';
  msg.innerHTML = '<div class="pavatar">'+ICON_BOT+'</div><div class="pbubble'+(kind?' k-'+kind:'')+'">'+html+'</div>';
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
  msg.innerHTML = '<div class="pavatar">'+ICON_BOT+'</div><div class="ptyping"><span></span><span></span><span></span></div>';
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
  return row;
}

/* After feedback the learner taps Continue, so the feedback stays readable
   instead of being replaced straight away. */
function addContinue(onGo){
  addChips(['Continue'], function(){ onGo(); }, 'continue-row');
}

/* ================= LAUNCH / CLUSTER FLOW ================= */
function launchChat(){
  chatStarted = true;
  chatDone = false;
  clusterIndex = 0;
  attemptIndex = 0;
  clusterResults = [null,null,null,null];
  newTurn();
  setInputText('Choose an option above…');
  updateClusterProgress();

  var toast = document.getElementById('phoneToast');
  toast.style.display = '';
  toast.textContent = 'Connecting to SwiftChat…';
  setTimeout(function(){
    toast.textContent = 'Connected';
    setTimeout(function(){ toast.style.display='none'; }, 1200);
  }, 900);

  setTimeout(function(){
    addPBot("Hi! I'm SwiftChat. Let's do 4 quick rounds. Read each scenario, then pick your answer below.", 'info');
    setTimeout(function(){ presentCluster(); }, 700);
  }, 1000);

  resetIdle();
}

function presentCluster(){
  attemptIndex = 0;
  updateClusterProgress();
  addTyping();
  setTimeout(function(){
    removeTyping();
    presentScenario(true);
  }, 700);
}

/* withTitle: the round title heads the scenario bubble (was its own bubble). */
function presentScenario(withTitle){
  var cluster = laneData[currentLane].clusters[clusterIndex];
  var sc = cluster.scenarios[attemptIndex];
  addTyping();
  setTimeout(function(){
    removeTyping();
    addPBot((withTitle ? '<b>'+cluster.title+'</b>' : '') + sc.text);
    setTimeout(function(){
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
  setTimeout(function(){
    removeTyping();
    if(isRight){
      addPBot(ICON_CHECK+' '+sc.feedback[0], 'good');
      clusterResults[clusterIndex] = 'pass';
      updateClusterProgress();
      addContinue(advanceCluster);
    } else {
      addPBot(ICON_X+' '+sc.feedback[1], 'soft');
      if(attemptIndex < cluster.scenarios.length-1){
        setTimeout(function(){
          addPBot("Let's try one more like this, with a new example.", 'info');
          addContinue(function(){
            attemptIndex++;
            newTurn();
            presentScenario(false);
          });
        }, 800);
      } else {
        clusterResults[clusterIndex] = 'fail';
        updateClusterProgress();
        setTimeout(function(){
          addPBot("That's okay, this round needs another round of practice. Let's move on for now, you can come back to it.", 'soft');
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
  setTimeout(function(){
    removeTyping();
    var passed = clusterResults.filter(function(r){return r==='pass';}).length;
    addPBot("You've finished all 4 rounds, "+passed+" out of 4 cleared. Check your full result on the next page.", 'info');
    setInputText('Chat complete');
  }, 700);
  updateGateResult();
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
    hintEl.innerHTML = '<div class="pavatar">'+ICON_BOT+'</div><div class="pbubble k-help"></div>';
    body.insertBefore(hintEl, currentChipRow);
  }
  hintEl.querySelector('.pbubble').innerHTML = html;
  log('SwiftChat', html);
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
  updateClusterProgress();
  addPBot("No problem, noted. You can come back to this round later from your result page.", 'info');
  addContinue(advanceCluster);
}

/* ================= IDLE / INACTIVE SESSION ================= */
/* The nudge shows in the phone's status strip so it never pushes the turn off screen. */
function resetIdle(){
  clearTimeout(idleTimer);
  var toast = document.getElementById('phoneToast');
  if(toast.classList.contains('is-idle')){ toast.classList.remove('is-idle'); toast.style.display = 'none'; }
  if(chatDone || !chatStarted) return;
  idleTimer = setTimeout(function(){
    var msg = "Still there? Take your time, tap an option whenever you're ready.";
    toast.textContent = msg;
    toast.classList.add('is-idle');
    toast.style.display = '';
    log('SwiftChat', msg);
  }, 20000);
}

/* ================= RESULT / GATE ================= */
function updateGateResult(){
  var box = document.getElementById('gateResult');
  var passCount = clusterResults.filter(function(r){return r==='pass';}).length;
  var passed = (passCount === 4);
  box.className = 'result-card ' + (passed ? 'pass' : 'fail');
  document.getElementById('gateHeadline').textContent = passed ? 'Mastery reached' : 'Almost, a little more practice needed';
  document.getElementById('gateSub').textContent =
    'Rounds cleared: ' + passCount + ' of 4. ' +
    (passed
      ? 'You have cleared every round, that meets mastery for this gated step.'
      : 'This gate needs all 4 rounds cleared. Go back to the chat and retry the rounds marked below.');

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

function retryCluster(i){
  current = CHAT_SLIDE;
  clusterIndex = i;
  clusterResults[i] = null;
  chatDone = false;
  // Bug fix: the input placeholder used to stay on "Chat complete" after Retry.
  setInputText('Choose an option above…');
  render();
  updateClusterProgress();
  newTurn();
  addPBot("Let's go back to: <b>"+laneData[currentLane].clusters[i].title+"</b>", 'info');
  setTimeout(function(){ attemptIndex = 0; presentScenario(false); }, 600);
  resetIdle();
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', function(){
  buildPills();
  render();
});
