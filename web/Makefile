

default:
	./node_modules/.bin/esbuild \
		src/main.tsx \
		--bundle \
		--sourcemap \
		--define:process.env.NODE_ENV=\"production\" \
		--outfile=static/bundle.js \
		--minify

watch:
	find -name '*.tsx' -o -name '*.js' | entr make