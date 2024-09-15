let uploadedImage = null;
const inputWidth = document.getElementById('width-input');
const defaultInputWidthMax = 200;

// ASCII variations
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

// Image to ASCII conversion
document.getElementById("upload-image").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            uploadedImage = img;

            // Update the input range based on the image size
            setInputWidthMax(img.width);

            processImageToASCII(img);

            sessionStorage.setItem('uploadedImage', event.target.result);
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function processImageToASCII(img, width = defaultInputWidthMax) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const aspectRatio = img.height / img.width;
    const height = Math.floor((width * aspectRatio) / 2);

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const asciiArt = convertToASCII(imageData);
    document.getElementById("ascii-output").textContent = asciiArt;
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
            const brightness = (r + g + b) / 3;

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
        const width = parseInt(inputWidth.value, 10);
        processImageToASCII(uploadedImage, width);
    } else {
        const savedImageData = sessionStorage.getItem('uploadedImage');
        if (savedImageData) {
            const img = new Image();
            img.onload = function () {
                uploadedImage = img;

                // Update the input range based on the image size
                setInputWidthMax(img.width);

                processImageToASCII(img, defaultInputWidthMax);
            };
            img.src = savedImageData;
        } else {
            document.getElementById("ascii-output").textContent = '';
        }
    }
}

// Input handlers
function clearImage() {
    uploadedImage = null;
    inputWidth.disabled = true;
    sessionStorage.removeItem('uploadedImage');
    document.getElementById("ascii-output").textContent = '';
}

// Update the image width based on the input range value
inputWidth.addEventListener('input', function () {
    const width = parseInt(inputWidth.value, 10);
    if (uploadedImage) {
        processImageToASCII(uploadedImage, width);
    }
});

function setInputWidthMax(width) {
    inputWidth.max = width;
    inputWidth.disabled = false; // Enable the input range
    inputWidth.value = defaultInputWidthMax; // Set fixed value
}

// Handle radio button changes
document.getElementById('variation-form').addEventListener('change', function () {
    const selectedVariation = parseInt(document.querySelector('input[name="variation"]:checked').value, 10);
    variation = selectedVariation;
    if (uploadedImage) {
        const width = parseInt(inputWidth.value, 10);
        processImageToASCII(uploadedImage, width);
    }
});

// Automatically generate ASCII art if image is available in sessionStorage
window.onload = function() {
    regenerate();
};
