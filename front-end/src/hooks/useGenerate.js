import { useState } from "react";
import axios from "axios";

export function useFacts() {
    const [jobId, setJobId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateFacts = async ({ disease, stage, keywords, max_facts, file }) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();

        formData.append("disease", disease);
        formData.append("stage", String(stage)); 
        formData.append("keywords", keywords || "");
        formData.append("max_facts", max_facts);

        if(file)
            formData.append("file",file);


        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/facts/generate`, formData ,{
                headers :{
                    "Content-Type" : "multipart/form-data",
                }
            });
            const newJobId = response.data.job_id;
            setJobId(newJobId);
            return newJobId;

        } catch (error) {
            console.error("Error fetching facts:", error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    return { generateFacts }
}