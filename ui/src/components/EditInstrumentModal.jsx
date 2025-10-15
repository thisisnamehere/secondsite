import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { categoriesAPI } from '../lib/api';
import { toast } from 'react-toastify';

function EditInstrumentModal({ instrument, onClose, onSubmit }) {
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: instrument.name,
      category: instrument.category || '',
      quantity: instrument.quantity,
      received_at: instrument.received_at || '',
      status: instrument.status,
      note: instrument.note || ''
    }
  });

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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-apple p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-apple-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-apple-dark">Редактировать инструмент</h2>
            <button
              onClick={onClose}
              className="text-apple-gray hover:text-apple-dark transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Наименование */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Наименование <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  {...register('name', {
                    required: 'Наименование обязательно',
                    maxLength: { value: 200, message: 'Максимум 200 символов' }
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Категория */}
              <div>
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Категория
                </label>
                <select className="input-field" {...register('category')}>
                  <option value="">Выберите категорию</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Количество */}
              <div>
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Количество <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`input-field ${errors.quantity ? 'border-red-500' : ''}`}
                  {...register('quantity', {
                    required: 'Количество обязательно',
                    min: { value: 0, message: 'Минимум 0' },
                    valueAsNumber: true
                  })}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>

              {/* Дата поступления */}
              <div>
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Дата поступления
                </label>
                <input
                  type="date"
                  className="input-field"
                  {...register('received_at')}
                />
              </div>

              {/* Состояние */}
              <div>
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Состояние
                </label>
                <select className="input-field" {...register('status')}>
                  <option value="available">В наличии</option>
                  <option value="in_transit">В пути</option>
                  <option value="out_of_stock">Отсутствует</option>
                </select>
              </div>

              {/* Примечание */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-apple-dark mb-2">
                  Примечание
                </label>
                <textarea
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Дополнительная информация..."
                  {...register('note')}
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary min-h-[44px] text-sm sm:text-base"
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary min-h-[44px] text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditInstrumentModal;
