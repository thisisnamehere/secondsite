import { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { categoriesAPI } from '../lib/api';
import { toast } from 'react-toastify';

function SearchAndFilters({ filters, onSearchChange, onFilterChange }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Ошибка при загрузке категорий');
    }
  };

  return (
    <motion.div
      className="card mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Поиск */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-gray pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Поиск по наименованию..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200"
            defaultValue={filters.q}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Фильтр по категории */}
        <div>
          <select
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Фильтр по состоянию */}
        <div>
          <select
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 appearance-none bg-white cursor-pointer"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            <option value="">Все состояния</option>
            <option value="available">В наличии</option>
            <option value="in_transit">В пути</option>
            <option value="out_of_stock">Отсутствует</option>
          </select>
        </div>
      </div>

      {/* Активные фильтры */}
      {(filters.q || filters.category || filters.status) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-apple-gray">Активные фильтры:</span>
          {filters.q && (
            <span className="px-3 py-1 bg-apple-blue bg-opacity-10 text-apple-blue rounded-lg text-sm flex items-center gap-2">
              Поиск: {filters.q}
              <button onClick={() => onFilterChange('q', '')} className="hover:text-blue-700">
                <FaTimes size={12} />
              </button>
            </span>
          )}
          {filters.category && (
            <span className="px-3 py-1 bg-apple-blue bg-opacity-10 text-apple-blue rounded-lg text-sm flex items-center gap-2">
              Категория: {filters.category}
              <button onClick={() => onFilterChange('category', '')} className="hover:text-blue-700">
                <FaTimes size={12} />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="px-3 py-1 bg-apple-blue bg-opacity-10 text-apple-blue rounded-lg text-sm flex items-center gap-2">
              Состояние: {filters.status}
              <button onClick={() => onFilterChange('status', '')} className="hover:text-blue-700">
                <FaTimes size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default SearchAndFilters;
