import './Carousel.css';

interface CarouselProps {
  children: React.ReactNode | React.ReactNode[];
  gap?: number;
  snapAlign?: 'start' | 'center' | 'end';
  showScrollbar?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  gap = 12,
  snapAlign = 'start',
  showScrollbar = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        gap: `${gap}px`,
        paddingBottom: showScrollbar ? '0' : '12px',
        scrollbarWidth: showScrollbar ? 'auto' : 'none', // Firefox
        msOverflowStyle: showScrollbar ? 'auto' : 'none', // IE/Edge
      }}
      className={!showScrollbar ? 'hide-scrollbar' : ''}
    >
      {!Array.isArray(children) && (
        <div style={{ scrollSnapAlign: snapAlign }}>
          {children}
        </div>
      )}
      {Array.isArray(children) && children.map((child, idx) => (
        <div key={idx} style={{ scrollSnapAlign: snapAlign }}>
          {child}
        </div>
      ))}
    </div>
  );
};
