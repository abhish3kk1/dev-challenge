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

function changeTab(tab) {
  var element, divTab
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
/* request the topic /fx/prices, to receive update messages */
function subScribe() {
  if(!subscription) {
    subscription = client.subscribe("/fx/prices", displayBids)
  } else {
    alert("Already subscribed");
  }
}

function unSubscribe() {
  if(subscription) {
    subscription.unsubscribe();
    subscription = null;
    /* StompVersion error appears for which I was unable to find solution */
  }
}

function displayBids(frame) {
  var bid = JSON.parse(frame.body);
  let bidExists = false;
  bids.forEach((b) => {
    if(b.name==bid.name) {
      bidExists = true
    }
  })
  if(!bidExists) {
    console.log(bid)
    bids.push(bid)
    /* The table should be sorted (and remain sorted) by the column that indicates how much the best bid price last changed (lastChangeBid in the response data). */
    /* Ascending/Descending order was not given so, I am assuming ascending order */
    bids.sort((a,b) => a.lastChangeBid - b.lastChangeBid)
    createHTML()
  }
}

function createHTML() {
  let html = "";
  let bidsTbody = document.getElementById("bids-tbody");
  let bidsTable = document.getElementById("bids-table");
  let sparkline = document.getElementById('abhishek-sparkline')
  let sparks = []
  let sparkLineOptions = {
    height : null,
    lineColor : "black",
    lineWidth : 2,
    startColor : "green",
    endColor : "red",
    maxColor : "transparent",
    minColor : "transparent",
    minValue : null,
    maxValue : null,
    dotRadius : 4,
  }
  bidsTbody.innerHTML = "";
  if(bids && bids.length) {
    bids.forEach((bid) => {
      html+="<tr>"+
              "<td>"+bid.name+"</td>"+
              "<td>"+bid.bestBid+"</td>"+
              "<td>"+bid.bestAsk+"</td>"+
              "<td>"+bid.lastChangeBid+"</td>"+
              "<td>"+bid.lastChangeAsk+"</td>"+
            "</tr>";
      /* The midprice can be calculated by adding the bestBid and bestAsk fields together and dividing by 2. */
      let midPrice = (bid.bestBid+bid.bestAsk)/2
      sparks.push(midPrice);
    })
    /* Sparkline should be drawn after/before sorting? I am assuming after */
    Sparkline.draw(sparkline, sparks, sparkLineOptions)
    bidsTbody.innerHTML = html;
    bidsTable.classList.remove("hidden")
  } else {
    bidsTable.classList.add("hidden")
  }
}

window.changeTab = changeTab
window.subScribe = subScribe
window.unSubscribe = unSubscribe
window.bids = bids