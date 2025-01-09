<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>Events Dashboard</h2>
      <div class="search-bar">
        <input 
          type="search" 
          v-model="searchTerm" 
          placeholder="Search events..."
          class="search-input"
        />
      </div>
    </div>

    <p v-if="!user" class="login-message">
      <i class="warning-icon">⚠️</i>
      You are not logged in. Please log in to access the dashboard.
    </p>
    
    <div v-else>
      <div class="dashboard-stats">
        <div class="stat-card">
          <h4>Total Events</h4>
          <p>{{ events.length }}</p>
        </div>
        <div class="stat-card">
          <h4>My Events</h4>
          <p>{{ myEventsCount }}</p>
        </div>
        <div class="stat-card">
          <h4>Free Events</h4>
          <p>{{ freeEventsCount }}</p>
        </div>
      </div>

      <div class="action-bar">
        <div class="filters">
          <select v-model="eventFilter" class="filter-select">
            <option value="all">All Events</option>
            <option value="my-events">My Events</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>
          <select v-model="sortBy" class="filter-select">
            <option value="date">Sort by Date</option>
            <option value="votes">Sort by Popularity</option>
            <option value="price">Sort by Price</option>
          </select>
        </div>
        <router-link to="/create-event" class="create-button">
          <span class="plus-icon">+</span> Create New Event
        </router-link>
      </div>

      <div class="events-grid">
        <div v-for="event in filteredAndSortedEvents" 
             :key="event.id" 
             class="event-card"
             :class="{ 'my-event': event.createdBy === user.uid }">
          <div class="event-image-container">
            <img
              v-if="event.img"
              :src="event.img"
              :alt="event.title"
              class="event-image"
            />
            <div class="event-date-badge">
              {{ formatDateBadge(event.date) }}
            </div>
            <span v-if="event.isFree" class="free-badge">Free</span>
          </div>
          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <p class="event-description">{{ truncateDescription(event.description) }}</p>
            <div class="event-details">
              <span class="detail-item">
                <i class="icon">📅</i>
                {{ formatDate(event.date) }}
              </span>
              <span class="detail-item">
                <i class="icon">💰</i>
                {{ event.isFree ? 'Free' : `$${event.Price}` }}
              </span>
            </div>
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
            <div class="event-footer">
              <span v-if="event.createdBy === user.uid" class="creator-badge">Created by you</span>
               
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
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
  
  query,
  runTransaction,
  serverTimestamp ,
  where,
  
} from 'firebase/firestore';

