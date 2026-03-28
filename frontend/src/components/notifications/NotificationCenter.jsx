import { useState, useEffect } from 'react';
import { notificationService } from '../../utils/api';
import './Notifications.css';

const NotificationBadge = ({ onClick }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data } = await notificationService.getUnreadCount();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Error fetching unread count', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="notification-badge-container" onClick={onClick}>
            <i className="fas fa-bell notification-icon"></i>
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
    );
};

const NotificationPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notification-panel shadow-lg">
            <div className="panel-header">
                <h3>Notifications</h3>
                <div className="header-actions">
                    <button onClick={markAllRead} className="btn-link">Mark all as read</button>
                    <button onClick={onClose} className="btn-close"><i className="fas fa-times"></i></button>
                </div>
            </div>
            <div className="panel-body">
                {loading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="empty-state">No notifications</div>
                ) : (
                    <div className="notification-list">
                        {notifications.map(notification => (
                            <div 
                                key={notification._id} 
                                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className="notification-type-badge" data-type={notification.type}>
                                    {notification.type}
                                </div>
                                <div className="notification-content">
                                    <p className="message">{notification.message}</p>
                                    <small className="time">{new Date(notification.createdAt).toLocaleString()}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export { NotificationBadge, NotificationPanel };
