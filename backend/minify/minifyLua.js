const luamin = require('luamin');
const fs = require('fs');
const path = require('path');

function copyFiles(sourceDir, destDir, transformFunction, ignoredDirectories = []) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Read the contents of the source directory
    fs.readdir(sourceDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const sourceFile = path.join(sourceDir, file);
            const destFile = path.join(destDir, file);

            // Check if the file is a directory
            fs.stat(sourceFile, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                if (stats.isDirectory()) {
                    // Check if the directory should be ignored
                    if (ignoredDirectories.includes(file)) {
                        console.log(`Skipping directory: ${sourceFile}`);
                        return;
                    }
                    // Recursively copy subdirectory
                    copyFiles(sourceFile, destFile, transformFunction, ignoredDirectories);
                } else {
                    // Read and apply transformation function to file content
                    fs.readFile(sourceFile, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }

                        // Apply transformation function to file content
                        const transformedData = transformFunction(data);

                        // Write transformed data to destination file
                        fs.writeFile(destFile, transformedData, 'utf8', err => {
                            if (err) {
                                console.error('Error writing file:', err);
                                return;
                            }
                            console.log(`Copied ${sourceFile} to ${destFile}`);
                        });
                    });
                }
            });
        });
    });
}

// Example usage:
const sourceDirectory = '/home/mateus/WSL/PROJETOS/minecraft/CCManagerLua';
const destinationDirectory = '/home/mateus/WSL/PROJETOS/minecraft/CCManagerLuaMini';

// Define directories to be ignored
const ignoredDirectories = ['Logs'];

// Define your transformation function here
function transformFunction(data) {
    // Example transformation: Minify Lua code
    return luamin.minify(data);
}

copyFiles(sourceDirectory, destinationDirectory, transformFunction, ignoredDirectories);
