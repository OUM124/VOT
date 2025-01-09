<template>
  <div class="create-event">
    <div class="form-container">
      <h2>Create New Event</h2>
      
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            required
            class="form-input"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
  <label for="date">Date and Time</label>
  <input
    id="date"
    v-model="formData.date"
    type="datetime-local"
    required
    class="form-input"
  >
</div>


        <div class="form-group">
        <label for="img">Event Image</label>
        <input
          id="img"
          type="file"
          @change="handleImageUpload"
          class="form-input"
          accept="image/*"
        >
      </div>


        <div class="form-group checkbox">
          <input
            id="isFree"
            v-model="formData.isFree"
            type="checkbox"
          >
          <label for="isFree">Free Event</label>
        </div>

        <div v-if="!formData.isFree" class="form-group">
          <label for="price">Price</label>
          <input
            id="price"
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            class="form-input"
          >
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="submit-button"
        >
          {{ loading ? 'Creating...' : 'Create Event' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
export default {
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      successMessage: '',
      formData: {
        title: '',
        description: '',
        date: this.getCurrentDateTime(), // Automatically set to current date and time
        isFree: true,
        price: 0,
        img: ''
      }
    };
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date();
      return now.toISOString().slice(0, 16); // Formats the date for `datetime-local`
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.formData.img = reader.result; // Store the Base64 string
        };
        reader.readAsDataURL(file);
      }
    },
    async handleSubmit() {
      if (!auth.currentUser) {
        this.errorMessage = 'You must be logged in to create an event';
        return;
      }

      try {
        this.loading = true;
        this.errorMessage = '';

        const eventData = {
          ...this.formData,
          createdBy: auth.currentUser.uid,
          date: new Date(this.formData.date),
          Price: this.formData.isFree ? 0 : Number(this.formData.price),
          yesVotes: 0,
          noVotes: 0,
          createdAt: new Date(),
        };

        await addDoc(collection(db, 'events'), eventData);

        this.successMessage = 'Event created successfully! Redirecting to dashboard...';

        setTimeout(() => {
          this.router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error creating event:', error);
        this.errorMessage = 'Error creating event. Please try again.';
      } finally {
        this.loading = false;
      }
    },
  }
};

</script>

<style scoped>
.create-event {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox input {
  width: auto;
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.submit-button:hover {
  background-color: #2563eb;
}

.submit-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.success-message {
  background-color: #dcfce7;
  color: #166534;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.error-message {
  background-color: #fee2e2;
  color: #dc2626;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}
</style>