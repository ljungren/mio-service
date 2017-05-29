module.exports = {
  unknown: "Welcome, friend! My name is Mio. I can help you find a place that's relevant to your company, by social terms, so that you can find an optimal place to extend your connections and base your operations. I am not as intelligent as you, but I can learn about your company and discuss your thoughts about my suggestions. You can start by briefly explaining to me what it is your company does.",
  known: (username=null, context=null) => {
    return "Hello"+(username ? " " + capFirst(username) : "")+", have you contacted"+(context ? " " + getName(context) : "")+" yet? or would you like to continue looking for an office?"
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