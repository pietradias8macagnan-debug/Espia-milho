import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (session && !error) {
                    setAuthenticated(true);
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error('Erro ao verificar autenticação:', err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Ouvir mudanças de estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                setAuthenticated(false);
                navigate('/');
            } else if (event === 'SIGNED_IN' && session) {
                setAuthenticated(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f2f4e8'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#2f3a2e'
                }}>
                    <div style={{
                        fontSize: '2rem',
                        marginBottom: '1rem'
                    }}>
                        🌾
                    </div>
                    <div>Verificando acesso...</div>
                </div>
            </div>
        );
    }

    return authenticated ? children : null;
};

export default ProtectedRoute;