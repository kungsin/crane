import dayjs from 'dayjs';

import { QueryWindow } from '../models';

export const rangeMap = {
  [QueryWindow.LAST_12_HOURS]: [dayjs(+dayjs() - 3600 * 12 * 1000), dayjs()],
  [QueryWindow.LAST_1_DAY]: [dayjs(+dayjs() - 3600 * 24 * 1000), dayjs()],
  [QueryWindow.LAST_7_DAY]: [dayjs().subtract(7, 'd').startOf('day'), dayjs()],
  [QueryWindow.LAST_30_DAY]: [dayjs().subtract(30, 'd').startOf('day'), dayjs()],
  [QueryWindow.PRE_7_DAY]: [dayjs(), dayjs().add(7, 'd').endOf('day')],
  [QueryWindow.PRE_14_DAY]: [dayjs(), dayjs().add(14, 'd').endOf('day')],
};
