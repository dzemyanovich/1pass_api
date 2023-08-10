import axios from 'axios';

export function get<T>(url: string): Promise<T> {
  return new Promise((resolve) => {
    axios.get(url).then((response) => {
      resolve(response.data as T);
    });
  });
}

export function post<T>(url: string, data: any): Promise<T> {
  return new Promise((resolve) => {
    axios.post(url, data).then((response) => {
      resolve(response.data as T);
    });
  });
}
