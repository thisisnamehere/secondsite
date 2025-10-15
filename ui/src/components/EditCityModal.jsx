import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { citiesAPI } from '../lib/api';

function EditCityModal({ city, onClose, onUpdate }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: city.name }
  });

  const onSubmit = async (data) => {
    try {
      await citiesAPI.update(city.id, data);
      toast.success('Город успешно обновлён');
      onUpdate();
      onClose();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при обновлении города';
      toast.error(message);
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
          className="bg-white rounded-apple p-4 sm:p-6 md:p-8 max-w-md w-full shadow-apple-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-apple-dark">Редактировать город</h2>
            <button
              onClick={onClose}
              className="text-apple-gray hover:text-apple-dark transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-apple-dark mb-2">
                Название города
              </label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                {...register('name', {
                  required: 'Название обязательно',
                  minLength: { value: 2, message: 'Минимум 2 символа' },
                  maxLength: { value: 100, message: 'Максимум 100 символов' }
                })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
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

export default EditCityModal;
