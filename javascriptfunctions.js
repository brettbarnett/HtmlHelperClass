const hiddenColumns = [];
let TableLastSortedColumn = -1;
function sortTable() {
    const sortColumn = parseInt(arguments[0]);
    const type = arguments.length > 1 ? arguments[1].toUpperCase() : 'T';
    const dateformat = arguments.length > 2 ? arguments[2].toUpperCase() : '';
    const table = document.getElementById("indextable");
    const tbody = table.getElementsByTagName("tbody")[0];
    const rows = tbody.getElementsByTagName("tr");
    const arrayOfRows = new Array();
    for (let i = 0, len = rows.length; i < len; i++) {
        arrayOfRows[i] = new Object;
        arrayOfRows[i].oldIndex = i;
        const celltext = rows[i].getElementsByTagName("td")[sortColumn].innerHTML.replace(/<[^>]*>/g, "");
        if (type == 'D') {
            arrayOfRows[i].value = getDateSortingKey(dateformat, celltext);
        }
        else {
            const re = type == "N" ? /[^\.\-\+\d]/g : /[^a-zA-Z0-9]/g;
            arrayOfRows[i].value = celltext.replace(re, "").substr(0, 25).toLowerCase();
        }
    }
    if (sortColumn == TableLastSortedColumn) {
        arrayOfRows.reverse();
    }
    else {
        TableLastSortedColumn = sortColumn;
        switch (type) {
            case "N": arrayOfRows.sort(compareRowOfNumbers);
                break;
            case "D": arrayOfRows.sort(compareRowOfNumbers);
                break;
            default: arrayOfRows.sort(compareRowOfText);
        }
    }
    const newTableBody = document.createElement("tbody");
    newTableBody.id = "tablebody";
    for (let i = 0, len = arrayOfRows.length; i < len; i++) {
        newTableBody.appendChild(rows[arrayOfRows[i].oldIndex].cloneNode(true));
    }
    table.replaceChild(newTableBody, tbody);
}

function compareRowOfText(a, b) {
    const aval = a.value;
    const bval = b.value;
    return (aval == bval ? 0 : (aval > bval ? 1 : -1));
}

function compareRowOfNumbers(a, b) {
    const aval = /\d/.test(a.value) ? parseFloat(a.value) : 0;
    const bval = /\d/.test(b.value) ? parseFloat(b.value) : 0;
    return (aval == bval ? 0 : (aval > bval ? 1 : -1));
}

function getDateSortingKey(format, text) {
    if (format.length < 1) { return ""; }
    format = format.toLowerCase();
    text = text.toLowerCase();
    text = text.replace(/^[^a-z0-9]*/, "");
    text = text.replace(/[^a-z0-9]*$/, "");
    if (text.length < 1) { return ""; }
    text = text.replace(/[^a-z0-9]+/g, ",");
    const date = text.split(",");
    if (date.length < 3) { return ""; }
    let d = 0, m = 0, y = 0;
    for (let i = 0; i < 3; i++) {
        const ts = format.substr(i, 1);
        if (ts == "d") { d = date[i]; }
        else if (ts == "m") { m = date[i]; }
        else if (ts == "y") { y = date[i]; }
    }
    d = d.replace(/^0/, "");
    if (d < 10) { d = "0" + d; }
    if (/[a-z]/.test(m)) {
        m = m.substr(0, 3);
        switch (m) {
            case "jan": m = String(1); break;
            case "feb": m = String(2); break;
            case "mar": m = String(3); break;
            case "apr": m = String(4); break;
            case "may": m = String(5); break;
            case "jun": m = String(6); break;
            case "jul": m = String(7); break;
            case "aug": m = String(8); break;
            case "sep": m = String(9); break;
            case "oct": m = String(10); break;
            case "nov": m = String(11); break;
            case "dec": m = String(12); break;
            default: m = String(0);
        }
    }
    m = m.replace(/^0/, "");
    if (m < 10) { m = "0" + m; }
    y = parseInt(y);
    if (y < 100) { y = parseInt(y) + 2000; }
    return "" + String(y) + "" + String(m) + "" + String(d) + "";
}

