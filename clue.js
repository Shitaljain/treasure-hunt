// clue.js
const uid_clue = localStorage.getItem('teamUid');
if (!uid_clue) { alert('Please join first'); window.location.href = 'index.html'; }

const params = new URLSearchParams(location.search);
const clueId = params.get('clue');
if (!clueId) { alert('No clue specified'); window.location.href = 'map.html'; }

const clueTextEl = document.getElementById('clueText');
const statusEl = document.getElementById('status');
const progressEl = document.getElementById('progress');

let totalClues = 0, clueIndex = 0;

// load clues to compute progress
db.ref('clues').once('value').then(snap => {
  const keys = snap.exists() ? Object.keys(snap.val()) : [];
  totalClues = keys.length;
  clueIndex = keys.indexOf(clueId);
  if (clueIndex === -1) clueIndex = 0;
  progressEl.innerText = `Clue ${clueIndex+1} of ${totalClues || 1}`;
});

// load this clue
db.ref('clues/' + clueId).once('value').then(snap => {
  if (!snap.exists()) { clueTextEl.innerText = 'Clue not found.'; return; }
  const c = snap.val();
  clueTextEl.innerText = c.text || 'No clue text';
}).catch(e => clueTextEl.innerText = 'Error loading clue');

// submit answer
document.getElementById('submitBtn').addEventListener('click', async () => {
  const ansRaw = document.getElementById('answer').value.trim();
  if (!ansRaw) return alert('Enter an answer');

  // prevent double-solving
  const solvedSnap = await db.ref(`teams/${uid_clue}/solvedClues/${clueId}`).once('value');
  if (solvedSnap.exists()) return statusEl.innerText = 'You already solved this clue';

  // get correct answer from db
  const cue = await db.ref('clues/' + clueId + '/answer').once('value');
  const correct = (cue.val() || '').toString().trim().toLowerCase();
  if (ansRaw.toLowerCase() === correct) {
    // award points
    await db.ref(`teams/${uid_clue}/score`).transaction(s => (s || 0) + 10);
    await db.ref(`teams/${uid_clue}/solvedClues/${clueId}`).set(firebase.database.ServerValue.TIMESTAMP);
    statusEl.innerText = 'Correct! +10 points';
    setTimeout(() => window.location.href = 'map.html', 1200);
  } else {
    statusEl.innerText = 'Wrong answer — try again';
  }
});
