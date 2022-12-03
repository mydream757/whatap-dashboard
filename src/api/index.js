import getOpenApi from './getApiModule';
import { DEMO_ACCOUNT_API_TOCKEN } from './constants';

const spot = getOpenApi('project')('api');
const series = getOpenApi('project')('api/json');
const projectMeta = getOpenApi('project')('json');
const accountMeta = getOpenApi('account', {
  'x-whatap-token': DEMO_ACCOUNT_API_TOCKEN,
})('api/json');

export default {
  spot,
  series,
  projectMeta,
  accountMeta,
};
