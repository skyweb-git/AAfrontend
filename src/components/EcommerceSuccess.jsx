import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Home, ShoppingBag } from 'lucide-react';
import Navbar from './Navbar';
import { ecommerceAPI } from '../services/api';

const EcommerceSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('verifying'); // verifying | paid | failed
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      return;
    }
    let isCancelled = false;
    const verify = async () => {
      try {
        const res = await ecommerceAPI.verifyPurchaseSession(orderId);
        if (isCancelled) return;
        if (res.status === 'paid' || res.status === 'PAID') {
          setStatus('paid');
          setOrderDetails(res);
        } else {
          setStatus('failed');
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Verification error:', err);
          setStatus('failed');
        }
      }
    };
    verify();
    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-500 text-sm">Please wait while we confirm your payment with Cashfree...</p>
            </>
          )}

          {status === 'paid' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your artwork purchase has been confirmed. The artist will prepare and dispatch your piece.
              </p>
              {orderDetails && (
                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-medium text-gray-900 font-mono text-xs">{orderId}</span>
                  </div>
                  {orderDetails.productName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Artwork</span>
                      <span className="font-medium text-gray-900">{orderDetails.productName}</span>
                    </div>
                  )}
                  {orderDetails.artistName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Artist</span>
                      <span className="font-medium text-gray-900">{orderDetails.artistName}</span>
                    </div>
                  )}
                  {orderDetails.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount Paid</span>
                      <span className="font-bold text-gray-900">₹{Number(orderDetails.amount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                <Home size={16} />
                Back to Home
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Incomplete</h2>
              <p className="text-gray-500 text-sm mb-6">
                We could not verify your payment. If any amount was deducted, Cashfree will automatically process a refund to your account.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  <ShoppingBag size={14} />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors text-sm"
                >
                  <Home size={14} />
                  Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EcommerceSuccess;
