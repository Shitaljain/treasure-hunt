// index.js
document.getElementById('joinBtn').addEventListener('click', registerTeam);

// If already registered (localStorage) redirect to map
if (localStorage.getItem('teamUid')) {
  // optionally, ensure auth restored
  // window.location.href = 'map.html';
}

async function registerTeam() {
  const name = document.getElementById('teamName').value.trim();
  if (!name) return alert('Please enter a team name.');

  try {
    const cred = await auth.signInAnonymously();
    const uid = cred.user.uid;
    await db.ref('teams/' + uid).set({
      name,
      score: 0,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      solvedClues: {}
    });
    localStorage.setItem('teamUid', uid);
    localStorage.setItem('teamName', name);
    window.location.href = 'map.html';
  } catch (err) {
    console.error(err);
    alert('Registration failed: ' + err.message);
  }
}
