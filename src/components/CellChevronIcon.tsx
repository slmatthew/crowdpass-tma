import type { FC } from 'react';

import { classNames } from '@/css/classnames.ts';
import { useMemo } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { ChevronRight } from 'lucide-react';

export type CellChevronIconProps = {
  className?: string,
};

export const CellChevronIcon: FC<CellChevronIconProps> = ({ className }) => {
  const platform = useMemo(() => retrieveLaunchParams().tgWebAppPlatform, []);
  const isIOS = ['ios', 'macos'].includes(platform);

  if(isIOS) {
    return <ChevronRight className={classNames('icon__hint', className)} />;
  }

  return <></>;
};