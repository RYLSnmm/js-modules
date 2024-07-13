JavaScript ファイルのモジュール置き場

Gist はインポートし辛いのでここでまとめる

**【使用例】**

- jsdelivr
- esm.sh

```html
<!doctype html>

<script type="module">
	import f from "https://cdn.jsdelivr.net/gh/ryls-github/js-modules@main/modules/example.js"

	console.log(f("jsdelivr"))
</script>

<script type="module">
	import f from "https://esm.sh/gh/ryls-github/js-modules@main/modules/example.js"

	console.log(f("esm.sh"))
</script>
```
