import type { FC } from 'react';
import { Cell, CellProps } from '@telegram-apps/telegram-ui';
import React, { useMemo } from 'react';
import { retrieveLaunchParams, themeParamsButtonColor, themeParamsHintColor } from '@telegram-apps/sdk-react';

export type IconCellProps = JSX.IntrinsicElements['div'] & CellProps & {
  icon: React.ReactNode;
  color?: string;
};

export const IconCell: FC<IconCellProps> = ({ icon, color, className, ...rest }) => {
  const platform = useMemo(() => retrieveLaunchParams().tgWebAppPlatform, []);
  const isIOS = ['ios', 'macos'].includes(platform);

  const accentColor = themeParamsButtonColor() || '#2AABEE';
  const secondaryColor = themeParamsHintColor()|| accentColor;
  const iconColor = isIOS ? '#FFFFFF' : accentColor;
  const backgroundColor = (color && color.startsWith('var', 0)) ? color : `rgba(${hexToRgb(color ?? accentColor)}, 1)`;
  
  const beforeContent = isIOS ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        borderRadius: '20%',
        width: '32px',
        height: '32px',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        color: iconColor,
      }}>
        {icon}
      </div>
    </div>
  ) : (
    <span style={{ color: secondaryColor }}>
      {icon}
    </span>
  );

  return (
    <Cell
      {...rest}
      className={className}
      before={beforeContent}
    />
  );
};

function hexToRgb(hex: string): string {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}