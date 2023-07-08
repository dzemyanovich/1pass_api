export const handler = async () => {
  // todo: use TypeScript
  const sportObjects = [
    {
      title: 'Poison BOX',
      type: 'crossfit',
      coords: {
        latitude: 53.91226000038975,
        longitude: 27.451467018119395,
      },
    },
    {
      title: 'CROSSiT',
      type: 'crossfit',
      coords: {
        latitude: 53.92796322906796,
        longitude: 27.681089535767622,
      },
    },
    {
      title: 'STAYA BOX',
      type: 'crossfit',
      coords: {
        latitude: 53.90719490535783,
        longitude: 27.531684602939592,
      },
    },
  ];

  return sportObjects;
};
