import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaArchive, FaBoxOpen, FaInfoCircle } from 'react-icons/fa';
import { getStatusLabel, getStatusClass } from '../lib/utils';

function InstrumentCard({ instrument, onEdit, onArchive, onDelete, onViewDetails, showArchived }) {
  const handleArchive = (e) => {
    e.stopPropagation();
    onArchive(instrument);  // ✅ Передаем весь объект
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(instrument);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(instrument);  // ✅ Передаем весь объект
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-apple p-4 cursor-pointer hover:shadow-apple-lg transition-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onViewDetails(instrument)}
    >
      {/* Заголовок и статус */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-base font-semibold text-apple-dark truncate mb-1">
            {instrument.name}
          </h3>
          <p className="text-xs text-apple-gray">ID: #{instrument.id}</p>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${getStatusClass(instrument.status)}`}>
          {getStatusLabel(instrument.status)}
        </span>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-apple-gray mb-1">Категория</p>
          <p className="text-sm font-medium text-apple-dark truncate">
            {instrument.category || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-apple-gray mb-1">Количество</p>
          <p className="text-sm font-bold text-apple-blue">
            {instrument.quantity}
          </p>
        </div>
      </div>

      {/* Действия */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(instrument)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-apple-blue hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          <FaInfoCircle size={14} />
          Подробнее
        </button>
        
        {!showArchived && (
          <button
            onClick={handleEdit}
            className="p-2 text-apple-blue hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Редактировать"
          >
            <FaEdit size={14} />
          </button>
        )}
        
        <button
          onClick={handleArchive}
          className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
            showArchived 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-orange-600 hover:bg-orange-50'
          }`}
          title={showArchived ? 'Восстановить' : 'Архивировать'}
        >
          {showArchived ? <FaBoxOpen size={14} /> : <FaArchive size={14} />}
        </button>
        
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Удалить"
        >
          <FaTrash size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default InstrumentCard;
