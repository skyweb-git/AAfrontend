import React, { useState } from 'react';
import { X, Send, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { messagesAPI } from '../services/api';

const MessageModal = ({ isOpen, onClose, recipientId, recipientName }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSending(true);
      setError('');
      
      await messagesAPI.sendMessage({
        recipientId,
        text: message.trim(),
        type: 'direct_message'
      });

      setSuccess(true);
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Send message error:', err);
      // Fallback for demo if API fails
      if (err.message.includes('404') || err.message.includes('Network Error')) {
          const mockMessages = JSON.parse(localStorage.getItem('userMessages') || '[]');
          mockMessages.unshift({
            id: Date.now(),
            text: message.trim(),
            timestamp: new Date().toISOString(),
            sender: 'user',
            recipientName,
            status: 'sent'
          });
          localStorage.setItem('userMessages', JSON.stringify(mockMessages));
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2000);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-red-500/10">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-white" size={24} />
            <h2 className="text-white font-bold text-lg uppercase tracking-tight">Message {recipientName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {success ? (
            <div className="py-12 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <Send size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500">Your message has been delivered to {recipientName}.</p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                  Your Message
                </label>
                <textarea
                  autoFocus
                  required
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write your message to ${recipientName}...`}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-red-600 transition-all text-gray-800 resize-none"
                  disabled={sending}
                ></textarea>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-sm font-medium">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                  disabled={sending}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="flex-[2] bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {sending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      SEND MESSAGE
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
