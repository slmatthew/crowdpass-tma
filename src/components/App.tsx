import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark, retrieveRawInitData, postEvent } from '@telegram-apps/sdk-react';
import { AppRoot, Button, Placeholder } from '@telegram-apps/telegram-ui';

import { routes } from '@/navigation/routes.tsx';
import { useAuth } from '@/contexts/AuthContext';
import axios, { AxiosError } from 'axios';
import { appConfig } from '@/config/appConfig';
import { lightColors, darkColors } from '@/types/colors';
import { ModalProvider } from '@/contexts/ModalsContext';
import { CartProvider } from '@/contexts/CartContext';

export function App() {
  const { isAuthenticated, login } = useAuth();
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const rawInitData = useMemo(() => retrieveRawInitData(), []);
  const isDark = useSignal(isMiniAppDark);
  const platform = lp.tgWebAppPlatform;
  const isIOS = ['ios', 'macos'].includes(platform);

  const [authResult, setAuthResult] = useState<{ accessToken: string, refreshToken: string } | null>(null);
  const [authError, setAuthError] = useState<{ message: string } | null>(null);

  const reloadPage = () => {
    postEvent('iframe_will_reload');
    location.reload();
  };
  
  useEffect(() => {
    if(!isAuthenticated) {
      const client = axios.create({
        baseURL: appConfig.apiBaseUrl,
        headers: {
          Authorization: `tma ${rawInitData}`,
        },
      });

      client.post<{ accessToken: string, refreshToken: string }>('auth/tma')
        .then(res => setAuthResult(res.data))
        .catch((err: any) => {
          setAuthResult(null);
          if(err instanceof AxiosError) {
            setAuthError(err.response?.data);
          }
        });
    }
  }, [isAuthenticated, rawInitData]);

  useEffect(() => {
    if (authResult) {
      login(authResult.accessToken, authResult.refreshToken);
    }
  }, [authResult, login]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = isDark ? darkColors : lightColors;

    //const headerColor = isDark ? '#AF52DE' : '#BF5AF2';
    postEvent('web_app_set_header_color', { color_key: 'secondary_bg_color' });

    Object.entries(colors).forEach(([name, value]) => {
      root.style.setProperty(`--${name}`, value);
    });

    root.style.setProperty('--sfx-platform-background', isIOS ? 'inherit' : 'var(--tgui--section_bg_color, white)');
    root.style.setProperty('--sfx-modal-padding', isIOS ? '1rem' : '0');
  }, [isDark]);

  if(authError) return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <Placeholder
        header="Возникла ошибка"
        description={authError.message}
        action={<Button onClick={() => reloadPage()}>Попробовать ещё раз</Button>}
      />
    </AppRoot>
  );

  if(!isAuthenticated) {
    return (
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
      >
        <Placeholder
          header="Ещё немного..."
          description="Подгружаем необходимые данные"
        />
      </AppRoot>
    );
  }

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <ModalProvider>
        <HashRouter>
          <CartProvider>
            <Routes>
              {routes.map((route) => <Route key={route.path} {...route} />)}
              <Route path="*" element={<Navigate to="/"/>}/>
            </Routes>
          </CartProvider>
        </HashRouter>
      </ModalProvider>
    </AppRoot>
  );
}
