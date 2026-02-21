import { API } from '../config';

export interface FxResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
  time_next_update_utc: string;
}

export async function fetchRates(base = 'USD'): Promise<FxResponse> {
  const res = await fetch(`${API.exchangeRate}/${base}`);
  if (!res.ok) throw new Error(`ExchangeRate API ${res.status}`);
  const data: FxResponse = await res.json();
  if (data.result !== 'success') throw new Error(`ExchangeRate error: ${data.result}`);
  return data;
}
