const fs = require('fs-extra');
const path = require('path');

async function copyResources() {
  const sourceDir = path.join(process.cwd(), 'models');
  const targetDir = path.join(process.cwd(), '.next', 'static', 'models');

  try {
    // Ensure the target directory exists
    await fs.ensureDir(targetDir);
    
    // Copy the resources directory
    await fs.copy(sourceDir, targetDir);
    
    console.log('Resources folder copied successfully!');
  } catch (err) {
    console.error('Error copying resources folder:', err);
    process.exit(1);
  }
}

copyResources(); 