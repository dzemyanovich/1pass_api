import axios from 'axios';

const { API_URL } = process.env;
const GET_SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;

type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
  createdAt: Date | null, // todo: createdAt cannot be null
};

function get<T>(url: string): Promise<T> {
  return new Promise((resolve) => {
    axios.get(url).then((response) => {
      resolve(response.data);
    });
  });
}

describe('login and validate-token', () => {
  it('gets all sport objects', async () => {
    const response: SportObjectVM[] = await get(
      GET_SPORT_OBJECTS_URL,
    );

    // todo: use 'objectMatching'
    expect(response.length).toBeGreaterThan(0);
  });
});
