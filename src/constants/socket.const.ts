export enum EMIT_SOCKET {
    REGISTER_USER = 'REGISTER_USER',
    UNREGISTER_USER = 'UNREGISTER_USER',
}

export enum SOCKET_TRIGGERS {
    SEND_NEW_CHAT_MESSAGE = 'SEND_NEW_CHAT_MESSAGE',
    DELETE_CHAT_MESSAGE = 'DELETE_CHAT_MESSAGE',
    INCREASE_UNSEEN_MESSAGE_COUNT = 'INCREASE_UNSEEN_MESSAGE_COUNT',
    MARK_AS_SEEN = 'MARK_AS_SEEN',
}
export type SocketTTriggerTypes = `${SOCKET_TRIGGERS}`;

/**
 * Events the client LISTENS for (incoming from Express socket server).
 * These mirror SOCKET_TRIGGERS but are typed separately so the
 * SocketProvider can subscribe declaratively.
 */
export enum LISTEN_SOCKET {
    SEND_NEW_CHAT_MESSAGE = 'SEND_NEW_CHAT_MESSAGE',
    DELETE_CHAT_MESSAGE = 'DELETE_CHAT_MESSAGE',
    INCREASE_UNSEEN_MESSAGE_COUNT = 'INCREASE_UNSEEN_MESSAGE_COUNT',
    MARK_AS_SEEN = 'MARK_AS_SEEN',
}
export type ListenSocketTypes = `${LISTEN_SOCKET}`;

export enum SOCKET_NAMESPACES {
    USER_ONLINE = 'user-online',
}
export type SocketNamespacesTypes = `${SOCKET_NAMESPACES}`;