// Download SOME images from production to local development
//Run with "node download-images.js"

const fs = require('fs');
const path = require('path');
const https = require('https');

// Create images directory if it doesn't exist
const imagesDir = path.join(process.cwd(), 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log(`Created directory: ${imagesDir}`);
}

// List of images to download
const imagesToDownload = [
  {
    url: 'https://stegetfore.netlify.app/images/hero-fallback.jpg',
    destination: path.join(imagesDir, 'hero-fallback.jpg')
  },
  {
    url: 'https://stegetfore.netlify.app/images/placeholder.jpg',
    destination: path.join(imagesDir, 'placeholder.jpg')
  }
  // Add more images as needed
];

// Function to download a file
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${destination}...`);
    
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Following redirect to: ${response.headers.location}`);
        downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // Check if the response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP status code ${response.statusCode}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Handle errors during download
      response.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete the file if there's an error
        reject(err);
      });
      
      // Finalize the file when download is complete
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded ${url}`);
        resolve();
      });
      
      // Handle errors when writing to file
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  console.log('Starting downloads...');
  
  for (const image of imagesToDownload) {
    try {
      await downloadFile(image.url, image.destination);
    } catch (error) {
      console.error(`Error downloading ${image.url}:`, error.message);
    }
  }
  
  console.log('All downloads completed!');
}

// Run the download
downloadAllImages();