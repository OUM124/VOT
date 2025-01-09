<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <img :src="logoImage" alt="UM6P Logo" class="logo-image" />
      </div>
      <div class="form-section">
        <h2>Login</h2>
        <form @submit.prevent="loginUser">
          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: null,
      logoImage: require("../assets/um6p.jpeg"),
    };
  },
  methods: {
    async loginUser() {
      const auth = getAuth();
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        console.log('User logged in:', userCredential.user);
        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  padding: 20px;
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logo-section {
  width: 50%;
  background-color: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border-radius: 10px 0 0 10px;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-height: 500px;
}

.form-section {
  width: 50%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 30px;
  font-weight: 600;
}

form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

input {
  width: 100%;
  padding: 15px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  outline: none;
}

button {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

p {
  margin-top: 20px;
  font-size: 1rem;
  color: #666;
}

p a {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
}

p a:hover {
  color: #0056b3;
  text-decoration: underline;
}

.error {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .logo-section,
  .form-section {
    width: 100%;
  }
  
  .logo-section {
    border-radius: 10px 10px 0 0;
    padding: 20px;
  }
  
  .form-section {
    padding: 30px 20px;
  }
}
</style>