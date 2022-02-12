let ws = new WebSocket("ws://localhost/");
let wsConnected = false;
let imt = null;
ws.onopen = () => {
	console.log("[WEBSOCKET]: Connected to the server");
	wsConnected = true;
}
function notConnectedHandler() {
	if (wsConnected === true) return;
	console.log("[WEBSOCKET]: 500ms elapsed and the WebSocket is not connected, starting connection interval");
	imt = setInterval(() => {
		console.log("[WEBSOCKET]: Trying to connect...");
		if (wsConnected === true) {
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Connected to the server');
			ws.send(JSON.stringify({ name: "auth-unique-id", args: [genSocketId(20)] }));
			clearInterval(imt);
			return imt = null;
		}
		ws = new WebSocket("ws://localhost/");
		ws.onopen = () => {
			wsConnected = true;
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Connected to the server');
			ws.send(JSON.stringify({ name: "auth-unique-id", args: [genSocketId(20)] }));
			clearInterval(imt);
			imt = null;
		}
	}, 5000);
}
setTimeout(notConnectedHandler, 500);