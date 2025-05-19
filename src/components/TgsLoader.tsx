import { useEffect, useRef, useState, CSSProperties } from "react";
import lottie from "lottie-web";
import pako from "pako";

const tgsCache = new Map<string, any>();

interface TgsLoaderProps {
  tgsUrl: string;
  style?: CSSProperties;
}

export function TgsLoader({ tgsUrl, style }: TgsLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndRender() {
      try {
        let animationData = tgsCache.get(tgsUrl);

        if(!animationData) {
          const response = await fetch(tgsUrl);
          const buffer = await response.arrayBuffer();
          const compressedData = new Uint8Array(buffer);
          const decompressedData = pako.inflate(compressedData, { to: "string" });
          animationData = JSON.parse(decompressedData);

          tgsCache.set(tgsUrl, animationData);
        }

        if(containerRef.current) {
          const animation = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData,
          });

          animation.addEventListener('DOMLoaded', () => {
            const svg = containerRef.current?.querySelector('svg');
            if(svg) {
              svg.style.width = '100%';
              svg.style.height = '100%';
              svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }
          });
        }
      } catch(err: any) {
        console.error("Ошибка загрузки или декодирования:", err);
        setError("Не удалось загрузить стикер.");
      }
    }

    loadAndRender();
  }, [tgsUrl]);

  return (
    <div style={{ overflow: "hidden", ...style }}>
      {error ? (
        <div>{error}</div>
      ) : (
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}