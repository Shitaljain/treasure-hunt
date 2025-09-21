// leaderboard.js
const list = document.getElementById('list');
db.ref('teams').on('value', snap => {
  const arr = [];
  snap.forEach(child => {
    const v = child.val();
    arr.push({ uid: child.key, name: v.name || 'Team', score: v.score || 0, createdAt: v.createdAt || 0 });
  });
  arr.sort((a,b) => (b.score - a.score) || (a.createdAt - b.createdAt));
  list.innerHTML = '';
  arr.forEach((it, i) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.innerHTML = `<span>${i+1}. ${it.name}</span><span style="font-weight:800">${it.score} pts</span>`;
    list.appendChild(li);
  });
});
