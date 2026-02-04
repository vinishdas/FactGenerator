import { useState, useEffect } from "react";
import axios from "axios";


export function useStages(id) {
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDiseases = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ontology/diseases/${id}/stages`);

                const apiStages = response.data;

                const normalized = {
                    name: apiStages[0]?.disease_name ?? "Unknown Disease",
                    stages: apiStages.map(stage => ({
                        id: stage.id,
                        title: stage.name,
                        description: "Description not available",
                        status: "Early",
                        severity: "Unknown",
                    })),
                };
                setStages(normalized);

            } catch (error) {
                console.error("Error fetching diseases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDiseases();
    }, []);

    return { stages, loading };
}