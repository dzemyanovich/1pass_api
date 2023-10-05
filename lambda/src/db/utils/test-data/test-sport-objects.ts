import SportObject from '../../models/sport-object';
import { MINSK_TIME_ZONE } from '../../../utils/constants';

const testSportObjects: SportObject[] = [
  {
    name: 'Poison BOX',
    address: 'ул. Лещинского 8',
    lat: 53.91226000038975,
    long: 27.451467018119395,
    timeZone: MINSK_TIME_ZONE,
  } as SportObject,
  {
    name: 'CROSSiT',
    address: 'ул. Купревича 1/5',
    lat: 53.92796322906796,
    long: 27.681089535767622,
    timeZone: MINSK_TIME_ZONE,
  } as SportObject,
  {
    name: 'STAYA BOX',
    address: 'ул. Тимирязева 9',
    lat: 53.90719490535783,
    long: 27.531684602939592,
    timeZone: MINSK_TIME_ZONE,
  } as SportObject,
  {
    name: 'ФОРМА',
    address: 'ул. Притыцкого 29',
    lat: 53.90798928234661,
    long: 27.48417856648457,
    timeZone: MINSK_TIME_ZONE,
  } as SportObject,
];

export default testSportObjects;
