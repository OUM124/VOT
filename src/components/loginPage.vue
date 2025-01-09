<template>
    <div class="login-page">
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
      };
    },
    methods: {
      async loginUser() {
        const auth = getAuth();
        try {
          const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
          console.log('User logged in:', userCredential.user);
          this.$router.push('/dashboard'); // Redirect after login
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
    },
  };
  </script>
  
  <style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

input {
  font-size: 1rem;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  transition: border-color 0.3s ease-in-out;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  font-size: 1rem;
  padding: 10px 15px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

button:hover {
  background-color: #0056b3;
}

p {
  margin-top: 15px;
  font-size: 0.9rem;
  color: #555;
}

p a {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease-in-out;
}

p a:hover {
  color: #0056b3;
}

.error {
  margin-top: 10px;
  font-size: 0.9rem;
  color: red;
  text-align: center;
}
</style>

  