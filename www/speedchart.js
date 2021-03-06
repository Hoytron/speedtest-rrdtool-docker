const downloadBlue = '2DD9EC';
const green = '#6AFFF3';
const uploadPurple = '825ED4';
const downloadGreen = '72FFBC';
const uploadPink = 'FF7AD2';
const purple = '#BF71FF';
const blue = '#1CBFFF';
const red = '#FF3366';
const darknavy = '#141526';
const white = '#FFFFFF';
const black = '#000000';
const grey = '#809193A8'; // with 50% opacity -> #80******
const transparent = '#FF******';

function jsonMerge(j1, j2){
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
	mostX = xData[xData.length-1];

	//animation
	var frames = [];
	var n = xData.length;
	for (var i = 0; i < n; i++) {
		frames[i] = {data: [{x: [], y: []}]}
		frames[i].data[0].x = xData.slice(0, i+1);
		frames[i].data[0].y = yData.slice(0, i+1);
	}

	var trace = {
		x: frames[1].data[0].x,
		y: frames[1].data[0].y,
		name: titleText,
		mode: 'lines+markers',
		connectgaps: false,
		type: 'scatter',
	};

	var minimum_trace = {
		x: [xData[0], mostX],
		y: [minimum, minimum],
		name: 'threshold',
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
		},
		xaxis: {
			type: 'date',
			range: [(new Date).setDate(mostX.getDate() - 7), mostX],
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

	animation = {
      transition: {
        duration: 0
      },
      frame: {
        duration: 40,
        redraw: false
      }
	}

	var configuration = {
		// displayModeBar: true,
		modeBarButtonsToRemove: ['lasso2d','toggleSpikelines'],
	};

	var trace = jsonMerge(trace, trace_layout);

	Plotly.newPlot( div, [trace, minimum_trace], default_layout, configuration).then(function(){
		Plotly.animate(div, frames, animation);
	});
}

function draw(jsonData){
	var errorDiv = document.getElementById('error-msg');
	errorDiv.innerHTML = '';

	DOWNLOAD = document.getElementById('speedchart-download');
	UPLOAD = document.getElementById('speedchart-upload');
	PING = document.getElementById('speedchart-ping');

	var download_layout = {
		line: {
			shape: 'spline',
			smoothing: 1.2,
			color: green,
		},
		fill: 'tozeroy',
		marker:{
			color: green,
			size: 4,
		}
	};
	var upload_layout = {
		line: {
			shape: 'spline',
			smoothing: 1.2,
			color: purple,
		},
		fill: 'tozeroy',
		marker:{
			color: purple,
			size: 4,
		}
	};
	var ping_layout = {
		line: {
			shape: 'spline',
			smoothing: 1.2,
			color: blue
		},
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
