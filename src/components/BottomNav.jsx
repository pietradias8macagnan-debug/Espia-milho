import { useNavigate } from "react-router-dom";

export default function BottomNav() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "10px",
                background: "#020617",
                borderTop: "1px solid #1e293b"
            }}
        >
            <button onClick={() => navigate("/dashboard")} style={btn}>

            </button>

            <button onClick={() => navigate("/mapa")} style={btn}>

            </button>

            <button onClick={() => navigate("/monitoramento")} style={btn}>

            </button>
        </div>
    );
}

const btn = {
    background: "none",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer"
};