const C = (tag, props, children) => {
	const element = document.createElement(tag)
	Object.assign(element, props)
	element.append(...children ?? [])
	return element
}

class YtPlayer extends HTMLElement {
	_video_id = ""

	get video_id() {
		return this._video_id
	}

	set video_id(value) {
		const video_id = String(value ?? "")
		this._video_id = video_id
		this.rerender()
		this.setAttribute("video_id", video_id)
	}

	_use_thumbnail = false

	get use_thumbnail() {
		return this._use_thumbnail
	}

	set use_thumbnail(value) {
		const use_thumbnail = !!value
		this._use_thumbnail = use_thumbnail
		this.reset()
		this.setAttribute("use_thumbnail", use_thumbnail)
	}

	_thumbnail_size = "maxresdefault"

	get thumbnail_size() {
		return this._thumbnail_size
	}

	set thumbnail_size(value) {
		const sizes = ["maxresdefault", "default", "sddefault", "mqdefault", "hqdefault"]
		const thumbnail_size = Math.max(0, sizes.indexOf(value))
		this._thumbnail_size = thumbnail_size
		this.rerender()
		this.setAttribute("thumbnail_size", thumbnail_size)
	}

	_thumbnail = ""

	get thumbnail() {
		return this._thumbnail
	}

	set thumbnail(value) {
		this._thumbnail = value
		this.rerender()
		this.setAttribute("thumbnail", value)
	}

	_width = 576

	get width() {
		return this._width
	}

	set width(value) {
		const width = ~~value
		this._width = width
		this.resize()
		this.setAttribute("width", width)
	}

	_height = 324

	get height() {
		return this._height
	}

	set height(value) {
		const height = ~~value
		this._height = height
		this.resize()
		this.setAttribute("height", height)
	}

	_aspect_ratio = 16 / 9

	get aspect_ratio() {
		return this._aspect_ratio
	}

	set aspect_ratio(value) {
		const aspect_ratio = +value || (16 / 9)
		this._aspect_ratio = aspect_ratio
		this.resize()
		this.setAttribute("aspect_ratio", aspect_ratio)
	}

	attributeChangedCallback(name, old_value, new_value) {
		if (old_value === new_value) return
		if (name === "use_thumbnail") {
			this[name] = !!new_value
		} else {
			if (name in this) {
				this[name] = new_value
			}
		}
	}

	static observedAttributes = [
		"video_id",
		"use_thumbnail",
		"thumbnail_size",
		"thumbnail",
		"width",
		"height",
		"aspect_ratio",
	]

	static _sheet = null

	static get sheet() {
		if (this._sheet) return this._sheet

		const sheet = new CSSStyleSheet()

		sheet.replaceSync(`
			:host {
				display: inline-block;
			}
			#thumbnail {
				width: 100%;
				height: 100%;
				display: grid;
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
			}
			#play {
				width: 60px;
				height: 60px;
				margin: auto;
				border-radius: 8px;
				background: red;
				border: 0;
				box-shadow: 0 0 8px 3px #0003;
				cursor: pointer;

				&:after {
					content: "▶";
					font-size: 32px;
					color: white;
				}
			}
			iframe {
				width: 100%;
				height: 100%;
				border: 0;
			}
		`)

		this._sheet = sheet

		return sheet
	}

	connectedCallback() {
		this.resize()
		if (!this.shadowRoot) {
			this.attachShadow({ mode: "open" })
			this.shadowRoot.adoptedStyleSheets = [this.constructor.sheet]
		}
		this.reset()
	}

	resize() {
		let width = this.width
		let height = this.height
		if (width === 0) width = Math.round(height * this.aspect_ratio)
		if (height === 0) height = Math.round(width / this.aspect_ratio)
		this.style.width = width + "px"
		this.style.height = height + "px"
	}

	static getThumbnailURL(video_id, thumbnail_size) {
		return `https://img.youtube.com/vi/${video_id}/${thumbnail_size}.jpg`
	}

	getThumbnailURL() {
		return this.constructor.getThumbnailURL(this.video_id, this.thumbnail_size)
	}

	renderThumbnail() {
		const btn = C("button", { id: "play" })
		const div = C("div", { id: "thumbnail" }, [btn])

		const thumbnail_url = this.thumbnail || this.getThumbnailURL()
		div.style.backgroundImage = `url(${thumbnail_url})`
		btn.onclick = () => {
			this.renderVideo()
		}

		this.shadowRoot?.replaceChildren(div)
	}

	renderVideo() {
		const frame = C("iframe", {
			allowFullscreen: true,
			src: `https://www.youtube.com/embed/${this.video_id}?feature=oembed`,
		})
		this.shadowRoot?.replaceChildren(frame)
	}

	reset() {
		if (!this.shadowRoot) return
		if (this.use_thumbnail) {
			this.renderThumbnail()
		} else {
			this.renderVideo()
		}
	}

	rerender() {
		if (!this.shadowRoot) return
		if (this.shadowRoot.querySelector("#thumbnail")) {
			this.renderThumbnail()
		} else {
			this.renderVideo()
		}
	}
}

customElements.define("yt-player", YtPlayer)

export { YtPlayer }
