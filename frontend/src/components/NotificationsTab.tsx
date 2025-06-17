import React from 'react';
import { Bell, Heart, UserPlus, MessageCircle, Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function NotificationsTab() {
  const { state, dispatch } = useApp();

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Star className="w-5 h-5 text-yellow-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const unreadCount = state.notifications.filter(n => !n.read).length;
  const readCount = state.notifications.filter(n => n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
        <p className="text-gray-600">Stay updated with the latest activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <div className="text-blue-100">Unread Notifications</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8" />
            <div>
              <div className="text-2xl font-bold">{state.notifications.length}</div>
              <div className="text-green-100">Total Notifications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {state.notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              When celebrities you follow post new content or interact with you, you'll see it here!
            </p>
          </div>
        ) : (
          <>
            {unreadCount > 0 && (
              <div className="p-6 border-b border-gray-100 bg-blue-50">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  New Notifications ({unreadCount})
                </h2>
              </div>
            )}
            
            <div className="divide-y divide-gray-100">
              {state.notifications.map((notification) => {
                const relatedUser = state.users.find(u => u.id === notification.relatedUserId);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {relatedUser ? (
                          <div className="relative">
                            <img
                              src={relatedUser.avatar}
                              alt={relatedUser.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.message}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatTimeAgo(notification.timestamp)}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {readCount > 0 && unreadCount === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p>All caught up! 🎉</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}