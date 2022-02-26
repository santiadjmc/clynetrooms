let ws = new WebSocket("ws://161.97.104.158:8888");
let wsConnected = false;
let imt = null;
ws.onopen = () => {
	console.log("[WEBSOCKET]: Connected to the server");
	ws.send(JSON.stringify({ name: "auth-unique-id", args: [genSocketId(20)] }));
	ws.send(JSON.stringify({ name: "path-set", args: [window.location.pathname] }));
	wsConnected = true;
}
function notConnectedHandler() {
	if (wsConnected === true) return;
	console.log("[WEBSOCKET]: 5s elapsed and the WebSocket is not connected, starting connection interval");
	imt = setInterval(() => {
		console.log("[WEBSOCKET]: Trying to connect...");
		if (wsConnected === true) {
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Connected to the server');
			ws.send(JSON.stringify({ name: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ name: "path-set", args: [window.location.pathname] }));
			clearInterval(imt);
			return imt = null;
		}
		ws = new WebSocket("ws://161.97.104.158:8888");
		ws.onopen = () => {
			wsConnected = true;
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Connected to the server');
			ws.send(JSON.stringify({ name: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ name: "path-set", args: [window.location.pathname] }));
			clearInterval(imt);
			imt = null;
		}
	}, 5000);
}
setTimeout(notConnectedHandler, 5000);