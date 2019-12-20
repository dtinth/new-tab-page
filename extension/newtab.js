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

Vue.component('tweet-board', {
  template: `<div class="tweet-board">
    <div class="cards">
      <a :href="card.data.url" :data-tweet="card.data.tweet" class="card" v-for="card of cards" :key="card.id" :style="style(card)">
        <strong>{{card.data.title}}</strong>
        {{card.data.description}}
        <span class="time">{{formatTime(card.data.time)}}</span>
      </a>
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

App.instance = new Vue({
  el: '#app',
  template: `<div>
    <current-time />
    <tweet-board/>
  </div>`,
})
