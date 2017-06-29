module.exports = {
  unknown: (name=null) => {
    return "Hello"+(name ? " " + capFirst(name) : " friend")+"! My name is Mio. \n\nI was made as a thesis experiment to see if corporate ambitions of profit and user experience can be aligned with ambitions of sustainable development. I can help modern companies like you to find an optimal environment in Sweden to base your operations, in terms of social connections. I strive towards global sustainability goals, as in prioritizing locations in less urban areas. My suggestions are just static examples, but for now, please pretend with me that I consume data from multiple social networks and sources of geographical data to find custom locations for you."
  },
  known: (name=null, context=null) => {
    return "What's up"+(name ? " " + capFirst(name) : "")+"? have you contacted"+(context ? " " + getName(context) : " an office")+" yet? Have any questions? Or would you like to continue searching for an office?"
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