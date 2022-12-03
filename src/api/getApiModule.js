import { API_HEADER, API_ROOT, API_ROUTES } from './constants';

const getPath = (url, param = {}) => {
  let path = url;
  for (const key in param) {
    path = path.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key]);
  }

  return path;
};

const getOpenApi = (route) => (apiKey, param) =>
  new Promise((resolve, reject) => {
    if (apiKey in API_ROUTES[route]) {
      return resolve({
        url: [API_ROOT, route, apiKey].filter((path) => !!path).join('/'),
        name: API_ROUTES[route][apiKey],
      });
    } else {
      reject('잘못된 API 정보');
    }
  }).then(({ url, name }) =>
    fetch(getPath(url, param), {
      headers: API_HEADER,
    })
      .then((response) => response.json())
      .then((data) => ({
        apiKey,
        name,
        data,
      }))
  );

export default getOpenApi;
