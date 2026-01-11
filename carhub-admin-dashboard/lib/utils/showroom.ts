export const formatOpeningHours = (openingHours: any): string => {
  if (!openingHours || typeof openingHours !== 'object') {
    return 'Not specified';
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleString('en', { weekday: 'long' }).toLowerCase();
  
  if (openingHours[today]) {
    return `Today: ${openingHours[today]}`;
  }

  // Return first available day's hours
  for (const day of days) {
    if (openingHours[day]) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      return `${dayName}: ${openingHours[day]}`;
    }
  }

  return 'Not specified';
};

export const formatServices = (services: any[]): string => {
  if (!Array.isArray(services) || services.length === 0) {
    return 'No services listed';
  }
  
  return services.slice(0, 3).join(', ') + (services.length > 3 ? ` +${services.length - 3} more` : '');
};

export const getSocialLink = (socialLinks: any, platform: string): string | null => {
  if (!socialLinks || typeof socialLinks !== 'object') {
    return null;
  }
  
  return socialLinks[platform] || null;
};