import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const eventService = {
    getAllEvents: () => api.get('/events'),
    getEventById: (id) => api.get(`/events/${id}`),
    createEvent: (data) => api.post('/events', data),
    updateEvent: (id, data) => api.put(`/events/${id}`, data),
    deleteEvent: (id) => api.delete(`/events/${id}`),
    register: (id) => api.post(`/events/${id}/register`),
    unregister: (id) => api.post(`/events/${id}/unregister`),
    getMyRegistrations: () => api.get('/events/my-registrations'),
    triggerReminders: (id) => api.post(`/events/${id}/trigger-reminders`),
    getEventRegistrants: (id) => api.get(`/events/${id}/registrations`),
    toggleAttendance: (id, userId, attended) => api.put(`/events/${id}/registrations/${userId}/attendance`, { attended }),
    updateEventOverrides: (id, overrides) => api.put(`/events/${id}/manual-override`, overrides),
};

export const notificationService = {
    getNotifications: () => api.get('/notifications'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

export const analyticsService = {
    getGlobalEventAnalytics: () => api.get('/analytics/events/global'),
    getEventAnalytics: (id) => api.get(`/analytics/events/${id}`),
    getRiskDetection: () => api.get('/analytics/risk-detection'),
    getAuditLogs: () => api.get('/analytics/audit-logs'),
};

export default api;
