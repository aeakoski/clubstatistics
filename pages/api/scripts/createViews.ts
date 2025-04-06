import { NextApiRequest, NextApiResponse } from 'next';
import { hasRunToday, updateLastRunData } from '../../../utils/lastRun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if script has already run today
  if (hasRunToday('createViews')) {
    return res.status(200).json({ message: 'createViews already ran today' });
  }

  try {
    const createViews = (await import('../../../createViews')).default;
    await createViews();
    
    // Update last run data
    updateLastRunData('createViews');
    
    return res.status(200).json({ message: 'createViews completed successfully' });
  } catch (error: any) {
    console.error('Error running createViews:', error);
    return res.status(500).json({ error: error.message || 'Failed to run createViews' });
  }
} 