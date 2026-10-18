#!/bin/zsh
# Render one frame range of the film with progress shown, under a watchdog:
# if no new frame is rendered for 2 minutes, the chunk is killed, the range
# reported, and it is retried once with --concurrency=1.
# usage: scripts/render-chunk.sh <first> <last> <out.mp4> [concurrency]
cd "${0:A:h}/.."
first=$1; last=$2; out=$3; conc=${4:-4}
export REMOTION_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
attempt() {
  local c=$1 log="$out.log"
  : > "$log"
  npx remotion render src/index.ts BrandFilm "$out" --frames=$first-$last --codec=h264 --crf=16 --x264-preset=slow \
    --pixel-format=yuv420p --scale=1.3333333333333333 --concurrency=$c --log=info > "$log" 2>&1 &
  local pid=$! last_n="" last_t=$(date +%s)
  while kill -0 $pid 2>/dev/null; do
    sleep 10
    # Remotion prints "Rendered <n>/<total>" (and "Encoded …") as it goes.
    local n=$(grep -oE "Rendered [0-9]+/[0-9]+" "$log" | tail -1)
    if [[ "$n" != "$last_n" ]]; then last_n=$n; last_t=$(date +%s); echo "[$first-$last c$c] $n"; fi
    if (( $(date +%s) - last_t > 120 )); then
      echo "WATCHDOG: no new frames for 2 min in $first-$last (c$c, last: ${last_n:-none}); killing"
      pkill -P $pid; kill -9 $pid 2>/dev/null; pkill -f "react-motion-render" ; return 2
    fi
  done
  wait $pid
}
attempt $conc && { echo "OK $first-$last"; exit 0; }
echo "RETRY $first-$last with --concurrency=1"
attempt 1 && { echo "OK $first-$last (c1)"; exit 0; }
echo "FAILED $first-$last"; exit 1
