#!/bin/zsh
# The whole film in 10 chunks under the watchdog (render-chunk.sh), then
# joined losslessly (the chunks share every encoder setting).
cd "${0:A:h}/.."
total=3930; n=10; size=$(( (total + n - 1) / n ))
mkdir -p out/chunks; : > out/chunks/list.txt
start=$(date +%s)
for ((k=0; k<n; k++)); do
  a=$(( k * size )); b=$(( a + size - 1 )); (( b > total - 1 )) && b=$(( total - 1 ))
  f=$(printf "out/chunks/c%02d.mp4" $k)
  echo "== chunk $((k+1))/$n: frames $a-$b ($(( $(date +%s) - start ))s elapsed)"
  ./scripts/render-chunk.sh $a $b $f 4 || { echo "STOPPED at chunk $((k+1)) ($a-$b)"; exit 1; }
  echo "file '${f:t}'" >> out/chunks/list.txt
done
npx remotion ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -c copy -movflags +faststart out/brand-film.mp4
echo "JOINED out/brand-film.mp4 in $(( $(date +%s) - start ))s"
