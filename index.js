var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const fs = require('fs');

// Página principal
app.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});


//dados principais
app.get('/google/:id', function(req, res){
  let tempo= new Date();

  if(req.params.id.includes("Que tempo está em ")){ 
    // api key 
    apikey="c1c9c0636e9e4e442d2769d9e61c6f9a";
    // remove parte da string para obter a localizacao
    localizacao = req.params.id.replace(/Que tempo está em /g,'');
    //forma o link da api
    api="http://api.openweathermap.org/data/2.5/weather?q="+localizacao+"&appid="+apikey+"&lang=pt";

    let data = '';
    let t;
    let resposta;
    //obter dados
    const http = require('http');
    http.get(api, (resp) => {
      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        let json = JSON.parse(data);
        //console.log(json);
        try{
          t=json.weather[0].description;
          //console.log(t);
          resposta="Está "+ t +" em "+localizacao;
        }catch{
          resposta="Localização Invalida!";
        }
        console.log(req.params.id + " - "+ resposta +" - "+ tempo);
        //Monstra na index em tempo real
        io.emit('chat message', req.params.id + " - "+ resposta +" - "+ tempo);
        //enviar a string
        res.send(resposta);
      });
    }).on("error", (err) => {

    });

  }else{
      console.log(req.params.id + " - " + tempo);
      //Monstra na index em tempo real
      io.emit('chat message', req.params.id + " - " + tempo);
      res.send('Speech: ' + req.params.id + ' Time: ' + tempo);
  }

  var obj = {
    table: []
  };

  fs.readFile('jsontest.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    } else {
      //transforma em objeto
      obj = JSON.parse(data); 
      //adiciona dados
      obj.table.push({Time: tempo, Speech:req.params.id}); 
      let json = JSON.stringify(obj); 
      //escreve no ficheiro
      fs.writeFileSync('jsontest.json', json); 
    }});
});


//mostrar logs pela file
app.get('/logs', function(req, res){
  let rawdata = fs.readFileSync('jsontest.json');
  let logs = JSON.parse(rawdata);
  res.send(logs);
});

http.listen(port, function(){
  console.log('Aberto em localhost:' + port);
});

