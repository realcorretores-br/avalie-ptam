<<<<<<< HEAD
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
    id: number;
    enable_profile: boolean;
    enable_subscription: boolean;
    enable_payment_history: boolean;
    enable_notes: boolean;
    site_logo?: string;
    site_favicon?: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
    id: 1,
    enable_profile: true,
    enable_subscription: true,
    enable_payment_history: true,
    enable_notes: true,
    site_logo: undefined,
    site_favicon: undefined
};

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings' as any)
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.warn('Could not fetch system settings, using defaults:', error.message);
                // If table doesn't exist or row missing, ensure we fallback
                setSettings(DEFAULT_SETTINGS);
            } else if (data) {
                setSettings(data as SystemSettings);
            }
        } catch (error) {
            console.error('Error in useSystemSettings:', error);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        const channel = supabase
            .channel('system_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'system_settings'
                },
                () => {
                    fetchSettings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { settings, loading, refetch: fetchSettings };
};
=======
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemSettings {
    id: number;
    enable_profile: boolean;
    enable_subscription: boolean;
    enable_payment_history: boolean;
    enable_notes: boolean;
    site_logo?: string;
    site_favicon?: string;
}

const DEFAULT_SETTINGS: SystemSettings = {
    id: 1,
    enable_profile: true,
    enable_subscription: true,
    enable_payment_history: true,
    enable_notes: true,
    site_logo: undefined,
    site_favicon: undefined
};

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('system_settings' as any)
                .select('*')
                .eq('id', 1)
                .single();

            if (error) {
                console.warn('Could not fetch system settings, using defaults:', error.message);
                // If table doesn't exist or row missing, ensure we fallback
                setSettings(DEFAULT_SETTINGS);
            } else if (data) {
                setSettings(data as SystemSettings);
            }
        } catch (error) {
            console.error('Error in useSystemSettings:', error);
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        const channel = supabase
            .channel('system_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'system_settings'
                },
                () => {
                    fetchSettings();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { settings, loading, refetch: fetchSettings };
};
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
