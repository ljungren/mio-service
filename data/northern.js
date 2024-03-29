module.exports = {
  replace_original: false,
  text: '',
  attachments: [
    {
      fallback: 'Sorry, attachment couldn\'t be loaded',
      callback_id: 'northern_action',
      color: '#91CCEC',
      pretext: '\n\nAnother good option!',
      author_name: '',
      author_link: '',
      author_icon: '',
      title: 'The Great Northern',
      title_link: 'http://www.thegreatnorthern.org/',
      text: '',
      fields: [
        {
          title: 'Relevance to you: 86%',
          value: 'Storgatan 53, 931 30 Skellefteå\n2300 SEK per month (per person)\nSpace for 1-20 people',
          'short': false
        }
      ],
      image_url: 'http://portal.skelleftea.se/Sve/Bilder/Nyhetsbilder%202014%20oktober%20ff/Pansalen%203.jpg',
      thumb_url: 'http://portal.skelleftea.se/Sve/Bilder/Nyhetsbilder%202014%20oktober%20ff/Pansalen%203.jpg',
      footer: '',
      footer_icon: '',
      ts: 0,
      actions: [
        {
          name: 'option',
          text: 'Contact',
          style: 'primary',
          type: 'button',
          value: 'contact'
        },
        {
          name: 'option',
          text: 'Tell me more',
          style: 'secondary',
          type: 'button',
          value: 'more'
        },
        {
          name: 'option',
          text: 'Search again',
          type: 'button',
          value: 'next'
        }
      ]
    }
  ]
}