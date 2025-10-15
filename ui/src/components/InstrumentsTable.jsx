import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight, FaArchive, FaBoxOpen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { formatDate, getStatusLabel, getStatusClass } from '../lib/utils';
import ViewToggle from './ViewToggle';
import InstrumentCard from './InstrumentCard';
import InstrumentDetailModal from './InstrumentDetailModal';

function InstrumentsTable({ 
  instruments, 
  loading, 
  onEdit,
  onArchive, 
  onDelete,
  showArchived, 
  filters,
  onSortChange,
  page,
  totalPages,
  onPageChange
}) {
  // Состояние для режима отображения (только для мобильных)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('instrumentsViewMode') || 'table';
  });
  
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Сохранение выбора режима отображения
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('instrumentsViewMode', mode);
  };

  // Закрытие модального окна деталей
  const handleCloseDetail = () => {
    setSelectedInstrument(null);
  };
  const handleArchive = async (instrument) => {
    const willArchive = !showArchived;
    const result = await Swal.fire({
      title: willArchive ? 'Архивировать инструмент?' : 'Восстановить инструмент?',
      text: willArchive 
        ? `Инструмент "${instrument.name}" будет перемещён в архив`
        : `Инструмент "${instrument.name}" будет восстановлён`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007aff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: willArchive ? 'Да, архивировать' : 'Да, восстановить',
      cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
      onArchive(instrument.id, willArchive);
    }
  };

  const handleDelete = async (instrument) => {
    const result = await Swal.fire({
      title: 'Удалить инструмент?',
      text: `Вы уверены, что хотите удалить "${instrument.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007aff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
      onDelete(instrument.id);
    }
  };

  const getSortIcon = (column) => {
    if (filters.sortBy !== column) return <FaSort className="text-apple-gray" />;
    return filters.order === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  if (instruments.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-xl text-apple-gray">Нет инструментов</p>
        <p className="text-sm text-apple-gray mt-2">Добавьте первый инструмент для начала работы</p>
      </div>
    );
  }

  // Рендеринг карточного вида для мобильных
  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      <AnimatePresence mode="popLayout">
        {instruments.map((instrument, index) => (
          <InstrumentCard
            key={instrument.id}
            instrument={instrument}
            onEdit={onEdit}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onViewDetails={setSelectedInstrument}
            showArchived={showArchived}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  // Рендеринг табличного вида
  const renderTableView = () => (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle px-4 sm:px-0">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm whitespace-nowrap">ID</th>
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm">
                <button
                  onClick={() => onSortChange('name')}
                  className="flex items-center gap-1 sm:gap-2 hover:text-apple-dark text-xs sm:text-sm"
                >
                  Наименование {getSortIcon('name')}
                </button>
              </th>
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm whitespace-nowrap">Категория</th>
              <th className="table-header px-2 sm:px-4 py-3 text-center text-xs sm:text-sm">
                <button
                  onClick={() => onSortChange('quantity')}
                  className="flex items-center gap-1 sm:gap-2 hover:text-apple-dark mx-auto text-xs sm:text-sm"
                >
                  Кол-во {getSortIcon('quantity')}
                </button>
              </th>
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                <button
                  onClick={() => onSortChange('received_at')}
                  className="flex items-center gap-1 sm:gap-2 hover:text-apple-dark text-xs sm:text-sm"
                >
                  Дата {getSortIcon('received_at')}
                </button>
              </th>
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm whitespace-nowrap">Статус</th>
              <th className="table-header px-2 sm:px-4 py-3 text-left text-xs sm:text-sm hidden lg:table-cell">Примечание</th>
              <th className="table-header px-2 sm:px-4 py-3 text-center text-xs sm:text-sm whitespace-nowrap">Действия</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((instrument) => (
              <motion.tr
                key={instrument.id}
                className="border-b hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-apple-gray text-xs sm:text-sm whitespace-nowrap">#{instrument.id}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-apple-dark text-xs sm:text-sm min-w-[150px] max-w-[200px] truncate">{instrument.name}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-apple-gray text-xs sm:text-sm whitespace-nowrap">{instrument.category || '-'}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-apple-dark text-xs sm:text-sm">{instrument.quantity}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-apple-gray text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">{formatDate(instrument.received_at)}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap inline-block ${getStatusClass(instrument.status)}`}>
                    {getStatusLabel(instrument.status)}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 text-apple-gray text-xs sm:text-sm max-w-[150px] truncate hidden lg:table-cell">{instrument.note || '-'}</td>
                <td className="px-2 sm:px-4 py-2 sm:py-3">
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    {!showArchived && (
                      <button
                        onClick={() => onEdit(instrument)}
                        className="p-2 text-apple-blue hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Редактировать"
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(instrument)}
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
                      onClick={() => handleDelete(instrument)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Удалить"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        {/* Переключатель режима отображения - только на мобильных */}
        {isMobile && (
          <div className="mb-4 flex justify-center pb-4 border-b border-gray-100">
            <ViewToggle viewMode={viewMode} onToggle={handleViewModeChange} />
          </div>
        )}

        {/* Отображение контента в зависимости от режима */}
        {isMobile && viewMode === 'cards' ? renderCardView() : renderTableView()}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t px-4">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Предыдущая страница"
            >
              <FaChevronLeft />
            </button>
            <span className="text-apple-gray text-xs sm:text-sm whitespace-nowrap">
              <span className="hidden xs:inline">Страница </span>{page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Следующая страница"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </motion.div>

      {/* Модальное окно с детальной информацией */}
      {selectedInstrument && (
        <InstrumentDetailModal
          instrument={selectedInstrument}
          onClose={handleCloseDetail}
          onEdit={onEdit}
          onArchive={handleArchive}
          onDelete={handleDelete}
          showArchived={showArchived}
        />
      )}
    </>
  );
}

export default InstrumentsTable;
