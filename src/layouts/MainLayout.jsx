import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User, 
  AlertCircle 
} from 'lucide-react';
import Instagram from '../components/icons/Instagram';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, fetchMe } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/create', label: 'Create Post', icon: PlusCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080b11] text-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-gray-800/60 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-instagram-orange via-instagram-pink to-instagram-purple flex items-center justify-center shadow-lg shadow-instagram-pink/20">
            <Instagram size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gradient">IG Gateway</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive 
                    ? 'bg-gradient-to-r from-instagram-pink/20 to-instagram-purple/10 text-instagram-pink border border-instagram-pink/20 shadow-md shadow-instagram-pink/5' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & logout footer */}
        <div className="border-t border-gray-800/60 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-300">
                <User size={16} />
              </div>
              <div className="max-w-[120px]">
                <p className="text-sm font-semibold truncate">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-950/30 transition-all duration-300 font-medium cursor-pointer"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content & Mobile View Wrapper */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0">
        {/* Top Header */}
        <header className="glass border-b border-gray-800/60 py-4 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          {/* Logo on Mobile, Title on Desktop */}
          <div className="md:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-instagram-orange via-instagram-pink to-instagram-purple flex items-center justify-center">
              <Instagram size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">IG Gateway</span>
          </div>

          <h1 className="hidden md:block font-bold text-lg text-gray-200">
            {location.pathname === '/' ? 'Dashboard' : 'Create Post'}
          </h1>

          {/* Instagram Account Connection Status */}
          <div className="flex items-center gap-2">
            {user?.instagram_connected ? (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full text-green-400 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span>Connected: {user.instagram_account_id}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full text-amber-400 text-xs font-semibold">
                <AlertCircle size={12} />
                <span>Instagram Disconnected</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-gray-800/60 h-16 flex items-center justify-around px-4 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-20 h-full transition-all duration-300 ${
                isActive ? 'text-instagram-pink' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-20 h-full text-gray-400 hover:text-red-400"
        >
          <LogOut size={20} />
          <span className="text-[10px] mt-1 font-medium">Log Out</span>
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;
