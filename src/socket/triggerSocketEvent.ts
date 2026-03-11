// G:\Projects\meeting-sync\src\utils\socket\triggerSocketEvent.ts (next.js)
import { SOCKET_NAMESPACES, SocketNamespaces, SocketTTriggerTypes } from "@/constants/socket.const";
import axios from "axios";

interface TriggerSocketParams {
    userId: string;
    type: SocketTTriggerTypes;
    triggeredData: unknown;
    namespace?: SocketNamespaces;
}

export const triggerSocketEvent = async ({
    userId,
    type,
    triggeredData,
    namespace = SOCKET_NAMESPACES.USER_CHAT,
}: TriggerSocketParams) => {
    try {
        await axios.post(
            `${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || process.env.SOCKET_SERVER_URL}/api/trigger-event`,
            {
                userId,
                type,
                triggeredData,
                namespace,
            },
            {
                headers: {
                    "x-api-key": process.env.SOCKET_API_SECRET_KEY || process.env.NEXT_PUBLIC_SOCKET_API_SECRET_KEY,
                },
            }
        );

    } catch (err) {
        console.error("Error triggering socket event via Express:", err);
    }
};