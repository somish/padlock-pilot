[Unit]
Description=Padlock Backend
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=1
StartLimitBurst=5
StartLimitIntervalSec=10
User=_user_
ExecStart=_node_ _main_

[Install]
WantedBy=multi-user.target
