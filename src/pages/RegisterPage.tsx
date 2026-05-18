import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse, Lock, User, Mail, AlertCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RegisterPage = () => {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Проверка дали паролите съвпадат
        if (password !== confirmPassword) {
            setError('Паролите не съвпадат');
            return;
        }

        setIsLoading(true);

        const result = await register(username, email, password);

        if (result.success) {
            toast({
                title: 'Успешна регистрация',
                description: 'Добре дошли в системата!',
            });
            navigate('/dashboard');
        } else {
            setError(result.error || 'Грешка при регистрация');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Лого */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground shadow-elevated mb-4">
                        <Warehouse className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">СкладПро</h1>
                    <p className="text-muted-foreground mt-1">Система за управление на склад</p>
                </div>

                <Card className="shadow-elevated border-border/50">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl flex items-center justify-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Регистрация
                        </CardTitle>
                        <CardDescription>Създайте нов потребителски акаунт</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username">Потребителско име</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="ivan.petrov"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={3}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Минимум 3 символа</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Имейл адрес</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ivan@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Парола</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Въведете парола"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Минимум 6 символа</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Потвърдете паролата</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Въведете паролата отново"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Регистрация...' : 'Регистрирай се'}
                            </Button>
                        </form>

                        {/* Линк за вход */}
                        <div className="mt-6 pt-4 border-t border-border text-center">
                            <p className="text-sm text-muted-foreground">
                                Вече имате акаунт?{' '}
                                <Link to="/login" className="text-primary hover:underline font-medium">
                                    Влезте тук
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
