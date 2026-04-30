export enum EMIT_SOCKET {
    REGISTER_USER = 'REGISTER_USER',
    UNREGISTER_USER = 'UNREGISTER_USER',
}

export enum SOCKET_TRIGGERS {
    SEND_NEW_CHAT_MESSAGE = 'SEND_NEW_CHAT_MESSAGE',
    DELETE_CHAT_MESSAGE = 'DELETE_CHAT_MESSAGE',
    INCREASE_UNSEEN_MESSAGE_COUNT = 'INCREASE_UNSEEN_MESSAGE_COUNT',
    MARK_AS_SEEN = 'MARK_AS_SEEN',

    USER_CONNECTED = 'USER_CONNECTED',
    USER_DISCONNECTED = 'USER_DISCONNECTED',
}
export type SocketTTriggerTypes = `${SOCKET_TRIGGERS}`;

/**
 * Events the client LISTENS for (incoming from Express socket server).
 * These mirror SOCKET_TRIGGERS but are typed separately so the
 * SocketProvider can subscribe declaratively.
 */
export enum LISTEN_SOCKET_CHAT_EVENT {
    SEND_NEW_CHAT_MESSAGE = 'SEND_NEW_CHAT_MESSAGE',
    DELETE_CHAT_MESSAGE = 'DELETE_CHAT_MESSAGE',
    INCREASE_UNSEEN_MESSAGE_COUNT = 'INCREASE_UNSEEN_MESSAGE_COUNT',
    MARK_AS_SEEN = 'MARK_AS_SEEN',
}
export type ListenSocketChatEventTypes = `${LISTEN_SOCKET_CHAT_EVENT}`;

export enum LISTEN_SOCKET_AGET_EVENT {
    USER_CONNECTED = 'USER_CONNECTED',
    USER_DISCONNECTED = 'USER_DISCONNECTED',
}
export type ListenSocketAgentEventTypes = `${LISTEN_SOCKET_AGET_EVENT}`;


export enum SOCKET_NAMESPACES {
    USER_ONLINE = 'user-online',
}
export type SocketNamespacesTypes = `${SOCKET_NAMESPACES}`;