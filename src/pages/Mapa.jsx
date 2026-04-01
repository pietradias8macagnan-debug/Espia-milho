import Layout from "../components/Layout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Mapa() {
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                navigate("/");
            }
        };
        checkSession();
    }, [navigate]);

    return (
        <Layout>
            <h2>Mapa da Lavoura 🌽</h2>

            <MapContainer
                center={[-16.47, -54.63]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[-16.47, -54.63]} />
            </MapContainer>
        </Layout>
    );
}