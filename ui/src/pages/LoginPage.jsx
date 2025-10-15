import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaHospital, FaUser, FaLock } from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function LoginPage({ onLogin }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Создаём credentials в Base64
      const credentials = btoa(`${data.login}:${data.password}`);
      
      // Проверяем авторизацию через health endpoint с Basic Auth
      const response = await axios.get(`${API_BASE_URL}/api/health`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.status === 200) {
        // Сохраняем credentials в localStorage
        localStorage.setItem('admin_credentials', credentials);
        localStorage.setItem('admin_login', data.login);
        toast.success('Успешный вход!');
        onLogin();
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Неверный логин или пароль');
      } else {
        toast.error('Ошибка подключения к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-apple shadow-apple-lg p-6 sm:p-8 w-full max-w-md"
      >
        {/* Логотип */}
        <div className="flex justify-center mb-8">
          <div className="bg-apple-blue bg-opacity-10 p-6 rounded-full">
            <FaHospital className="text-apple-blue text-5xl" />
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-apple-dark text-center mb-2">
          Учёт инструмента
        </h1>
        <p className="text-apple-gray text-center mb-8">
          Войдите для продолжения
        </p>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Логин */}
          <div>
            <label className="block text-sm font-medium text-apple-dark mb-2">
              Логин
            </label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-gray pointer-events-none z-10" />
              <input
                type="text"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 ${errors.login ? 'border-red-500' : ''}`}
                placeholder="Введите логин"
                {...register('login', {
                  required: 'Логин обязателен'
                })}
              />
            </div>
            {errors.login && (
              <p className="text-red-500 text-sm mt-1">{errors.login.message}</p>
            )}
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-sm font-medium text-apple-dark mb-2">
              Пароль
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-apple-gray pointer-events-none z-10" />
              <input
                type="password"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:border-apple-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Введите пароль"
                {...register('password', {
                  required: 'Пароль обязателен'
                })}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Кнопка входа */}
          <button
            type="submit"
            className="w-full btn-primary"
            disabled={loading || isSubmitting}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
