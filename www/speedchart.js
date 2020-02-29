const green = '#6AFFF3';
const purple = '#BF71FF';
const blue = '#1CBFFF';
const red = '#FF3366';
const darknavy = '#141526';
const white = '#FFFFFF';
const black = '#000000';
const grey = '#809193A8'; // with 50% opacity -> #80******
const transparent = '#FF******';

function json_merge(j1, j2){
	var result = {};
	Object.keys(j1)
	  .forEach(key => result[key] = j1[key]);

	Object.keys(j2)
	  .forEach(key => result[key] = j2[key]);
	return result;
}

function plot(div, xData, yData, xMax, minimum, trace_layout){
	titleText = div.getAttribute("title");
	unit = ' ' + div.getAttribute("unit");
	
	var trace = {
		x: xData,
		y: yData,
		name: titleText,
		mode: 'lines',
		connectgaps: false,
		type: 'scatter',
	};
	
	var minimum_trace = {
		x: [xData[0], xData[xData.length-1]],
		y: [minimum, minimum],
		name: 'minimum',
		mode: 'lines',
		type: 'scatter',
		line: {color: red}
	}
	
	var default_layout = {
		title: {
			text: titleText.toUpperCase(),
			font: {
				color: white
			}
		},
		showlegend: true,
		legend: {
			x: 1,
			xanchor: 'right',
			y: 1.1,
			orientation: "v",
			font: {
				family: 'Gotham',
			    size: 12,
			    color: white
			},
			bgcolor: transparent,
			bordercolor: white,
			borderwidth: 0.5
		},
		xaxis: {
			showline: true,
			showgrid: false,
			showticklabels: true,
			linecolor: white,
			linewidth: 1,
			autotick: true,
			ticks: 'outside',
			tickcolor: white,
			tickfont: {
			    family: 'Gotham',
			    size: 12,
			    color: white
			}
		},
		yaxis: {
			showgrid: true,
			zeroline: false,
			showline: false,
			showticklabels: true,
			gridcolor: grey,
			linecolor: white,
			linewidth: 1,
			autotick: true,
			ticks: 'outside',
			tickcolor: white,
			ticksuffix: unit,
			tickfont: {
			    family: 'Gotham',
			    size: 12,
			    color: white
			},
			range: [0, xMax]
		},
		responsive: true,
		clickmode: 'event',
		dragmode: 'pan',
		margin: {
			autoexpand: true,
			t: 100
		},
		calendar: 'gregorian',
		paper_bgcolor: darknavy,
		plot_bgcolor: darknavy,
	}
	
	var configuration = {
		displayModeBar: false
	};
	
	var trace = json_merge(trace, trace_layout);
	
	Plotly.newPlot( div, [trace, minimum_trace], default_layout, configuration);
}

function draw(jsonData){
	var errorDiv = document.getElementById('error-msg');
	errorDiv.innerHTML = '';
	
	DOWNLOAD = document.getElementById('speedchart-download');
	UPLOAD = document.getElementById('speedchart-upload');
	PING = document.getElementById('speedchart-ping');
	
	var download_layout = {
		line: {color: green},
		marker:{color: green}
	};
	var upload_layout = {
		line: {color: purple},
		marker:{color: purple}
	};
	var ping_layout = {
		line: {color: blue},
		marker: {color: blue}
	};

	if (jsonData.hasOwnProperty('timestamps')){
		var dates = jsonData.timestamps.map(function(t){return new Date(t * 1000);});
	}
	else{
		errorDiv.innerHTML = 'no data retrieved - wait until enough data is collected to plot graphes';
	}
	if (jsonData.hasOwnProperty('download')){
		plot(DOWNLOAD, dates, jsonData.download, (jsonData.options.download.max + 10), jsonData.options.download.min, download_layout);
	}
	else {
		DOWNLOAD.innerHTML = 'no download data available';
	}
	if (jsonData.hasOwnProperty('upload')){
		plot(UPLOAD, dates, jsonData.upload, (jsonData.options.upload.max + 10), jsonData.options.upload.min, upload_layout);
	}
	else {
		UPLOAD.innerHTML = 'no upload data available';
	}
	if (jsonData.hasOwnProperty('ping')){
		plot(PING, dates, jsonData.ping, (jsonData.options.ping.max + 10), jsonData.options.ping.min, ping_layout);
	}
	else {
		PING.innerHTML = 'no ping data available';
	}
}

function getData(callback){
	var errorDiv = document.getElementById('error-msg');
	errorDiv.innerHTML = '';

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'data');
	xhr.responseType = 'json';
	xhr.onload = function () {
		if (xhr.status >= 200 && xhr.status < 300) {
			callback(xhr.response);
		} else {
			errorDiv.innerHTML = 'Loading Data failed...';
		}
	};
	xhr.send();
}

function loadGrpah(){
	getData(draw);
}