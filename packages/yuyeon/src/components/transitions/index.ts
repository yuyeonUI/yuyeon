import { createExpandTransition } from './expand-transition';

export const YExpandVTransition = createExpandTransition(false);
export const YExpandHTransition = createExpandTransition(true);

export type YExpandVTransition = InstanceType<typeof YExpandVTransition>;
export type YExpandHTransition = InstanceType<typeof YExpandHTransition>;
