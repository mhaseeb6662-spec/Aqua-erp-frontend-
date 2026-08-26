import { useEffect, useState } from 'react';
import { Menu, ChevronDown, LogOut, User as UserIcon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import portalService from '../../services/portalService';
import toast from 'react-hot-toast';
import AcademyLogo from '../common/AcademyLogo';

export default function Navbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await portalService.getNotifications();
        if (isMounted) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // silent fallback
      }
    };
    fetchUnread();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-marine/[0.06] bg-white/80 px-4 py-3.5 backdrop-blur-md sm:px-8 no-print">
      <div className="flex items-center gap-3">
        <button className="text-slate-700 hover:text-tide lg:hidden p-1 rounded-lg hover:bg-slate-100 transition" onClick={onMenuClick}>
          <Menu className="h-5.5 w-5.5" />
        </button>
        <div className="lg:hidden flex items-center">
          <AcademyLogo variant="navbar" className="h-7 w-auto" />
        </div>
        <h1 className="font-display text-base sm:text-xl font-bold text-marine hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-full p-2 text-slate-700 transition hover:bg-slate-100 hover:text-marine"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tide text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tide text-xs font-bold text-white">
              {initials || <UserIcon className="h-4 w-4" />}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-bold leading-tight text-marine">{user?.fullName}</span>
              <span className="block text-xs font-medium leading-tight text-slate-600">{user?.role?.name}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-52 animate-rise rounded-xl border border-slate-200 bg-white p-1.5 shadow-pop">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-bold text-marine">{user?.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-coral hover:bg-coral/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
