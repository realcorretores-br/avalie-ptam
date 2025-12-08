import { useEffect, useState } from "react";
import { Bell, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type?: 'system' | 'admin';
  priority?: 'high' | 'medium' | 'low';
}

export const NotificationBell = () => {
  const { subscription } = useSubscription();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    addSystemNotifications();
  }, [subscription]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const dbNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        created_at: n.created_at,
        type: 'admin' as const,
        priority: 'high' as const,
      }));

      setNotifications(prev => {
        const systemNotifs = prev.filter(n => n.type === 'system');
        // Filter out read admin notifications so they don't reappear
        const unreadDbNotifications = dbNotifications.filter(n => !n.read);
        return [...unreadDbNotifications, ...systemNotifs];
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const addSystemNotifications = () => {
    if (!subscription) return;

    const systemNotifications: Notification[] = [];

    // Check for renewal warnings
    if (subscription.data_expiracao) {
      const daysUntilExpiration = differenceInDays(
        new Date(subscription.data_expiracao),
        new Date()
      );

      if (daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
        systemNotifications.push({
          id: 'renewal-warning',
          title: 'Renovação do Plano',
          message: `Seu plano expira em ${daysUntilExpiration} dias`,
          read: false,
          created_at: new Date().toISOString(),
          type: 'system',
          priority: daysUntilExpiration <= 3 ? 'high' : 'medium',
        });
      } else if (daysUntilExpiration <= 0) {
        systemNotifications.push({
          id: 'renewal-expired',
          title: 'Plano Expirado',
          message: 'Seu plano expirou! Renove para continuar usando',
          read: false,
          created_at: new Date().toISOString(),
          type: 'system',
          priority: 'high',
        });
      }
    }

    // Check for report limit warnings
    const reportsRemaining = subscription.relatorios_disponiveis - subscription.relatorios_usados;
    const reportsPercentage = (subscription.relatorios_usados / subscription.relatorios_disponiveis) * 100;

    if (reportsRemaining === 0) {
      systemNotifications.push({
        id: 'limit-reached',
        title: 'Limite Atingido',
        message: 'Você atingiu o limite de relatórios do seu plano',
        read: false,
        created_at: new Date().toISOString(),
        type: 'system',
        priority: 'high',
      });
    } else if (reportsPercentage >= 80) {
      systemNotifications.push({
        id: 'limit-warning',
        title: 'Aviso de Limite',
        message: `Restam apenas ${reportsRemaining} relatórios disponíveis`,
        read: false,
        created_at: new Date().toISOString(),
        type: 'system',
        priority: 'medium',
      });
    }

    setNotifications(prev => {
      const adminNotifs = prev.filter(n => n.type === 'admin');
      return [...adminNotifs, ...systemNotifications];
    });
  };

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification?.type === 'admin' && !notification.read) {
      // Mark as read in database for admin notifications
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Update state to mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.type === 'system') return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllRead = async () => {
    const readAdminNotifs = notifications.filter(n => n.type === 'admin' && n.read);
    
    try {
      await supabase
        .from('notifications')
        .delete()
        .in('id', readAdminNotifs.map(n => n.id));

      setNotifications(prev => prev.filter(n => n.type === 'system' || !n.read));
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-amber-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notificações</h3>
            {notifications.some(n => n.type === 'admin' && n.read) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={deleteAllRead}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar lidas
              </Button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação no momento
            </p>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read ? 'bg-muted/50' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => !notification.read && markAsRead(notification.id)}
                      >
                        <p className="font-medium text-sm mb-1">{notification.title}</p>
                        <p className={`text-sm ${notification.priority ? getPriorityColor(notification.priority) : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                        {notification.type === 'admin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
