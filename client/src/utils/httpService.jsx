// import axios from "axios";

// axios.interceptors.response.use(null, (error) => {
//   const expectedError =
//     error.response &&
//     error.response.status >= 400 &&
//     error.response.status < 500;
//   if (!expectedError) {
//     //console.log('Unexpected error occured!');
//   }

//   return Promise.reject(error);
// });

// export default {
//   get: axios.get,
//   post: axios.post,
//   put: axios.put,
//   delete: axios.delete,
// };

import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL; // automatically picks .env

const instance = axios.create({
  baseURL: backendUrl, // <-- all requests will prepend this
});

axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;
  if (!expectedError) {
    //console.log('Unexpected error occured!');
  }
  return Promise.reject(error);
});

export default {
  get: (url, ...rest) => instance.get(url, ...rest),
  post: (url, ...rest) => instance.post(url, ...rest),
  put: (url, ...rest) => instance.put(url, ...rest),
  delete: (url, ...rest) => instance.delete(url, ...rest),
};
