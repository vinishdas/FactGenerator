import axios from "axios";


// This is just the template will update it as per Backend
// TODO:

async function useSource(){
    const getAllPosts = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getposts`,{
        withCredentials : true
    })

    const data = getAllPosts.data;

    return data;
}

export default useSource;