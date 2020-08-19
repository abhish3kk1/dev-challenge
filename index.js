/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

function connectCallback() {
  document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

const exampleSparkline = document.getElementById('example-sparkline')
Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])

/* ABHISHEK */
var currentTab = 'task';
var bids = [];
var subscription = null;

/**
 * Switches the tab to view
 * @param {String} tab - The tab which is clicked
 */
function changeTab(tab) {
  let element, divTab
  if(tab !== currentTab) {
    divTab = document.getElementById(currentTab+"-tab");
    divTab.classList.remove('active')
    element = document.getElementById(currentTab);
    element.style.display = "none";
    currentTab = tab;
    divTab = document.getElementById(currentTab+"-tab");
    divTab.classList.add('active')
    element = document.getElementById(currentTab);
    element.style.display = "block";
  }
}

/**
 * Start Subscription to stomp web socket
 */
function subScribe() {
  if(!subscription) {
    subscription = client.subscribe("/fx/prices", displayBids)
  } else {
    alert("Already subscribed");
  }
}

/**
 * Stop Subscription to stomp web socket
 */
function unSubscribe() {
  if(subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
}

/**
 * Callback function to stomp subscribe function
 * Checks if bid is present in global variable
 * Updates bid in bid array
 * @param {Object} frame - Frame object returned stomp subscribe callback
 */
function displayBids(frame) {
  let bid = JSON.parse(frame.body);
  let bidIndex = bids.findIndex((b) => {
    return b.name == bid.name
  });
  if(bidIndex > -1) {
    for(let prop in bid) {
      bids[bidIndex][prop] = bid[prop];
    }
    console.log(bid.name+' time difference', (Date.now() - bids[bidIndex].time)/1000);
    if(((Date.now() - bids[bidIndex].time)/1000) >= 30) {
      bids[bidIndex].time = Date.now();
      bids[bidIndex]['sparks'] = [...bids[bidIndex]['sparks'], (bid.bestBid+bid.bestAsk)/2]
    }
  } else {
    bid.sparks = [(bid.bestBid+bid.bestAsk)/2];
    bid.time = Date.now();
    bids.push(bid);
  }
  bids.sort((a,b) => b.lastChangeBid - a.lastChangeBid)
  createHTML()
}

/**
 * process stomp data and create HTML
 */
function createHTML() {
  let htmlString = "";
  let bidsTbody = document.getElementById("bids-tbody");
  let bidsTable = document.getElementById("bids-table");
  bidsTbody.innerHTML = "";
  if(bids.length) {
    bids.forEach((bid) => {
      htmlString+="<tr>"+
        "<td>"+bid.name+"</td>"+
        "<td>"+bid.bestBid+"</td>"+
        "<td>"+bid.bestAsk+"</td>"+
        "<td>"+bid.lastChangeBid+"</td>"+
        "<td>"+bid.lastChangeAsk+"</td>"+
        "<td id="+bid.name+"></td>"+
      "</tr>";
    })
    bidsTbody.innerHTML = htmlString
    Object.keys(bids).forEach((name) => {
      let bid = bids[name];
      const sparkline = document.getElementById(bid.name);
      Sparkline.draw(sparkline, bid.sparks);
    })
    bidsTable.classList.remove("hidden")
  } else {
    bidsTable.classList.add("hidden")
  }
}

window.changeTab = changeTab
window.subScribe = subScribe
window.unSubscribe = unSubscribe
window.bids = bids

module.exports = {
  changeTab,
  subScribe,
  unSubscribe
}