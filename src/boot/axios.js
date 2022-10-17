import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'

function notify(errors){
  errors.forEach(err => {
      let msg = err;
      
      if(typeof(err) === 'object'){
          msg = err.message;
      }

      Notify.create({
          position: 'top',
          message: msg,
          color: 'red',
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
          icon: 'warning',
          progress: true,
      });
  });
}

const api = axios.create();

export default boot(({ app,store }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  api.interceptors.response.use((response) => response, (error) => {
    notify([error]);
  });

  store.use(() => ({api}))
});

export { api }
