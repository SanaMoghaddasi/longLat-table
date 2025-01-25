const map = L.map('map', {
    attributionControl: false
}).setView([36.579350367797346, 53.04887527633113], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

const tableBody = document.querySelector("#coordinates-table tbody");
const selectAllCheckbox = document.querySelector("#select-all");
const deleteSelectedButton = document.querySelector("#delete-selected");
const deleteFooter = document.querySelector("#delete-footer");
const emptyMessage = document.querySelector("#empty-message");

const MAX_ROWS = 25;
let rowCount = 0;
let cursorMarkers = [];


const purpleIcon = L.icon({
    iconUrl: '././public/images/pointer.webp',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, 0]
});


function addRow(lat, lng) {
    if (rowCount >= MAX_ROWS) {
        Swal.fire({
            icon: 'error',
            title: 'ظرفیت محدود است',
            text: "نمیتوانید سطری جدید اضافه کنید",
        });
        return;
    }

    
    const existingEmptyMessage = document.querySelector("#empty-message");
    if (existingEmptyMessage) {
        existingEmptyMessage.remove();
    }

    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("row-checkbox");
    checkbox.dataset.lat = lat;
    checkbox.dataset.lng = lng;
    checkboxCell.appendChild(checkbox);

    const latCell = document.createElement("td");
    latCell.textContent = lat.toFixed(6);
    latCell.dataset.value = lat.toFixed(6);

    const lngCell = document.createElement("td");
    lngCell.textContent = lng.toFixed(6);
    lngCell.dataset.value = lng.toFixed(6);

    const operationsCell = document.createElement("td");

   
    const editIcon = document.createElement("i");
    editIcon.className = "fas fa-edit action-icon";
    editIcon.style.color = "purple";
    editIcon.onclick = () => enableEdit(latCell, lngCell);

    operationsCell.appendChild(editIcon);

    row.appendChild(checkboxCell);
    row.appendChild(latCell);
    row.appendChild(lngCell);
    row.appendChild(operationsCell);

    tableBody.appendChild(row);
    rowCount++;

    
    deleteFooter.hidden = false;

  
    updateSelectAllCheckboxStatus();
}


function handleSelectAllChange() {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);

    
    updateDeleteFooterVisibility();
}


function updateSelectAllCheckboxStatus() {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    const checkedCheckboxes = document.querySelectorAll(".row-checkbox:checked");

    if (checkboxes.length > 0 && checkboxes.length === checkedCheckboxes.length) {
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.checked = false;
    }

    updateDeleteFooterVisibility();
}


function updateDeleteFooterVisibility() {
    const selectedRows = document.querySelectorAll(".row-checkbox:checked");
    deleteFooter.hidden = selectedRows.length === 0;
}


function deleteSelectedRows() {
    const selectedRows = document.querySelectorAll(".row-checkbox:checked");
    if (selectedRows.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'هیچ ردیفی انتخاب نشده است',
            text: 'لطفاً حداقل یک ردیف را انتخاب کنید',
        });
        return;
    }

    Swal.fire({
        title: 'توجه',
        text: "آیا میخواهید سطرهای انتخاب شده را پاک کنید؟",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله',
        cancelButtonText: 'خیر',
    }).then((result) => {
        if (result.isConfirmed) {
            selectedRows.forEach(checkbox => {
                const row = checkbox.closest('tr');
                row.remove();
                rowCount--;

                
                const lat = parseFloat(checkbox.dataset.lat);
                const lng = parseFloat(checkbox.dataset.lng);

                cursorMarkers = cursorMarkers.filter(marker => {
                    if (marker.getLatLng().lat === lat && marker.getLatLng().lng === lng) {
                        map.removeLayer(marker); 
                        return false;
                    }
                    return true;
                });
            });

            
            if (rowCount === 0) {
                const noDataRow = document.createElement("tr");
                noDataRow.id = "empty-message";
                const noDataCell = document.createElement("td");
                noDataCell.colSpan = 5;
                noDataCell.className = "empty-message";
                noDataCell.innerHTML = "دیتایی در جدول موجود نمی یاشد<br><img src='././public/images/empty.gif' alt='empty table' />";
                noDataRow.appendChild(noDataCell);
                tableBody.appendChild(noDataRow);

               
                deleteFooter.hidden = true;
            }

            
            updateSelectAllCheckboxStatus();
        }
    });
}

function enableEdit(latCell, lngCell) {
    if (!latCell.querySelector("input")) {
        const latInput = document.createElement("input");
        latInput.type = "text";
        latInput.value = latCell.dataset.value;
        latInput.onblur = () => finalizeEdit(latCell, latInput.value);
        latCell.textContent = "";
        latCell.appendChild(latInput);
        latInput.focus();
    }

    if (!lngCell.querySelector("input")) {
        const lngInput = document.createElement("input");
        lngInput.type = "text";
        lngInput.value = lngCell.dataset.value;
        lngInput.onblur = () => finalizeEdit(lngCell, lngInput.value);
        lngCell.textContent = "";
        lngCell.appendChild(lngInput);
    }
}

function finalizeEdit(cell, newValue) {
    cell.dataset.value = newValue;
    cell.textContent = newValue;
}

selectAllCheckbox.addEventListener('change', handleSelectAllChange);


document.querySelector("#coordinates-table").addEventListener('change', function (e) {
    if (e.target.classList.contains('row-checkbox')) {
        updateSelectAllCheckboxStatus();
    }
});

deleteSelectedButton.addEventListener('click', deleteSelectedRows);

map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    const cursorMarker = L.marker([lat, lng], {
        icon: purpleIcon
    }).addTo(map);

    cursorMarkers.push(cursorMarker);
    addRow(lat, lng);
});

