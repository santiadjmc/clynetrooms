async function checkUserTag(tag) {
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