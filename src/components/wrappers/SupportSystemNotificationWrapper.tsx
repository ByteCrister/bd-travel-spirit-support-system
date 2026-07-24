"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/socket/initiateSocket";
import { useSupportSystemNotificationStore } from "@/store/support-system-notification.store";
import { ADMIN_NOTIFICATION_TYPE } from "@/constants/support-system-notification.const";
import { SOCKET_NAMESPACES } from "@/constants/socket.const";
import { SupportSystemNotificationType } from "@/types/notification.types";

interface SupportSystemNotificationWrapperProps {
  children: React.ReactNode;
}

export function SupportSystemNotificationWrapper({ children }: SupportSystemNotificationWrapperProps) {
  const { fetchInitial, addNotificationFromSocket, notifications } = useSupportSystemNotificationStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchedRef.current && notifications.length === 0) {
      fetchInitial();
      fetchedRef.current = true;
    }
  }, [fetchInitial, notifications.length]);

  useEffect(() => {
    const socket = getSocket(SOCKET_NAMESPACES.USER_ONLINE);
    if (!socket) return;
    
    const handleNew = (payload: { data: SupportSystemNotificationType }) => {
      addNotificationFromSocket(payload.data);
    };
    
    socket.on(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNew);
    socket.on(ADMIN_NOTIFICATION_TYPE.SUPPORT_EMP_FORGOT_PASSWORD, handleNew);
    socket.on(ADMIN_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD, handleNew);
    socket.on(ADMIN_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED, handleNew);
    socket.on(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNew);
    
    return () => {
      socket.off(ADMIN_NOTIFICATION_TYPE.NEW_GUIDE_REGISTRATION, handleNew);
      socket.off(ADMIN_NOTIFICATION_TYPE.SUPPORT_EMP_FORGOT_PASSWORD, handleNew);
      socket.off(ADMIN_NOTIFICATION_TYPE.GUIDE_FORGOT_PASSWORD, handleNew);
      socket.off(ADMIN_NOTIFICATION_TYPE.NEW_TOUR_REQUESTED, handleNew);
      socket.off(ADMIN_NOTIFICATION_TYPE.SYSTEM_ERROR, handleNew);
    };
  }, [addNotificationFromSocket]);

  return <>{children}</>;
}
