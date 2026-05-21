#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$ROOT/marketing/video"
FONT="/System/Library/Fonts/Supplemental/Arial Bold.ttf"
INPUT1="$ROOT/assets/og-whiteout-tools.png"
INPUT2="$ROOT/qa-redesign-hero.png"
INPUT3="$ROOT/qa-redesign-desktop.png"
OUTPUT="$OUT_DIR/wos-launch-short.mp4"

mkdir -p "$OUT_DIR"

ffmpeg -y \
  -loop 1 -t 5 -i "$INPUT1" \
  -loop 1 -t 5 -i "$INPUT2" \
  -loop 1 -t 5 -i "$INPUT3" \
  -filter_complex "\
[0:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,zoompan=z='min(zoom+0.0008,1.08)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',scale=1080:1920,setsar=1,fade=t=in:st=0:d=0.4,fade=t=out:st=4.6:d=0.4[s0]; \
[1:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,zoompan=z='min(zoom+0.0008,1.08)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',scale=1080:1920,setsar=1,fade=t=in:st=0:d=0.4,fade=t=out:st=4.6:d=0.4[s1]; \
[2:v]scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080,zoompan=z='min(zoom+0.0008,1.08)':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)',scale=1080:1920,setsar=1,fade=t=in:st=0:d=0.4,fade=t=out:st=4.6:d=0.4[s2]; \
[s0][s1][s2]concat=n=3:v=1:a=0[bg]; \
[bg]drawbox=x=0:y=0:w=iw:h=250:color=black@0.42:t=fill, \
drawbox=x=40:y=1530:w=1000:h=300:color=black@0.42:t=fill, \
drawtext=fontfile='$FONT':text='Still checking WOS codes in random chats?':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=88:enable='between(t,0,3.2)', \
drawtext=fontfile='$FONT':text='Copy codes. Time Frostfire. Plan FC.':fontcolor=white:fontsize=54:x=(w-text_w)/2:y=160:enable='between(t,0.5,4.2)', \
drawtext=fontfile='$FONT':text='Quick code board':fontcolor=white:fontsize=68:x=70:y=1570:enable='between(t,0,5)', \
drawtext=fontfile='$FONT':text='Fast copy + source labels':fontcolor=white:fontsize=42:x=70:y=1650:enable='between(t,0.2,5)', \
drawtext=fontfile='$FONT':text='Frostfire Mine timer':fontcolor=white:fontsize=68:x=70:y=1570:enable='between(t,5,10)', \
drawtext=fontfile='$FONT':text='Know the 30-minute phase flow':fontcolor=white:fontsize=42:x=70:y=1650:enable='between(t,5.2,10)', \
drawtext=fontfile='$FONT':text='Fire Crystal planner':fontcolor=white:fontsize=68:x=70:y=1570:enable='between(t,10,15)', \
drawtext=fontfile='$FONT':text='Check furnace gaps in seconds':fontcolor=white:fontsize=42:x=70:y=1650:enable='between(t,10.2,15)', \
drawtext=fontfile='$FONT':text='witheout20.top':fontcolor=white:fontsize=58:x=(w-text_w)/2:y=1788:enable='between(t,0,15)', \
format=yuv420p[v]" \
  -map "[v]" \
  -r 25 \
  -c:v libx264 \
  -pix_fmt yuv420p \
  "$OUTPUT"

echo "Created $OUTPUT"
