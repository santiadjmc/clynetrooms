/**
 * @param {MessageEvent} event
 */
function wsMessageHandler(event) {
	const data = JSON.parse(event.data);
	const eventName = data.event;
	const eventArgs = data.args;
	console.log(`[WEBSOCKET]: Received event ${eventName}`);
	switch (eventName) {
		case "reload": {
			alert("The WebSocket received a reload event, we'll reload ur page");
			window.location.reload();
		}
	}
}
function wsCloseHandler(event) {
	wsConnected = false;
	console.log("[WEBSOCKET]: Unexpectly disconnected from the server, reconnection interval started");
	imt = setInterval(() => {
		console.log("[WEBSOCKET]: Trying to reconnect...");
		if (wsConnected === true) {
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Reconnected to the server');
			ws.send(JSON.stringify({ event: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ event: "path-set", args: [window.location.pathname + `?${paramsArray.map(param => `${param.key}=${param.value}`).join("&")}`] }));
			clearInterval(imt);
			return imt = null;
		}
		ws = new WebSocket("ws://161.97.104.158:8889");
		ws.onopen = () => {
			wsConnected = true;
			ws.onmessage = wsMessageHandler;
			ws.onclose = wsCloseHandler;
			console.log('[WEBSOCKET]: Reconnected to the server');
			ws.send(JSON.stringify({ event: "auth-unique-id", args: [genSocketId(20)] }));
			ws.send(JSON.stringify({ event: "path-set", args: [window.location.pathname + `?${paramsArray.map(param => `${param.key}=${param.value}`).join("&")}`] }));
			clearInterval(imt);
			imt = null;
		}
	}, 5000);
}
ws.onclose = wsCloseHandler;
ws.onmessage = wsMessageHandler;