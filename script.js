document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const canvas = document.getElementById('canvas');
    const saveButton = document.getElementById('saveButton');
    const loadButton = document.getElementById('loadButton');
    const exportHtmlButton = document.getElementById('exportHtml'); // Button to export canvas as HTML
    const imageUpload = document.getElementById('imageUpload');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const bgImageUpload = document.getElementById('bgImageUpload');

    function createCanvasItem(type, content = '', left = '50px', top = '50px', src = null) {
        let element = document.createElement(type === 'image' ? 'img' : 'div');

        if (type === 'text' || type === 'note') {
            element.contentEditable = true;
            element.textContent = content;
            element.classList.add('canvas-item');
            if (type === 'note') {
                element.style.backgroundColor = 'lightyellow';
                element.style.padding = '10px';
                element.style.borderRadius = '5px';
            }
        } else if (type === 'image') {
            element.src = src;
            element.classList.add('canvas-item');
            element.style.maxWidth = '200px';
        }

        element.style.position = 'absolute';
        element.style.left = left;
        element.style.top = top;
        element.draggable = false;

        // Dragging behavior
        element.addEventListener('mousedown', (event) => {
            if (element.contentEditable === 'true') return; // Allow editing

            event.preventDefault();
            let shiftX = event.clientX - element.getBoundingClientRect().left;
            let shiftY = event.clientY - element.getBoundingClientRect().top;

            function moveAt(pageX, pageY) {
                element.style.left = `${pageX - shiftX}px`;
                element.style.top = `${pageY - shiftY}px`;
            }

            function onMouseMove(event) {
                moveAt(event.pageX, event.pageY);
            }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        canvas.appendChild(element);
    }

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('type', draggable.classList[1]);
        });
    });

    canvas.addEventListener('dragover', (e) => e.preventDefault());

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if (type) {
            createCanvasItem(type, type === 'text' ? 'Editable Text' : 'Sticky Note',
                `${e.clientX - canvas.offsetLeft}px`, `${e.clientY - canvas.offsetTop}px`);
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                createCanvasItem('image', '', '50px', '50px', event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    bgColorPicker.addEventListener('input', (e) => {
        canvas.style.backgroundColor = e.target.value;
    });

    bgImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                canvas.style.backgroundImage = `url(${event.target.result})`;
                canvas.style.backgroundSize = 'cover';
            };
            reader.readAsDataURL(file);
        }
    });

    saveButton.addEventListener('click', () => {
        const elements = canvas.querySelectorAll('.canvas-item');
        const state = Array.from(elements).map(el => ({
            type: el.tagName.toLowerCase() === 'img' ? 'image' : (el.style.backgroundColor === 'lightyellow' ? 'note' : 'text'),
            content: el.contentEditable ? el.textContent : null,
            left: el.style.left,
            top: el.style.top,
            src: el.tagName.toLowerCase() === 'img' ? el.src : null
        }));
        localStorage.setItem('canvasState', JSON.stringify(state));
    });

    loadButton.addEventListener('click', () => {
        const state = JSON.parse(localStorage.getItem('canvasState'));
        if (state) {
            canvas.innerHTML = '';
            state.forEach(item => {
                createCanvasItem(item.type, item.content, item.left, item.top, item.src);
            });
        }
    });

    exportHtmlButton.addEventListener('click', () => {
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Exported Canvas</title>
                <style>
                    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .canvas {
                        width: ${canvas.clientWidth}px;
                        height: ${canvas.clientHeight}px;
                        position: relative;
                        background-color: ${canvas.style.backgroundColor || 'white'};
                        background-image: ${canvas.style.backgroundImage || 'none'};
                        background-size: cover;
                        border: 2px dashed #ccc;
                    }
                    .canvas-item {
                        position: absolute;
                        word-wrap: break-word;
                        border: 1px solid black;
                        background-color: rgba(255, 255, 255, 0.8);
                        max-width: 150px;
                    }
                    .canvas-item[contenteditable="true"] {
                        outline: none;
                        cursor: text;
                        min-width: 50px;
                        min-height: 20px;
                    }
                    .canvas-item img {
                        max-width: 100%;
                        height: auto;
                    }
                </style>
            </head>
            <body>
                <div class="canvas">${canvas.innerHTML}</div>
                <script>
                    document.querySelectorAll('.canvas-item').forEach(el => {
                        el.contentEditable = 'true';
                    });
                </script>
            </body>
            </html>
        `;

        // Open in a new tab
        const newTab = window.open();
        newTab.document.open();
        newTab.document.write(htmlContent);
        newTab.document.close();

        // Create a downloadable HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'canvas.html';
        a.textContent = 'Download HTML File';
        a.style.display = 'block';
        a.style.marginTop = '20px';

        newTab.document.body.appendChild(a);
    });
});
