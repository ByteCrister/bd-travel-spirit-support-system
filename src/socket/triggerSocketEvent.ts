// G:\Projects\bd-travel-spirit-support-system\src\socket\triggerSocketEvent.ts (next.js)
import { SOCKET_NAMESPACES, SocketNamespacesTypes, SocketTTriggerTypes } from "@/constants/socket.const";
import axios from "axios";

interface TriggerSocketParams {
    userId?: string;
    ownerId?: string;
    type: SocketTTriggerTypes;
    data: unknown;
    namespace?: SocketNamespacesTypes;
}

export const triggerSocketEvent = async ({
    userId,
    ownerId,
    type,
    data,
    namespace = SOCKET_NAMESPACES.USER_ONLINE,
}: TriggerSocketParams) => {
    try {
        const SOCKET_API_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || process.env.SOCKET_SERVER_URL
        const SOCKET_API_KEY = process.env.SOCKET_API_SECRET_KEY || process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY

        if (!SOCKET_API_URL || !SOCKET_API_KEY) {
            console.error("Socket API URL or Key is not defined");
            return;
        }

        await axios.post(
            `${SOCKET_API_URL}/api/trigger-socket-event`,
            {
                userId,
                ownerId,
                type,
                data,
                namespace,
            },
            {
                headers: {
                    "x-api-key": SOCKET_API_KEY,
                },
            }
        );

    } catch (err) {
        console.error("Error triggering socket event via Express:", err);
    }
};