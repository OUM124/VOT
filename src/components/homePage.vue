<template>
    <div class="home-page">
      <header class="hero">
        <img :src="universityImage" alt="UM6P Logo" class="hero-logo" />
        <h1>Welcome to UM6P Event Voting</h1>
        <p>Join the community and vote on exciting events!</p>
        <button @click="redirectToLogin" class="hero-button">Get Started</button>
      </header>
  
      <section class="events-section">
        <h2>Upcoming Events</h2>
        <div v-if="loading" class="loading">Loading events...</div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="events.length" class="events-container">
          <div v-for="event in events" :key="event.id" class="event-card">
            <img :src="event.img" alt="Event Image" class="event-image" />
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <p><strong>Date:</strong> {{ formatDate(event.date) }}</p>
            <p><strong>Free Event:</strong> {{ event.isFree ? "Yes" : "No" }}</p>
            <p v-if="!event.isFree"><strong>Price:</strong> {{ event.Price }} USD</p>
            <div class="votes">
              <p><strong>Yes Votes:</strong> {{ event.yesVotes }}</p>
              <p><strong>No Votes:</strong> {{ event.noVotes }}</p>
            </div>
            <button @click="handleVote()" class="vote-button">Vote</button>
          </div>
        </div>
        <div v-else-if="!loading" class="no-events">No events available.</div>
      </section>
    </div>
  </template>
  
  <script>
  import { collection, getDocs } from "firebase/firestore";
  import { db } from "../../firebase";
  
  export default {
    data() {
      return {
        universityImage: require("../assets/um6p.jpeg"), // Replace with actual UM6P logo URL
        events: [],
        loading: false,
        error: "",
      };
    },
    methods: {
      async fetchEvents() {
        this.loading = true;
        try {
          const querySnapshot = await getDocs(collection(db, "events"));
          this.events = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (err) {
          console.error("Error fetching events:", err);
          this.error = "Failed to load events. Please try again.";
        } finally {
          this.loading = false;
        }
      },
      formatDate(date) {
        return new Date(date).toLocaleString();
      },
      handleVote() {
  this.$router.push("/login");
}
,
      redirectToLogin() {
        this.$router.push("/login");
      },
    },
    created() {
      this.fetchEvents();
    },
  };
  </script>
  
  <style scoped>
  .home-page {
    font-family: Arial, sans-serif;
    color: #333;
  }
  
  .hero {
  text-align: center;
  background-color: #f0f4f8;
  margin-bottom: 20px;
}

.hero-logo {
  width: 100%;
  height: 600px; /* Maintains the aspect ratio */
  display: block; /* Ensures no extra space below the image */
  margin: 0 auto; /* Centers the image horizontally if needed */
}

.hero h1 {
  margin-bottom: 10px;
  font-size: 2.5rem;
}

.hero p {
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.hero-button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.hero-button:hover {
  background-color: #2563eb;
}

  
  .events-section {
    padding: 20px 0;
  }
  
  .events-section h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .loading {
    text-align: center;
    font-size: 1.2rem;
  }
  
  .error-message {
    text-align: center;
    color: red;
    font-size: 1rem;
  }
  
  .events-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  
  .event-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    padding: 20px;
    width: 300px;
    text-align: center;
  }
  
  .event-image {
    max-width: 100%;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  
  .vote-button {
    background-color: #3b82f6;
    color: white;
    padding: 10px 15px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .vote-button:hover {
    background-color: #2563eb;
  }
  
  .no-events {
    text-align: center;
    font-size: 1.2rem;
  }
  </style>
  