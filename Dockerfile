FROM python:3.8-buster
WORKDIR /
RUN apt-get update -q 
RUN apt-get install -y rrdtool cron && apt-get clean && fc-cache
RUN pip3 install requests speedtest-cli python-dateutil Pillow python-crontab
RUN mkdir data
COPY startup.sh /startup.sh
COPY measure.py /measure.py
CMD /bin/bash ./startup.sh
