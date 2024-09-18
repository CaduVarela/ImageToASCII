let uploadedImage = null;

const widthInput = document.getElementById('output-width-input');
const defaultWidthInputMax = 200;

const fontSizeSpinner = document.getElementById('font-size-spinner');
let fontSize = fontSizeSpinner.value;

/* --- ASCII Variations --- */
const asciiChars = [
    // "Minimalist"
    ["@", "#", "x", " ", " ", " "],
    ["@", "#", "x", "-", ":", " "],
    // "Reduced"
    ["@", "#", "x", " ", " "],
    // "Detailed"
    ["@", "Q", '#', '-', ':', ' ', ' '],
    ["@", "Q", "#", "x", " ", " ", " "],
    // "Smooth Detailed"
    ["@", "Q", "#", "x", "-", ".", " ", " ", " ", " ", " "], // better with dark
    ["@", "Q", "#", "x", "+", "-", ":", "^", ">", ".", " "] // better with light
];
let variation = parseInt(document.querySelector('input[name="variation"]:checked').value, 10); // Default value

/* --- Main Components --- */

function processImageToASCII(img, width = defaultWidthInputMax) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const aspectRatio = img.height / img.width;
    const height = Math.floor((width * aspectRatio) / 2);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const asciiArt = convertToASCII(imageData);

    const asciiOutput = document.getElementById("ascii-output");
    asciiOutput.textContent = asciiArt;
    asciiOutput.style.fontSize = fontSize + "pt"; // Apply the selected font size
}

function convertToASCII(imageData) {
    const { data, width, height } = imageData;
    let asciiStr = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // For every pixel of the image, 'data' stores 4 values, one for every color and one for opacity
            // Here we calculate the 'offset', which holds the index to the first of the four values 
            const offset = (y * width + x) * 4;

            // Based on the offset, we only get the color values, since opacity is not relevant here
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];

            // This calculates the average brightness, returning a number between 0 and 255
            const weightedAverage = document.getElementById("weighted-average-checkbox").checked;
            let brightness;

            if (weightedAverage)
                brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            else
                brightness = (r + g + b) / 3;

            // Here we find the corresponding ASCII character index based on the brightness
            const charIndex = Math.floor((brightness / 255) * (asciiChars[variation].length - 1));

            asciiStr += asciiChars[variation][charIndex];
        }
        asciiStr += "\n";
    }

    return asciiStr;
}

function regenerate() {
    if (uploadedImage) {
        const width = parseInt(widthInput.value, 10);
        processImageToASCII(uploadedImage, width);
    } else {
        const savedImageData = sessionStorage.getItem('uploadedImage');
        if (savedImageData) {
            const img = new Image();
            img.onload = function () {
                uploadedImage = img;

                // Update the input range based on the image size
                setwidthInputMax(img.width);

                processImageToASCII(img, defaultWidthInputMax);
            };
            img.src = savedImageData;
        } else {
            document.getElementById("ascii-output").textContent = '';
        }
    }
}

/* --- Utils --- */
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            uploadedImage = img;

            // Update the input range based on the image size
            setwidthInputMax(img.width);

            processImageToASCII(img);

            sessionStorage.setItem('uploadedImage', e.target.result);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/* --- Input handlers --- */

// Image Upload
document.getElementById("upload-image").addEventListener("change", function (e) {
    const file = e.target.files[0];
    loadImage(file);
});

// Clear
function clearImage() {
    uploadedImage = null;
    widthInput.disabled = true;
    sessionStorage.removeItem('uploadedImage');
    document.getElementById("ascii-output").textContent = '';
}

// Output width
widthInput.addEventListener('input', function () {
    const width = parseInt(widthInput.value, 10);
    if (uploadedImage) {
        processImageToASCII(uploadedImage, width);
    }
});

function setwidthInputMax(width) {
    widthInput.max = width;
    widthInput.disabled = false; // Enable the input range
    widthInput.value = defaultWidthInputMax; // Set fixed value
}

// ASCII chars variation
document.getElementById('variation-form').addEventListener('change', function () {
    const selectedVariation = parseInt(document.querySelector('input[name="variation"]:checked').value, 10);
    variation = selectedVariation;
    if (uploadedImage) {
        const width = parseInt(widthInput.value, 10);
        processImageToASCII(uploadedImage, width);
    }
});

// Copy to clipboard
document.getElementById('copy-button').addEventListener('click', function () {
    const asciiArt = document.getElementById("ascii-output").textContent;
    if (asciiArt) {
        navigator.clipboard.writeText(asciiArt)
    } else {
        navigator.clipboard.writeText('');
    }
});

// Font size
document.getElementById('font-size-spinner').addEventListener('input', function () {
    fontSize = parseInt(this.value, 10);

    if (fontSize > 6) fontSize = 6;
    else if (fontSize < 1) fontSize = 1;

    this.value = fontSize;

    document.getElementById('ascii-output').style.fontSize = fontSize + "pt";
});

// Weighted average
document.getElementById('weighted-average-checkbox').addEventListener('change', function () {
    regenerate();
});

// Drag and drop
const dropArea = document.body;

dropArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    dropArea.classList.add('dragging');
});

dropArea.addEventListener('dragleave', (event) => {
    if (!dropArea.contains(event.relatedTarget)) {
        dropArea.classList.remove('dragging');
    }
});

dropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dropArea.classList.remove('dragging');

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    } else {
        alert('You must drop an image');
    }

    dropArea.classList.remove('dragging');
});

// Page load
window.onload = function() {
    regenerate();
};
