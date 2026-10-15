import React, { useEffect, useState } from 'react';
import './style/App.css';
import LocationPicker from './LocationPicker';
const cities = [
  ['Singapore', 'Singapore', 'Asia/Singapore', 1.29, 103.85],
  ['London', 'United Kingdom', 'Europe/London', 51.51, -0.13],
  ['New York', 'United States', 'America/New_York', 40.71, -74.01],
  ['Tokyo', 'Japan', 'Asia/Tokyo', 35.68, 139.69],
  ['Sydney', 'Australia', 'Australia/Sydney', -33.87, 151.21]
];
function Icon({ pin, rainy, cloudy }) {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    {pin ? <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></> : cloudy || rainy ? <><path d="M6 17a5 5 0 1 1 1-9A6 6 0 0 1 18 9a4 4 0 0 1 0 8Z"/>{rainy && <path d="m7 20-1 2m7-2-1 2m7-2-1 2"/>}</> : <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></>}
  </svg>;
}
function Digit({ value }) {
  const [old, setOld] = useState(value);
  useEffect(() => { const timer = setTimeout(() => setOld(value), 600); return () => clearTimeout(timer); }, [value]);
  return <span className="digit" aria-hidden="true">
    <span className="half top"><span>{value}</span></span>
    <span className="half bottom"><span>{old}</span></span>
    {old !== value && <React.Fragment key={value}><span className="half top flip-top"><span>{old}</span></span><span className="half bottom flip-bottom"><span>{value}</span></span></React.Fragment>}
    <i className="hinge left"/><i className="hinge right"/>
  </span>;
}
export default function App() {
  const [time, setTime] = useState(new Date());
  const [city, setCity] = useState(cities[0]);
  const [hour12, setHour12] = useState(false);
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('Loading weather');

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    const controller = new AbortController();
    setWeather(null); setStatus('Loading weather');
    async function refresh() {
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city[3]}&longitude=${city[4]}&current=temperature_2m,weather_code`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (typeof data.current?.temperature_2m !== 'number') throw new Error();
        setWeather(data.current);
      } catch (error) { if (error.name !== 'AbortError') setStatus('Weather unavailable'); }
    }
    refresh(); const timer = setInterval(refresh, 600000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [city]);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: city[2], hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' }).formatToParts(time);
  const get = type => parts.find(part => part.type === type)?.value;
  const date = time.toLocaleDateString('en-GB', { timeZone: city[2], weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const code = weather?.weather_code;
  const snow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  const description = code === 0 ? 'Clear skies' : code <= 3 ? 'Partly cloudy' : code <= 48 ? 'Foggy' : snow ? 'Snow' : code >= 95 ? 'Thunderstorms' : 'Rain';
  return <main className="app">
    <header><a className="brand" href="./">FLIP<span>CLOCK</span></a><span className="header-note">A little less noise. A little more now.</span></header>
    <section className="clock-section" aria-label="Flip clock">
      <div className="eyebrow">THE PRESENT MOMENT</div><p className="date">{date}</p>
      <div className="clock" role="timer" aria-label={`${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod') || ''}`}>
        {['hour', 'minute', 'second'].map((unit, index) => <React.Fragment key={unit}>{index > 0 && <span className="colon" aria-hidden="true"><i/><i/></span>}<div className="time-unit"><div className="digit-pair">{get(unit).split('').map((value, i) => <Digit key={i} value={value}/>)}</div><span className="unit-label">{unit}S</span></div></React.Fragment>)}
      </div>
      {hour12 && <div className="period">{get('dayPeriod')}</div>}
      <div className="details"><div className="location"><Icon pin/><LocationPicker city={city} onSelect={setCity}/></div><span className="divider"/><div className="weather"><Icon cloudy={!weather || (code > 0 && code <= 48) || snow} rainy={code > 48 && !snow}/><div><span className="temperature">{weather ? `${Math.round(weather.temperature_2m)}°C` : '—'}</span><span className="secondary">{weather ? description : status}</span></div></div></div>
      <div className="format-switch" aria-label="Time format"><button className={!hour12 ? 'active' : ''} aria-pressed={!hour12} onClick={() => setHour12(false)}>24 hour</button><button className={hour12 ? 'active' : ''} aria-pressed={hour12} onClick={() => setHour12(true)}>12 hour</button></div>
    </section>
    <footer><span>MAKE TIME FOR WHAT MATTERS.</span></footer>
  </main>;
}

