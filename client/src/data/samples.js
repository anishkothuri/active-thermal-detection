// Curated sample thermal media for one click Live Detection testing.
// dataset samples are held out from training, never seen during fine tuning.
// web samples are CC BY 4.0 research photos, a real world generalization test.
// video samples are reassembled from consecutive hand captured dataset frames.

const BASE = import.meta.env.BASE_URL;

export const SAMPLES = [
  {
    id: 'dataset-01',
    src: BASE + 'samples/dataset-01.png',
    title: 'Cow full body',
    kind: 'dataset',
    tag: 'Held out test set',
  },
  {
    id: 'dataset-02',
    src: BASE + 'samples/dataset-02.png',
    title: 'Cow side profile',
    kind: 'dataset',
    tag: 'Held out test set',
  },
  {
    id: 'dataset-03',
    src: BASE + 'samples/dataset-03.png',
    title: 'Cow rear view',
    kind: 'dataset',
    tag: 'Held out test set',
  },
  {
    id: 'web-hoof',
    src: BASE + 'samples/web-hoof.jpg',
    title: 'Hoof thermogram',
    kind: 'web',
    tag: 'Real world · unseen',
    credit: 'Comparison of Low and High Cost Infrared Thermal Imaging Devices for the Detection of Lameness in Dairy Cattle, Veterinary Sciences 2022, PMC9413687',
    creditUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9413687/',
    license: 'CC BY 4.0',
  },
  {
    id: 'web-head1',
    src: BASE + 'samples/web-head1.jpg',
    title: 'Head and eye thermogram',
    kind: 'web',
    tag: 'Real world · unseen',
    credit: 'The Relationship between the Infrared Eye Temperature of Beef Cattle and Associated Biological Responses at High Environmental Temperatures, Animals 2024, PMC11475250',
    creditUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11475250/',
    license: 'CC BY 4.0',
  },
  {
    id: 'web-head2',
    src: BASE + 'samples/web-head2.jpg',
    title: 'Muzzle thermogram',
    kind: 'web',
    tag: 'Real world · unseen',
    credit: 'The Relationship between the Infrared Eye Temperature of Beef Cattle and Associated Biological Responses at High Environmental Temperatures, Animals 2024, PMC11475250',
    creditUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11475250/',
    license: 'CC BY 4.0',
  },
  {
    id: 'video-male2',
    src: BASE + 'samples/video-male2.mp4',
    poster: BASE + 'samples/video-male2-poster.png',
    title: 'Cow 10s clip',
    kind: 'video',
    tag: 'Hand captured · 100 frames',
  },
  {
    id: 'video-female4',
    src: BASE + 'samples/video-female4.mp4',
    poster: BASE + 'samples/video-female4-poster.png',
    title: 'Cow 10s clip',
    kind: 'video',
    tag: 'Hand captured · 100 frames',
  },
];
