# mio-service
A web service consumed by a slackbot named Mio.

Mio is a conversational prototype for helping companies find personalized office space relevant to their specific needs. Created as part of my master thesis project. The slack API consumes this node.js webservice with a connected postgres database and the natural language processing was created with api.ai (DialogFlow).

![mio_architecture](https://user-images.githubusercontent.com/9825650/122874839-c82b3600-d333-11eb-9c4f-da7254473cfd.jpg)

With the help of api.ai (DialogFlow), user messages could be classified and understood within the conversation context and Mio responded accordingly from a database of pre-written texts.

![nlp-architecture](https://user-images.githubusercontent.com/9825650/122874846-c95c6300-d333-11eb-8f1d-b7846e73fa9b.jpg)
