import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useStages(id) {
    const [stages, setStages] = useState([]);
    const [isloading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refetch = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        const fetchStages = async () => {
            if (!id) 
                return;

            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/ontology/diseases/${id}/stages`);
                const apiStages = response.data;

                const normalizedStages = apiStages.map(stage => ({
                    id: stage.id,
                    name: stage.name, // Ensure raw name is kept for STAGE_DESCRIPTIONS mapping in Home
                    title: stage.name,
                    disease_name: stage.disease_name, 
                    description: stage.description || "Description not available",
                    status: stage.status || "Unknown",
                    severity: stage.severity || "Unknown",
                    // Map the pending facts count from backend
                    pending_facts: stage.pending_facts || 0
                }));
                
                setStages(normalizedStages);
            } catch (error) {
                console.error("Error fetching stages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStages();
    }, [id, refreshTrigger]); 

    return { stages, isloading, refetch };
}