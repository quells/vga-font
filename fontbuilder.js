const charPickerCellSize = 24;
const charDrawerPixelSize = 40;
var currentChar = 0;
var chars = [];

window.onload = () => {
  loadChars();

  initCharPicker();
  initCharDrawer();
};

const loadChars = () => {
  const saved = localStorage.getItem('font');
  if (!saved) {
    initChars();
    return;
  }
  const parsed = JSON.parse(saved);
  chars = parsed.map((hex) => {
    return [1, 0, 0, 0, 0, 0, 0, 255];
  });
};

const saveChars = () => {
  const toSave = chars.map((char) => toHexString(char));
  localStorage.setItem('font', JSON.stringify(toSave));
};

const initChars = () => {
  chars = [];
  for (let i = 0; i < 256; i++) {
    const char = [0, 0, 0, 0, 0, 0, 0, 0];
    chars.push(char);
  }
};

const initCharPicker = () => {
  const table = document.getElementById('charpicker');

  // least significant nibble header
  const thead = document.createElement('thead');
  const lsn = document.createElement('tr');
  lsn.appendChild(document.createElement('th'));
  for (let i = 0; i < 16; i++) {
    const nh = document.createElement('th');
    nh.setAttribute('scope', 'col');
    nh.innerText = '_' + i.toString(16);
    lsn.appendChild(nh);
  }
  thead.appendChild(lsn);
  table.appendChild(thead);

  // most significant nibble rows
  const tbody = document.createElement('tbody');
  for (let j = 0; j < 16; j++) {
    const jh = j.toString(16);
    const nr = document.createElement('tr');

    // most significant nibble header
    const nh = document.createElement('th');
    nh.setAttribute('scope', 'row');
    nh.innerText = jh + '_';
    nr.appendChild(nh);

    // char cells
    for (let i = 0; i < 16; i++) {
      const ih = i.toString(16);
      const cell = document.createElement('td');
      const img = document.createElement('img');
      img.setAttribute('id', `char${jh}${ih}`);
      img.setAttribute('width', charPickerCellSize);
      img.setAttribute('height', charPickerCellSize);
      img.onclick = selectChar;
      cell.appendChild(img);
      nr.appendChild(cell);
    }

    tbody.appendChild(nr);
  }
  table.appendChild(tbody);
};

const initCharDrawer = () => {
  const canvas = document.getElementById('chardrawer');
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  // draw grid
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#f00';
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    ctx.moveTo(0, 0.5 + i * (1 + charDrawerPixelSize));
    ctx.lineTo(w, 0.5 + i * (1 + charDrawerPixelSize));
    ctx.stroke();
    ctx.moveTo(0.5 + i * (1 + charDrawerPixelSize), 0);
    ctx.lineTo(0.5 + i * (1 + charDrawerPixelSize), h);
    ctx.stroke();
  }

  canvas.onclick = togglePixel;
};

const selectChar = (e) => {
  currentChar = parseInt(e.target.id.slice(4), 16);
  initCharDrawer();
  console.log(currentChar);
};

const getMousePos = (e, canvas) => {
  const r = canvas.getBoundingClientRect();
  return {
    x: e.clientX - r.left,
    y: e.clientY - r.top
  };
}

const togglePixel = (e) => {
  const pos = getMousePos(e, e.target);
  const x = Math.floor(pos.x / (1 + charDrawerPixelSize));
  const y = Math.floor(pos.y / (1 + charDrawerPixelSize));

  saveChars();
};

const toHexString = (byteArray) => {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

const fromHexString = (hex) => {

}
