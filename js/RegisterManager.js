async function getUserByTag(tag) {
    const request = await fetch("/api/discord/users");
    const req = await request.json();
    if (req.error) {
        logs.error("api", `Couldn't retrieve discord users, reason: ${req.message}`);
        alert(`[API]: ${req.message}`);
        return window.location.reload();
    }
    if (req.warning) {
        logs.warn("api", req.warning);
    }
    const foundUser = req.users.find(u => u.tag === tag);
    if (!foundUser) return null;
    else return foundUser;
}
async function sendForm(tagId, messageId, buttonId) {
    const tag = document.getElementById(tagId);
    const message = document.getElementById(messageId);
    const btn = document.getElementById(buttonId);
    tag.style.backgroundColor = "white";
    btn.disabled = true;
    btn.innerText = "Cargando...";
    tag.disabled = true;
    message.disabled = true;
    const foundU = await getUserByTag(tag.value);
    if (!foundU) {
        btn.disabled = false;
        btn.innerText = "Enviar";
        tag.disabled = false;
        message.disabled = false;
        tag.style.backgroundColor = "red";
        setTimeout(() => tag.style.backgroundColor = "white", 3000);
        alert("Invalid Tag");
        return;
    }
    const request = await fetch("/api/users/pending", { method: "post", headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ data: { discordId: foundU.userId, message: message.value } }) });
    const req = await request.json();
    if (req.alreadyConfirmating) {
        tag.disabled = false;
        message.disabled = false;
        btn.disabled = false;
        btn.innerText = "Enviar";
        return alert(`Ya se ha enviado el mensaje de confirmacion, por favor revisa tus mensajes directos.`);
    }
    if (req.alreadyIn) {
        tag.disabled = false;
        message.disabled = false;
        btn.disabled = false;
        btn.innerText = "Enviar";
        return alert(`Ya hay una solicitud pendiente a nombre de ${foundU.displayName}`);
    }
    if (req.alreadyRegistered) {
        tag.disabled = false;
        message.disabled = false;
        btn.disabled = false;
        btn.innerText = "Enviar";
        return alert(`Ya hay una cuenta registrada a nombre del usuario ${foundU.displayName}`);
    }
    if (!req.dmable) {
        tag.disabled = false;
        message.disabled = false;
        btn.disabled = false;
        btn.innerText = "Enviar";
        return alert(`No se pueden enviar mensajes a ${foundU.displayName}, por favor activa los mensajes directos antes de volver a intentar`);
    }
    btn.disabled = false;
    tag.value = "";
    message.value = "";
    tag.disabled = false;
    message.disabled = false;
    btn.innerText = "Enviar";
    alert(`Solicitud enviada, un mensaje de confirmacion va a ser enviado a ${foundU.displayName}`);
}