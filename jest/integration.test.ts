import axios from 'axios';

// todo: use this type in lambda function -> DAL (aka repository.js)
type SportObjectVM = {
  id: number,
  name: string,
  address: string,
  lat: number,
  long: number,
  createdAt: Date,
};

function get<T>(url: string): Promise<T> {
  return new Promise((resolve) => {
    axios.get(url).then((response) => {
      resolve(response.data);
    });
  });
}

describe('get-sport-objects', () => {
  it('gets all sport objects', async () => {
    const { API_URL } = process.env;
    const GET_SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;

    const response: SportObjectVM[] = await get(
      GET_SPORT_OBJECTS_URL,
    );

    // todo: use 'objectMatching'
    expect(response.length).toBeGreaterThan(0);
  });
});
