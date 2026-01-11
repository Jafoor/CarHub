// Format currency (BDT)
export const formatPrice = (price: number): string => {
  if (!price && price !== 0) return 'N/A';
  
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format mileage with unit
export const formatMileage = (mileage: number | null | undefined, unit: string = 'km'): string => {
  if (!mileage && mileage !== 0) return 'N/A';
  
  return `${new Intl.NumberFormat('en-BD').format(mileage)} ${unit}`;
};

// Format engine capacity with unit
export const formatEngineCapacity = (capacity: number | null | undefined, unit: string = 'cc'): string => {
  if (!capacity && capacity !== 0) return 'N/A';
  
  return `${capacity} ${unit}`;
};

// Capitalize first letter and replace underscores with spaces
export const capitalizeFirst = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text
export const truncateText = (text: string, length: number): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// Get condition label
export const getConditionLabel = (condition: string): string => {
  const labels: { [key: string]: string } = {
    brand_new: 'Brand New',
    used: 'Used',
    refurbished: 'Refurbished',
    reconditioned: 'Reconditioned',
  };
  return labels[condition] || condition;
};

// Get status label
export const getStatusLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    draft: 'Draft',
    published: 'Published',
    sold: 'Sold',
    reserved: 'Reserved',
    expired: 'Expired',
  };
  return labels[status] || status;
};

// Get transmission label
export const getTransmissionLabel = (transmission: string): string => {
  const labels: { [key: string]: string } = {
    manual: 'Manual',
    automatic: 'Automatic',
    semi_automatic: 'Semi-Automatic',
    cvt: 'CVT',
  };
  return labels[transmission] || transmission;
};

// Get fuel type label
export const getFuelTypeLabel = (fuelType: string): string => {
  const labels: { [key: string]: string } = {
    petrol: 'Petrol',
    diesel: 'Diesel',
    electric: 'Electric',
    hybrid: 'Hybrid',
    cng: 'CNG',
    lpg: 'LPG',
  };
  return labels[fuelType] || fuelType;
};

// Get drive type label
export const getDriveTypeLabel = (driveType: string): string => {
  const labels: { [key: string]: string } = {
    fwd: 'Front Wheel Drive',
    rwd: 'Rear Wheel Drive',
    awd: 'All Wheel Drive',
    '4wd': 'Four Wheel Drive',
  };
  return labels[driveType] || driveType;
};

// Validate email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Bangladeshi format)
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return phoneRegex.test(phone);
};

// Generate random ID
export const generateId = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
};

// Get initial letters for avatar
export const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Calculate discount percentage
export const calculateDiscount = (original: number, current: number): number => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};