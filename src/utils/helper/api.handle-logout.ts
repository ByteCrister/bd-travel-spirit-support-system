import axios from "axios";

export async function apiHandleLogout() {
    try {
        // Tell the server to clear the HttpOnly cookie
        await axios.post(
            '/api/auth/logout',
            {},                      // no body needed
            { withCredentials: true } // include cookies
        )

        // Optional: clear any client-side tokens/state
        // e.g. localStorage.removeItem('accessToken')
        // e.g. reset your auth context

        // Redirect to login (or wherever makes sense)
        return true;
    } catch (err) {
        console.error('❌ Logout failed:', err)
        return false;
        // you might show a toast here
    }
}