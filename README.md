# speedchart

This repo contains small scripts and a `Dockerfile` to use `speedtest-cli` and
record its results in a `rrdtool` database for record keeping and graphing.

Optionally results may be upload using `HTTP PUT` (WebDAV)

## Demo

![Speedchart results demo](demo/demo.gif)

## Version

This is in alpha development without any versioning whatsoever. Since it's
a hobby project to scratch an itch, sensible versioning will only start after
some stability has been reached.

## Getting started

```shell
$ git clone https://github.com/Hoytron/speedtest-rrdtool-docker
$ cp settings.ini.sample settings.ini && vi settings.ini
```

Build and start your Docker container:

```shell
$ docker build -t speedchart .
$ docker create --name speedchart -v $(pwd)/data:/data -v $(pwd)/settings.ini:/settings.ini speedchart
$ docker start speedchart
```

Or use a docker-compose file:

```docker-compose.yml
version: '3'
services:
  speedchart:
    container_name: speedchart
    image: speedchart
    ports:
     - <your host port>:80
    volumes:
     - <path to your host volume>/data:/data
     - <path to your host volume>/settings.ini:/settings.ini
    restart: "unless-stopped"
```

And then:

```shell
$ docker.compose up -d
```

## Without Docker

You can setup this without docker. But there are a view restrictions:
- the `data` and `www` directories have to be directly at your drives root directory 
- the `measure.py` and `settings.ini` have to be at root as well
- `startup.sh` will start the webserver, if enabled (change the port for your needs in `settings.ini`)
- every run of the `measure.py` will reset the cronjob with the specified values, you can disable the cronjob in `settings.ini`

## View the results

You can view the results as graph.png inside the `/data` directory of the speedchart container.
By default there is an Webserver running inside the container to plot the data in javascript. 
You can access the rrd-tool plot graph.png via `http://your.docker.host.ip:port/rrd-graph`, or edit the `settings.ini` file and change the default to `rrd-tool`:

```ini
[server]
enable = true
port = 80
default = rrd-tool
```

Now you can access the rrd-tool plot graph.png
You do not need the web interface? Just disable the server in the `settings.ini`

## Uploading the graph

This script comes with basic upload functionality using `HTTP PUT`, good enough
to upload the resulting graph to say a NextCloud instance.

To enable uploading the graph, edit the `settings.ini` file:

```ini
[graph_upload]
enable = true
url = https://subdomain.domain.tld/directory/
user = username
password = password
```

Make sure to pass a *directory* for the URL since `graph.png` is appended
automatically.

## Settings

Configuration takes place via an ini file the script expects in the same
directory. Mount that ini file into the container. This
allows you to change the settings without re-building or restarting the container.

| Section                      | Setting     | Description                                                        			 |
|------------------------------|-------------|-------------------------------------------------------------------------------|
| `general`                    | `log_level` | Choose `debug` or `info`                                          			 |
|                              | `measure`   | Set to `false` if you want to skip measuring (for debugging)      			 |
| 			       			   | `periodical`| Set to `true` if you want to schedule a cron job                   			 |
| `schedule`		           | `minutes`   | Run a speedtest every `n` minutes. Use `*` for always              			 |
| 			       			   | `hours`     | Run a speedtest every `n` hours. Use `*` for always                			 |
|			       			   | `dayOfMonth`| Run a speedtest every `n` days. Use `*` for always                 			 |
| `graph`                      | `width`     | total width of the graph.png                                       			 |
|                              | `height`    | height of one graph, i.e. total height = 3x `height`               			 |
| `graph_upload`               | `enable`    | Enable uploading `graph.png` via webdav                            			 |
|                              | `url`       | The *directory* where `graph.png` will be uploaded to (`HTTP PUT`) 			 |
|                              | `user`      | Username used for HTTP Authentication                              			 |
|                              | `password`  | Password used for HTTP Authentication                              			 |
| `server`					   | `enable`    | Enable the webserver															 |
|							   | `port`      | Set the webservers port				                                         |
| 							   | `dafault`   | Set to `plotly` to have a result html/javascript page as default. Set to `rrd-tool` to get the graph.png delivered by default |
| `download`, `upload`, `ping` | `min`       | Graphs start at 0 but there's a minimum line to display you expectetd minimum |
|                              | `max`       | Graphs go up to this value                                         			 |
|                              | `color`     | Which color the graph line in graph.png should have                           |

### Changing the `max` values

Be careful when changing the `max` values. The database `rrdtool` uses this to
initialize and changing the `max` requires starting over with the rrd database. 

# Copyright

* Florian Heinle <launchpad@planet-tiax.de> 
* Thomas Tasler

This project is licensed under the MIT License.
