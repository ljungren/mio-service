let responses = [
  "I don't quite understand. Could you please rephrase? 🙂",
  "I'm sorry, I don't seem to quite understand. Could you please rephrase that?",
  "I must have misunderstood you. Would you mind repeat that with other words?"
]

module.exports = {
  regular: () => {
    return responses[Math.floor(Math.random()*responses.length)]
  }
}