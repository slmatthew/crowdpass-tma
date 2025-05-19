import { useAuth } from "@/contexts/AuthContext";
import { on, postEvent } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useSettingsButton() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(!isAuthenticated || !user) {
      postEvent('web_app_setup_settings_button', { is_visible: false })
      return () => {};
    }
    
    if(!user.admin) {
      postEvent('web_app_setup_settings_button', { is_visible: false })
      return () => {};
    }

    const removeSettingsButtonListener = on('settings_button_pressed', _ => navigate('/sfx/qr'));

    postEvent('web_app_setup_settings_button', { is_visible: true });

    return () => {
      removeSettingsButtonListener();
    };
  }, [isAuthenticated, user]);
}