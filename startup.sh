#!/bin/bash

PYTHONPATH=/usr/local/bin/python3
/usr/local/bin/python3 /measure.py
/usr/local/bin/python3 /www/server.py &
cron -f
