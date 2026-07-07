import { createExpandTransition } from './expand-transition';
import { createSlideDirectionTransition } from './slide-transition';

export const YExpandVTransition = createExpandTransition(false);
export const YExpandHTransition = createExpandTransition(true);

export type YExpandVTransition = InstanceType<typeof YExpandVTransition>;
export type YExpandHTransition = InstanceType<typeof YExpandHTransition>;

export const YSlideVTransition = createSlideDirectionTransition('v'); // side: 'top' | 'bottom'
export const YSlideHTransition = createSlideDirectionTransition('h'); // side: 'left' | 'right'
