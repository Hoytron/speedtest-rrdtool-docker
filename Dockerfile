FROM python:3.8-buster
WORKDIR /
RUN apt-get update -q 
RUN apt-get install -y rrdtool cron librrd-dev libpython3-dev && apt-get clean && fc-cache
RUN pip3 install requests speedtest-cli python-dateutil Pillow python-crontab rrdtool
RUN mkdir data
RUN mkdir www
COPY startup.sh /startup.sh
COPY measure.py /measure.py
ADD www /www
RUN ln -s /data/graph.png /www/graph.png 
CMD /bin/bash ./startup.sh
