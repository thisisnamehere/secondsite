import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { citiesAPI, instrumentsAPI, exportAPI } from '../lib/api';
import { FaArrowLeft, FaPlus, FaFileExcel, FaArchive, FaBoxOpen } from 'react-icons/fa';
import InstrumentsTable from '../components/InstrumentsTable';
import AddInstrumentModal from '../components/AddInstrumentModal';
import EditInstrumentModal from '../components/EditInstrumentModal';
import SearchAndFilters from '../components/SearchAndFilters';
import { debounce } from '../lib/utils';

function CityPage({ onLogout }) {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [city, setCity] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState(null);
  
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    category: '',
    status: '',
    archived: '0',
    sortBy: 'id',
    order: 'desc',
    page: 1,
    pageSize: 20
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (cityId) {
      loadCity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  useEffect(() => {
    if (cityId) {
      loadInstruments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId, filters.q, filters.category, filters.status, filters.archived, filters.sortBy, filters.order, filters.page]);

  const loadCity = async () => {
    try {
      const response = await citiesAPI.getById(cityId);
      setCity(response.data.data);
    } catch (error) {
      toast.error('Ошибка при загрузке города');
      navigate('/');
    }
  };

  const loadInstruments = async () => {
    try {
      setLoading(true);
      const response = await instrumentsAPI.getAll({ cityId, ...filters });
      setInstruments(response.data.data.items || []);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      toast.error('Ошибка при загрузке инструментов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstrument = async (data) => {
    try {
      await instrumentsAPI.create({ ...data, city_id: parseInt(cityId, 10) });
      toast.success('Инструмент успешно добавлен');
      setShowAddModal(false);
      loadInstruments();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при добавлении инструмента';
      toast.error(message);
      console.error('Add instrument error:', error.response || error);
    }
  };

  const handleEditInstrument = async (id, data) => {
    try {
      await instrumentsAPI.update(id, { ...data, city_id: parseInt(cityId, 10) });
      toast.success('Инструмент успешно обновлён');
      setEditingInstrument(null);
      loadInstruments();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при обновлении инструмента';
      toast.error(message);
      console.error('Edit instrument error:', error.response || error);
    }
  };

  const handleArchiveInstrument = async (id, archived) => {
    try {
      await instrumentsAPI.archive(id, archived);
      toast.success(archived ? 'Инструмент архивирован' : 'Инструмент восстановлен');
      loadInstruments();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при архивировании';
      toast.error(message);
    }
  };

  const handleDeleteInstrument = async (id) => {
    try {
      await instrumentsAPI.delete(id);
      toast.success('Инструмент успешно удалён');
      loadInstruments();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при удалении инструмента';
      toast.error(message);
    }
  };

  const handleExport = () => {
    const url = exportAPI.downloadExcel({ cityId, ...filters });
    window.open(url, '_blank');
    toast.success('Экспорт начат');
  };

  const toggleArchived = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    setFilters(prev => ({ ...prev, archived: newShowArchived ? '1' : '0', page: 1 }));
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, q: value, page: 1 }));
    }, 500),
    []
  );

  return (
    <div className="min-h-screen pb-8">
      <motion.div
        className="bg-white shadow-apple mb-4 sm:mb-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-apple-blue hover:text-blue-600 mb-2 sm:mb-3 text-sm sm:text-base min-h-[44px]"
          >
            <FaArrowLeft /> Назад к городам
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-apple-dark">
            {city?.name || 'Загрузка...'}
          </h1>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-4 sm:pb-6">
        <div className="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-initial"
            >
              <FaPlus /> <span className="hidden xs:inline">Добавить инструмент</span>
            </button>
            <button 
              onClick={toggleArchived} 
              className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-colors duration-200 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-initial ${
                showArchived 
                  ? 'bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {showArchived ? <FaBoxOpen /> : <FaArchive />}
              <span className="hidden xs:inline">{showArchived ? 'Показать активные' : 'Показать архив'}</span>
            </button>
            <button 
              onClick={handleExport} 
              className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] flex-1 sm:flex-initial"
            >
              <FaFileExcel /> <span className="hidden xs:inline">Экспорт в Excel</span>
            </button>
          </div>
        </div>

        <SearchAndFilters
          filters={filters}
          onSearchChange={debouncedSearch}
          onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }))}
        />

        <InstrumentsTable
          instruments={instruments}
          loading={loading}
          onEdit={setEditingInstrument}
          onArchive={handleArchiveInstrument}
          onDelete={handleDeleteInstrument}
          showArchived={showArchived}
          filters={filters}
          onSortChange={(sortBy) => setFilters(prev => ({ 
            ...prev, 
            sortBy,
            order: prev.sortBy === sortBy && prev.order === 'desc' ? 'asc' : 'desc'
          }))}
          page={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
        />
      </div>

      {showAddModal && (
        <AddInstrumentModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddInstrument}
        />
      )}

      {editingInstrument && (
        <EditInstrumentModal
          instrument={editingInstrument}
          onClose={() => setEditingInstrument(null)}
          onSubmit={(data) => handleEditInstrument(editingInstrument.id, data)}
        />
      )}
    </div>
  );
}

export default CityPage;
