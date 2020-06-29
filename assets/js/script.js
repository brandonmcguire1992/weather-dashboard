var citySearchForm = document.querySelector('#city-search-form');
var cityInput = document.querySelector('#city-input');
var cityList = document.querySelector('#city-list ul');
var currentWeatherContainerEl = document.querySelector('#current-weather');
var cityNameEl = document.querySelector('#city-name');
var dateEl = document.querySelector('#date');
var currentIconEl = document.querySelector('#current-icon');
var currentTempEl = document.querySelector('#current-temp');
var currentHumidityEl = document.querySelector('#current-humidity');
var currentWindEl = document.querySelector('#current-wind');
var currentUVEl = document.querySelector('#current-uv');
var forecastCardsContainer = document.querySelector('#cards-container');

var cities = [];

function formSubmitHandler(event) {
	event.preventDefault();
	var cityName = cityInput.value.trim();

	if (cityName) {
		getWeatherData(cityName);

		cityInput.value = '';
	} else {
		alert('Please enter a valid city name');
		return;
	}
}

function handleCityClick() {
	getWeatherData(event.target.innerText);
}

function getWeatherData(city) {
	var appid = '9aae1d7d5854d6a61065bbbf23e68178';

	var currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${appid}`;

	fetch(currentWeatherUrl)
		.then(function(res) {
			if (res.ok) {
				res.json().then(function(data) {
					if (!cities.includes(data.name)) {
						updateCities(data.name);
					}

					displayCurrentWeather(data);

					var lat = data.coord.lat;
					var lon = data.coord.lon;

					var uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?appid=${appid}&lat=${lat}&lon=${lon} `;
					fetch(uvIndexUrl).then(function(uvRes) {
						if (uvRes.ok) {
							uvRes.json().then(function(uvData) {
								displayUVIndex(uvData);
							});
						} else {
							alert('Sorry, the UV Index was not found for that city');
						}
					});
					var forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude={current, hourly, minutely}&appid=${appid}`;

					fetch(forecastWeatherUrl).then(function(forecastRes) {
						if (forecastRes.ok) {
							forecastRes.json().then(function(forecastData) {
								displayForecastWeather(forecastData);
							});
						} else {
							alert(
								'Sorry, the 5-day forecast data is not available for that city'
							);
						}
					});
				});
			} else {
				alert('Sorry, that city was not found, please try again.');
			}
		})
		.catch(function(error) {
			alert('Unable to connect to Open Weather Map');
		});
}

function updateCities(city) {
	var cityListItemEl = document.createElement('li');
	cityListItemEl.innerText = city;

	cityList.appendChild(cityListItemEl);

	saveCity(city);
}

function displayCurrentWeather(currentData) {
	cityNameEl.innerText = currentData.name;
	dateEl.innerText = `(${moment.unix(currentData.dt).format('M/D/YYYY')})`;
	currentIconEl.setAttribute(
		'src',
		`https://openweathermap.org/img/wn/${currentData.weather[0].icon}.png`
	);
	currentTempEl.innerText = currentData.main.temp;
	currentHumidityEl.innerText = currentData.main.humidity;
	currentWindEl.innerText = currentData.wind.speed;
}

function displayUVIndex(uvData) {
	if (uvData.value < 3) {
		currentUVEl.className = 'uv-favorable';
	} else if (uvData.value < 8) {
		currentUVEl.className = 'uv-moderate';
	} else {
		currentUVEl.className = 'uv-severe';
	}
	currentUVEl.innerText = uvData.value;
}

function displayForecastWeather(forecastData) {
	forecastCardsContainer.innerHTML = '';
	for (var i = 1; i <= 5; i++) {
		var dt = moment.unix(forecastData.daily[i].dt).format('M/D/YYYY HH:mm:ss');
		var forecastDateName = dt.split(' ')[0].trim();
		var forecastCardEl = document.createElement('div');
		forecastCardEl.className = 'card';

		forecastCardsContainer.appendChild(forecastCardEl);

		var forecastDateEl = document.createElement('h4');
		var forecastIconEl = document.createElement('img');
		var forecastTempEl = document.createElement('p');
		var forecastHumidityEl = document.createElement('p');

		forecastDateEl.innerText = forecastDateName;

		forecastIconEl.setAttribute(
			'src',
			`https://openweathermap.org/img/wn/${forecastData.daily[i].weather[0]
				.icon}.png`
		);
		forecastTempEl.innerText = `Temp: ${forecastData.daily[i].temp.day}°F`;
		forecastHumidityEl.innerText = `Humidity: ${forecastData.daily[i].humidity}%`;

		forecastCardEl.appendChild(forecastDateEl);
		forecastCardEl.appendChild(forecastIconEl);
		forecastCardEl.appendChild(forecastTempEl);
		forecastCardEl.appendChild(forecastHumidityEl);
	}
}

function saveCity(city) {
	cities.push(city);

	localStorage.setItem('cities', JSON.stringify(cities));
}


function loadCities() {
	var LScities = localStorage.getItem('cities');
	LScities = JSON.parse(LScities);
	if (!LScities) {
		return false;
	}
	for (var i = 0; i < LScities.length; i++) {
		updateCities(LScities[i]);
	}
	getWeatherData(LScities[0]);
}

loadCities();

citySearchForm.addEventListener('submit', formSubmitHandler);
cityList.addEventListener('click', handleCityClick);