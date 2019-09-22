
const express = require('express');
const app = express();
const fetch = require("node-fetch");
var cors = require('express-cors')
var bodyParser = require('body-parser');


app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));



app.use(cors({
    allowedOrigins: [
        'localhost:3000',
        'intelliship-pro-store.herokuapp.com'
    ]
}))


const bins = {
  // in grams
  "Bin1" : {
    "w" : 20,
    "h" : 20,
    "d" : 20,
    "id": "SmallBin"
  },
  "Bin2" : {
    "w" : 40,
    "h" : 40,
    "d" : 40,
    "id" : "MediumBin"
  },
  "Bin3" : {
    "w" : 100,
    "h" : 100,
    "d" : 100,
    "id" : "LargeBin"
  },
  "Bin4" : {
    "w" : 50,
    "h" : 50,
    "d" : 300,
    "id" : "LongBin"
  },
  "Bin5" : {
    "w" : 110,
    "h" : 110,
    "d" : 110,
    "id" : "XLargeBin"
  },
}

const emptyBin = {
   "bins": [
    {
       "w": 0,
       "h": 0,
       "d": 0,
       "id": "EmptyBin"
    }
   ]
}

const binParams = {
     "params": {
      "images_background_color": "255,255,255",
      "images_bin_border_color": "59,59,59",
      "images_bin_fill_color": "230,230,230",
      "images_item_border_color": "214,79,79",
      "images_item_fill_color": "177,14,14",
      "images_item_back_border_color": "215,103,103",
      "images_sbs_last_item_fill_color": "99,93,93",
      "images_sbs_last_item_border_color": "145,133,133",
      "images_width": 100,
      "images_height": 100,
      "images_source": "file",
      "images_sbs": 1,
      "stats": 1,
      "item_coordinates": 1,
      "images_complete": 1,
      "images_separated": 1
   }
}

const productSpecs = {
  // in grams
      "001" : {
        "name": "Brown Watch",
        "weight" : 500,
        "w" : 50,
        "h" : 50,
        "d" : 40
      },
      "002" : {
        "name" : "Black Watch",
        "weight" : 400,
        "w" : 40,
        "h" : 40,
        "d" : 40
      },
     "003" : {
       "name" : "Chair",
       "weight" : 2000,
       "w" : 82,
       "h" : 101,
       "d" : 96
     },
     "004" : {
      "name" : "Toy Car",
      "weight" : 200,
      "w" : 5,
      "h" : 15,
      "d" : 15
    },
     "005" : {
       "name" : "Cotton Mat",
       "weight" : 1000,
       "w" : 10,
       "h" : 30,
       "d" : 30
     }
}

app.get('/getOptimizedPacking', async function(request, response) {
  
  
  var items = request.query
  
  //construct request body
  var requestBody = {
    "bins": [],
    "items": [],
    "username": process.env.USERNAME,
    "api_key": process.env.API_KEY,
  }
  
  

  
  for (var item in items) {
    var itemObj = {}
    itemObj[item] = {}
    
    
    console.log(productSpecs[item])
    itemObj[item]['w'] = productSpecs[item]['w']
    itemObj[item]['h'] = productSpecs[item]['h']
    itemObj[item]['d'] = productSpecs[item]['d']
    itemObj[item]['id'] = item
    itemObj[item]['q'] = items[item]
    // console.log(item, items[item]);
    requestBody["items"].push(itemObj[item])
  }
  


  
  for (var bin in emptyBin) {   
    requestBody["bins"].push(bins[bin])
    requestBody["bins"]
  }
  
  requestBody["params"] = binParams["params"]
  
  console.log(requestBody)

  const rawResponse = await fetch('https://asia1.api.3dbinpacking.com/packer/findBinSize', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  var content = await rawResponse.json()
  
  console.log(content)
  

  response.send(content);
});



// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
