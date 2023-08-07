import axios from 'axios';
import '../types.d.ts';

function get<T>(url: string): Promise<T> {
  return new Promise((resolve) => {
    axios.get(url).then((response) => {
      resolve(response.data);
    });
  });
}

function post<T>(url: string, data: any): Promise<T> {
  return new Promise((resolve) => {
    axios.post(url, data).then((response) => {
      resolve(response.data);
    });
  });
}

describe('get-sport-objects', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/get-sport-objects`;

  it('gets all sport objects', async () => {
    const response: EventResult<SportObjectVM[]> = await get(URL);

    if (!response.data) {
      throw new Error('response.data is undefined');
    }

    expect(response.data.length).toBeGreaterThan(0);
  });
});

describe('auth-send-code', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/auth-send-code`;

  it('phone is missing', async () => {
    const response: EventResult<string> = await post(URL, {});

    expect(response.success).toBe(false);
  });

  it('invalid phone (short string)', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '543',
    });

    expect(response.success).toBe(false);
  });

  it('invalid phone (number instead of string)', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: 142 as unknown as string,
    });

    expect(response.success).toBe(false);
  });  
});

describe('auth-verify-code', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/auth-verify-code`;

  it('phone is missing', async () => {
    const response: EventResult<string> = await post(URL, {
      code: 'some_code',
    });

    expect(response.success).toBe(false);
  });

  it('code is missing', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '+375333366883',
    });

    expect(response.success).toBe(false);
  });

  it('phone and code are missing', async () => {
    const response: EventResult<string> = await post(URL, {});

    expect(response.success).toBe(false);
  });

  it('invalid phone and code', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: 'string',
      code: null,
    });

    expect(response.success).toBe(false);
  });
});
