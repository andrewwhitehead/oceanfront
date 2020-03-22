import { createApp } from 'vue'
import App from './App.vue'
import { demo } from './demo'
import { router } from './router'
import './index.scss'
import './theme/demo.scss'
import { Oceanfront } from 'oceanfront'
import 'highlight.js/styles/vs2015.css'

createApp(App)
  .use(Oceanfront)
  .use(demo)
  .use(router)
  .mount('#app')
