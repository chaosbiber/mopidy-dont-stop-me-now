require('dotenv').config()

const Mopidy = require("mopidy");
const sampleSize = require("lodash/sampleSize");
const compact = require("lodash/compact");

const mopidy = new Mopidy({
    webSocketUrl: `ws://${process.env.HOST}:${process.env.PORT}/mopidy/ws/`,
});

const TRACKLIMIT = process.env.TRACKLIMIT || 10;
const NUMBER_TO_ADD = process.env.NUMBER_TO_ADD || 30;
const ENABLE_CONSUME = process.env.ENABLE_CONSUME || true;

mopidy.on("state", stateChanged);
mopidy.on("event", eventTriggered);

async function fetchNumberOfTracks() {
    return mopidy.tracklist.getTlTracks();
}

function addRandomTracks() {
    if (ENABLE_CONSUME) {
        mopidy.tracklist.setConsume({value: true});
    }
    mopidy.library.browse(["local:directory?type=track"]).then(data => {
        const uris = sampleSize(arrayOf('uri', data), NUMBER_TO_ADD);
        console.log(uris);
        mopidy.tracklist.add({uris: uris});
    });
}

function stateChanged(state) {
    console.log('state changed to:', state);
    if (state == 'state:online') {
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