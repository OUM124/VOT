<template>
  <div class="dashboard">
    <h2>Events Dashboard</h2>
    <p v-if="!user">You are not logged in. Please log in to access the dashboard.</p>
    
    <div v-else>
      <div class="action-bar">
        <router-link to="/create-event" class="create-button">
          <span class="plus-icon">+</span> Create New Event
        </router-link>
      </div>

      <div class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card">
          <img v-if="event.img" :src="event.img" :alt="event.title" class="event-image">
          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>
            <p><strong>Date:</strong> {{ formatDate(event.date) }}</p>
            <p><strong>Price:</strong> {{ event.isFree ? 'Free' : `$${event.Price}` }}</p>
            <div class="votes">
              <button 
                @click="handleVote(event.id, 'yes')" 
                :disabled="hasVoted(event.id)"
                :class="{ 'voted': userVote(event.id) === 'yes' }"
                class="vote-button yes-vote"
              >
                👍 {{ event.yesVotes || 0 }}
              </button>
              <button 
                @click="handleVote(event.id, 'no')" 
                :disabled="hasVoted(event.id)"
                :class="{ 'voted': userVote(event.id) === 'no' }"
                class="vote-button no-vote"
              >
                👎 {{ event.noVotes || 0 }}
              </button>
            </div>
            <p v-if="event.createdBy === user.uid" class="created-by">(Created by you)</p>
          </div>
        </div>
      </div>
      
      <p v-if="loading" class="loading">Loading events...</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import { auth, db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  setDoc,
  query,
  where
} from 'firebase/firestore';

export default {
  data() {
    return {
      user: null,
      events: [],
      loading: true,
      errorMessage: null,
      userVotes: {}, // Store user's votes
    };
  },
  methods: {
    formatDate(date) {
      if (date && date.toDate) {
        return date.toDate().toLocaleString();
      }
      return '';
    },
    
    async fetchEvents() {
  if (!this.user) return;
  
  try {
    this.loading = true;
    this.errorMessage = null;

    const eventsCollection = collection(db, 'events');
    const querySnapshot = await getDocs(eventsCollection);
    
    this.events = querySnapshot.docs.map(doc => {
      const eventData = {
        id: doc.id,
        ...doc.data()
      };
      console.log('Event data:', eventData);
      console.log('Image URL:', eventData.img);
      return eventData;
    });

    await this.fetchUserVotes();
    this.loading = false;
  } catch (error) {
    console.error('Error fetching events:', error);
    this.errorMessage = 'Error fetching events. Please try again later.';
    this.loading = false;
  }
},
    async fetchUserVotes() {
      if (!this.user) return;

      try {
        const votesCollection = collection(db, 'votes');
        const userVotesQuery = query(
          votesCollection,
          where('userId', '==', this.user.uid)
        );
        
        const votesSnapshot = await getDocs(userVotesQuery);
        const votes = {};
        
        votesSnapshot.forEach(doc => {
          votes[doc.data().eventId] = doc.data().voteType;
        });
        
        this.userVotes = votes;
      } catch (error) {
        console.error('Error fetching user votes:', error);
      }
    },

    async handleVote(eventId, voteType) {
      if (!this.user || this.hasVoted(eventId)) return;

      try {
        // Update event document
        const eventRef = doc(db, 'events', eventId);
        await updateDoc(eventRef, {
          [`${voteType}Votes`]: increment(1)
        });

        // Create vote record
        const voteId = `${eventId}_${this.user.uid}`;
        const voteRef = doc(db, 'votes', voteId);
        await setDoc(voteRef, {
          eventId,
          userId: this.user.uid,
          voteType,
          timestamp: new Date()
        });

        // Update local state
        this.userVotes[eventId] = voteType;
        
        // Update local event count
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          const event = this.events[eventIndex];
          const voteField = `${voteType}Votes`;
          this.events[eventIndex] = {
            ...event,
            [voteField]: (event[voteField] || 0) + 1
          };
        }
      } catch (error) {
        console.error('Error voting:', error);
        this.errorMessage = 'Error recording vote. Please try again.';
      }
    },

    hasVoted(eventId) {
      return eventId in this.userVotes;
    },

    userVote(eventId) {
      return this.userVotes[eventId];
    }
  },
  watch: {
    user(newUser) {
      if (newUser) {
        this.fetchEvents();
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.user = auth.currentUser;
    });

    auth.onAuthStateChanged((user) => {
      this.user = user;
      if (user) {
        this.fetchUserVotes();
      }
    });
  },
};
</script>

<style scoped>
/* Previous styles remain the same */
.dashboard {
  padding: 20px;
}

.action-bar {
  margin: 20px 0;
  display: flex;
  justify-content: flex-end;
}

.create-button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: #2563eb;
}

.plus-icon {
  font-size: 1.2em;
  font-weight: bold;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.event-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.event-content {
  padding: 15px;
}

.votes {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.yes-votes {
  color: #22c55e;
}

.no-votes {
  color: #ef4444;
}

.created-by {
  font-size: 0.875rem;
  color: #666;
  margin-top: 10px;
}

.loading {
  text-align: center;
  margin-top: 20px;
}

.error {
  color: #ef4444;
  text-align: center;
  margin-top: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

h3 {
  margin: 0 0 10px 0;
  font-size: 1.25rem;
}

.vote-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.vote-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.vote-button.voted {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.yes-vote:hover:not(:disabled) {
  background-color: #dcfce7;
  border-color: #22c55e;
}

.no-vote:hover:not(:disabled) {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.yes-vote.voted {
  background-color: #dcfce7;
  border-color: #22c55e;
}

.no-vote.voted {
  background-color: #fee2e2;
  border-color: #ef4444;
}
</style>
