const charSize = 8;
const charPickerCellSize = 3 * charSize;
const charDrawerPixelSize = 5 * charSize;
var currentChar = 0;
var chars = [];

var graphicsMode = 'text';

window.onload = () => {
  loadChars();

  initCharPicker();
  initCharDrawer();
  initModeSelector();
  initCharBuffer();

  redrawFrameBuffer();
};

const loadChars = () => {
  const saved = localStorage.getItem('font');
  if (!saved) {
    initChars();
    return;
  }
  const parsed = JSON.parse(saved);
  chars = parsed.map((hex) => {
    return fromHexString(hex);
  });
};

const saveChars = () => {
  const toSave = chars.map((char) => toHexString(char));
  localStorage.setItem('font', JSON.stringify(toSave));
};

const initChars = () => {
  chars = [];
  for (let i = 0; i < 256; i++) {
    const char = new Uint8Array(charSize);
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
      img.setAttribute('src', charImg(j*16 + i).toDataURL());
      img.setAttribute('class', 'charimg');
      img.onclick = selectChar;
      cell.appendChild(img);
      nr.appendChild(cell);
    }

    tbody.appendChild(nr);
  }
  table.appendChild(tbody);
};

const charImg = (idx) => {
  const char = chars[idx];
  const canvas = document.createElement('canvas');
  canvas.width = charSize;
  canvas.height = charSize;
  const ctx = canvas.getContext('2d');

  // draw char
  ctx.fillStyle = '#000';
  char.forEach((line, j) => {
    for (let i = 0; i < charSize; i++) {
      if (line & (1 << i)) {
        ctx.fillRect(i, j, 1, 1);
      }
    }
  });

  return canvas;
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
  for (let i = 1; i < charSize; i++) {
    ctx.moveTo(0, 0.5 + i * (1 + charDrawerPixelSize));
    ctx.lineTo(w, 0.5 + i * (1 + charDrawerPixelSize));
    ctx.stroke();
    ctx.moveTo(0.5 + i * (1 + charDrawerPixelSize), 0);
    ctx.lineTo(0.5 + i * (1 + charDrawerPixelSize), h);
    ctx.stroke();
  }

  // draw char
  ctx.fillStyle = '#000';
  chars[currentChar].forEach((line, j) => {
    let y = j * (1 + charDrawerPixelSize);
    for (let i = 0; i < charSize; i++) {
      if (line & (1 << i)) {
        let x = i * (1 + charDrawerPixelSize);
        ctx.fillRect(1 + x, 1 + y, charDrawerPixelSize, charDrawerPixelSize);
      }
    }
  });

  canvas.onclick = togglePixel;
};

const selectChar = (e) => {
  currentChar = parseInt(e.target.id.slice(4), 16);
  initCharDrawer();
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
  const i = Math.floor(pos.x / (1 + charDrawerPixelSize));
  const j = Math.floor(pos.y / (1 + charDrawerPixelSize));

  const bitSelect = (1 << i);
  chars[currentChar][j] ^= bitSelect;

  saveChars();

  // redraw pixel
  const pxValue = chars[currentChar][j] & bitSelect;
  const canvas = document.getElementById('chardrawer');
  const ctx = canvas.getContext('2d');
  if (pxValue) {
    ctx.fillStyle = '#000';
  } else {
    ctx.fillStyle = '#fff';
  }
  const x = i * (1 + charDrawerPixelSize);
  const y = j * (1 + charDrawerPixelSize);
  ctx.fillRect(1 + x, 1 + y, charDrawerPixelSize, charDrawerPixelSize);

  // redraw charpicker
  const hidx = toHexString([currentChar]);
  const img = document.getElementById(`char${hidx}`);
  img.setAttribute('src', charImg(currentChar).toDataURL());

  redrawFrameBuffer();
};

const toHexString = (byteArray) => {
  return Array.from(byteArray, function (byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

const fromHexString = (hex) => {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

const initModeSelector = () => {
  document.getElementsByName('graphicsmode').forEach((radio) => {
    radio.addEventListener('change', handleModeSelected);
  });
};

const handleModeSelected = (e) => {
  graphicsMode = e.target.value;

  redrawCharBuffer();
  redrawFrameBuffer();
};

const initCharBuffer = () => {
  const cb = document.getElementById('charbuffer');
  cb.onchange = redrawFrameBuffer;
  cb.oninput = redrawFrameBuffer;
  redrawCharBuffer();
}

const redrawCharBuffer = () => {
  const cb = document.getElementById('charbuffer');
  if (graphicsMode === 'text') {
    cb.classList.replace('gfxmode', 'textmode');
    cb.setAttribute('cols', 80);
  } else {
    cb.classList.replace('textmode', 'gfxmode');
    cb.setAttribute('cols', 40);
  }
}

const redrawFrameBuffer = () => {
  const fb = document.getElementById('framebuffer');
  const ctx = fb.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 640, 480);

  const cb = document.getElementById('charbuffer').value;
  for (let idx = 0; idx < cb.length; idx++) {
    const char = cb.charCodeAt(idx);
    const img = charImg(char);

    var i, j, w, h;
    if (graphicsMode === 'text') {
      i = idx % 80;
      j = Math.floor(idx / 80);
      w = charSize;
      h = 2 * charSize;
    } else {
      i = idx % 40;
      j = Math.floor(idx / 40);
      w = 2 * charSize;
      h = 2 * charSize;
    }
    x = 1 + i * w;
    y = 1 + j * h;

    ctx.drawImage(img, x, y, w, h);
  }
}
