
#!/bin/bash
URL='https://google.com/search?q='
QUERY=$(echo '' | dmenu -p "Google" -fn "Noto Mono-10" -nb "#002b36" -nf "#839496" -sb "#073642" -sf "#93a1a1")
if [ -n "$QUERY" ]; then
	xdg-open "${URL}${QUERY}" 2> /dev/null
	exec i3-msg [class="^Chromium$"] focus
fi