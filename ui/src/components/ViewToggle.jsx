import { motion } from 'framer-motion';
import { FaThLarge, FaTable } from 'react-icons/fa';

function ViewToggle({ viewMode, onToggle }) {
  return (
    <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
      <button
        onClick={() => onToggle('table')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          viewMode === 'table'
            ? 'text-apple-dark'
            : 'text-apple-gray hover:text-apple-dark'
        }`}
      >
        {viewMode === 'table' && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-white rounded-lg shadow-apple"
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          />
        )}
        <FaTable className="relative z-10" size={16} />
        <span className="relative z-10 hidden xs:inline">Таблица</span>
      </button>
      
      <button
        onClick={() => onToggle('cards')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          viewMode === 'cards'
            ? 'text-apple-dark'
            : 'text-apple-gray hover:text-apple-dark'
        }`}
      >
        {viewMode === 'cards' && (
          <motion.div
            layoutId="activeView"
            className="absolute inset-0 bg-white rounded-lg shadow-apple"
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          />
        )}
        <FaThLarge className="relative z-10" size={16} />
        <span className="relative z-10 hidden xs:inline">Карточки</span>
      </button>
    </div>
  );
}

export default ViewToggle;
