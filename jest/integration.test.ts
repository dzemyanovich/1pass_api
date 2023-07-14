import axios from 'axios';

const { API_URL } = process.env;
const GET_SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;

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

// todo: while running I see error in console: Watchman crawl failed
describe('get-sport-objects', () => {
  it('gets all sport objects', async () => {
    const response: SportObjectVM[] = await get(
      GET_SPORT_OBJECTS_URL,
    );

    // todo: use 'objectMatching'
    expect(response.length).toBeGreaterThan(0);
  });
});
