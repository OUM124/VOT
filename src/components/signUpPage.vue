<template>
  <div class="signup-page">
    <div class="signup-container">
      <div class="logo-section">
        <img :src="logoImage" alt="UM6P Logo" class="logo-image" />
      </div>
      <div class="form-section">
        <h2>Sign Up</h2>
        <form @submit.prevent="validateAndSignUp">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email (@um6p.ma)" 
            required 
            @input="validateEmail"
          />
          <div v-if="emailError" class="input-error">
            {{ emailError }}
          </div>
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit" :disabled="!!emailError">Sign Up</button>
        </form>
        <p>Already have an account? <router-link to="/login">Login</router-link></p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      errorMessage: null,
      emailError: null,
      logoImage: require("../assets/um6p.jpeg"),
    };
  },
  methods: {
    validateEmail() {
      const emailDomain = '@um6p.ma';
      if (this.email && !this.email.endsWith(emailDomain)) {
        this.emailError = `Only ${emailDomain} email addresses are allowed`;
      } else {
        this.emailError = null;
      }
    },
    async validateAndSignUp() {
      // Double check validation before submission
      if (!this.email.endsWith('@um6p.ma')) {
        this.emailError = 'Only @um6p.ma email addresses are allowed';
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        console.log('User signed up:', userCredential.user);
        this.$router.push('/login');
      } catch (error) {
        console.error('Sign-up error:', error.message);
        this.errorMessage = error.message;
      }
    },
  },
};
</script>

<style scoped>

.input-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: -10px;
  margin-bottom: 10px;
  text-align: left;
  width: 100%;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: #6c757d;
}

input.error {
  border-color: #dc3545;
}

input.error:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
}

.signup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  padding: 20px;
}

.signup-container {
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
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1);
  outline: none;
}

button {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #218838;
}

p {
  margin-top: 20px;
  font-size: 1rem;
  color: #666;
}

p a {
  color: #28a745;
  text-decoration: none;
  font-weight: 600;
}

p a:hover {
  color: #218838;
  text-decoration: underline;
}

.error {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
}

@media (max-width: 768px) {
  .signup-container {
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