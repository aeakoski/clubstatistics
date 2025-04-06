import { NextApiRequest, NextApiResponse } from 'next';
import { hasRunToday, updateLastRunData } from '../../../utils/lastRun';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if script has already run today
  if (hasRunToday('bqFiller')) {
    return res.status(200).json({ message: 'bqFiller already ran today' });
  }

  try {
    const bqFiller = (await import('../../../bqFiller')).default;
    await bqFiller();
    
    // Update last run data
    updateLastRunData('bqFiller');
    
    return res.status(200).json({ message: 'bqFiller completed successfully' });
  } catch (error: any) {
    console.error('Error running bqFiller:', error);
    return res.status(500).json({ error: error.message || 'Failed to run bqFiller' });
  }
} 