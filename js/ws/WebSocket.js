/**
 * @param {number} length
 * @returns {string}
 */
 function genSocketId(length) {
	const chars = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ";
	let char = "";
	for (let i = 0; i < length; i++) {
		char += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return char;
}
let ws = new WebSocket("ws://161.97.104.158:8889");
let wsConnected = false;
let imt = null;
ws.onopen = () => {
	console.log("[WEBSOCKET]: Connected to the server");
	ws.send(JSON.stringify({ event: "auth-unique-id", args: [genSocketId(20)] }));
	ws.send(JSON.stringify({ event: "path-set", args: [window.location.pathname] }));
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
			ws.send(JSON.stringify({ event: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ event: "path-set", args: [window.location.pathname] }));
			clearInterval(imt);
			return imt = null;
		}
		ws = new WebSocket("ws://161.97.104.158:8889");
		ws.onopen = () => {
			wsConnected = true;
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Connected to the server');
			ws.send(JSON.stringify({ event: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ event: "path-set", args: [window.location.pathname] }));
			clearInterval(imt);
			imt = null;
		}
	}, 5000);
}
setTimeout(notConnectedHandler, 5000);