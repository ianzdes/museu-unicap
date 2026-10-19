import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export function ProtectedRoute() {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        // Checa se existe sessão ativa
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Escuta mudanças de auth (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>;
    }

    // Se não tiver sessão (não estiver logado), redireciona pro Login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver logado, renderiza a página solicitada
    return <Outlet />;
}