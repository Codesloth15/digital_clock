import React, { useEffect, useRef, useState } from 'react';

const codes = 'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = codes.map(code => ({ code, name: names.of(code) })).sort((a, b) => a.name.localeCompare(b.name));
const popular = [
  ['Singapore', 'Singapore', 'Asia/Singapore', 1.29, 103.85, 'SG'],
  ['Manila', 'Philippines', 'Asia/Manila', 14.60, 120.98, 'PH'],
  ['Cebu City', 'Philippines', 'Asia/Manila', 10.32, 123.89, 'PH'],
  ['Davao', 'Philippines', 'Asia/Manila', 7.07, 125.61, 'PH'],
  ['London', 'United Kingdom', 'Europe/London', 51.51, -0.13, 'GB'],
  ['New York', 'United States', 'America/New_York', 40.71, -74.01, 'US'],
  ['Tokyo', 'Japan', 'Asia/Tokyo', 35.68, 139.69, 'JP'],
  ['Sydney', 'Australia', 'Australia/Sydney', -33.87, 151.21, 'AU'],
];

export default function LocationPicker({ city, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const root = useRef(null);
  const trigger = useRef(null);
  const input = useRef(null);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  useEffect(() => {
    if (!open || query.trim().length < 2) { setResults([]); setStatus(''); return; }
    const controller = new AbortController();
    setResults([]); setStatus('Searching…');
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ name: query.trim(), count: '15', language: 'en' });
        if (country) params.set('countryCode', country);
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        const matches = (data.results || []).filter(item => item.timezone && Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
        if (controller.signal.aborted) return;
        setResults(matches.map(item => [item.name, item.country || names.of(item.country_code), item.timezone, item.latitude, item.longitude, item.country_code, item.admin1, item.id]));
        setStatus(matches.length ? '' : 'No cities found. Try another city name.');
      } catch (error) { if (!controller.signal.aborted) setStatus('Search unavailable. Please try again.'); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, query, country]);
  const options = query.trim().length >= 2 ? results : popular.filter(item => !country || item[5] === country);
  function choose(item) { onSelect(item); setOpen(false); trigger.current?.focus(); }
  return <div className="location-picker" ref={root} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className="location-trigger" aria-label={`Choose location, ${city[0]}, ${city[1]}`} aria-expanded={open} aria-controls="location-panel" onClick={() => setOpen(!open)}>{city[0]}<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg></button>
    <span className="secondary">{city[1]}</span>
    {open && <div id="location-panel" className="location-panel" role="region" aria-label="Choose location">
      <div className="picker-heading">Choose your location<button className="picker-close" aria-label="Close location picker" onClick={() => { setOpen(false); trigger.current?.focus(); }}>×</button></div>
      <label htmlFor="country-filter">Country</label><select id="country-filter" value={country} onChange={event => setCountry(event.target.value)}><option value="">All countries</option>{countries.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select>
      <label htmlFor="city-search">City</label><input ref={input} id="city-search" type="search" value={query} placeholder="Search a city, e.g. Manila" onChange={event => setQuery(event.target.value)} autoComplete="off"/>
      <div className="result-heading">{query.trim().length >= 2 ? 'SEARCH RESULTS' : 'POPULAR CITIES'}</div>
      <div className="location-results">{options.map(item => <button className="location-result" key={item[7] || item[0]} onClick={() => choose(item)}><span><strong>{item[0]}</strong><small>{[item[6], item[1]].filter(Boolean).join(', ')}</small></span>{city[0] === item[0] && city[2] === item[2] && <span aria-label="Selected">✓</span>}</button>)}<p className="search-status" role="status">{status || (!options.length && query.trim().length < 2 ? 'Enter a city name to search this country.' : '')}</p></div>
    </div>}
  </div>;
}
