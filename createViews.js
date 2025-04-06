const fs = require('fs');
const path = require('path');
const { BigQuery } = require('@google-cloud/bigquery');

// Initialize BigQuery client
const bigquery = new BigQuery({ projectId: 'osfk-it' });

// Define view dependencies and order
const VIEW_CREATION_ORDER = {
  'flight_log': ['first_flight_at']
  
  // Add more datasets and their view order as needed
};

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
  console.log(viewId);
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
 * Load all SQL files from all datasets
 * @param {string} folderPath - Path to the models folder
 * @returns {Object} - Map of dataset and their views with SQL content
 */
function loadAllViews(folderPath) {
  const datasets = fs.readdirSync(folderPath);
  const allViews = {};
  
  for (const datasetName of datasets) {
    const datasetPath = path.join(folderPath, datasetName);
    const viewFiles = fs.readdirSync(datasetPath).filter(file => file.endsWith('.sql'));
    
    allViews[datasetName] = viewFiles.map(viewFile => ({
      viewId: viewFile.replace('.sql', ''),
      sql: fs.readFileSync(path.join(datasetPath, viewFile), 'utf8')
    }));
  }
  
  return allViews;
}

/**
 * Get ordered views based on dependencies across all datasets
 * @param {Object} allViews - Map of datasets and their views
 * @returns {Array} - Ordered array of views with dataset and view info
 */
function getOrderedViews(allViews) {
  const orderedViews = [];
  
  // First add views in specified order
  Object.entries(VIEW_CREATION_ORDER).forEach(([datasetName, orderedViewIds]) => {
    if (allViews[datasetName]) {
      orderedViewIds.forEach(viewId => {
        const view = allViews[datasetName].find(v => v.viewId === viewId);
        if (view) {
          orderedViews.push({ datasetName, ...view });
          allViews[datasetName] = allViews[datasetName].filter(v => v.viewId !== viewId);
        }
      });
    }
  });
  
  // Add remaining views
  Object.entries(allViews).forEach(([datasetName, views]) => {
    views.forEach(view => {
      orderedViews.push({ datasetName, ...view });
    });
  });
  
  return orderedViews;
}

/**
 * Process all views in the correct order
 * @param {string} folderPath - Path to the models folder
 */
async function processFolder(folderPath) {
  // First load all views from all datasets
  const allViews = loadAllViews(folderPath);
  
  // Get views in correct order
  const orderedViews = getOrderedViews(allViews);
  
  // Create datasets and views in order
  for (const view of orderedViews) {
    const { datasetName, viewId, sql } = view;
    
    // Ensure dataset exists
    await createDatasetIfNotExists(datasetName);
    
    // Create or update view
    await createOrUpdateView(datasetName, viewId, sql);
  }
}

// Main function to run the script
async function main() {
  try {
    // Specify the path to the "models" folder
    const modelsFolderPath = 'models';
    
    // Process the folder to create or update datasets and views
    await processFolder(modelsFolderPath);
  } catch (err) {
    console.error('Error:', err);
    throw err;
  }
}

// Export the main function
module.exports = main;
