module.exports = {
  replace_original: false,
  text: '',
  attachments: [
    {
      fallback: 'Sorry, attachment couldn\'t be loaded',
      callback_id: 'sliperiet_action',
      color: '#91CCEC',
      pretext: '\n\nI found a great match!',
      author_name: '',
      author_link: '',
      author_icon: '',
      title: 'Sliperiet',
      title_link: 'http://sliperiet.umu.se/',
      text: '',
      fields: [
        {
          title: 'Relevance to you: 93%',
          value: 'Östra Strandgatan 32, 903 33 Umeå\n2500 SEK per month (per person)\nSpace for 1-15 people',
          'short': false
        }
      ],
      image_url: 'http://www.gunseus.com/wp-content/uploads/2014/08/131217_150143-JG.jpg',
      thumb_url: 'http://www.gunseus.com/wp-content/uploads/2014/08/131217_150143-JG.jpg',
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