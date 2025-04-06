import React from 'react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Starting up the data pipeline...');

  useEffect(() => {
    const runScripts = async () => {
      try {
        setStatus('Checking if all data components are in place for displaying proper flight data...');
        const createViewsResponse = await fetch('/api/scripts/createViews');
        const createViewsData = await createViewsResponse.json();
        
        if (createViewsData.message.includes('already ran today')) {
          setStatus('All flight data components are already up to date. Checking flight logs...');
        } else {
          setStatus('Updating flight data components in the database...');
        }
        
        if (!createViewsResponse.ok) throw new Error(createViewsData.error || 'Failed to update flight data views');
        
        setStatus('Checking if flight logs have been imported today...');
        const bqFillerResponse = await fetch('/api/scripts/bqFiller');
        const bqFillerData = await bqFillerResponse.json();
        
        if (bqFillerData.message.includes('already ran today')) {
          setStatus('Flight logs are updated earlier today. Taking you to the dashboard...');
        } else {
          setStatus('Importing new flight logs from MyWebLog...');
        }
        
        if (!bqFillerResponse.ok) throw new Error(bqFillerData.error || 'Failed to import flight logs');
        
        // Short delay to show the final status
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('All data is up to date! Opening the dashboard...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to Looker Studio
        window.location.href = 'https://lookerstudio.google.com/u/0/reporting/f5ce3993-2162-47d9-8156-36dc4b0bbb35/page/VbLGD';
      } catch (error: any) {
        setStatus(`Something went wrong: ${error.message || 'Could not update flight data'}. Please try again later or contact support.`);
        console.error('Script execution error:', error);
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
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ 
        color: '#333',
        marginBottom: '20px'
      }}>ÖSFK Flight Statistics</h1>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        <p style={{ 
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.5'
        }}>{status}</p>
      </div>
    </div>
  );
} 