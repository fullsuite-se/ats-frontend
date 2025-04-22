
export const formatStatusForDisplay = (statusKey) => {
    return statusKey.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};