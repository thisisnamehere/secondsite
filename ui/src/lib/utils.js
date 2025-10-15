// Debounce функция для оптимизации поиска
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Форматирование даты
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

// Маппинг статусов
export const STATUS_MAP = {
  available: { label: 'В наличии', color: 'bg-green-100 text-green-800' },
  in_transit: { label: 'В пути', color: 'bg-yellow-100 text-yellow-800' },
  out_of_stock: { label: 'Отсутствует', color: 'bg-red-100 text-red-800' },
};

// Получение label статуса
export function getStatusLabel(status) {
  return STATUS_MAP[status]?.label || status;
}

// Получение класса статуса
export function getStatusClass(status) {
  return STATUS_MAP[status]?.color || 'bg-gray-100 text-gray-800';
}
