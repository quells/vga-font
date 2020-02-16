const charPickerCellSize = 24;

window.onload = () => {
    initCharPicker();
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

const selectChar = (e) => {
    const id = parseInt(e.target.id.slice(4), 16);
};
