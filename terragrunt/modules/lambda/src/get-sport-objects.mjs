export const handler = async () => {
  const sportObjects = [
    {
      name: 'Poison BOX',
      address: 'ул. Лещинского 8',
      coords: {
        lat: 53.91226000038975,
        long: 27.451467018119395,
      },
    },
    {
      name: 'CROSSiT',
      address: 'ул. Купревича 1/5',
      coords: {
        lat: 53.92796322906796,
        long: 27.681089535767622,
      },
    },
    {
      name: 'STAYA BOX',
      address: 'ул. Тимирязева 9',
      coords: {
        lat: 53.90719490535783,
        long: 27.531684602939592,
      },
    },
    {
      name: 'ФОРМА',
      address: 'ул. Притыцкого 29',
      coords: {
        lat: 53.90798928234661,
        long: 27.48417856648457,
      },
    },
  ];

  return sportObjects;
};
