import { YIconCheckbox } from './YIconCheckbox';
import { YIconClear } from './YIconClear';
import { YIconDropdown } from './YIconDropdown';
import { YIconExpand } from './YIconExpand';
import { YIconPageControl } from './YIconPageControl';
import { YIconSort } from './YIconSort';

export * from './YIconExpand';
export * from './YIconClear';
export * from './YIconCheckbox';
export * from './YIconPageControl';
export * from './YIconSort';

export const builtSet = {
  expand: YIconExpand,
  dropdown: YIconDropdown,
  clear: YIconClear,
  checkbox: YIconCheckbox,
  pageControl: YIconPageControl,
  next: {
    component: YIconPageControl,
    props: {
      type: 'next',
    },
  },
  prev: {
    component: YIconPageControl,
    props: {
      type: 'prev',
    },
  },
  sort: YIconSort,
};
