export const COLORS = {
  primary: '#4F46E5',
  secondary: '#F97316',
  background: '#F5F7FB',
  white: '#FFFFFF',
  black: '#111827',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  lightGray: '#F3F4F6',
  gray: '#9CA3AF',
  darkGray: '#374151',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const CATEGORIES = [
  { id: 'Men', name: 'Men', Icon: 'man' },
  { id: 'Women', name: 'Women', Icon: 'woman' },
  { id: 'Kids', name: 'Kids', Icon: 'happy' },
  { id: 'Shoes', name: 'Shoes', Icon: 'footsteps' },
  { id: 'Bag', name: 'Bag', Icon: 'bag' },
];

export const getStatusColor = (status: string) => {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    case 'placed':
      return 'bg-blue-100 text-blue-700';
    case 'processing':
      return 'bg-yellow-100 text-yellow-700';
    case 'shipped':
      return 'bg-purple-100 text-purple-700';
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
