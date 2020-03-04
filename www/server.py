#!/usr/bin/env python3

import configparser
import logging
import http.server
import socketserver
import sys
import os
import json
import rrdtool

# class to handle http requests and define routes
class SpeedchartHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    default = 'plotly'
    def do_GET(self):
        if self.path == '/':
            if self.default == 'plotly':
                self.path = 'index.html'
            else:
                self.path = 'graph.png'
        elif self.path == '/rrd-graph':
            self.path = 'graph.png'
        elif self.path == '/data':
            retrieveData()
            self.path = 'data.json'
        elif self.path == '/plotly.js':
            retrieveData()
            self.path = 'plotly-latest.min.js'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        self.send_my_headers()
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def send_my_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

def getSettings():
    return {
        "download": {
            "min": int(SETTINGS['download']['min']),
            "max": int(SETTINGS['download']['max'])
        },
        "upload": {
            "min": int(SETTINGS['upload']['min']),
            "max": int(SETTINGS['upload']['max'])
        },
        "ping": {
            "min": int(SETTINGS['ping']['min']),
            "max": int(SETTINGS['ping']['max'])
        }
    }

def prepareDataForPlotly(start, end, step, datasources, rows):
    current_time = start
    rowsWithTime = []
    for row in rows:
        '''if row has at least one value, add time and remember'''
        if len(list(filter(None, row))) > 0:
            row = row + (current_time,)
            rowsWithTime.append(row)
        current_time += step
    
    transposition = [[row[i] for row in rowsWithTime] for i in range(len(rowsWithTime[0]))]

    datasources = datasources + ("timestamps",)
    json_data = {}
    for i in range(0, len(datasources)):
        json_data[datasources[i]] = transposition[i]

    return json_data

def retrieveData():
    try:
        rrd_info = rrdtool.info(RRD_FNAME)

        data = rrdtool.fetch(RRD_FNAME, 'MAX', '-s -1y')
        start, end, step = data[0]
        ds = data[1]
        rows = data[2]
        json_data = prepareDataForPlotly(start, end, step, ds, rows)

        json_data['options'] = getSettings()

        f = open("data.json", "w")
        f.write( json.dumps(json_data) )
        f.close()
    except Exception as e:
        main_logger = logging.getLogger('speedchart')
        main_logger.info('retrieve data from rrd failed')
        main_logger.debug(str(e))

def start_server():
    port = int(SETTINGS['server']['port'])
    web_dir = '/www'

    os.chdir(web_dir)
    handler = SpeedchartHttpRequestHandler
    handler.default = SETTINGS['server']['default']
    server = socketserver.TCPServer(("", port), handler)

    server.serve_forever()

def load_settings(settings_fname='settings.ini'):
    '''load config settings from ini file'''
    ini_file = configparser.ConfigParser()
    ini_file.read('/settings.ini')

    # dependencies
    # webserver needs server settings
    if ini_file.getboolean('server', 'enable'):
        for setting in ('port', 'default'):
            if not ini_file.has_option('server', setting):
                raise RuntimeError('Webserver enabled but not all server settings present')
    return ini_file

SETTINGS = load_settings()
RRD_FNAME = '/data/speed.rrd'

def main():
    logging.basicConfig(
        level=getattr(logging, SETTINGS['general']['log_level'].upper()),
        format='%(asctime)s %(message)s'
    )
    main_logger = logging.getLogger('speedchart')

    if SETTINGS.getboolean('server', 'enable'):
        main_logger.info('starting webserver')
        main_logger.debug('Default to ' + SETTINGS['server']['default'])
        start_server()


if __name__ == '__main__':
  main()

