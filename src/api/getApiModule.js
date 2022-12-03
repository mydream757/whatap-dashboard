import { API_CATEGORIES, API_HEADER, API_ROOT } from './constants';

const getPath = (url, param = {}) => {
  let path = url;
  for (const key in param) {
    path = path.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
  }

  return path;
};

const getOpenApi =
  (category, header = API_HEADER) =>
  (route) =>
  (apiKey, param) =>
    new Promise((resolve, reject) => {
      if (apiKey in API_CATEGORIES[category][route]) {
        return resolve({
          url: [API_ROOT, route, apiKey].filter((path) => !!path).join('/'),
          name: API_CATEGORIES[category][route][apiKey],
        });
      } else {
        reject('잘못된 API 정보');
      }
    }).then(({ url, name }) =>
      fetch(getPath(url, param), {
        headers: { ...header },
      })
        .then((response) => response.json())
        .then((data) => ({
          apiKey,
          name,
          data,
        }))
    );

export default getOpenApi;
