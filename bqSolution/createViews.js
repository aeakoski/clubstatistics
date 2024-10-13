const fs = require('fs');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');

// Initialize BigQuery client
const bigquery = new BigQuery({ projectId: 'osfk-it' });

/**
 * Create a dataset if it doesn't already exist.
 * @param {string} datasetId - Full dataset ID including project ID.
 */
async function createDatasetIfNotExists(datasetId) {
  try {
    // Try to get the dataset, will throw if it doesn't exist
    await bigquery.dataset(datasetId).get({ autoCreate: false });
    console.log(`Dataset ${datasetId} already exists.`);
  } catch (err) {
    if (err.code === 404) {
      // If the dataset doesn't exist, create it
      await bigquery.createDataset(datasetId, { location: 'US' });
      console.log(`Created dataset ${datasetId}`);
    } else {
      throw err;
    }
  }
}

/**
 * Create or update a view if needed.
 * If the view exists and the SQL differs, update it.
 * @param {string} datasetId - The dataset in which the view is to be created or updated.
 * @param {string} viewId - The name of the view.
 * @param {string} viewSql - The SQL query for the view.
 */
async function createOrUpdateView(datasetId, viewId, viewSql) {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(viewId);

  try {
    // Try to get the view
    const [tableMetadata] = await table.get();
    
    const existingSql = tableMetadata.metadata.view.query;

    // If the existing SQL is different from the new SQL, update the view
    if (existingSql.trim() !== viewSql.trim()) {
      console.log(`Updating view ${viewId} in dataset ${datasetId}`);
      const options = {
        view: {
          query: viewSql,
          useLegacySql: false,
        },
      };
      await table.setMetadata(options);
      console.log(`Updated view ${viewId} in dataset ${datasetId}`);
    } else {
      console.log(`View ${viewId} in dataset ${datasetId} is up to date.`);
    }
  } catch (err) {
    if (err.code === 404) {
      // If the view doesn't exist, create it
      console.log(`View ${viewId} does not exist in dataset ${datasetId}. Creating it.`);
      const options = {
        view: {
          query: viewSql,
          useLegacySql: false,
        },
      };
      await table.create(options);
      console.log(`Created view ${viewId} in dataset ${datasetId}`);
    } else {
      throw err;
    }
  }
}

/**
 * Process the folder to create or update datasets and views based on the folder structure.
 * @param {string} folderPath - Path to the models folder.
 */
async function processFolder(folderPath) {
  const datasets = fs.readdirSync(folderPath);
  
  for (const datasetName of datasets) {
    const datasetPath = path.join(folderPath, datasetName);
    const datasetId = `${datasetName}`;

    // Check if dataset exists, if not create it
    await createDatasetIfNotExists(datasetId);

    // Process all SQL files (views) in the dataset folder
    const viewFiles = fs.readdirSync(datasetPath);
    
    for (const viewFile of viewFiles) {
      if (viewFile.endsWith('.sql')) {
        const viewId = viewFile.replace('.sql', '');
        const viewFilePath = path.join(datasetPath, viewFile);
        
        // Read the SQL query from the file
        const viewSql = fs.readFileSync(viewFilePath, 'utf8');
        
        // Create or update the view based on the SQL content
        await createOrUpdateView(datasetId, viewId, viewSql);
      }
    }
  }
}

// Main function to run the script
(async () => {
  try {
    // Specify the path to the "models" folder
    const modelsFolderPath = 'models';
    
    // Process the folder to create or update datasets and views
    await processFolder(modelsFolderPath);
  } catch (err) {
    console.error('Error:', err);
  }
})();
