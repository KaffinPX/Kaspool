module.exports = {
  requests: {
    authorize: require('./requests/authorize'),
    submit: require('./requests/submit'),
    subscribe: require('./requests/subscribe')
  },
  responses: {
    Answer: require('./responses/answer'),
    Error: require('./responses/error'),
    Notify: require('./responses/notify'),
    SetDifficulty: require('./responses/setDifficulty'),
    SetExtranonce: require('./responses/setExtranonce')
  }
}