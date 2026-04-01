import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LandingPage() {
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const [authMode, setAuthMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [authError, setAuthError] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetPhone, setResetPhone] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetMethod, setResetMethod] = useState('email'); // 'email', 'sms', 'security'
    const [showAlternativeOptions, setShowAlternativeOptions] = useState(false);

    // Verificar sessão automaticamente ao carregar a página
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session && !error) {
                    // Usuário já está logado, redirecionar para dashboard
                    navigate('/dashboard');
                }
            } catch (err) {
                console.log('Nenhuma sessão ativa encontrada');
            }
        };

        checkSession();

        // Ouvir mudanças de estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                navigate('/dashboard');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthMessage('');

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setAuthError('Insira um email válido.');
            return;
        }

        if (password.length < 6) {
            setAuthError('Senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            if (authMode === 'register') {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    setAuthError(error.message || 'Falha ao cadastrar.');
                    return;
                }

                // Supabase pode retornar user sem sessão (verificação por email)
                if (data?.user) {
                    setAuthMessage(`Cadastro efetuado! Verifique ${email} e faça login (confirmar email se necessário).`);
                    setAuthMode('login');
                    setPassword('');
                    return;
                }

                if (data?.session) {
                    setAuthMessage('Conta criada e logado automaticamente. Redirecionando...');
                    navigate('/dashboard');
                    return;
                }

                setAuthError('Não foi possível criar a conta. Tente novamente.');
                return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
                options: {
                    data: {
                        remember_me: rememberMe
                    }
                }
            });

            if (error) {
                setAuthError(error.message || 'Falha ao autenticar.');
                return;
            }

            if (data.session) {
                navigate('/dashboard');
                return;
            }

            setAuthError('Login não retornou sessão.');
        } catch (err) {
            console.error(err);
            setAuthError('Erro inesperado, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetMessage('');

        if (resetMethod === 'email') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(resetEmail)) {
                setResetError('Insira um email válido.');
                return;
            }
        } else if (resetMethod === 'sms') {
            const phonePattern = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
            if (!phonePattern.test(resetPhone)) {
                setResetError('Insira um telefone válido (ex: (11) 99999-9999).');
                return;
            }
        }

        setLoading(true);
        try {
            let result;

            if (resetMethod === 'email') {
                result = await supabase.auth.resetPasswordForEmail(resetEmail, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
            } else if (resetMethod === 'sms') {
                result = await supabase.auth.resetPasswordForSMS(resetPhone, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
            } else if (resetMethod === 'security') {
                result = await supabase.auth.resetPasswordForSecurityCode(resetEmail, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
            }

            if (result.error) {
                setResetError(result.error.message || 'Erro ao enviar recuperação.');
                return;
            }

            const methodNames = {
                email: 'email',
                sms: 'SMS',
                security: 'código de segurança'
            };

            setResetMessage(`${methodNames[resetMethod]} de recuperação enviado! Verifique suas mensagens.`);
            setShowAlternativeOptions(false);
        } catch (err) {
            setResetError('Erro inesperado, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => setLoginModalOpen(true);
    const closeModal = () => {
        setLoginModalOpen(false);
        setAuthError('');
        setAuthMessage('');
        setEmail('');
        setPassword('');
        setFullName('');
        setAuthMode('login');
        setShowResetPassword(false);
        setResetEmail('');
        setResetPhone('');
        setResetMessage('');
        setResetError('');
        setResetMethod('email');
        setShowAlternativeOptions(false);
    };
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full h-full overflow-auto bg-[#fafaf8]">
            {/* Login Modal */}
            {loginModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={closeModal}>
                    <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-6 right-6 text-3xl text-[#8b7355] hover:text-[#3d2817]" onClick={closeModal}>×</button>
                        <h2 className="text-3xl text-[#3d2817] mb-6 font-serif">
                            {showResetPassword ? 'Recuperar Senha' : 'Bem-vindo ao EspIA'}
                        </h2>

                        {!showResetPassword ? (
                            <>
                                <div className="flex gap-2 mb-4 justify-center">
                                    <button type="button" className={`px-4 py-2 rounded-lg ${authMode === 'login' ? 'bg-[#6b8e5a] text-white' : 'bg-gray-200 text-[#3d2817]'}`} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthMessage(''); }}>
                                        Entrar
                                    </button>
                                    <button type="button" className={`px-4 py-2 rounded-lg ${authMode === 'register' ? 'bg-[#6b8e5a] text-white' : 'bg-gray-200 text-[#3d2817]'}`} onClick={() => { setAuthMode('register'); setAuthError(''); setAuthMessage(''); }}>
                                        Cadastrar
                                    </button>
                                </div>
                                {authError && <p className="text-sm text-red-600 mb-4">{authError}</p>}
                                {authMessage && <p className="text-sm text-green-600 mb-4">{authMessage}</p>}
                                <form onSubmit={handleAuthSubmit}>
                                    {authMode === 'register' && (
                                        <div className="mb-5">
                                            <label className="block text-[#3d2817] font-semibold mb-2">Nome Completo</label>
                                            <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" placeholder="Seu nome" className="w-full p-3 border border-gray-300 rounded-lg text-sm" />
                                        </div>
                                    )}
                                    <div className="mb-5">
                                        <label className="block text-[#3d2817] font-semibold mb-2">Email</label>
                                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="seu@email.com" className="w-full p-3 border border-gray-300 rounded-lg text-sm" autoComplete="email" required />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-[#3d2817] font-semibold mb-2">Senha</label>
                                        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full p-3 border border-gray-300 rounded-lg text-sm" autoComplete="current-password" required />
                                    </div>
                                    {authMode === 'login' && (
                                        <div className="mb-4 flex items-center">
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="mr-2"
                                            />
                                            <label htmlFor="rememberMe" className="text-sm text-[#3d2817]">Lembrar-me</label>
                                        </div>
                                    )}
                                    <button type="submit" className="w-full bg-[#6b8e5a] text-white border-none rounded-xl py-3 font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-[#5a7a4c] hover:shadow-lg" disabled={loading}>
                                        {loading ? 'Processando...' : authMode === 'register' ? 'Criar Conta' : 'Entrar'}
                                    </button>
                                </form>
                                <div className="text-center mt-4">
                                    <span className="text-[#8b7355] text-sm">{authMode === 'login' ? 'Não tem conta?' : 'Já tem conta?'} <span className="text-[#6b8e5a] cursor-pointer font-semibold" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'Cadastre-se' : 'Fazer login'}</span></span>
                                    {authMode === 'login' && (
                                        <div className="mt-2">
                                            <span className="text-[#6b8e5a] cursor-pointer text-sm font-semibold" onClick={() => setShowResetPassword(true)}>Esqueceu a senha?</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex gap-2 mb-4 justify-center">
                                    <button
                                        type="button"
                                        className={`px-3 py-1.5 rounded-lg text-xs ${resetMethod === 'email' ? 'bg-[#6b8e5a] text-white' : 'bg-gray-200 text-[#3d2817]'}`}
                                        onClick={() => { setResetMethod('email'); setResetError(''); setResetMessage(''); }}
                                    >
                                        📧 Email
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-3 py-1.5 rounded-lg text-xs ${resetMethod === 'sms' ? 'bg-[#6b8e5a] text-white' : 'bg-gray-200 text-[#3d2817]'}`}
                                        onClick={() => { setResetMethod('sms'); setResetError(''); setResetMessage(''); }}
                                    >
                                        📱 SMS
                                    </button>
                                    <button
                                        type="button"
                                        className={`px-3 py-1.5 rounded-lg text-xs ${resetMethod === 'security' ? 'bg-[#6b8e5a] text-white' : 'bg-gray-200 text-[#3d2817]'}`}
                                        onClick={() => { setResetMethod('security'); setResetError(''); setResetMessage(''); }}
                                    >
                                        🛡️ Código
                                    </button>
                                </div>

                                <p className="text-[#8b7355] text-sm mb-6 text-center">
                                    {resetMethod === 'email' && 'Digite seu email para receber um link de recuperação.'}
                                    {resetMethod === 'sms' && 'Digite seu telefone para receber um código por SMS.'}
                                    {resetMethod === 'security' && 'Digite seu email para receber um código de segurança.'}
                                </p>

                                {resetError && <p className="text-sm text-red-600 mb-4">{resetError}</p>}
                                {resetMessage && <p className="text-sm text-green-600 mb-4">{resetMessage}</p>}

                                <form onSubmit={handleResetPassword}>
                                    <div className="mb-6">
                                        <label className="block text-[#3d2817] font-semibold mb-2">
                                            {resetMethod === 'sms' ? 'Telefone' : 'Email'}
                                        </label>
                                        <input
                                            value={resetMethod === 'sms' ? resetPhone : resetEmail}
                                            onChange={(e) => resetMethod === 'sms' ? setResetPhone(e.target.value) : setResetEmail(e.target.value)}
                                            type={resetMethod === 'sms' ? 'tel' : 'email'}
                                            placeholder={resetMethod === 'sms' ? '(11) 99999-9999' : 'seu@email.com'}
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-[#6b8e5a] text-white border-none rounded-xl py-3 font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-[#5a7a4c] hover:shadow-lg" disabled={loading}>
                                        {loading ? 'Enviando...' : `Enviar ${resetMethod === 'email' ? 'Link' : resetMethod === 'sms' ? 'SMS' : 'Código'}`}
                                    </button>
                                </form>

                                {!showAlternativeOptions && resetMessage && (
                                    <div className="text-center mt-4">
                                        <p className="text-[#8b7355] text-xs mb-2">Não recebeu a mensagem?</p>
                                        <button
                                            type="button"
                                            className="text-[#6b8e5a] cursor-pointer text-xs font-semibold underline"
                                            onClick={() => setShowAlternativeOptions(true)}
                                        >
                                            Tentar outras opções
                                        </button>
                                    </div>
                                )}

                                {showAlternativeOptions && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-[#3d2817] text-sm font-semibold mb-3">Outras opções de recuperação:</p>
                                        <div className="space-y-2">
                                            {resetMethod !== 'email' && (
                                                <button
                                                    type="button"
                                                    className="w-full text-left p-2 bg-white rounded border text-xs hover:bg-gray-50"
                                                    onClick={() => { setResetMethod('email'); setResetError(''); setResetMessage(''); }}
                                                >
                                                    📧 Receber por Email
                                                </button>
                                            )}
                                            {resetMethod !== 'sms' && (
                                                <button
                                                    type="button"
                                                    className="w-full text-left p-2 bg-white rounded border text-xs hover:bg-gray-50"
                                                    onClick={() => { setResetMethod('sms'); setResetError(''); setResetMessage(''); }}
                                                >
                                                    📱 Receber por SMS
                                                </button>
                                            )}
                                            {resetMethod !== 'security' && (
                                                <button
                                                    type="button"
                                                    className="w-full text-left p-2 bg-white rounded border text-xs hover:bg-gray-50"
                                                    onClick={() => { setResetMethod('security'); setResetError(''); setResetMessage(''); }}
                                                >
                                                    🛡️ Código de Segurança
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center mt-4">
                                    <span className="text-[#6b8e5a] cursor-pointer text-sm font-semibold" onClick={() => setShowResetPassword(false)}>Voltar ao Login</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#fafaf8]/85 border-b border-gray-200/30">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#6b8e5a] to-[#8bb367] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">🌾</span>
                            </div>
                            <span className="font-bold text-base text-[#3d2817]">EspIA</span>
                        </div>
                        <div className="hidden md:flex gap-8">
                            <span onClick={() => scrollToSection('features')} className="text-[#3d2817] font-medium text-xs cursor-pointer hover:text-[#6b8e5a]">Capacidades</span>
                            <span onClick={() => scrollToSection('ia')} className="text-[#3d2817] font-medium text-xs cursor-pointer hover:text-[#6b8e5a]">IA</span>
                            <span onClick={() => scrollToSection('stats')} className="text-[#3d2817] font-medium text-xs cursor-pointer hover:text-[#6b8e5a]">Tecnologia</span>
                        </div>
                        <button className="bg-[#6b8e5a] text-white border-none rounded-lg px-6 py-2.5 font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-[#5a7a4c] hover:shadow-lg" onClick={openModal}>Entrar</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero" className="bg-gradient-to-br from-[#f5e6d3] via-white to-[#e8f3ed] py-20 md:py-32 animate-fade-in w-full">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="animate-slide-up">
                            <div className="bg-[#e8f3ed] rounded-xl px-3 py-1.5 w-fit mb-4">
                                <span className="text-[#6b8e5a] text-xs font-semibold">🚀 Monitoramento Fenológico com IA</span>
                            </div>
                            <h1 className="text-3xl leading-tight text-[#3d2817] mb-5 font-serif">A IA que Vigia sua Lavoura</h1>
                            <p className="text-sm text-[#8b7355] leading-relaxed mb-6">Monitore estádios fenológicos, anomalias e NDVI em tempo real. Geoprocessamento inteligente + IA para recomendações precisas baseadas em EMBRAPA.</p>
                            <div className="flex gap-3 flex-wrap">
                                <button className="bg-[#6b8e5a] text-white border-none rounded-lg px-6 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#5a7a4c] hover:shadow-lg hover:-translate-y-0.5" onClick={openModal}>Comece Agora</button>
                            </div>
                        </div>
                        <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <div className="bg-gradient-to-br from-[#6b8e5a] to-[#8bb367] rounded-3xl p-10 text-white text-center min-h-[400px] flex flex-col justify-center items-center gap-6">
                                <div className="text-7xl">📊</div>
                                <div className="text-xl font-semibold">Dashboard de Fenologia</div>
                                <div className="text-sm opacity-90">Análise em tempo real do desenvolvimento da cultura</div>
                                <div className="bg-white/10 rounded-xl p-4 mt-4 border border-white/20">
                                    <div className="text-xs opacity-90">V4 → V6 → V8 → V10 → VT → R1 → R3 → R5 → R6</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 w-full bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl text-[#3d2817] mb-4 font-serif">Capacidades Integradas</h2>
                        <p className="text-sm text-[#8b7355] max-w-2xl mx-auto">Geoprocessamento, IA e agronomia de precisão em uma única plataforma</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#e8f3ed] rounded-xl flex items-center justify-center mb-4">
                                🌱
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Estágios Fenológicos</h3>
                            <p className="text-[#8b7355] leading-relaxed">Identifique automaticamente cada estágio do desenvolvimento (V, R) com precisão de ±2 dias</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#fef3e6] rounded-xl flex items-center justify-center mb-4">
                                📋
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Relatórios com IA</h3>
                            <p className="text-[#8b7355] leading-relaxed">Geração inteligente com base em documentos EMBRAPA/MAPA. Cada recomendação rastreável</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#f0f5f1] rounded-xl flex items-center justify-center mb-4">
                                📊
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Fenologia Precisa</h3>
                            <p className="text-[#8b7355] leading-relaxed">Escala BBCH, graus-dia acumulados (GDD) e integração com INMET para cálculo automático</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#e8f3ed] rounded-xl flex items-center justify-center mb-4">
                                🐛
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Detecção de Anomalias</h3>
                            <p className="text-[#8b7355] leading-relaxed">Pragas (Spodoptera), doenças, deficiências nutricionais, plantas nanicas e limiares de dano</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#fef3e6] rounded-xl flex items-center justify-center mb-4">
                                🗺️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Mapas NDVI Atualizados</h3>
                            <p className="text-[#8b7355] leading-relaxed">Imagens Sentinel-2 processadas com QGIS. Vigor de plantas automaticamente classificado</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                            <div className="w-16 h-16 bg-[#f0f5f1] rounded-xl flex items-center justify-center mb-4">
                                📱
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">PWA Offline-First</h3>
                            <p className="text-[#8b7355] leading-relaxed">Coleta de dados sem internet. Sincronização automática. Funciona em qualquer smartphone</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* IA Section */}
            <section id="ia" className="py-24 w-full bg-gradient-to-br from-[#f5e6d3] via-[#fafaf8] to-[#e8f3ed]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="bg-white rounded-3xl p-12 shadow-lg flex flex-col justify-center gap-8">
                            <div>
                                <div className="w-16 h-16 bg-[#e8f3ed] rounded-xl flex items-center justify-center mb-5">
                                    🤖
                                </div>
                                <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Machine Learning Avançado</h3>
                                <p className="text-[#8b7355] leading-relaxed text-lg">Nossos modelos foram treinados com milhares de imagens de diferentes cultivares e condições climáticas</p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-[#fef3e6] rounded-xl flex items-center justify-center mb-5">
                                    🎯
                                </div>
                                <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Precisão Agrícola</h3>
                                <p className="text-[#8b7355] leading-relaxed text-lg">97% de acurácia na classificação de estágios, validado com agrônomos especializados</p>
                            </div>
                            <div>
                                <div className="w-16 h-16 bg-[#f0f5f1] rounded-xl flex items-center justify-center mb-5">
                                    ⚡
                                </div>
                                <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Resultados Instantâneos</h3>
                                <p className="text-[#8b7355] leading-relaxed text-lg">Processamento em menos de 2 segundos. Sem necessidade de conexão com a nuvem</p>
                            </div>
                        </div>
                        <div className="animate-slide-up">
                            <div className="bg-gradient-to-br from-[#8bb367] to-[#6b8e5a] rounded-3xl p-10 text-white min-h-[500px] flex flex-col justify-center gap-8">
                                <div>
                                    <div className="text-xs uppercase tracking-wider opacity-90 mb-3 font-semibold">Estágio V6</div>
                                    <div className="text-2xl font-bold mb-2">6 Folhas Visíveis</div>
                                    <div className="text-xs opacity-95">Estágio vegetativo – 6 semanas após emergência</div>
                                </div>
                                <div className="bg-white/15 rounded-xl p-5 border border-white/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                                        <span className="text-sm">GDD acumulado: 450°C</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span className="text-sm">Confiança IA: 97.3%</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        <span className="text-sm">Próximo estágio em ~10 dias</span>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/dashboard')} className="bg-white/25 border border-white/30 text-white px-6 py-3 rounded-xl cursor-pointer font-semibold text-sm transition-all duration-300 hover:bg-white/35">Ver Histórico Completo →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-24 w-full bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl text-[#3d2817] mb-4 font-serif">Tecnologia Robusta</h2>
                        <p className="text-sm text-[#8b7355]">Desenvolvida com foco em agronomia de precisão</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#fef3e6] rounded-xl flex items-center justify-center mb-4">
                                🐍
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Python 3.10+</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Backend com FastAPI. Processamento de imagens com OpenCV e scikit-learn. Modelos ML com TensorFlow/PyTorch</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#e8f3ed] rounded-xl flex items-center justify-center mb-4">
                                🗺️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">QGIS 3.x</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Processamento de rasters Sentinel-2. Cálculo de índices espectrais (NDVI, NDMI). Análise geoespacial vetorial</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#f0f5f1] rounded-xl flex items-center justify-center mb-4">
                                🛰️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">Sentinel-2 API</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Imagens multiespectrais 10m. Copernicus Open Access Hub. Bandas RGB + NIR/SWIR para cálculos espectrais</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#fef3e6] rounded-xl flex items-center justify-center mb-4">
                                ⚛️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">React 19 + Leaflet</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Frontend responsivo com React Router. Mapas interativos com Leaflet. Autenticação com Supabase</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#e8f3ed] rounded-xl flex items-center justify-center mb-4">
                                🗄️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">PostgreSQL + PostGIS</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Banco geoespacial. Extensão PostGIS para geometrias. Armazenamento de geometrias de talhões e pontos de coleta</p>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-lg">
                            <div className="w-16 h-16 bg-[#f0f5f1] rounded-xl flex items-center justify-center mb-4">
                                🌦️
                            </div>
                            <h3 className="text-lg text-[#3d2817] mb-3 font-bold">INMET OpenData</h3>
                            <p className="text-[#8b7355] leading-relaxed text-sm">Dados meteorológicos em tempo real. Cálculo de GDD (graus-dia). Integração com modelos fenológicos</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 w-full bg-gradient-to-br from-[#6b8e5a] to-[#5a7a4c]">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-3xl text-white mb-3 font-serif">Pronto para Otimizar sua Lavoura?</h2>
                    <p className="text-sm text-white/90 mb-6 max-w-2xl mx-auto">Comece hoje e veja os resultados em sua próxima safra</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 w-full bg-[#3d2817] text-white/80">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-2xl">🌾</span>
                            <span className="text-lg font-bold text-white">EspIA</span>
                        </div>
                        <p className="text-sm leading-relaxed">EspIA para fenologia do milho, desenvolvida por agrônomos e engenheiros</p>
                    </div>
                    <div className="border-t border-white/10 pt-6 text-center">
                        <p className="text-sm">© 2024 EspIA. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
