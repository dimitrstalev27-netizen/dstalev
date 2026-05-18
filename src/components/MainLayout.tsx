import { useState, forwardRef } from 'react';
import { Outlet, Navigate, NavLink as RouterNavLink, useLocation, type NavLinkProps } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    History,
    FileBarChart,
    AlertTriangle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Warehouse,
    User,
    Moon,
    Sun
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useInventory } from '@/hooks/use-inventory';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// --- Помощен компонент за навигация (предишният NavLink.tsx) ---
interface CustomNavLinkProps extends Omit<NavLinkProps, "className"> {
    className?: string;
    activeClassName?: string;
}

const CustomNavLink = forwardRef<HTMLAnchorElement, CustomNavLinkProps>(
    ({ className, activeClassName, to, ...props }, ref) => {
        return (
            <RouterNavLink
                ref={ref}
                to={to}
                className={({ isActive }) => cn(className, isActive && activeClassName)}
                {...props}
            />
        );
    }
);
CustomNavLink.displayName = "CustomNavLink";

// --- Данни за навигацията ---
const navigation = [
    { name: 'Табло', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Артикули', href: '/inventory', icon: Package },
    { name: 'Операции', href: '/operations', icon: ArrowLeftRight },
    { name: 'История', href: '/history', icon: History },
    { name: 'Справки', href: '/reports', icon: FileBarChart },
    { name: 'Сигнали', href: '/alerts', icon: AlertTriangle },
];

// --- Компонент за Sidebar (предишният AppSidebar.tsx) ---
const AppSidebar = ({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) => {
    const { user, logout, isAdmin } = useAuth();
    const { stats } = useInventory();
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    const alertCount = stats.lowStockItems + stats.outOfStockItems;

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative sticky top-0 h-screen">
            <aside className={cn(
                'flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out h-screen',
                collapsed ? 'w-16' : 'w-64'
            )}>
                {/* Заглавна част */}
                <div className={cn('flex items-center p-4 border-b border-sidebar-border', collapsed ? 'justify-center' : 'justify-start gap-3')}>
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex-shrink-0">
                        <Warehouse className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="animate-fade-in">
                            <h1 className="font-semibold text-sm">СкладПро</h1>
                            <p className="text-xs text-sidebar-foreground/60">Система за склад</p>
                        </div>
                    )}
                </div>

                {/* Навигация */}
                <nav className="flex-1 p-3 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const showBadge = item.href === '/alerts' && alertCount > 0;

                        return (
                            <CustomNavLink
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                    'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                                    collapsed && 'justify-center px-2'
                                )}
                                activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                            >
                                <div className="relative">
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    {showBadge && collapsed && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full" />
                                    )}
                                </div>
                                {!collapsed && (
                                    <>
                                        <span className="animate-fade-in">{item.name}</span>
                                        {showBadge && (
                                            <span className="ml-auto bg-warning text-warning-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                                                {alertCount}
                                            </span>
                                        )}
                                    </>
                                )}
                            </CustomNavLink>
                        );
                    })}

                    {isAdmin && (
                        <CustomNavLink
                            to="/users"
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                                collapsed && 'justify-center px-2'
                            )}
                            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        >
                            <User className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="animate-fade-in">Потребители</span>}
                        </CustomNavLink>
                    )}
                </nav>

                {/* Долна част (Тема и Профил) */}
                <div className="p-3 border-t border-sidebar-border">
                    <div className={cn('flex items-center mb-2 px-3 py-2 rounded-lg bg-sidebar-accent/50', collapsed ? 'justify-center' : 'justify-between')}>
                        {!collapsed && <span className="text-sm font-medium text-sidebar-foreground/70">Тъмна тема</span>}
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                    </div>

                    <CustomNavLink
                        to="/profile"
                        className={cn('flex items-center gap-3 px-2 py-2 mb-2 rounded-lg hover:bg-sidebar-accent group', collapsed && 'justify-center')}
                        activeClassName="bg-sidebar-accent"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                            {getInitials(user?.name)}
                        </div>
                        {!collapsed && (
                            <div className="animate-fade-in overflow-hidden text-left">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-sidebar-foreground/60 truncate">{isAdmin ? 'Администратор' : 'Потребител'}</p>
                            </div>
                        )}
                    </CustomNavLink>

                    <Button variant="ghost" onClick={logout} className={cn('w-full', collapsed ? 'justify-center px-2' : 'justify-start')}>
                        <LogOut className="w-5 h-5" />
                        {!collapsed && <span className="ml-3">Изход</span>}
                    </Button>
                </div>
            </aside>

            {/* Бутон за свиване/разпъване */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className={cn('absolute top-5 z-50 w-7 h-7 rounded-full bg-sidebar-primary text-white', collapsed ? 'left-[60px]' : 'left-[252px]')}
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
        </div>
    );
};

// --- ОСНОВЕН ЕКСПОРТ: MainLayout ---
export const MainLayout = () => {
    const { isAuthenticated } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main className="flex-1 overflow-auto h-screen">
                <div className="container py-6 px-6 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
