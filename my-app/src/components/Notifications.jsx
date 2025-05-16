import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { markNotificationRead } from '../solana/api';

export const Notifications = () => {
  const { publicKey } = useWallet();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch notifications when wallet is connected
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!publicKey) return;
      
      setLoadingNotifications(true);
      try {
        // For demonstration, we're creating mock notification data
        // In a real app, you would query all notifications from the blockchain
        const mockNotifications = [
          { 
            id: 1, 
            message: 'Payment of 1000 to recipient was executed successfully',
            timestamp: new Date().toLocaleString(),
            isRead: false,
            paymentId: 1,
            notificationPDA: publicKey // This is just a placeholder, would be a real PDA in production
          },
          { 
            id: 2, 
            message: 'Payment of 2000 to recipient was executed successfully',
            timestamp: new Date().toLocaleString(),
            isRead: false,
            paymentId: 2,
            notificationPDA: publicKey // This is just a placeholder, would be a real PDA in production
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [publicKey]);

  const handleMarkAsRead = async (notification) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const response = await markNotificationRead(notification.notificationPDA);
      
      setResult(response);
      if (response.success) {
        // Update the notification as read
        setNotifications(notifications.map(n => 
          n.id === notification.id 
            ? { ...n, isRead: true } 
            : n
        ));
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Notifications</h2>
      {loadingNotifications ? (
        <p className="loading">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <p className="notification-message">{notification.message}</p>
              <p className="notification-time">{notification.timestamp}</p>
              {!notification.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(notification)}
                  disabled={loading}
                  className="mark-read-btn"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <p>Notification marked as read successfully! Tx: {result.signature.slice(0, 8)}...</p>
          ) : (
            <p>Error: {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}; 