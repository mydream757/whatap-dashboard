import { OPEN_API, OPEN_API_HEADERS, OPEN_API_ROOT } from './constants';

const getPath = (url, param = {}) => {
  let path = url;
  for (const key in param) {
    path = path.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
  }

  return path;
};

/**
 * : ((
 *     key: keyof typeof OPEN_API['json'] & keyof typeof OPEN_API[''],
 *     param: any
 *   ) => Promise<{ key: string; name: string; data: any }>)
 *
 * @param type
 */

const getOpenApi = (type) => (key, param) =>
  new Promise((resolve, reject) => {
    if (key in OPEN_API[type]) {
      return resolve({
        url: [OPEN_API_ROOT, type, key].filter((path) => !!path).join('/'),
        name: OPEN_API[type][key],
      });
    } else {
      reject('잘못된 API 정보');
    }
  }).then(({ url, name }) =>
    fetch(getPath(url, param), {
      headers: OPEN_API_HEADERS,
    })
      .then((response) => response.json())
      .then((data) => ({
        key,
        name,
        data,
      }))
  );

export default getOpenApi;
