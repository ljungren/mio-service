module.exports = {
  replace_original: false,
  text: '',
  attachments: [
    {
      fallback: 'Sorry, something went wrong',
      callback_id: 'house_action',
      color: '#91CCEC',
      pretext: '\n\nThis is a good alternative too!',
      author_name: '',
      author_link: '',
      author_icon: '',
      title: 'House Be',
      title_link: 'http://startupare.com/',
      text: '',
      fields: [
        {
          title: 'Relevance to you: 76%',
          value: 'Hus B, 830 13 Åre\n2300 SEK per month (per person)\nSpace for 1-10 people',
          'short': false
        }
      ],
      image_url: 'http://fastighetstidningen.se/wp-content/uploads/2016/11/dios_are.jpg',
      thumb_url: 'http://fastighetstidningen.se/wp-content/uploads/2016/11/dios_are.jpg',
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