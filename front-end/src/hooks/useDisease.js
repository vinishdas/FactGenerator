import { useState, useEffect } from "react";
import axios from "axios";


export function useDiseases() {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/diseases`);
                console.log(response);

                setDiseases(response.data);
                
            } catch (error) {
                console.error("Error fetching diseases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiseases();
    }, []);

    return { diseases, loading };
}