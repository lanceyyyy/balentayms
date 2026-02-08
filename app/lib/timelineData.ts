export interface MemoryEntry {
  id: number;
  imageSrc: string;
  caption: string;
  rotation: number;
}

export const memories: MemoryEntry[] = [
  {
    id: 1,
    imageSrc: '/images/1.jpeg',
    caption: 'The day you unknowingly became my favorite notification.',
    rotation: -3,
  },
  {
    id: 2,
    imageSrc: '/images/2.jpeg',
    caption: 'The first time I knew I was in trouble.',
    rotation: 2,
  },
  {
    id: 3,
    imageSrc: '/images/3.jpeg',
    caption: 'The day you started stealing my hoodies.',
    rotation: -2,
  },
  {
    id: 4,
    imageSrc: '/images/4.jpeg',
    caption: 'When your laugh became my favorite sound.',
    rotation: 3,
  },
  {
    id: 5,
    imageSrc: '/images/5.jpeg',
    caption: 'The moment I realized this was different.',
    rotation: -1,
  },
  {
    id: 6,
    imageSrc: '/images/6.jpeg',
    caption: 'Every chapter with you is my favorite.',
    rotation: 1,
  },
];

export const FLIP_MESSAGE = "And we're just getting started...";
