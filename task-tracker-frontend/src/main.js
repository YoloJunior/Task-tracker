// Точка входу Vue додатку

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())  // стейт менеджер
app.use(router)         // маршрутизація

app.mount('#app')
