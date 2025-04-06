import { format } from 'date-fns';

interface LastRunData {
  date: string;
  createViews: boolean;
  bqFiller: boolean;
}

// We'll store the last run data in an environment variable
const LAST_RUN_KEY = 'LAST_RUN_DATA';

export function getLastRunData(): LastRunData {
  try {
    const data = process.env[LAST_RUN_KEY];
    if (data) {
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

export function updateLastRunData(script: 'createViews' | 'bqFiller'): void {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastRun = getLastRunData();
  
  const newData = {
    ...lastRun,
    date: today,
    [script]: true
  };
  
  // Store the data in an environment variable
  process.env[LAST_RUN_KEY] = JSON.stringify(newData);
}

export function hasRunToday(script: 'createViews' | 'bqFiller'): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastRun = getLastRunData();
  return lastRun.date === today && lastRun[script];
} 