function filterByColumn(column) {
    const columnTextQuery = column.value.toUpperCase().trim();
    const tableBodyRefence = document.getElementById('tablebody');
    const tableRows = tableBodyRefence.getElementsByTagName('tr');
    const columnIndex = column.parentNode.cellIndex;
    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
        if (tableRows[rowIndex].classList.contains('hiddenRow')) {
            continue;
        }
        else {
            const fieldReference = tableRows[rowIndex].getElementsByTagName('td')[columnIndex];
            const fieldText = fieldReference.textContent || fieldReference.innerText;
            if (fieldText.toUpperCase().indexOf(columnTextQuery) <= -1) {
                show_hide_row(rowIndex, false);
            }
        }
    }
}
const debouncedFilterByColumn = debounce(filterByColumn);

function show_hide_row(row_no, do_show) {
    const tableReference = document.getElementById('indextable').tBodies[0];
    const tableRow = tableReference.getElementsByTagName('tr')[row_no];
    if (do_show) {
        tableRow.classList.remove('hiddenRow');
    }
    else {
        tableRow.classList.add('hiddenRow');
    }
}

function show_hide_column(col_no, do_show) {
    const tableBodyReference = document.getElementById('tablebody');
    const columnHeaderReference = document.getElementById("columnHeader" + col_no.toString()).parentElement;
    const searchColumnReference = document.getElementById("filterCell" + col_no.toString()).parentElement;
    if (do_show) {
        columnHeaderReference.classList.remove("hiddenCell");
        searchColumnReference.classList.remove("hiddenCell");
        for (let x = 0; x < tableBodyReference.childNodes.length; x++) {
            const tableRowReference = document.getElementById("dataRow" + x.toString());
            tableRowReference.getElementsByTagName("td")[col_no].classList.remove("hiddenCell");
        }
    }
    else {
        columnHeaderReference.classList.add("hiddenCell");
        searchColumnReference.classList.add("hiddenCell");
        for (let x = 0; x < tableBodyReference.childNodes.length; x++) {
            const tableRowReference = document.getElementById("dataRow" + x.toString());
            tableRowReference.getElementsByTagName("td")[col_no].classList.add("hiddenCell");
        }
    }
}

function formatDateTime(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'

    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
}

