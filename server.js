import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import { WebSocketServer } from 'ws';

const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || 'ضع_يوزرك_هنا_بدون_At';
const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT });
console.log('Server running on port ' + PORT);

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  wss.clients.forEach(function(client) {
    if (client.readyState === 1) client.send(msg);
  });
}

const connection = new TikTokLiveConnection(TIKTOK_USERNAME);

connection.connect()
  .then(function(state) {
    console.log('Connected to roomId: ' + state.roomId);
  })
  .catch(function(err) {
    console.error('Connection failed: ' + err.message);
  });

connection.on(WebcastEvent.FOLLOW, function(data) {
  broadcast({ type: 'follow', name: data.user && data.user.uniqueId ? data.user.uniqueId : 'user' });
});

connection.on(WebcastEvent.LIKE, function(data) {
  broadcast({ type: 'like', name: data.user && data.user.uniqueId ? data.user.uniqueId : 'user', count: data.likeCount || 1 });
});

connection.on(WebcastEvent.GIFT, function(data) {
  if (data.giftType === 1 && !data.repeatEnd) return;
  broadcast({ type: 'gift', name: data.user && data.user.uniqueId ? data.user.uniqueId : 'user', gift: data.giftName || 'gift', repeatCount: data.repeatCount || 1 });
});

connection.on(WebcastEvent.CHAT, function(data) {
  broadcast({ type: 'comment', name: data.user && data.user.uniqueId ? data.user.uniqueId : 'user', comment: data.comment || '' });
});

connection.on('disconnected', function() {
  console.log('Disconnected from stream');
});

connection.on('streamEnd', function() {
  console.log('Stream ended');
});
```
