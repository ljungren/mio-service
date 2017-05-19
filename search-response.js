module.exports = {
        text: "",
        attachments: [
            {
                fallback: "Sliperiet result",
                color: "#91CCEC",
                pretext: "I found some great matches. Check it out!",
                author_name: "",
                author_link: "",
                author_icon: "",
                title: "Relevance to you: 93%",
                title_link: "",
                text: "",
                fields: [
                    {
                        title: "Sliperiet",
                        value: "Östra Strandgatan 32, 903 33 Umeå\n 2500 SEK per month (per person)\nSpace for 1-15 people",
                        short: false
                    }
                ],
                image_url: "http://www.gunseus.com/wp-content/uploads/2014/08/131217_150143-JG.jpg",
                thumb_url: "",
                footer: "",
                footer_icon: "",
                ts: 0,
                actions: [
                    {
                        name: "option",
                        text: "View website",
                        style: "primary",
                        type: "button",
                        value: "view"
                    },
                    {
                        name: "option",
                        text: "Tell me more",
                        style: "secondary",
                        type: "button",
                        value: "more"
                    },
                    {
                        name: "option",
                        text: "Show next result",
                        type: "button",
                        value: "war",
                        confirm: {
                            title: "Are you sure?",
                            text: "Wouldn't you prefer a good game of chess?",
                            ok_text: "Yes",
                            dismiss_text: "No"
                        }
                    }
                ]
            }
        ]
}