import getOpenApi from './getApiModule';

const spot = getOpenApi('');
const series = getOpenApi('json');

export default {
  spot,
  series,
};
