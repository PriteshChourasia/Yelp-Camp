const fileInput = document.getElementById('formFileMultiple');
const fileList = document.getElementById('fileList');

fileInput.addEventListener('change', function () {
    const files = Array.from(fileInput.files);
    if (files.length === 0) {
        fileList.textContent = 'No files selected.';
        return;
    }

    // List all selected file names
    fileList.innerHTML = files.map(f => `• ${f.name}`).join('<br>');
});