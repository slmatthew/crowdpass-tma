import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { on, postEvent } from "@telegram-apps/sdk-react";

interface BridgeContextType {
  requestFullscreen: () => any;
  isFullscreen: boolean;

  reloadIframe: () => any;
}

const BridgeContext = createContext<BridgeContextType | undefined>(undefined);

export function BridgeProvider({ children }: { children: ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const reloadIframe = () => {
    postEvent('iframe_will_reload');
    location.reload();
  };

  /**
   * @TODO при переходе в fullscreen необходимо добавлять отступы,
   * @TODO соответствующие safeInset и viewport устройства
   * @TODO в идеале нужно обрабатывать это в App сразу после
   * @TODO requestFullscreen
   */

  const requestFullscreen = () => {
    postEvent('web_app_request_fullscreen');
    setIsFullscreen(isFullscreen);
  }

  useEffect(() => {
    on('fullscreen_failed', ({ error }) => {
      setIsFullscreen(error === 'ALREADY_FULLSCREEN');
    })
  }, []);

  return (
    <BridgeContext.Provider
      value={{ isFullscreen, requestFullscreen, reloadIframe }}
    >
      {children}
    </BridgeContext.Provider>
  );
}

export function useBridge() {
  const context = useContext(BridgeContext);
  if (!context) {
    throw new Error("useBridge должен использоваться внутри <BridgeProvider>");
  }
  return context;
}