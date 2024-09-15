let uploadedImage = null;

document.getElementById("upload-image").addEventListener("change", function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");

            const width = 440;
            const aspectRatio = img.height / img.width;
            const height = Math.floor((width * aspectRatio) / 2);

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);

            const asciiArt = convertToASCII(imageData);
            document.getElementById("ascii-output").textContent = asciiArt;
        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function regenerate() {
    document.getElementById("upload-image").file = document.getElementById("upload-image").file;
}

const asciiChars = [
    ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", "."],
    ["@", "#", "8", "&", "O", "S", "$", "*", ":", ".", " "],
    ["@", "#", "8", "&", "W", "M", "X", "Z", "S", "0", "?", "*", "+", ":", ".", " "]
]

const variation = 2;

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
