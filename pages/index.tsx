import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const runScripts = async () => {
      try {
        setStatus('Running createViews...');
        const createViewsResponse = await fetch('/api/run-scripts?script=createViews');
        if (!createViewsResponse.ok) throw new Error('createViews failed');
        
        setStatus('Running bqFiller...');
        const bqFillerResponse = await fetch('/api/run-scripts?script=bqFiller');
        if (!bqFillerResponse.ok) throw new Error('bqFiller failed');
        
        setStatus('Scripts completed successfully! Redirecting...');
        // Redirect to Looker Studio
        window.location.href = 'https://lookerstudio.google.com/u/0/reporting/f5ce3993-2162-47d9-8156-36dc4b0bbb35/page/VbLGD';
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    };

    runScripts();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>Club Statistics Data Pipeline</h1>
      <p>{status}</p>
    </div>
  );
} 