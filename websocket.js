
var WebSocketServer = require('websocket').server;
var http = require('http');

//Porta que o server irá escutar
const port = 8080;

var Estado = false;
var time = 1000;


////////SOKET IO
const appIO = require('express')();
const httpIO = require('http').Server(appIO);
const io = require('socket.io')(httpIO);
const portIO = process.env.PORT || 3000;

appIO.get('/', (req, res) => {
  res.sendFile(__dirname + '/TelaInicial.html');
});

io.on('connection', (socket) => {
  socket.on('chat message', msg => {
    io.emit('chat message', Estado);
  });

  socket.on('TempoMudou', msg => {
    console.log('Tempo mudou para: ' + msg);
    time = msg;
  });

});




httpIO.listen(portIO, () => {
  console.log(`Socket.IO server running at http://localhost:${portIO}/`);
});
////////SOKET IO





//Cria o server
var server = http.createServer();

//Server irá escutar na porta definida em 'port'
server.listen(port, () => {
    //Server está pronto
    console.log(`Server está executando na porta ${port}`);
});

//Cria o WebSocket server
wsServer = new WebSocketServer({
  httpServer: server
});

//Chamado quando um client deseja conectar
wsServer.on('request', (request) => {
    //Estado do led: false para desligado e true para ligado
    let state = false;

    //Aceita a conexão do client
    let client = request.accept(null, request.origin);

    //Chamado quando o client envia uma mensagem
    client.on('message', (message) => {
        //Se é uma mensagem string utf8
        if (message.type === 'utf8') {
            //Mostra no console a mensagem
            console.log(message.utf8Data);
        }
    });


    //Tempo que fica piscando essa bagaça
    function timeout() {
      setTimeout(function () {
                  //Envia para o client "ON" ou "OFF" dependendo do estado atual da variável state
          client.sendUTF(state? "ON" : "OFF");
          //Inverte o estado
          state = !state;
          //Mostra na tela o estado
          io.emit('chat message', state);
          timeout();
      }, time);
    };
    timeout();




    //Chamado quando a conexão com o client é fechada
    client.on('close', () => {
        console.log("Conexão fechada");
        //Remove o intervalo de envio de estado
        clearInterval(interval);
    });
});