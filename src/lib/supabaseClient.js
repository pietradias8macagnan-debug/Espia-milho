import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabaseClient;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables are not set. Running in local demo mode with in-memory auth.');

    let localUser = null;
    let authStateListeners = [];

    supabaseClient = {
        auth: {
            getSession: async () => {
                if (!localUser) return { data: { session: null }, error: null };
                return {
                    data: {
                        session: {
                            access_token: 'local-demo-token',
                            user: localUser,
                        },
                    },
                    error: null,
                };
            },

            signInWithPassword: async ({ email, password }) => {
                if (!email || !password) {
                    return { data: null, error: { message: 'Email e senha required' } };
                }
                localUser = { id: 'local-1', email };
                // Notificar listeners sobre mudança de estado
                authStateListeners.forEach(listener => listener('SIGNED_IN', {
                    access_token: 'local-demo-token',
                    user: localUser,
                }));
                return {
                    data: {
                        session: {
                            access_token: 'local-demo-token',
                            user: localUser,
                        },
                    },
                    error: null,
                };
            },

            signUp: async ({ email, password }) => {
                if (!email || !password) {
                    return { data: null, error: { message: 'Email e senha required' } };
                }
                localUser = { id: 'local-1', email };
                // Notificar listeners sobre mudança de estado
                authStateListeners.forEach(listener => listener('SIGNED_IN', {
                    access_token: 'local-demo-token',
                    user: localUser,
                }));
                return {
                    data: {
                        user: localUser,
                        session: {
                            access_token: 'local-demo-token',
                            user: localUser,
                        },
                    },
                    error: null,
                };
            },

            signOut: async () => {
                localUser = null;
                // Notificar listeners sobre mudança de estado
                authStateListeners.forEach(listener => listener('SIGNED_OUT', null));
                return { error: null };
            },

            onAuthStateChange: (callback) => {
                authStateListeners.push(callback);
                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                const index = authStateListeners.indexOf(callback);
                                if (index > -1) {
                                    authStateListeners.splice(index, 1);
                                }
                            }
                        }
                    }
                };
            },

            resetPasswordForEmail: async (email, options) => {
                console.log('Solicitação de reset de senha para:', email);
                const link = `${options?.redirectTo || 'http://localhost:3000/reset-password'}?token=demo-token-123`;
                console.log('Link de reset (simulado):', link);

                // Simular delay de envio
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mostrar alert com informações do "email enviado"
                alert(`📧 Email de recuperação gerado:\n\nPara: ${email}\nLink: ${link}\n\nPara teste local, abra o link acima.`);

                return { error: null };
            },

            // Método adicional para recuperação por SMS (demo)
            resetPasswordForSMS: async (phone, options) => {
                console.log('Solicitação de reset por SMS para:', phone);

                // Simular delay de envio
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Gerar código de 6 dígitos
                const smsCode = Math.floor(100000 + Math.random() * 900000);
                console.log('Código SMS gerado:', smsCode);

                // Mostrar alert com código
                alert(`📱 SMS simulado enviado!\n\nPara: ${phone}\nCódigo: ${smsCode}\n\nUse este código para recuperar a senha.`);

                return { error: null, code: smsCode };
            },

            // Método para recuperação por código de segurança (demo)
            resetPasswordForSecurityCode: async (email, options) => {
                console.log('🛡️ [MODO DEMO] Solicitação de código de segurança para:', email);

                // Simular delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Gerar código de 8 caracteres
                const securityCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                console.log('🔢 [MODO DEMO] Código de segurança gerado:', securityCode);

                // Mostrar alert com código
                alert(`🛡️ [MODO DEMO] Código de segurança enviado!\n\nPara: ${email}\nCódigo: ${securityCode}\n\nNo modo demo, use este código para recuperar a senha.`);

                return { error: null, code: securityCode };
            },
        },
    };
} else {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = supabaseClient;
