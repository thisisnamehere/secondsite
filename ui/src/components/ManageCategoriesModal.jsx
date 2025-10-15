import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaEdit, FaTrash, FaSave, FaBan } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { categoriesAPI } from '../lib/api';

function ManageCategoriesModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      toast.error('Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Введите название категории');
      return;
    }

    try {
      await categoriesAPI.create({ name: newCategoryName.trim() });
      toast.success('Категория добавлена');
      setNewCategoryName('');
      setAdding(false);
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при добавлении категории';
      toast.error(message);
    }
  };

  const handleEdit = async (id) => {
    if (!editingName.trim()) {
      toast.error('Введите название категории');
      return;
    }

    try {
      await categoriesAPI.update(id, { name: editingName.trim() });
      toast.success('Категория обновлена');
      setEditingId(null);
      setEditingName('');
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.error || 'Ошибка при обновлении категории';
      toast.error(message);
    }
  };

  const handleDelete = async (category) => {
    const result = await Swal.fire({
      title: 'Удалить категорию?',
      text: `Вы уверены, что хотите удалить категорию "${category.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#007aff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Да, удалить',
      cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
      try {
        await categoriesAPI.delete(category.id);
        toast.success('Категория удалена');
        loadCategories();
      } catch (error) {
        const message = error.response?.data?.error || 'Ошибка при удалении категории';
        toast.error(message);
      }
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
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
          className="bg-white rounded-apple shadow-apple-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[80vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка */}
          <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b gap-2">
            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-apple-dark truncate">Управление категориями</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
            >
              <FaTimes className="text-apple-gray" size={18} />
            </button>
          </div>

          {/* Контент */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {editingId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 input-field text-sm sm:text-base"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEdit(category.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Сохранить"
                        >
                          <FaSave size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Отмена"
                        >
                          <FaBan size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-apple-dark font-medium text-sm sm:text-base">{category.name}</span>
                        <button
                          onClick={() => startEdit(category)}
                          className="p-2 text-apple-blue hover:bg-blue-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Редактировать"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                          title="Удалить"
                        >
                          <FaTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>
                ))}

                {categories.length === 0 && !adding && (
                  <p className="text-center text-apple-gray py-8">Нет категорий</p>
                )}

                {/* Форма добавления */}
                {adding ? (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 input-field text-sm sm:text-base"
                      placeholder="Название новой категории"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAdd();
                        if (e.key === 'Escape') {
                          setAdding(false);
                          setNewCategoryName('');
                        }
                      }}
                    />
                    <button
                      onClick={handleAdd}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Добавить"
                    >
                      <FaSave size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setAdding(false);
                        setNewCategoryName('');
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Отмена"
                    >
                      <FaBan size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="w-full p-2 sm:p-3 border-2 border-dashed border-gray-300 rounded-xl text-apple-gray 
                             hover:border-apple-blue hover:text-apple-blue transition-colors flex items-center 
                             justify-center gap-2 min-h-[44px] text-sm sm:text-base"
                  >
                    <FaPlus /> Добавить категорию
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Футер */}
          <div className="p-3 sm:p-4 md:p-6 border-t flex justify-end">
            <button onClick={onClose} className="btn-primary min-h-[44px] text-sm sm:text-base px-6 sm:px-8">
              Готово
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ManageCategoriesModal;
