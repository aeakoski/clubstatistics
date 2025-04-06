import { NextApiRequest, NextApiResponse } from 'next';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

const LAST_RUN_FILE = path.join(process.cwd(), '.last-run');

interface LastRunData {
  date: string;
  createViews: boolean;
  bqFiller: boolean;
}

function getLastRunData(): LastRunData {
  try {
    if (fs.existsSync(LAST_RUN_FILE)) {
      const data = fs.readFileSync(LAST_RUN_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading last run data:', error);
  }
  return {
    date: '',
    createViews: false,
    bqFiller: false
  };
}

function updateLastRunData(script: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastRun = getLastRunData();
  
  const newData = {
    date: today,
    ...lastRun,
    [script]: true
  };
  
  fs.writeFileSync(LAST_RUN_FILE, JSON.stringify(newData, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { script } = req.query;
  if (!script || typeof script !== 'string') {
    return res.status(400).json({ error: 'Script parameter is required' });
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const lastRun = getLastRunData();

  // Check if script has already run today
  if (lastRun.date === today && lastRun[script as keyof LastRunData]) {
    return res.status(200).json({ message: `${script} already ran today` });
  }

  try {
    let scriptModule;
    if (script === 'createViews') {
      scriptModule = require('../../createViews');
    } else if (script === 'bqFiller') {
      scriptModule = require('../../bqFiller');
    } else {
      return res.status(400).json({ error: 'Invalid script name' });
    }

    // Run the script
    await scriptModule.default();
    
    // Update last run data
    updateLastRunData(script);
    
    return res.status(200).json({ message: `${script} completed successfully` });
  } catch (error) {
    console.error(`Error running ${script}:`, error);
    return res.status(500).json({ error: `Failed to run ${script}` });
  }
} 