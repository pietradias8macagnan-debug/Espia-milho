import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    function handleLogin() {
        navigate("/dashboard");
    }

    return (
        <div>
            <h1>EspIA Milho 🌽</h1>

            <input placeholder="Email" />
            <input placeholder="Senha" />

            <button onClick={handleLogin}>Entrar</button>
        </div>
    );
}