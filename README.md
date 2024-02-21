# Common Room
> Your place to have fun!
> Live demo [_here_](https://commonroom-d0a42.web.app/)

## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Screenshots](#screenshots)
* [Setup](#setup)

## General Information
- This web aplication allows players to spend time together while playing simple games.


## Technologies Used
- Firebase Authentication
- Firebase Realtime Database
- p5.js
- webpack
- OpenAI API


## Features
- Canvas mode
- Shuffle mode
- Gotta go fast! mode
- Sign up, log in
- User profile updates
- Separate rooms for players
- Chat (for rooms)


## Screenshots
Menu:

[![image.png](https://i.postimg.cc/zfmgT5HB/image.png)](https://postimg.cc/jDX2rpX0)

Canvas:

[![image.png](https://i.postimg.cc/BvqJV78P/image.png)](https://postimg.cc/XrzMZ8kn)

Shuffle:

[![image.png](https://i.postimg.cc/fTnyvKvm/image.png)](https://postimg.cc/7b9qHSdZ)

[![image.png](https://i.postimg.cc/XvJYvDVS/image.png)](https://postimg.cc/WdBvW8FX)

Gotta draw fast!:

[![image.png](https://i.postimg.cc/tCjR6gXz/image.png)](https://postimg.cc/Hj6CDd8J)

[![image.png](https://i.postimg.cc/MGvzwMDz/image.png)](https://postimg.cc/sBdk92qL)

Sign up, log in:

[![image.png](https://i.postimg.cc/66dtBNd4/image.png)](https://postimg.cc/F1s2x8Ch)

User profile updates:

[![image.png](https://i.postimg.cc/1zn12xmt/image.png)](https://postimg.cc/kVmHRpt3)

Separate rooms for players:

[![image.png](https://i.postimg.cc/XJ9SNwy6/image.png)](https://postimg.cc/bDYF3STm)

Chat:

[![image.png](https://i.postimg.cc/Hn3Nj3YR/image.png)](https://postimg.cc/PvpyRW8Q)

## Setup

Clone the repository:

    git clone https://github.com/HPL21/common-room.git

Install dependencies:

    npm install

Set up environment variables:

- Create a .env file and provide the required OpenAI API key.

Create Firebase Project:

- Set up a [_Firebase_](https://firebase.google.com/) project, register app, copy firebaseConfig and paste it in firebase.js file, then set up authentication method (Email/Password) and Realtime Database with rules from database.rules.json file. Then copy your database URL and modify your firebase config: databaseURL: "yourURL". Also modify .firebaserc file with your projectId.

Install Firebase Tools globally:

    npm install -g firebase-tools

Authenticate Firebase:

    firebase login

Resolve permission issues (if any):

- If facing issues, run PowerShell as an administrator and execute the command:

        Set-ExecutionPolicy RemoteSigned

Bundle the application:

    npx webpack

Serve the application locally:

    firebase serve --only hosting

