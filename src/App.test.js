import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-15T16:05:09Z'));
  global.fetch = jest.fn(() => new Promise(() => {}));
});
afterEach(() => { jest.useRealTimers(); delete global.fetch; });
test('handles midnight, format changes, city changes, and timer cleanup', () => {
  const { unmount } = render(<App />);
  expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '00:05:09 ');
  fireEvent.click(screen.getByRole('button', { name: '12 hour' }));
  expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '12:05:09 am');
  fireEvent.click(screen.getByRole('button', { name: /Choose location, Singapore/ }));
  fireEvent.click(screen.getByRole('button', { name: /New York/ }));
  expect(screen.getByText('United States')).toBeInTheDocument();
  expect(screen.getByRole('timer')).toHaveAttribute('aria-label', '12:05:09 pm');
  unmount();
  expect(jest.getTimerCount()).toBe(0);
});

test('offers every country including Philippines and selects Manila', () => {
  render(<App />);
  expect(screen.queryByText(/Weather by/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Choose location, Singapore/ }));
  expect(screen.getAllByRole('option').length).toBe(250);
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'PH' } });
  fireEvent.click(screen.getByRole('button', { name: /Manila/ }));
  expect(screen.getByRole('button', { name: /Choose location, Manila, Philippines/ })).toBeInTheDocument();
  expect(screen.queryByLabelText('City')).not.toBeInTheDocument();
});

test('searches worldwide cities with the selected country filter', async () => {
  global.fetch = jest.fn(url => url.includes('geocoding-api')
    ? Promise.resolve({ ok: true, json: async () => ({ results: [{ id: 1, name: 'Baguio', country: 'Philippines', country_code: 'PH', timezone: 'Asia/Manila', latitude: 16.4, longitude: 120.6 }] }) })
    : new Promise(() => {}));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /Choose location, Singapore/ }));
  fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'PH' } });
  fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Baguio' } });
  await act(async () => { jest.advanceTimersByTime(300); });
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('countryCode=PH'), expect.any(Object));
  fireEvent.click(screen.getByRole('button', { name: /Baguio/ }));
  expect(screen.getByRole('button', { name: /Choose location, Baguio, Philippines/ })).toBeInTheDocument();
});