export default {
  data() {
    return {
      user: null,
      events: [],
      loading: true,
      errorMessage: null,
      userVotes: {},
      searchTerm: '',
      eventFilter: 'all',
      sortBy: 'date',
    };
  },
  computed: {
    myEventsCount() {
      return this.events.filter(event => event.createdBy === this.user?.uid).length;
    },
    freeEventsCount() {
      return this.events.filter(event => event.isFree).length;
    },
    filteredAndSortedEvents() {
      let filteredEvents = [...this.events];

      // Apply search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      switch (this.eventFilter) {
        case 'my-events':
          filteredEvents = filteredEvents.filter(event => event.createdBy === this.user?.uid);
          break;
        case 'free':
          filteredEvents = filteredEvents.filter(event => event.isFree);
          break;
        case 'paid':
          filteredEvents = filteredEvents.filter(event => !event.isFree);
          break;
      }

      // Apply sorting
      switch (this.sortBy) {
        case 'date':
          filteredEvents.sort((a, b) => a.date.toDate() - b.date.toDate());
          break;
        case 'votes':
          filteredEvents.sort((a, b) => (b.yesVotes || 0) - (a.yesVotes || 0));
          break;
        case 'price':
          filteredEvents.sort((a, b) => {
            if (a.isFree && b.isFree) return 0;
            if (a.isFree) return -1;
            if (b.isFree) return 1;
            return a.Price - b.Price;
          });
          break;
      }

      return filteredEvents;
    }
  },
  methods: {
    formatDate(date) {
      if (date?.toDate) {
        return date.toDate().toLocaleString();
      }
      return '';
    },
    formatDateBadge(date) {
      if (!date?.toDate) return '';
      const eventDate = date.toDate();
      return eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    truncateDescription(description) {
      return description?.length > 100 
        ? description.substring(0, 97) + '...' 
        : description;
    },
    async fetchEvents() {
      if (!this.user) return;
      
      try {
        this.loading = true;
        this.errorMessage = null;

        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection);
        
        this.events = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

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
    const voteId = `${eventId}_${this.user.uid}`;
    
    await runTransaction(db, async (transaction) => {
      // Get the current event data
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event does not exist!');
      }

      // Create vote document reference
      const voteRef = doc(db, 'votes', voteId);
      const voteDoc = await transaction.get(voteRef);
      
      // Check if user has already voted
      if (voteDoc.exists()) {
        throw new Error('Already voted');
      }

      // Prepare vote document
      const voteData = {
        eventId,
        userId: this.user.uid,
        voteType,
        timestamp: serverTimestamp()
      };

      // Update event vote count
      const currentVotes = eventDoc.data()[`${voteType}Votes`] || 0;
      
      // Create the vote document and update the vote count atomically
      transaction.set(voteRef, voteData);
      transaction.update(eventRef, {
        [`${voteType}Votes`]: currentVotes + 1
      });
    });

    // Update local state after successful transaction
    this.userVotes[eventId] = voteType;
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      const event = this.events[eventIndex];
      const voteField = `${voteType}Votes`;
      this.events[eventIndex] = {
        ...event,
        [voteField]: (event[voteField] || 0) + 1
      };
    }

    // Clear any previous error
    this.errorMessage = null;
    
  } catch (error) {
    console.error('Error voting:', error);
    this.errorMessage = error.message === 'Already voted' 
      ? 'You have already voted on this event.'
      : 'Error recording vote. Please try again.';
  }
}
,
    hasVoted(eventId) {
      return eventId in this.userVotes;
    },
    userVote(eventId) {
      return this.userVotes[eventId];
    },
    viewEventDetails(eventId) {
      this.$router.push(`/event/${eventId}`);
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
.dashboard {
  padding: 30px;
  min-height: 100vh;
  background-color: #f8fafc;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h2 {
  font-size: 2.5rem;
  color: #1e293b;
  margin: 0;
  font-weight: 700;
}

.search-bar {
  flex: 1;
  max-width: 400px;
  margin-left: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  color: #64748b;
  font-weight: 600;
}

.stat-card p {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
}

.filters {
  display: flex;
  gap: 15px;
}

.filter-select {
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  font-size: 0.95rem;
  cursor: pointer;
}

.create-button {
  background-color: #3b82f6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.create-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.event-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.event-card.my-event {
  border: 2px solid #3b82f6;
}

.event-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-bottom: 2px solid #e2e8f0;
}

.event-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  transition: transform 0.3s ease;
}

.event-image-container:hover .event-image {
  transform: scale(1.05);
}

.event-date-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.free-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: #10b981;
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.event-content {
  padding: 20px;
  flex-grow: 1;
}

.event-content h3 {
  font-size: 1.5rem;
  margin: 0 0 10px;
  color: #1e293b;
  font-weight: 600;
}

.event-description {
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 10px;
  line-height: 1.5;
}

.event-details {
  display: flex;
  gap: 15px;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  color: #4b5563;
}

.icon {
  margin-right: 8px;
}

.votes {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.vote-button {
  padding: 10px 15px;
  border-radius: 8px;
  background-color: #f3f4f6;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.vote-button:hover {
  background-color: #e2e8f0;
}

.vote-button.voted {
  background-color: #3b82f6;
  color: white;
}

.details-button {
  background-color: #3b82f6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.details-button:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.creator-badge {
  background-color: #3b82f6;
  color: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-right: 15px;
}
</style>
