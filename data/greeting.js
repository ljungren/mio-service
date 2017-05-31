module.exports = {
  unknown: (name=null) => {
    return "Hello"+(name ? " " + capFirst(name) : " friend")+"! My name is Mio. \n\nI was made as a thesis experiment to see if corporate ambitions of profit and user experience can be aligned with ambitions of sustainable development. I can help software companies like you to find an optimal environment to extend your network and base your operations, in terms of social connections. I strive towards global sustainability goals, as in prioritizing locations in less urban areas. My suggestions are static examples, but I pretend to consume data from multiple social networks and geographical open data to find custom locations for you. I am just a prototype, but I can learn about your company and discuss your thoughts about my suggestions to serve your needs.\n\n*You can start by briefly explaining to me what it is your company does.*"
  },
  known: (name=null, context=null) => {
    return "What's up"+(name ? " " + capFirst(name) : "")+"? have you contacted"+(context ? " " + getName(context) : " an office")+" yet? or would you like to continue looking for an office?"
  }
}

let getName = (context) => {
    switch(context){
      case 'sliperiet_action':
        return 'Sliperiet'
        break
      case 'northern_action':
        return 'The Great Northern'
        break
      case 'house_action':
        return 'House Be'
        break
      case 'lounge_action':
        return 'Business Lounge'
        break
    }
}

function capFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}