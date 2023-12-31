import axios from 'axios';

export function get<T>(url: string, params = {}): Promise<T> {
  return new Promise((resolve) => {
    axios.get(url, { params }).then((response) => {
      resolve(response.data as T);
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function post<T>(url: string, data: any): Promise<T> {
  return new Promise((resolve) => {
    axios.post(url, data).then((response) => {
      resolve(response.data as T);
    });
  });
}
