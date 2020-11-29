# Chat

I put this together for two reasons. For some time now, I have been looking for a way to communicate with my teenage sons while they are in the midst of some online gaming experience (which seems to be most of the time these days). It had got to the point that they wouldn´t answer their phones or check their WhatsApp messages and I would have to resort to speaking to them via Discord. Or, in the case of the younger one who is at least still in the same house, I would have to go upstairs and switch the light on and off a few times so that he would take his headphones off. This little web application allows me to send text and audio messages, so I can effectively broadcast when it is "Time for dinner!".

The second reason for doing this was that I was looking for a simple example as a starting point for the aforementioned teenage sons to develop a simple online game. I have suggested that they make an online Cards Against Humanity game, so that we can play with the eldest (who is at university). As a result, I have deliberately made the code as simple as I can rather than making the application particularly robust, attractive or portable.

The backend is a Node.JS HTTP server that serves up the frontend index.html as well as handles sending and receiving messages via websockets. The frontend is a static webpage that uses MediaRecorder to record the audio.
