<template>
    <div class="signup-page">
      <h2>Sign Up</h2>
      <form @submit.prevent="signUpUser">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login</router-link></p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script>
  import { auth } from "../../firebase"; // Import auth from firebase.js
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  
  export default {
    data() {
      return {
        email: '',
        password: '',
        errorMessage: null,
      };
    },
    methods: {
      async signUpUser() {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          console.log('User signed up:', userCredential.user);
          this.$router.push('/login'); // Redirect after sign-up
        } catch (error) {
          console.error('Sign-up error:', error.message);
          this.errorMessage = error.message;
        }
      },
    },
  };
  </script>
  <style scoped>
  .signup-page {
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
    background-color: #28a745;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  }
  
  button:hover {
    background-color: #218838;
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
  