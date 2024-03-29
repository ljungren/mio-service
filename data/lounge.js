module.exports = {
  replace_original: false,
  text: '',
  attachments: [
    {
      fallback: 'Sorry, something went wrong',
      callback_id: 'lounge_action',
      color: '#91CCEC',
      pretext: '\n\nThis could be an option as well',
      author_name: '',
      author_link: '',
      author_icon: '',
      title: 'Business Lounge',
      title_link: 'http://businesslounge.se/',
      text: '',
      fields: [
        {
          title: 'Relevance to you: 58%',
          value: 'Box 1116, 131 26 Nacka Strand\n3900 SEK per month (per person)\nSpace for 1-8 people',
          'short': false
        }
      ],
      image_url: 'http://www.businesslounge.se/wp-content/uploads/BL_05-1024x683.jpg',
      thumb_url: 'http://www.businesslounge.se/wp-content/uploads/BL_05-1024x683.jpg',
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

//https://storage.googleapis.com/objektia-production.appspot.com/_/resources/5866040579850240/images/businesslounge_se_wp_content_uploads_FullSizeRender_1024x768_jpg.jpg