function debounce(func, delay = 1000) {
    let timerId;
    return (...args) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

function buildTableHeaders() {
    const tableHeadersElement = document.getElementById("tableheaders");
    const columnCount = Object.keys(jsonArray[0]).length;

    const tableHeadersRow = document.createElement("tr");
    for (let i = 0; i < columnCount; i++) {
        const tableHeader = document.createElement("th");
        const anchorTag = document.createElement("a");
        anchorTag.id = "columnHeader" + i.toString();
        const valueType = jsonTypes[Object.keys(jsonArray[0])[i]];

        if (valueType === "System.DateTime") {
            anchorTag.href = "javascript:sortTable(" + i.toString() + ", 'D', 'mdy');";
        }
        else if (valueType === "System.Int32" || valueType === "System.Double") {
            anchorTag.href = "javascript:sortTable(" + i.toString() + ", 'N');";
        }
        else {
            anchorTag.href = "javascript:sortTable(" + i.toString() + ", 'T');";
        }

        if (hiddenColumns.includes(Object.keys(jsonArray[0])[i])) {
            tableHeader.classList.add("hiddenCell");
        }

        anchorTag.innerHTML = Object.keys(jsonArray[0])[i];
        tableHeader.appendChild(anchorTag);
        tableHeadersRow.appendChild(tableHeader);
    }

    tableHeadersElement.appendChild(tableHeadersRow);
}

function buildTableSearchRow() {
    const tableHeadersElement = document.getElementById("tableheaders");
    const tableHeaderSearchRow = document.createElement("tr");
    tableHeaderSearchRow.classList.add("no-print");
    const columnCount = Object.keys(jsonArray[0]).length;

    for (let i = 0; i < columnCount; i++) {
        const tableData = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.id = "filterCell" + i.toString();
        input.setAttribute("onkeyup", "javascript:debouncedFilterByColumn(this)");
        input.placeholder = "Filter By";
        if (hiddenColumns.includes(Object.keys(jsonArray[0])[i])) {
            tableData.classList.add("hiddenCell");
        }
        tableData.appendChild(input);
        tableHeaderSearchRow.appendChild(tableData);
    }

    tableHeadersElement.appendChild(tableHeaderSearchRow);
}

function buildTableBody() {
    const tableBodyElement = document.getElementById("tablebody");

    for (let x = 0; x < jsonArray.length; x++) {
        const jsonObj = jsonArray[x];

        const tableRow = document.createElement("tr");
        tableRow.id = "dataRow" + x.toString();
        for (let y = 0; y < Object.keys(jsonObj).length; y++) {
            const jsonDataType = Object.values(jsonTypes)[y];
            const tableData = document.createElement("td");
            if (jsonDataType === "System.DateTime") {
                tableData.innerHTML = formatDateTime(Object.values(jsonObj)[y]);
            }
            else if (jsonDataType === "System.Uri") {
              const anchorTag = document.createElement("a");
              anchorTag.href = Object.values(jsonObj)[y];
              anchorTag.textContent = Object.values(jsonObj)[y];
              anchorTag.target = "_blank";
              tableData.appendChild(anchorTag);
            }
            else if (jsonDataType === "LibreBarcode128String") {
                tableData.classList.add("Barcode");
            }
            else {
                tableData.innerHTML = Object.values(jsonObj)[y];
            }

            if (hiddenColumns.includes(Object.keys(jsonArray[0])[y])) {
                tableData.classList.add("hiddenCell");
            }

            tableRow.appendChild(tableData);
        }
        tableBodyElement.appendChild(tableRow);
    }
}

function buildCheckboxGrid() {
    const checkboxGridElement = document.getElementById("checkboxgrid");
    const columnCount = Object.keys(jsonArray[0]).length;

    for (let x = 0; x < columnCount; x++) {
        const columnName = Object.keys(jsonArray[0])[x];

        const listItemElement = document.createElement("li");

        const checkBoxElement = document.createElement("input");
        checkBoxElement.type = "checkbox";
        checkBoxElement.id = "showcolumn" + x.toString();
        if (hiddenColumns.includes(columnName)) {
            checkBoxElement.checked = false;
        }
        else {
            checkBoxElement.checked = true;
        }
        checkBoxElement.setAttribute("onchange", "javascript:show_hide_column(" + x.toString() + ", checked)");
        listItemElement.appendChild(checkBoxElement);

        const labelElement = document.createElement("label");
        labelElement.setAttribute("for", checkBoxElement.id.toString());
        labelElement.innerHTML = columnName;
        listItemElement.appendChild(labelElement);

        checkboxGridElement.appendChild(listItemElement);
    }
}

function download_table_as_csv(table_id, separator = ',') {
    const rows = document.querySelectorAll('table#' + table_id + ' tr');
    const csv = [];
    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cols = rows[i].querySelectorAll('td, th');
        if (rows[i].classList.contains('hiddenRow')) {
            continue;
        }
        if (rows[i].classList.contains('no-print')) {
            continue;
        }
        for (let j = 0; j < cols.length; j++) {
            if (cols[j].classList.contains("hiddenCell")) {
                continue;
            }
            let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
            data = data.replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        csv.push(row.join(separator));
    }
    const csv_string = csv.join('\n');
    const filename = 'export_' + document.title + '.csv';
    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
