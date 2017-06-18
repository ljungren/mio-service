let responses = [
  'Would you please describe in short terms what your company does? So that I can find relevant places for you.',
  'To get a grip of your company, I just need to ask, what is it your company does in brief terms?',
  'Could you briefly describe what your company does for me? Then I can give adapted suggestions.',
  'Please describe briefly what your company does and I will then find suited locations for you.'
]

module.exports = {
  new_search: () => {
    return responses[Math.floor(Math.random()*responses.length)]
  },
  existing_context: (context) => {
    return 'Have you contacted '+getName(context)+' yet? or would you like to continue searching for an office?'
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

