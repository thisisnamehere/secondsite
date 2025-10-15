import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { citiesAPI } from '../lib/api';
import CityCard from '../components/CityCard';
import AddCityModal from '../components/AddCityModal';
import ManageCategoriesModal from '../components/ManageCategoriesModal';
import Header from '../components/Header';
import { FaPlus, FaTags } from 'react-icons/fa';

function HomePage({ onLogout }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoading(true);
      const response = await citiesAPI.getAll();
      setCities(response.data.data || []);
    } catch (error) {
      toast.error('Ошибка при загрузке городов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (cityData) => {
    try {
      await citiesAPI.create(cityData);
      toast.success('Город успешно добавлен');
      setShowAddModal(false);
      loadCities();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при добавлении города';
      toast.error(message);
    }
  };

  const handleDeleteCity = async (cityId) => {
    try {
      await citiesAPI.delete(cityId);
      toast.success('Город успешно удалён');
      loadCities();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при удалении города';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Учёт медицинского инструмента" onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-apple-dark">Города</h1>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="btn-secondary flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center min-h-[44px]"
            >
              <FaTags /> <span className="hidden xs:inline">Категории</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary flex items-center gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center min-h-[44px]"
            >
              <FaPlus /> <span className="hidden xs:inline">Добавить город</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-apple-gray">Нет городов</p>
            <p className="text-sm text-apple-gray mt-2">Добавьте первый город для начала работы</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {cities.map((city, index) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CityCard
                  city={city}
                  onDelete={handleDeleteCity}
                  onUpdate={loadCities}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {showAddModal && (
        <AddCityModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddCity}
        />
      )}

      {showCategoriesModal && (
        <ManageCategoriesModal
          onClose={() => setShowCategoriesModal(false)}
        />
      )}
    </div>
  );
}

export default HomePage;
