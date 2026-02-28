import toast from 'react-hot-toast'

/**
 * Show success notification
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  })
}

/**
 * Show error notification
 * @param {string} message - Error message
 */
export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  })
}

/**
 * Show info notification
 * @param {string} message - Info message
 */
export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
  })
}

/**
 * Show warning notification
 * @param {string} message - Warning message
 */
export const showWarning = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
  })
}

/**
 * Show loading notification
 * @param {string} message - Loading message
 * @returns {string} - Toast ID for later dismissal
 */
export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-right',
  })
}

/**
 * Dismiss a specific toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss()
}

/**
 * Update a toast message
 * @param {string} toastId - Toast ID to update
 * @param {string} message - New message
 * @param {string} type - Toast type (success, error, info, warning)
 */
export const updateToast = (toastId, message, type = 'success') => {
  toast.dismiss(toastId)
  if (type === 'success') {
    showSuccess(message)
  } else if (type === 'error') {
    showError(message)
  } else if (type === 'warning') {
    showWarning(message)
  } else {
    showInfo(message)
  }
}

/**
 * Show promise-based toast (for async operations)
 * @param {Promise} promise - Promise to track
 * @param {object} messages - Messages object {loading, success, error}
 */
export const showPromise = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra',
    },
    {
      position: 'top-right',
    }
  )
}
