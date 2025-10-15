import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import EditCityModal from './EditCityModal';

function CityCard({ city, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Удалить город?',
      text: `Вы уверены, что хотите удалить город "${city.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007aff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
      onDelete(city.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  return (
    <>
      <motion.div
        className="card cursor-pointer hover:scale-105 transition-transform duration-300"
        onClick={() => navigate(`/city/${city.id}`)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-apple-blue bg-opacity-10 p-2 sm:p-3 rounded-xl flex-shrink-0">
              <FaMapMarkerAlt className="text-apple-blue text-xl sm:text-2xl" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-apple-dark truncate">{city.name}</h3>
              <p className="text-xs sm:text-sm text-apple-gray">
                {city.instruments_count || 0} инструментов
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3 sm:mt-4">
          <button
            onClick={handleEdit}
            className="flex-1 btn-secondary text-xs sm:text-sm min-h-[44px] flex items-center justify-center gap-2"
          >
            <FaEdit /> <span className="hidden xs:inline">Изменить</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-3 sm:px-4 min-h-[44px] rounded-xl border border-red-300 text-red-600 
                     hover:bg-red-50 transition-colors duration-200 flex items-center justify-center"
            title="Удалить"
          >
            <FaTrash />
          </button>
        </div>
      </motion.div>

      {showEditModal && (
        <EditCityModal
          city={city}
          onClose={() => setShowEditModal(false)}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

export default CityCard;
