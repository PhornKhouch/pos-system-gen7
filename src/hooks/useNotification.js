import { App } from 'antd';

/**
 * Reusable Ant Design Notification hook
 * Provides standardized methods for success, error, info, and warning notifications
 * 
 * Usage:
 * const { notifySuccess, notifyError, notifyWarning, notifyInfo } = useNotification();
 * notifySuccess('Category Created', 'New category added successfully!');
 */
export function useNotification() {
  const { notification } = App.useApp();

  const notifySuccess = (message, description = '', options = {}) => {
    notification.success({
      message,
      description,
      placement: 'topRight',
      duration: 3,
      ...options,
    });
  };

  const notifyError = (message, description = '', options = {}) => {
    notification.error({
      message,
      description,
      placement: 'topRight',
      duration: 4,
      ...options,
    });
  };

  const notifyWarning = (message, description = '', options = {}) => {
    notification.warning({
      message,
      description,
      placement: 'topRight',
      duration: 3.5,
      ...options,
    });
  };

  const notifyInfo = (message, description = '', options = {}) => {
    notification.info({
      message,
      description,
      placement: 'topRight',
      duration: 3,
      ...options,
    });
  };

  return {
    notification,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
  };
}

export default useNotification;
