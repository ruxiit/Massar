"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, Info, Warning, Prohibit, Check } from "@phosphor-icons/react";
import { notificationService, Notification } from "@/lib/notificationService";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { arDZ } from "date-fns/locale";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;

    fetchNotifications();

    // Set up Supabase real-time listener with a filter for the current user
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} className="text-success" />;
      case 'warning': return <Warning size={20} className="text-warning" />;
      case 'error': return <Prohibit size={20} className="text-danger" />;
      default: return <Info size={20} className="text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-text-muted hover:text-primary hover:bg-white rounded-full transition-all shadow-sm"
      >
        <Bell size={22} weight={unreadCount > 0 ? "fill" : "regular"} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-background animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 bg-white rounded-2xl shadow-premium border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-dark-navy flex items-center gap-2">
              الإشعارات
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Check size={14} />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-text-muted">
                <Bell size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.is_read ? 'bg-primary/[0.02]' : ''}`}
                >
                  {!notification.is_read && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>
                  )}
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold text-dark-navy mb-0.5 ${!notification.is_read ? 'pr-2' : ''}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {notification.content}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-text-muted">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: arDZ })}
                        </span>
                        {notification.link && (
                          <Link 
                            href={notification.link}
                            className="text-[10px] text-primary font-bold hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                            }}
                          >
                            عرض التفاصيل
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-gray-50/50 text-center">
              <button className="text-xs text-text-muted hover:text-dark-navy transition-colors">
                عرض كل الإشعارات
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
