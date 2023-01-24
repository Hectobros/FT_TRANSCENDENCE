/* eslint-disable */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import * as ElementPlusIconsVue from "@heroicons/vue/24/outline"
import VueCookies from 'vue-cookies'
import DKToast from 'vue-dk-toast';
import store from './store';
// @ts-ignore
import Countdown from 'vue3-flip-countdown'


const app = createApp(App);
app.use(VueCookies);
app.use(router);
app.use(DKToast);
app.use(Countdown);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(store);
app.mount('#app');