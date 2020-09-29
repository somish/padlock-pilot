#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

daemon_user=padlock
appdir=`realpath $DIR/..`
js_main_path="$appdir/index.js"
service_path=/etc/systemd/system/padlock.service
node_path=`which nodejs 2>/dev/null || which node 2>/dev/null`

if [ "$EUID" -ne 0 ]; then
  echo "Please use sudo"
  exit
fi

if ! sudo -u $daemon_user test -r $js_main_path; then
  echo "user '$daemon_user' doesn't have read permission for $js_main_path"
  echo "please resolve this with chmod or something"
  exit
fi

m4 \
  -D_user_=$daemon_user \
  -D_node_=$node_path \
  -D_main_=$js_main_path \
  < "$DIR/padlock.service.m4" > $service_path

systemctl enable padlock.service
systemctl start padlock
