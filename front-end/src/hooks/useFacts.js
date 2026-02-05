import { useState, useEffect } from "react";
import axios from "axios";


export function useGetFacts() {
    const [ _loading, setLoading] = useState(true);

    const fetchFacts = async (jobId) => {
        setLoading(true);

        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/facts/job/${jobId}`);
            
            return response.data;

        } catch (error) {
            console.error("Error fetching facts:", error);
        } finally {
            setLoading(false);
        }
    };
    return { fetchFacts , _loading }
}