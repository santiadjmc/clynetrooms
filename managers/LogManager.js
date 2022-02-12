require("colors");
class LogManager {
	/**
	 * @param {string[]} sources
	 */
	constructor(sources = []) {
		this.sources = sources;
		if (!sources.includes("log-manager")) this.sources.push("log-manager");
		if (!sources.includes("unknown")) this.sources.push("unknown");
		if (sources.length < 1) this.warn("log-manager", "There are no soruces in the sources array, so only unknown sources will be accepted");
	}
	/**
	 * @param {string} source
	 * @param {string} message
	 */
	error(source, message) {
		if (!source) return this.error("log-manager", `The source parameter at LogManager.error() is mandatory`);
		if (typeof source !== "string") return this.error("log-manager", `The source parameter at LogManager.error() must be of type string, received ${typeof source}`);
		if (!message) return this.error("log-manager", `The message parameter at LogManager.error() is mandatory`);
		if (typeof message !== "string") return this.error("log-manager", `The message parameter at LogManager.error() must be of type string, received ${typeof source}`);
		if (!this.sources.some(s => source.toLowerCase() === s)) return this.error("log-manager", `Unknown source '${source}' at LogManager.error()`);
		console.log(`[${source.toUpperCase()}][ERROR]: ${message}`.brightRed);
	}
	/**
	 * @param {string} source
	 * @param {string} message
	 */
	warn(source, message) {
		if (!source) return this.error("log-manager", `The source parameter at LogManager.warn() is mandatory`);
		if (typeof source !== "string") return this.error("log-manager", `The source parameter at LogManager.warn() must be of type string, received ${typeof source}`);
		if (!message) return this.error("log-manager", `The message parameter at LogManager.warn() is mandatory`);
		if (typeof message !== "string") return this.error("log-manager", `The message parameter at LogManager.warn() must be of type string, received ${typeof source}`);
		if (!this.sources.some(s => source.toLowerCase() === s)) return this.error("log-manager", `Unknown source '${source}' at LogManager.warn()`);
		console.log(`[${source.toUpperCase()}][WARNING]: ${message}`.brightYellow);
	}
	/**
	 * @param {string} source
	 * @param {string} message
	 */
	info(source, message) {
		if (!source) return this.error("log-manager", `The source parameter at LogManager.info() is mandatory`);
		if (typeof source !== "string") return this.error("log-manager", `The source parameter at LogManager.info() must be of type string, received ${typeof source}`);
		if (!message) return this.error("log-manager", `The message parameter at LogManager.info() is mandatory`);
		if (typeof message !== "string") return this.error("log-manager", `The message parameter at LogManager.info() must be of type string, received ${typeof source}`);
		if (!this.sources.some(s => source.toLowerCase() === s)) return this.error("log-manager", `Unknown source '${source}' at LogManager.info()`);
		console.log(`[${source.toUpperCase()}][INFO]: ${message}`.grey);
	}
	/**
	 * @param {string} source
	 * @param {string} message
	 */
	success(source, message) {
		if (!source) return this.error("log-manager", `The source parameter at LogManager.success() is mandatory`);
		if (typeof source !== "string") return this.error("log-manager", `The source parameter at LogManager.success() must be of type string, received ${typeof source}`);
		if (!message) return this.error("log-manager", `The message parameter at LogManager.success() is mandatory`);
		if (typeof message !== "string") return this.error("log-manager", `The message parameter at LogManager.success() must be of type string, received ${typeof source}`);
		if (!this.sources.some(s => source.toLowerCase() === s)) return this.error("log-manager", `Unknown source '${source}' at LogManager.success()`);
		console.log(`[${source.toUpperCase()}][SUCCESS]: ${message}`.green);
	}
}
module.exports = LogManager;