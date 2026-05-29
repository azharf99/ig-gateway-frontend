import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

const InstagramCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { linkInstagram, error } = useAuthStore();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      return;
    }

    const performLinking = async () => {
      const success = await linkInstagram(code);
      if (success) {
        setStatus('success');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setStatus('error');
      }
    };

    performLinking();
  }, [searchParams, linkInstagram, navigate]);

  return (
    <div className="min-h-screen bg-[#06080e] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-instagram-yellow via-instagram-pink to-instagram-purple" />
        
        {status === 'processing' && (
          <div className="flex flex-col items-center py-6">
            <Loader size={48} className="text-instagram-pink animate-spin mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Connecting Instagram Account</h3>
            <p className="text-gray-400 text-sm">Please wait while we exchange credentials with Meta servers...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center py-6">
            <CheckCircle size={48} className="text-green-400 mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-2">Successfully Connected!</h3>
            <p className="text-gray-400 text-sm">Your Instagram Creator/Business account is now linked. Redirecting you home...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center py-6">
            <XCircle size={48} className="text-red-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Connection Failed</h3>
            <p className="text-red-400/90 text-sm bg-red-950/20 border border-red-900/40 rounded-xl p-3 mb-4 w-full">
              {error || 'OAuth code invalid or expired.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition duration-300 text-sm cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramCallback;
