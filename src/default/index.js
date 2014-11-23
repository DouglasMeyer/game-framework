game.loadScripts = function loadScripts(){
  var promises = Array.prototype.map.call(arguments, function(src){
    return game.loadScript(src);
  });
  return Promise.all(promises);
};

game.loadScripts(
  '//game_framework.dev/default/create-element.js',
  '//cdn.firebase.com/js/client/2.0.4/firebase.js',
  '//cdn.peerjs.com/0.3/peer.js'
).then(function(){
  var firebaseRef = new Firebase("https://crackling-inferno-7109.firebaseio.com/");
  var peer = new Peer({key: 'p6zcgijuvfclq5mi'});
  peer.on('error', function(err){ console.error('peer error:', err); });
  peer.on('close', function(){ console.error('peer close:', arguments); });
  peer.on('disconnected', function(){ console.error('peer disconnected:', arguments); });

  var firebaseSecret = location.hash.match(/^(.*)#firebase_secret=([^#]+)(.*)$/);
  if (firebaseSecret) {
    //location.hash = firebaseSecret[1]+firebaseSecret[3];
    createElement({ textContent: 'You are the host' });

    var connections = [];
    peer.on('connection', function(conn){
      connections.push(conn);

      conn.on('data', function(data){
        createElement({ textContent: conn.id+': '+JSON.stringify(data) });
        data.who = conn.id;
        for (var c of connections){
          c.send(data);
        }
      });
    });

    Promise.all([
      new Promise(function(resolve, reject){ peer.on('open', resolve); }),
      new Promise(function(resolve, reject){
        firebaseRef.authWithCustomToken(firebaseSecret[2], function(err, authData){
          if (err) reject(err);
          else resolve(authData);
        });
      })
    ]).then(function(myPeerId, authArgs){
      firebaseRef.child('rooms').set({ default: peer.id });
    }, function(err){
      console.error('peer connection or firebaseRef.authWithCustomToken error:', err);
    });

    return;
  }



  firebaseRef.child('rooms').on('value', function(snapshot){
    console.log('got rooms:', snapshot.val());

    var conn = peer.connect( snapshot.val().default );
    conn.on('data', function(data){
      createElement({ textContent: data.who+': '+data.says });
    });
    conn.on('close', function(){ console.error('connection close:', arguments); });
    conn.on('error', function(){ console.error('connection error:', arguments); });

    var input = createElement({
      tag: 'input',
      '@type': 'text'
    });
    input.addEventListener('keypress', function(e){
      if (e.keyIdentifier === 'Enter'){
        conn.send({ says: input.value });
        input.value = '';
      }
    }, false);

  });


}, function(){
  console.err('loadScripts error', arguments);
});

//// echo chamber
//var audio = createElement('audio');
//navigator.webkitGetUserMedia({audio:true}, function(stream){
//  audio.src = window.URL.createObjectURL(stream);
//  audio.play();
//}, function(e){ console.error('getUserMedia error: ', e); });

