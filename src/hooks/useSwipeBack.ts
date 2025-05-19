import { retrieveLaunchParams } from "@telegram-apps/sdk-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export function useSwipeBack(back: boolean = true) {
  if(!back) return;

  const navigate = useNavigate();

  const lp = useMemo(() => retrieveLaunchParams(), []);
  const platform = lp.tgWebAppPlatform;
  const isIOS = ['ios', 'macos'].includes(platform);

  useEffect(() => {
    if(!isIOS) return () => {};

    let startX: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if(startX !== null) {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;

        if(deltaX > 50) {
          navigate(-1);
        }

        startX = null;
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);
}