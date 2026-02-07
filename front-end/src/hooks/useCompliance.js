import { useState } from "react";
import axios from "axios";

export function useCompliance() {
    const [scanning, setScanning] = useState(false);

    const scanUrl = async (url) => {
        setScanning(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/compliance/scan`, {
                url: url
            });
            return response.data;
        } catch (error) {
            console.error("Compliance Scan Failed:", error);
            // Return failure object effectively as a fallback for UI to handle
            return { status: "ERROR", error: error.message }; 
        } finally {
            setScanning(false);
        }
    };

    return { scanUrl, scanning };
}
