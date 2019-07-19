import moment from 'moment';
import 'moment/locale/de';
import Vue from 'vue';

const VueMoment = {
  install(instance) {
    // eslint-disable-next-line no-param-reassign
    instance.prototype.$moment = moment;
  },
};
// Bind plugin
Vue.use(VueMoment);
// Export plugin
export default VueMoment;
