import Vue from 'vue'
import App from './App.vue'
import router from './router'

// element ui
import ElementUI, { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 导入全局样式
import '@/assets/css/global.css';

// 导入字体图标
import '@/assets/fonts/iconfont.css';

// 导入axios
import axios from 'axios';
import VueAxios from 'vue-axios';
// 把包的属性挂载在vue原型上，其中$http是自定义属性，合法就行
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
//拦截器(interceptor)，固定写法
axios.interceptors.request.use(config => {
    console.log(config);
    config.headers.Authorization = window.sessionStorage.getItem('token');
    return config;
})
Vue.prototype.$http = axios;

// 挂载element-ui
Vue.use(ElementUI);
Vue.prototype.$message = Message

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')