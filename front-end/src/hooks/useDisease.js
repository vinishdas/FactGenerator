import { useState, useEffect } from "react";
import axios from "axios";


export function useDiseases() {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ontology/diseases`);

                setDiseases(response.data);

            } catch (error) {
                console.error("Error fetching diseases:", error);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1000)
            }
        };

        fetchDiseases();
    }, []);

    return { diseases, loading };
}