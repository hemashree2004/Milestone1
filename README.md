# Milestone1

Features:
Create Events: Users can create events with a title, description, and scheduled time.
Real-Time Notifications: Notify users via WebSockets when an event is about to start.
Logging Completed Events: Log completed events for future reference.

Endpoints
AddEvent (POST /events): Create a new event with title, description, and time.
GetEvents (GET /events): Fetch all upcoming events.

Event Storage:
Implement event storage with time-based sorting for efficient scheduling.
Polling and Notifications:
Use node-cron to poll events and trigger notifications.
Integrate WebSocket using the ws package for real-time updates.
Logging:
Save completed events asynchronously to a file for historical data.

Prerequisites:
Node.js: Ensure you have Node.js installed. You can check by running node -v in your terminal.
Text Editor: Use any text editor like Visual Studio Code.
I'm using VScode.

Steps I followed:

*Initialisation of the folder:
  npm init
  
*Install node modules:
  npm install express node-cron ws body-parser
  
*Defining event structure and storage

*Setting up the WebSocket for notification:
  creating index.js and updating the code snippet
  
*Running on the server:
  node index.js
  it will show running on the server
  open that localhost to check whether it's there
  
*Once done, open postman 
add new and select post method:
type the url above, select json as the format, type the json snippet, which has the event information and time date, send the request
select get method and send request, type the url above and check whether the posted events are there.

*connect the websocket using URL
*You will get event reminder once it is within 5minutes
*If u update event with same time, It will show "overlap"
