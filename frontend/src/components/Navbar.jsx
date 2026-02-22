import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 flex items-center text-primary-600 font-bold text-xl">
                            A-Vault
                        </div>
                        {title && (
                            <>
                                <div className="h-6 w-px bg-slate-300" />
                                <h1 className="text-slate-800 font-medium text-lg">{title}</h1>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="bg-slate-100 p-1.5 rounded-full">
                                <User size={16} className="text-slate-500" />
                            </div>
                            <span className="font-medium hidden sm:block">{user?.name}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-100">
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
