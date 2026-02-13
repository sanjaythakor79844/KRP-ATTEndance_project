import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Mail, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface GmailStatus {
  connected: boolean;
  user?: {
    email: string;
    name: string;
  };
  authUrl?: string;
  timestamp?: string;
}

export function GmailStatus() {
  const [status, setStatus] = useState<GmailStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gmail/status`);
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching Gmail status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gmail/auth-url`);
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
        // Poll for connection after opening auth window
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`${API_BASE_URL}/api/gmail/status`);
          const statusData = await statusResponse.json();
          if (statusData.connected) {
            clearInterval(pollInterval);
            fetchStatus();
          }
        }, 3000);
        
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/gmail/disconnect`, {
        method: 'POST'
      });
      await fetchStatus();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStatus();
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading Gmail status...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Gmail Status
        </h3>
        <Button variant="secondary" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {status && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {status.connected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-600 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-600 font-medium">Disconnected</span>
                </>
              )}
            </div>
            
            {status.connected && (
              <Button variant="secondary" onClick={handleDisconnect}>
                Disconnect
              </Button>
            )}
          </div>

          {status.connected && status.user && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">Connected as:</p>
              <p className="font-medium text-green-900">{status.user.email}</p>
              <p className="text-xs text-green-600 mt-1">✓ Ready to send emails</p>
            </div>
          )}

          {!status.connected && (
            <div className="text-center">
              <div className="mb-4">
                <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-600 mb-4">Connect Gmail to send emails</p>
              </div>
              
              <Button 
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Connect Gmail
              </Button>
              
              <div className="mt-4 text-xs text-gray-500 text-left bg-gray-50 p-3 rounded">
                <p className="font-medium mb-2">How to connect:</p>
                <p>1. Click "Connect Gmail" button</p>
                <p>2. Sign in with your Google account</p>
                <p>3. Grant permissions to send emails</p>
                <p>4. You'll be redirected back automatically</p>
              </div>
            </div>
          )}

          {status.timestamp && (
            <div className="text-xs text-gray-400 text-right">
              Last updated: {new Date(status.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
