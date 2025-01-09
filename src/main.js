import { createApp } from 'vue';
import App from './App.vue';
import router from './index'; // Import your router setup

const app = createApp(App);

// Use the router if you're handling routes
app.use(router);

// Optional: Add a global listener to Firebase auth state


app.mount('#app');
