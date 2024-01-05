function hasImage(cell) {
    return cell.startsWith('http') && cell.includes('image') || (cell.endsWith('.jpg') || cell.endsWith('.jpeg') || cell.endsWith('.png'));
}

function processCell(cell) {
    if (!cell) {
        return '';
    } else if (cell.startsWith('+')) {
        return `='${cell}'`;
    } else if (hasImage(cell)) {
        return `=IMAGE("${cell}")`
    }

    return cell;
}


function renderCell(cell) {
     if (hasImage(cell)) {
        return `<img src="${cell}" />`;
     }

     return cell;
}

function array2tsv(data = []) {
    return `${data.map(row => row.map(processCell).join('\t')).join('\n').toString().replaceAll('"','&#34')}`;
}


function array2table(header, data = []) {
    return `<div class="table-header">
                <h1>${header}</h1>
                <div class="pill">${data.length}</div>
            </div>
            <div class="grid-container" data-tsv="${array2tsv(data)}">
                <div class="table-preview">
                    <table>${data.slice(0,6).map(row => `<tr>${row.map(col => `<td>${renderCell(col)}</td>`).join('')}</tr>`).join('')}</table>
                    ${data.length > 6 ? '<div class="shade"></div>' : '' }
                </div>
            <div class="buttons">
                <button class="copy-button">
                    <img class="copy" src="./copy.png" />
                </button>
                <button class="add-button">Open in Rows</button>
            </div>
            </div>`;
}

function copyToClipboard(evt) {
    const tsv = evt.currentTarget.parentNode.parentNode.getAttribute('data-tsv');

    navigator.clipboard.writeText(JSON.stringify({ from: 'rows_extension', data: tsv.toString() })).then(() => {
        window.open('https://app-13038.app.qa-rows.com/new');
    });
}

function copyToClipboardOnly(evt) {
    const tsv = evt.currentTarget.parentNode.parentNode.getAttribute('data-tsv')

    navigator.clipboard.writeText(tsv.toString()).then(() => setTimeout(() => window.close() , 200));
}

(() => {
    chrome.runtime.sendMessage('rows-scrapper:start', (response) => {
        const element = document.querySelector('#preview');

        if (response.tables.length <= 0) {
            element.innerHTML = `<div class="no-results">
                                    <b>No results</b>
                                    <p>We are sorry but we couldn't identify any list or table</p>
                                </div>`;
        } else {
            element.innerHTML = response.tables.map((table , index)=> array2table(response.headers[index], table )).join('');

            document.querySelectorAll(".add-button").forEach(element => element.addEventListener('click', copyToClipboard));
            document.querySelectorAll(".copy-button").forEach(element => element.addEventListener('click', copyToClipboardOnly))
        }

    });
})();
