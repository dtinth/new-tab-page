# dtinth’s Chrome new tab page

## Features

When opening a new tab, I see a clock.

![Screenshot](docs/images/clock.png)

Scrolling down, I see the most recent tweets from a subset of my Twitter friends.
Since some friends tweet a lot while others occasionally, I made it so that it displays at most 1 latest tweet per person, so tweets by friends who don’t tweet a lot don’t get drowned.

![Screenshot](docs/images/twitter.png)

## Setup

My new tab page setup contains 3 parts.

1. The Chrome extension that replaces the new tab page. It does not talk to any third-party APIs (like Twitter API), but reads data through the database hosted on Firebase Firestore. It contains:

   - The background script that synchronizes the data between the browser and Firebase.
     This is so that the latest information is displayed right away and so that we don't have to download new data every time we open a new tab.
   - The new tab page which requests the data from the background script and displays it.

2. A Firebase project that stores the data.

   - Firebase Cloud Firestore is used to store the data and provide synchronization mechanism to the Chrome extension.
   - Firebase Cloud Function exposes a data ingestion API.

3. A Webtask that periodically fetches data from Twitter (and other sources) and sends it to the ingestion API.
