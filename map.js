// map.js
const uid = localStorage.getItem('teamUid');
const teamName = localStorage.getItem('teamName') || 'Team';
if (!uid) {
  alert('Please join the game first.');
  window.location.href = 'index.html';
}

document.getElementById('teamLabel').innerText = teamName;

// Change to your university center coordinates:
const campusLatLng = [28.9845, 77.7064]; // <-- UPDATE to your campus

const map = L.map('map').setView(campusLatLng, 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// create a DivIcon showing a treasure emoji
const treasureIcon = L.divIcon({ className: '', html: '<span class="treasure-marker">💰</span>', iconSize: [36,36], iconAnchor: [18,36] });

const clueMarkers = {};
const playerMarkers = {};

// Load clues and render chest markers
db.ref('clues').on('value', snapshot => {
  const clues = snapshot.val() || {};
  // remove old markers
  Object.values(clueMarkers).forEach(m => map.removeLayer(m));
  Object.entries(clues).forEach(([id, c]) => {
    if (c && c.lat && c.lng) {
      const marker = L.marker([c.lat, c.lng], { icon: treasureIcon }).addTo(map);
      const popupHtml = `<b>Checkpoint</b><br><div style="margin-top:6px;"><button onclick="openClue('${id}')" style="padding:8px;border-radius:8px;border:none;background:linear-gradient(90deg,#ffd86b,#ffb84d);font-weight:700;">Open Clue</button></div>`;
      marker.bindPopup(popupHtml);
      clueMarkers[id] = marker;
    }
  });
});

function openClue(id) {
  window.location.href = `clue.html?clue=${encodeURIComponent(id)}`;
}

// Live player locations
db.ref('locations').on('value', snap => {
  const locs = snap.val() || {};
  // remove absent markers
  Object.keys(playerMarkers).forEach(k => { if (!locs[k]) { map.removeLayer(playerMarkers[k]); delete playerMarkers[k]; } });
  Object.entries(locs).forEach(([puid, p]) => {
    if (!p || !p.lat) return;
    if (playerMarkers[puid]) {
      playerMarkers[puid].setLatLng([p.lat, p.lng]);
      playerMarkers[puid].bindPopup(`<b>${p.name}</b><br>${new Date(p.ts).toLocaleTimeString()}`);
    } else {
      const m = L.circleMarker([p.lat, p.lng], { radius: 8, color: '#fff', fillColor: '#ffb84d', fillOpacity: 0.9 }).addTo(map);
      m.bindPopup(`<b>${p.name}</b>`);
      playerMarkers[puid] = m;
    }
  });
});

// Location sharing
let watchId = null;
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    shareBtn.innerText = 'Start location';
    db.ref('locations/' + uid).remove().catch(()=>{});
    return;
  }
  if (!navigator.geolocation) return alert('Geolocation not supported.');
  watchId = navigator.geolocation.watchPosition(pos => {
    db.ref('locations/' + uid).set({
      name: teamName,
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      ts: firebase.database.ServerValue.TIMESTAMP
    });
    shareBtn.innerText = 'Stop location';
  }, err => { alert('Location error: ' + err.message); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000});
});

// QR scanning (html5-qrcode)
let htmlScanner = null;
document.getElementById('scanBtn').addEventListener('click', () => {
  document.getElementById('qrScanner').style.display = 'block';
  htmlScanner = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras || cameras.length === 0) return alert('No camera found.');
    const cameraId = cameras[0].id;
    htmlScanner.start(cameraId, { fps: 10, qrbox: 250 },
      qrMessage => {
        stopScanner();
        // If QR contains a clue URL or path open it
        if (qrMessage.startsWith('http')) {
          window.location.href = qrMessage;
        } else if (qrMessage.includes('clue=')) {
          window.location.href = `clue.html?${qrMessage.split('?')[1]}`;
        } else {
          alert('Scanned: ' + qrMessage);
        }
      },
      error => { /* ignore */ }
    ).catch(err => { alert('Camera error: ' + err); });
  }).catch(err => alert('Camera enumeration error: ' + err));
});

function stopScanner() {
  document.getElementById('qrScanner').style.display = 'none';
  if (htmlScanner) {
    htmlScanner.stop().then(() => htmlScanner.clear()).catch(()=>{});
    htmlScanner = null;
  }
}

function logout() {
  auth.signOut();
  localStorage.removeItem('teamUid');
  localStorage.removeItem('teamName');
  db.ref('locations/' + uid).remove().catch(()=>{});
  window.location.href = 'index.html';
}
