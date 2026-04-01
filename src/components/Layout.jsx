import BottomNav from "./BottomNav";

export default function Layout({ children }) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0f172a",
                color: "white",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Topo */}
            <div
                style={{
                    padding: "20px",
                    fontSize: "20px",
                    fontWeight: "bold"
                }}
            >
                EspIA Milho
            </div>

            {/* Conteúdo */}
            <div style={{ flex: 1, padding: "15px" }}>
                {children}
            </div>

            {/* Menu */}
            <BottomNav />
        </div>
    );
}