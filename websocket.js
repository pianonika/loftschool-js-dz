var fs = require('fs');
var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 8090});


var connections = [];
var path = './data.json';
var dataPoints = { 
    type: 'FeatureCollection', 
    features: []
};
var nextIndexPoint = 1;
new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response);
            }
        })
    })
    .then( function(data)
    {
        dataPoints = JSON.parse(data); 
        nextIndexPoint = dataPoints.features[dataPoints.features.length-1].properties.id + 1;  
    }, function()
    {
        console.log('no file');
    })


wss.on('connection', function connection(ws) {
    console.log('new connection');
    connections.push(ws);
    var points = dataPoints.features;
    points.forEach(function (point){
        ws.send (JSON.stringify(point));
    });

    ws.on('message', function incoming(message) {
        console.log('==========');
        console.log('new point "%s"', message);

        var placemark = JSON.parse(message);
        placemark.properties.id = nextIndexPoint;
        ++nextIndexPoint;
        dataPoints.features.push(placemark);

        fs.writeFile(path, JSON.stringify(dataPoints), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });

        connections.forEach(function(connection) {
            console.log('sending point to clients');

            connection.send(JSON.stringify(placemark), function(e) {
                if (e) {
                    connections = connections.filter(function(current) {
                        return current !== connection;
                    });

                    console.log('close connection');
                }
            });
        });

        console.log('==========');
    });

    ws.on('close', function() {
        connections = connections.filter(function(current) {
            return current !== ws;
        });

        console.log('close connection');
    });
});
