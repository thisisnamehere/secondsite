import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEdit, FaArchive, FaBoxOpen, FaTrash } from 'react-icons/fa';
import { formatDate, getStatusLabel, getStatusClass } from '../lib/utils';

function InstrumentDetailModal({ instrument, onClose, onEdit, onArchive, onDelete, showArchived }) {
  if (!instrument) return null;

  const handleEdit = () => {
    onEdit(instrument);
    onClose();
  };

  const handleArchive = () => {
    onArchive(instrument);  // ✅ Передаем весь объект
  };

  const handleDelete = () => {
    onDelete(instrument);  // ✅ Передаем весь объект
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl sm:rounded-3xl shadow-apple-lg w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Заголовок */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-4 sm:p-6 flex justify-between items-start gap-3 rounded-t-3xl sm:rounded-t-3xl">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-apple-dark mb-1">
                {instrument.name}
              </h2>
              <p className="text-sm text-apple-gray">ID: #{instrument.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            >
              <FaTimes className="text-apple-gray" size={20} />
            </button>
          </div>

          {/* Контент */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Статус */}
            <div>
              <p className="text-xs text-apple-gray mb-2">Состояние</p>
              <span className={`px-3 py-2 rounded-lg text-sm font-medium inline-block ${getStatusClass(instrument.status)}`}>
                {getStatusLabel(instrument.status)}
              </span>
            </div>

            {/* Основная информация */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-apple-gray mb-1">Категория</p>
                <p className="text-sm font-medium text-apple-dark">
                  {instrument.category || '—'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-apple-gray mb-1">Количество</p>
                <p className="text-lg font-bold text-apple-blue">
                  {instrument.quantity}
                </p>
              </div>
            </div>

            {/* Дата поступления */}
            {instrument.received_at && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-apple-gray mb-1">Дата поступления</p>
                <p className="text-sm font-medium text-apple-dark">
                  {formatDate(instrument.received_at)}
                </p>
              </div>
            )}

            {/* Примечание */}
            {instrument.note && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-apple-gray mb-2">Примечание</p>
                <p className="text-sm text-apple-dark whitespace-pre-wrap">
                  {instrument.note}
                </p>
              </div>
            )}

            {/* Дополнительная информация */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-600 mb-2 font-medium">Дополнительно</p>
              <div className="space-y-1 text-xs text-apple-dark">
                <p>Город: {instrument.city_name || '—'}</p>
                {instrument.created_at && (
                  <p>Создано: {formatDate(instrument.created_at)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-6 flex gap-2 rounded-b-3xl sm:rounded-b-3xl">
            {!showArchived && (
              <button
                onClick={handleEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-apple-blue text-white hover:bg-blue-600 transition-colors font-medium"
              >
                <FaEdit size={16} />
                Редактировать
              </button>
            )}
            <button
              onClick={handleArchive}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors font-medium ${
                showArchived
                  ? 'border-green-300 text-green-600 hover:bg-green-50'
                  : 'border-orange-300 text-orange-600 hover:bg-orange-50'
              }`}
            >
              {showArchived ? <FaBoxOpen size={16} /> : <FaArchive size={16} />}
              {showArchived ? 'Восстановить' : 'Архивировать'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-3 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-colors min-w-[44px] flex items-center justify-center"
              title="Удалить"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default InstrumentDetailModal;
