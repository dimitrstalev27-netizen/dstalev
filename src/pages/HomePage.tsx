import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    ArrowRightLeft,
    History,
    AlertTriangle,
    BarChart3,
    Shield,
    Users,
    Zap,
    CheckCircle2,
    ArrowRight,
    Warehouse,
    TrendingUp,
    Lock,
    Search,
} from 'lucide-react';
import { useEffect } from 'react';

export const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const features = [
        {
            icon: Package,
            title: 'Управление на артикули',
            description: 'Добавяне, редактиране и изтриване на складови артикули с детайлна информация',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            icon: ArrowRightLeft,
            title: 'Складови операции',
            description: 'Приемане и изписване на стока с автоматично проследяване на количествата',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            icon: History,
            title: 'История на операциите',
            description: 'Пълно проследяване на всички извършени складови движения',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            icon: AlertTriangle,
            title: 'Сигнали за наличност',
            description: 'Автоматично сигнализиране при достигане на минимални количества',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            icon: BarChart3,
            title: 'Справки и анализи',
            description: 'Генериране на детайлни справки за наличности и движение на артикули',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
        {
            icon: Shield,
            title: 'Защита на данните',
            description: 'Валидация и контрол на достъпа с потребителски роли',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
    ];

    const benefits = [
        {
            icon: Users,
            title: 'Потребителски роли',
            description: 'Администратор и потребител с различни права на достъп',
        },
        {
            icon: Zap,
            title: 'Бърза работа',
            description: 'Интуитивен интерфейс за ефективно управление на склада',
        },
        {
            icon: Lock,
            title: 'Сигурност',
            description: 'Защита на данните с валидация и контрол на достъпа',
        },
        {
            icon: Search,
            title: 'Търсене и филтриране',
            description: 'Мощни инструменти за намиране на нужната информация',
        },
    ];

    const stats = [
        { label: 'Категории артикули', value: '5+', icon: Warehouse },
        { label: 'Типове операции', value: '2', icon: ArrowRightLeft },
        { label: 'Видове справки', value: '10+', icon: BarChart3 },
        { label: 'Автоматични сигнали', value: '24/7', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            {/* Секция Hero */}
            <div className="relative overflow-hidden">
                {/* Фонов шаблон */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                <div className="container mx-auto px-4 py-16 md:py-24 relative">
                    <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
                        {/* Значка */}
                        <Badge className="mx-auto px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            <Warehouse className="w-4 h-4 mr-2 inline" />
                            Електронна платформа за управление на складова наличност
                        </Badge>

                        {/* Заглавие */}
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                                СкладПро
                            </h1>
                            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                                Модерна система за надеждно проследяване и управление на складови артикули
                            </p>
                        </div>

                        {/* Бутони за действие */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button
                                size="lg"
                                onClick={() => navigate('/login')}
                                className="group px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                Вход в системата
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => {
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-6 text-lg font-semibold"
                            >
                                Научете повече
                            </Button>
                        </div>

                        {/* Статистика */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex items-center justify-center mb-2">
                                        <stat.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Секция Функционалности */}
            <div id="features" className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-6xl mx-auto">
                    {/* Заглавие на секцията */}
                    <div className="text-center mb-12 space-y-4">
                        <Badge className="mx-auto px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                            Функционалности
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold">Всичко необходимо за вашия склад</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Пълен набор от инструменти за ефективно управление на складовата наличност
                        </p>
                    </div>

                    {/* Решетка с функционалности */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card
                                key={feature.title}
                                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/50"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <CardHeader>
                                    <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Секция Предимства */}
            <div className="bg-muted/30 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Заглавие на секцията */}
                        <div className="text-center mb-12 space-y-4">
                            <Badge className="mx-auto px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                                Предимства
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold">Защо да изберете СкладПро?</h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Надеждна и сигурна платформа, създадена с фокус върху потребителското изживяване
                            </p>
                        </div>

                        {/* Решетка с предимства */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={benefit.title}
                                    className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all hover:shadow-md"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Секция Изисквания */}
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-2 border-primary/20 shadow-xl">
                        <CardHeader className="text-center pb-6">
                            <Badge className="mx-auto mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                                Изпълнени изисквания
                            </Badge>
                            <CardTitle className="text-2xl md:text-3xl">
                                Съответствие с дипломното задание
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Всички изисквания са напълно реализирани и тествани
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    'Регистрация и вход с роли',
                                    'Управление на артикули',
                                    'Складови операции',
                                    'История на операциите',
                                    'Контрол на наличностите',
                                    'Генериране на справки',
                                    'Интуитивен интерфейс',
                                    'Защита на данните',
                                ].map((requirement, index) => (
                                    <div
                                        key={requirement}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                                        <span className="text-sm font-medium">{requirement}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Секция Призив за действие */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Готови ли сте да започнете?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Влезте в системата и започнете да управлявате вашия склад ефективно
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Button
                                size="lg"
                                onClick={() => navigate('/login')}
                                className="group px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                Вход в системата
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
