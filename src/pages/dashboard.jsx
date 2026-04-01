import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export default function Dashboard() {
    const navigate = useNavigate();
    const [apiStatus, setApiStatus] = useState("conectando...");
    const [propriedades, setPropriedades] = useState([]);
    const [apiError, setApiError] = useState("");
    const [novaPropriedade, setNovaPropriedade] = useState("");
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [propriedadeSelecionada, setPropriedadeSelecionada] = useState("");
    const [talhoes, setTalhoes] = useState([]);
    const [loadingTalhoes, setLoadingTalhoes] = useState(false);
    const [novoTalhaoDescr, setNovoTalhaoDescr] = useState("");
    const [buscaTalhao, setBuscaTalhao] = useState("");

    useEffect(() => {
        const getSession = async () => {
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

            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            };

            try {
                const respHealth = await fetch(`${API_BASE}/health`, {
                    method: "GET",
                    headers,
                });
                const healthData = await respHealth.json();
                setApiStatus(healthData.status === "ok" ? "API disponível" : "API com resposta inesperada");

                const respProp = await fetch(`${API_BASE}/propriedades`, {
                    method: "GET",
                    headers,
                });
                if (!respProp.ok) {
                    const errBody = await respProp.text();
                    throw new Error(`${respProp.status} ${errBody}`);
                }
                const lista = await respProp.json();
                const props = Array.isArray(lista) ? lista : [];
                setPropriedades(props);
                if (props.length > 0) {
                    setPropriedadeSelecionada(props[0].id);
                }
            } catch (err) {
                // Esconde erro de conexão para não poluir a interface.
                // Mantém status de offline e usará fallback suave.
                setApiStatus("offline");
                setApiError("");
                console.warn('dashboard: conexão não disponível', err);
            }
        };
        getSession();
    }, [navigate]);

    useEffect(() => {
        const getTalhoes = async () => {
            if (!propriedadeSelecionada) {
                setTalhoes([]);
                return;
            }

            const { data } = await supabase.auth.getSession();
            const token = data?.session?.access_token;
            if (!token) {
                setTalhoes([]);
                return;
            }

            setLoadingTalhoes(true);
            try {
                const resp = await fetch(`${API_BASE}/propriedades/${propriedadeSelecionada}/talhoes`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!resp.ok) {
                    throw new Error(`Erro ${resp.status}`);
                }
                const t = await resp.json();
                setTalhoes(Array.isArray(t) ? t : []);
            } catch (err) {
                if (err?.message?.toLowerCase().includes("failed to fetch")) {
                    setApiError("");
                    setApiStatus("offline");
                } else {
                    setApiError(err.message || "Erro ao carregar talhões");
                }
            } finally {
                setLoadingTalhoes(false);
            }
        };

        getTalhoes();
    }, [propriedadeSelecionada]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <Layout>
            {/* Header elegante e clássico */}
            <header style={{
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
                padding: "16px 0",
                marginBottom: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
                <div style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "0 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: "600",
                        color: "#000000",
                        margin: 0,
                        fontFamily: "var(--font-family-heading, 'Playfair Display', serif)"
                    }}>
                        EspIA Milho - Monitoramento
                    </h1>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            cursor: "pointer",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            transition: "background-color 0.2s"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#f9fafb"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#ffffff"}
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Conteúdo principal */}
            <main style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 20px"
            }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px",
                    marginBottom: "32px"
                }}>
                    {/* Card Mapa */}
                    <div
                        onClick={() => navigate("/mapa")}
                        style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "24px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transition: "box-shadow 0.2s, transform 0.2s",
                            textAlign: "center"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{
                            fontSize: "2rem",
                            marginBottom: "12px",
                            color: "#000000"
                        }}>
                            🗺️
                        </div>
                        <h3 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#000000",
                            margin: "0 0 8px 0"
                        }}>
                            Mapa
                        </h3>
                        <p style={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            margin: 0
                        }}>
                            Visualizar lavoura
                        </p>
                    </div>

                    {/* Card Novo Registro */}
                    <div
                        onClick={() => navigate("/monitoramento")}
                        style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "24px",
                            cursor: "pointer",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transition: "box-shadow 0.2s, transform 0.2s",
                            textAlign: "center"
                        }}
                        onMouseOver={(e) => {
                            e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{
                            fontSize: "2rem",
                            marginBottom: "12px",
                            color: "#000000"
                        }}>
                            ➕
                        </div>
                        <h3 style={{
                            fontSize: "1.25rem",
                            fontWeight: "600",
                            color: "#000000",
                            margin: "0 0 8px 0"
                        }}>
                            Novo Registro
                        </h3>
                        <p style={{
                            color: "#6b7280",
                            fontSize: "0.9rem",
                            margin: 0
                        }}>
                            Adicionar ponto
                        </p>
                    </div>
                </div>

                {/* Status da Aplicação */}
                <div style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                    <h3 style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#000000",
                        margin: "0 0 16px 0"
                    }}>
                        Status da Aplicação
                    </h3>
                    <div style={{ marginBottom: "16px" }}>
                        <p style={{
                            color: "#374151",
                            fontSize: "0.9rem",
                            margin: "0 0 4px 0"
                        }}>
                            API: <span style={{ fontWeight: "600", color: "#000000" }}>{apiStatus}</span>
                        </p>
                        {apiError && <p style={{
                            color: "#dc2626",
                            fontSize: "0.9rem",
                            margin: "4px 0"
                        }}>Erro: {apiError}</p>}
                        {successMessage && <p style={{
                            color: "#059669",
                            fontSize: "0.9rem",
                            margin: "4px 0"
                        }}>{successMessage}</p>}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color: "#000000",
                            marginBottom: "8px"
                        }}>
                            Nova Propriedade
                        </label>
                        <input
                            value={novaPropriedade}
                            onChange={(e) => setNovaPropriedade(e.target.value)}
                            placeholder="Nome da propriedade"
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                color: "#000000",
                                backgroundColor: "#ffffff",
                                fontSize: "0.9rem",
                                marginBottom: "10px",
                                boxSizing: "border-box"
                            }}
                        />
                        <button
                            onClick={async () => {
                                if (!novaPropriedade.trim()) {
                                    setApiError("Digite um nome válido para a propriedade.");
                                    return;
                                }
                                setSaving(true);
                                setApiError("");
                                setSuccessMessage("");

                                const { data: sessionData } = await supabase.auth.getSession();
                                if (!sessionData?.session?.access_token) {
                                    setApiError("Sessão inválida. Faça login novamente.");
                                    setSaving(false);
                                    return;
                                }

                                try {
                                    const resp = await fetch(`${API_BASE}/propriedades`, {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${sessionData.session.access_token}`,
                                        },
                                        body: JSON.stringify({ nome: novaPropriedade.trim() }),
                                    });
                                    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
                                    const created = await resp.json();
                                    setPropriedades((old) => [...old, created[0] || created]);
                                    setSuccessMessage(`Propriedade '${novaPropriedade.trim()}' criada.`);
                                    setNovaPropriedade("");
                                } catch (err) {
                                    setApiError(err.message || "Falha ao criar propriedade.");
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            style={{
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#374151"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#000000"}
                            disabled={saving}
                        >
                            {saving ? "Salvando..." : "Criar Propriedade"}
                        </button>
                    </div>

                    <p style={{
                        color: "#374151",
                        fontSize: "0.9rem",
                        margin: "0 0 16px 0"
                    }}>
                        Propriedades cadastradas: <strong style={{ color: "#000000" }}>{propriedades.length}</strong>
                    </p>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color: "#000000",
                            marginBottom: "8px"
                        }}>
                            Propriedade para talhões
                        </label>
                        <select
                            value={propriedadeSelecionada}
                            onChange={(e) => setPropriedadeSelecionada(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                color: "#000000",
                                backgroundColor: "#ffffff",
                                fontSize: "0.9rem",
                                boxSizing: "border-box"
                            }}
                        >
                            <option value="">Selecione</option>
                            {propriedades.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome || `ID ${p.id}`}</option>
                            ))}
                        </select>
                    </div>

                    <section>
                        <h4 style={{
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            color: "#000000",
                            margin: "0 0 12px 0"
                        }}>
                            Talhões
                        </h4>
                        {talhoes.length > 0 && (
                            <input 
                                placeholder="Buscar talhão..."
                                value={buscaTalhao}
                                onChange={e => setBuscaTalhao(e.target.value)}
                                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db", marginBottom: "12px", boxSizing: "border-box" }}
                            />
                        )}
                        {loadingTalhoes ? (
                            <p style={{
                                color: "#6b7280",
                                fontSize: "0.9rem",
                                margin: 0
                            }}>
                                Carregando talhões...
                            </p>
                        ) : talhoes.length === 0 ? (
                            <p style={{
                                color: "#6b7280",
                                fontSize: "0.9rem",
                                margin: 0
                            }}>
                                Nenhum talhão encontrado para essa propriedade.
                            </p>
                        ) : (
                            <ul style={{
                                margin: "0",
                                padding: "0",
                                listStyle: "none",
                                fontSize: "0.85rem",
                                color: "#374151"
                            }}>
                                {talhoes.filter((t) => !buscaTalhao || t.nome?.toLowerCase().includes(buscaTalhao.toLowerCase())).map((t) => (
                                    <li key={t.id} style={{
                                        padding: "8px 0",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}>
                                        <strong>{t.nome || "Sem descrição"}</strong>
                                        {t.created_at && (
                                            <span style={{ color: "#6b7280", fontSize: "0.8rem", marginLeft: "10px" }}>
                                                {new Date(t.created_at).toLocaleDateString()}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <div style={{ marginTop: "20px" }}>
                        <label style={{
                            display: "block",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            color: "#000000",
                            marginBottom: "8px"
                        }}>
                            Novo talhão (descrição):
                        </label>
                        <input
                            value={novoTalhaoDescr}
                            onChange={(e) => setNovoTalhaoDescr(e.target.value)}
                            placeholder="ex: talhão norte com praga"
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "6px",
                                border: "1px solid #d1d5db",
                                color: "#000000",
                                backgroundColor: "#ffffff",
                                fontSize: "0.9rem",
                                marginBottom: "10px",
                                boxSizing: "border-box"
                            }}
                        />
                        <button
                            onClick={async () => {
                                setApiError("");
                                setSuccessMessage("");
                                if (!propriedadeSelecionada) {
                                    setApiError("Escolha uma propriedade para criar talhão.");
                                    return;
                                }
                                if (!novoTalhaoDescr.trim()) {
                                    setApiError("Digite uma descrição para o talhão.");
                                    return;
                                }
                                const { data } = await supabase.auth.getSession();
                                const token = data?.session?.access_token;
                                if (!token) {
                                    setApiError("Sessão inválida. Faça login novamente.");
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
                                            nome: novoTalhaoDescr.trim()
                                        }),
                                    });
                                    if (!resp.ok) {
                                        const txt = await resp.text();
                                        throw new Error(`Erro ${resp.status} ${txt}`);
                                    }
                                    const created = await resp.json();
                                    const newTalhao = Array.isArray(created) ? created[0] : created;
                                    setTalhoes((old) => [...old, newTalhao]);
                                    setSuccessMessage("Talhão criado com sucesso.");
                                    setNovoTalhaoDescr("");
                                } catch (err) {
                                    setApiError(err.message || "Falha ao criar talhão.");
                                }
                            }}
                            style={{
                                backgroundColor: "#000000",
                                color: "#ffffff",
                                border: "none",
                                padding: "10px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#374151"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#000000"}
                        >
                            Criar talhão simples
                        </button>
                    </div>

                    {apiError && (
                        <p style={{
                            color: "#dc2626",
                            fontSize: "0.9rem",
                            margin: "16px 0 0 0",
                            fontWeight: "500"
                        }}>
                            {apiError}
                        </p>
                    )}
                </div>
            </main>
        </Layout>
    );
}
