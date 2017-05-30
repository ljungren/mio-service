module.exports = {
  unknown: (name=null) => {
    return "Welcome,"+(name ? " " + capFirst(name) : " friend")+"! My name is Mio. I was made as a thesis experiment to see if corporate ambitions of profit and user experience can be aligned with ambitions of sustainable development. I can help software companies like you to find office space that's relevant to your specific company, in terms of social connections, so that you can find an optimal environment to extend your network and base your operations. To strive towards sustainability goals, I prioritize locations in less urban areas. As of know, my suggestions are static, but I pretend to consume data from multiple social networks and geographical open data to find custom locations for you. I am just a prototype, but I can learn about your company and discuss your thoughts about my suggestions.\n\nYou can start by briefly explaining to me what it is your company does."
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
    return string.charAt(0).toUpperCase() + string.slice(1);
}