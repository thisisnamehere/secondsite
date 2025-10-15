import { motion } from 'framer-motion';
import { FaHospital, FaSignOutAlt, FaUser } from 'react-icons/fa';

function Header({ title, onLogout }) {
  const adminLogin = localStorage.getItem('admin_login');

  return (
    <motion.header
      className="bg-white shadow-apple"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <FaHospital className="text-apple-blue text-2xl sm:text-3xl flex-shrink-0" />
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-apple-dark truncate">{title}</h1>
          </div>
          
          {onLogout && (
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-apple-gray">
                <FaUser />
                <span className="text-sm">{adminLogin}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-red-300 text-red-600 
                         hover:bg-red-50 transition-colors duration-200 text-sm sm:text-base"
                title="Выйти"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
