require('dotenv').config()

const Mopidy = require("mopidy");
const sampleSize = require("lodash/sampleSize");
const compact = require("lodash/compact");

const mopidy = new Mopidy({
    webSocketUrl: `ws://${process.env.HOST}:${process.env.PORT}/mopidy/ws/`,
});

const TRACKLIMIT = process.env.TRACKLIMIT || 10;
const NUMBER_TO_ADD = process.env.NUMBER_TO_ADD || 30;

mopidy.on("state", stateChanged);
mopidy.on("event", eventTriggered);

async function fetchNumberOfTracks() {
    return mopidy.tracklist.getTlTracks();
}

function addRandomTracks() {
    mopidy.library.browse(["local:directory?type=track"]).then(data => {
        const uris = sampleSize(arrayOf('uri', data), NUMBER_TO_ADD);
        console.log(uris);
        mopidy.tracklist.add({uris: uris});
    });
}

function stateChanged(state) {
    if (state == 'state:online') {
        console.log('state: online');
        fetchNumberOfTracks().then(tracks => {
            if (tracks.length < TRACKLIMIT) {
                console.log("adding Tracks after state:online State Change");
                addRandomTracks();
            }
        });
    }
}

function eventTriggered(event) {
    if (event == 'event:tracklistChanged') {
        console.log('event: tracklistChanged');
        fetchNumberOfTracks().then(tracks => {
            if (tracks.length < TRACKLIMIT) {
                console.log("adding Tracks after tracklistChanged Event");
                addRandomTracks();
            }
        });
    }
}

////////////////
// helpers from Iris/src/js/util/arrays.js
//////////////

const arrayOf = (property, items = []) => {
  const array = [];
  items.forEach(
    (item) => {
      if (item[property] === undefined) return;
      if (item[property] === null) return;
      array.push(item[property]);
    },
  );
  return array;
};

const indexToArray = (index, keys) => {
  if (!index) return [];

  if (keys) {
    return compact(keys.map((key) => index[key]));
  }
  return compact(Object.keys(index).map((key) => index[key]));
};