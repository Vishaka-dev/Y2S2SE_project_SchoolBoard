import apiClient from '../api/apiClient';

const notificationService = {
  async getNotifications({ page = 0, size = 15 } = {}) {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Network error while loading notifications');
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Network error while marking notification as read');
    }
  },

  async markAllAsRead({ pageSize = 50, maxPages = 200 } = {}) {
    const unreadIds = [];
    let page = 0;
    let hasNext = true;

    while (hasNext && page < maxPages) {
      const data = await this.getNotifications({ page, size: pageSize });
      const currentPage = Array.isArray(data?.notifications) ? data.notifications : [];

      currentPage.forEach((notification) => {
        if (!notification.isRead) {
          unreadIds.push(notification.id);
        }
      });

      hasNext = Boolean(data?.hasNext);
      page += 1;
    }

    const uniqueUnreadIds = [...new Set(unreadIds)];

    if (uniqueUnreadIds.length === 0) {
      return { markedCount: 0, failedCount: 0 };
    }

    const results = await Promise.allSettled(uniqueUnreadIds.map((id) => this.markAsRead(id)));
    const markedCount = results.filter((result) => result.status === 'fulfilled').length;
    const failedCount = results.length - markedCount;

    return { markedCount, failedCount };
  },
};

export default notificationService;
