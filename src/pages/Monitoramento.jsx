import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export default function Monitoramento() {
    const navigate = useNavigate();
    const [propriedades, setPropriedades] = useState([]);
    const [propriedadeSelecionada, setPropriedadeSelecionada] = useState("");
    const [estagio, setEstagio] = useState("V1");
    const [anomalia, setAnomalia] = useState("");
    const [severidade, setSeveridade] = useState(1);
    const [msg, setMsg] = useState("");
    const [erro, setErro] = useState("");
    const [novaPropriedadeNome, setNovaPropriedadeNome] = useState("");
    const [loadingPropriedades, setLoadingPropriedades] = useState(true);
    const [savingPropriedade, setSavingPropriedade] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            setLoadingPropriedades(true);
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                navigate("/");
                return;
            }

            const token = data.session.access_token;
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const resp = await fetch(`${API_BASE}/propriedades`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(`Erro ao carregar propriedades: ${resp.status} ${text}`);
                }

                const dataProps = await resp.json();
                const unica = Array.isArray(dataProps) ? dataProps : [];
                setPropriedades(unica);
                if (unica.length > 0) {
                    setPropriedadeSelecionada(unica[0].id);
                }
            } catch (err) {
                setErro("Não foi possível carregar propriedades. Verifique se o servidor está ligado e tente novamente.");
                console.error('Erro API propriedades:', err);
            } finally {
                setLoadingPropriedades(false);
            }
        };

        checkSession();
    }, [navigate]);

    const handleCriarPropriedade = async () => {
        const nome = novaPropriedadeNome.trim();
        if (!nome) {
            setErro('Informe o nome da propriedade antes de criar.');
            setMsg('');
            return;
        }

        setErro('');
        setMsg('');
        setSavingPropriedade(true);

        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) {
            setErro('Sessão expirada. Faça login novamente.');
            setSavingPropriedade(false);
            navigate('/');
            return;
        }

        try {
            const resp = await fetch(`${API_BASE}/propriedades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ nome: nome }),
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(`Erro ao criar propriedade: ${resp.status} ${text}`);
            }

            const created = await resp.json();
            const novaProp = Array.isArray(created) ? created[0] : created;
            if (!novaProp || !novaProp.id) {
                throw new Error('Retorno inválido na criação da propriedade.');
            }

            setPropriedades((old) => [...old, novaProp]);
            setPropriedadeSelecionada(novaProp.id);
            setNovaPropriedadeNome('');
            setMsg(`Propriedade '${novaProp.nome || nome}' criada com sucesso.`);
            setErro('');
        } catch (err) {
            setErro(err.message || 'Não foi possível criar a propriedade. Tente novamente mais tarde.');
            console.error('Erro criar propriedade:', err);
        } finally {
            setSavingPropriedade(false);
        }
    };

    const handleSalvar = async () => {
        setMsg("");
        setErro("");

        if (!propriedadeSelecionada) {
            setErro("Selecione uma propriedade.");
            return;
        }
        if (!anomalia.trim()) {
            setErro("Descreva a anomalia.");
            return;
        }

        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        if (!token) {
            setErro("Sessão expirada. Faça login novamente.");
            navigate("/");
            return;
        }

        try {
            const resp = await fetch(`${API_BASE}/propriedades/${propriedadeSelecionada}/talhoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nome: `[${estagio}] ${anomalia} (Sev: ${severidade})`,
                    data_plantio: new Date().toISOString().split('T')[0],
                }),
            });

            if (!resp.ok) {
                const txt = await resp.text();
                throw new Error(`ERRO: ${resp.status} ${txt}`);
            }

            const created = await resp.json();
            setMsg(`Registro salvo com sucesso (ID: ${created[0]?.id || created.id || 'n/a'})`);
            setAnomalia("");
            setSeveridade(1);
        } catch (err) {
            let msgErro = "Falha ao salvar registro. Tente novamente mais tarde.";
            if (err?.message?.toLowerCase().includes("failed to fetch")) {
                msgErro = "Não foi possível conectar ao servidor. Verifique sua rede ou tente novamente.";
            } else if (err?.message) {
                msgErro = err.message;
            }
            setErro(msgErro);
            console.error('Erro salvar talhao:', err);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <div style={{ padding: "14px", maxWidth: "820px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "1.35rem", margin: 0 }}>Novo Ponto 🌽</h1>
                <button style={{ padding: "6px 10px", borderRadius: "10px", border: "none", background: "var(--color-error)", color: "white", cursor: "pointer", fontSize: "var(--font-size-xs)" }} onClick={handleLogout}>Sair</button>
            </div>

            <div style={{ marginTop: "14px", width: "100%" }}>
                <label style={{ display: "block", marginBottom: "4px", color: "var(--color-musgo-dark)", fontSize: "0.83rem" }}>Propriedade</label>

                {loadingPropriedades ? (
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px' }}>Carregando propriedades...</p>
                ) : propriedades.length === 0 ? (
                    <div style={{ marginBottom: '10px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>Nenhuma propriedade cadastrada ainda. Crie uma para começar.</p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <input
                                value={novaPropriedadeNome}
                                onChange={(e) => setNovaPropriedadeNome(e.target.value)}
                                placeholder="Digite o nome da propriedade"
                                style={{ flex: 1, padding: '7px', borderRadius: '7px', border: '1px solid var(--color-musgo-light)' }}
                            />
                            <button
                                onClick={handleCriarPropriedade}
                                disabled={savingPropriedade}
                                style={{ background: savingPropriedade ? '#9ca3af' : '#000000', color: '#ffffff', border: 'none', borderRadius: '7px', padding: '7px 12px', fontSize: '0.85rem', cursor: savingPropriedade ? 'not-allowed' : 'pointer' }}
                            >{savingPropriedade ? 'Criando...' : 'Criar'}</button>
                        </div>
                    </div>
                ) : (
                    <select value={propriedadeSelecionada} onChange={(e) => setPropriedadeSelecionada(e.target.value)} style={{ width: "100%", padding: "7px", marginTop: "4px", marginBottom: "10px", borderRadius: "7px", border: "1px solid var(--color-musgo-light)", color: "var(--color-text-dark)", background: "var(--color-bg-light)", fontSize: "0.9rem" }}>
                        <option value="">Selecione</option>
                        {propriedades.map((p) => (
                            <option key={p.id} value={p.id}>{p.nome || `ID ${p.id}`}</option>
                        ))}
                    </select>
                )}

                <label style={{ color: "var(--color-musgo-dark)", fontSize: "0.84rem" }}>Estágio</label>
                <select value={estagio} onChange={(e) => setEstagio(e.target.value)} style={{ width: "100%", padding: "7px", marginTop: "5px", marginBottom: "10px", borderRadius: "7px", border: "1px solid var(--color-musgo-light)", fontSize: "0.9rem", background: "var(--color-bg-light)", color: "var(--color-text-dark)" }}>
                    <option value="V1">V1</option>
                    <option value="V2">V2</option>
                    <option value="V3">V3</option>
                    <option value="V4">V4</option>
                    <option value="V5">V5</option>
                    <option value="V6">V6</option>
                    <option value="R1">R1</option>
                </select>

                <label style={{ color: "var(--color-musgo-dark)", fontSize: "0.84rem" }}>Anomalia</label>
                <input value={anomalia} onChange={(e) => setAnomalia(e.target.value)} placeholder="Ex: pragas, seca" style={{ width: "100%", padding: "7px", marginTop: "5px", marginBottom: "10px", borderRadius: "7px", border: "1px solid var(--color-musgo-light)", fontSize: "0.9rem", background: "var(--color-bg)", color: "var(--color-text-dark)" }} />

                <label style={{ color: "var(--color-musgo-dark)", fontSize: "0.84rem" }}>Severidade</label>
                <input type="number" value={severidade} min="1" max="5" onChange={(e) => setSeveridade(Number(e.target.value))} style={{ width: "100%", padding: "7px", marginTop: "5px", marginBottom: "11px", borderRadius: "7px", border: "1px solid var(--color-musgo-light)", fontSize: "0.9rem", background: "var(--color-bg)", color: "var(--color-text-dark)" }} />

                {erro && <p style={{ color: "#ef4444" }}>{erro}</p>}
                {msg && <p style={{ color: "#34d399" }}>{msg}</p>}

                <button onClick={handleSalvar} style={{ background: "var(--color-accent)", color: "white", padding: "10px 14px", border: "none", borderRadius: "8px", cursor: "pointer" }}>Salvar registro</button>
            </div>
        </div>
    );
}