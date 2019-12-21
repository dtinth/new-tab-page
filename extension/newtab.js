Vue.config.productionTip = false

const App = {}

Vue.component('current-time', {
  template: `<div class="current-time">
    {{time}}
  </div>`,
  data() {
    return { time: this.getTime() }
  },
  mounted() {
    setInterval(() => {
      this.time = this.getTime()
    }, 1000)
  },
  methods: {
    getTime() {
      return new Date()
        .toString()
        .split(' ')[4]
        .split(':')
        .slice(0, 2)
        .join(':')
    },
  },
})

Vue.component('card-board', {
  template: `<div class="card-board">
    <div class="cards">
      <template v-for="card of cards">
        <tweet-card :url="card.data.url" :tweet-json="card.data.tweet" v-if="card.data.tweet" :key="card.id" :card-style="style(card)">
          <template v-slot:time>
            <span class="time">{{formatTime(card.data.time)}}</span>
          </template>
        </tweet-card>
        <a v-else :href="card.data.url" class="card" :key="card.id" :style="style(card)">
          <strong>{{card.data.title}}</strong>
          {{card.data.description}}
          <span class="time">{{formatTime(card.data.time)}}</span>
        </a>
      </template>
    </div>
  </div>`,
  data() {
    return {
      cards: [],
    }
  },
  mounted() {
    chrome.runtime.sendMessage({ type: 'snapshot' }, response => {
      const cards = Object.entries(response.items).map(([id, data]) => ({
        id,
        data,
      }))
      console.log(cards)
      this.cards = _.sortBy(cards, 'data.time').reverse()
    })
  },
  methods: {
    formatTime(time) {
      const d = new Date(
        Date.parse(time) - new Date().getTimezoneOffset() * 60e3,
      )
        .toJSON()
        .split('T')
      const c = new Date(Date.now() - new Date().getTimezoneOffset() * 60e3)
        .toJSON()
        .split('T')
      if (c[0] === d[0]) {
        return d[1].slice(0, 5)
      } else {
        return d[0] + ' ' + d[1].slice(0, 5)
      }
    },
    style(card) {
      const diff = Date.now() - Date.parse(card.data.time)
      return {
        opacity: 1 - Math.max(0, Math.min(1, diff / 3600e3 / 6)) * 0.5,
        '--border-color': chroma
          .mix(
            '#bef',
            '#656463',
            1 - Math.pow(1 - Math.max(0, Math.min(1, diff / 3600e3)), 2),
          )
          .toString(),
      }
    },
  },
})

Vue.component('tweet-card', {
  props: ['url', 'tweetJson', 'cardStyle'],
  template: `<a :href="url" class="card" :style="cardStyle" :data-tweet="tweetJson">
    <img class="tweet-thumb" :src="image" v-if="image && !imageLoadFailed" @error="imageLoadFailed=true" />
    <strong>{{tweet.user.screen_name}}</strong>
    <span style="white-space: pre-line">{{text}}</span>
    <slot name="time"></slot>
    <div class="tweet-subtweet">
      <tweet-card :tweet-json="quotedJson" v-if="tweet.quoted_status" />
    </div>
  </a>`,
  data() {
    return { imageLoadFailed: false }
  },
  computed: {
    tweet() {
      return JSON.parse(this.tweetJson)
    },
    text() {
      return Array.from(this.tweet.full_text)
        .slice(...this.tweet.display_text_range)
        .join('')
    },
    quotedJson() {
      return JSON.stringify(this.tweet.quoted_status)
    },
    image() {
      const item =
        this.tweet.entities &&
        this.tweet.entities.media &&
        this.tweet.entities.media[0]
      if (item && item.sizes.thumb) {
        return item.media_url.replace(/\.\w+$/, '?format=jpg&name=thumb')
      }
    },
  },
})

App.instance = new Vue({
  el: '#app',
  template: `<div>
    <current-time />
    <card-board/>
  </div>`,
})
