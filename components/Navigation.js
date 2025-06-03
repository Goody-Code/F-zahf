const { useState, useEffect, useRef } = React;

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
    const navItems = [
        { id: 'home', label: 'الرئيسية', icon: 'fas fa-home' },
        { id: 'profile', label: 'الملف الكامل', icon: 'fas fa-user-circle' },
        { id: 'sessions', label: 'الجلسات المحفوظة', icon: 'fas fa-archive' }
    ];

    return (
        <nav className="bg-white shadow-lg border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8 space-x-reverse">
                        <h1 className="text-xl font-bold text-gray-800">
                            <i className="fab fa-facebook text-blue-600 ml-2"></i>
                            أرشيف فيسبوك
                        </h1>
                    </div>
                    
                    <div className="flex space-x-4 space-x-reverse">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setCurrentPage(item.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    currentPage === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <i className={`${item.icon} ml-2`}></i>
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage('settings')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                currentPage === 'settings'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <i className="fas fa-cog ml-2"></i>
                            الإعدادات
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

// Export for use in other files
window.Navigation = Navigation;