/**
 * Константы и утилиты для работы с аватарами
 */

/**
 * Интерфейс готового аватара
 */
export interface PredefinedAvatar {
  /** URL изображения аватара */
  url: string;
  /** Название аватара (для accessibility) */
  label: string;
  /** Категория аватара (опционально) */
  category?: 'animal' | 'character' | 'object' | 'other';
}

/**
 * Цвета фона для аватара (из референса Yandex ID)
 */
export const AVATAR_BACKGROUND_COLORS = [
  { value: '#edeff2', label: 'светло-серый' },
  { value: '#fdebeb', label: 'светло-красный' },
  { value: '#ffedd1', label: 'светло-оранжевый' },
  { value: '#fcf1c5', label: 'светло-желтый' },
  { value: '#e1fae7', label: 'светло-зеленый' },
  { value: '#e1f7f4', label: 'светло-бирюзовый' },
  { value: '#e3f3fa', label: 'светло-синий' },
  { value: '#efedf7', label: 'светло-фиолетовый' },
  { value: '#fae9f6', label: 'светло-пурпурный' },
] as const;

/**
 * Готовые аватары из Yandex ID
 * Источник: https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/
 */
export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/1b1b8e713e99ec22c81a.webp', 
    label: 'Academic cap',
    category: 'object'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fff280518cf59cf9b644.webp', 
    label: 'Alien',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/7504ddd175f79330ae19.webp', 
    label: 'Bear',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/692fb3ccc028a306ee0f.webp', 
    label: 'Cat',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/2304fdb8b218a2006745.webp', 
    label: 'Chess',
    category: 'object'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/72d8ef0bfc7289491011.webp', 
    label: 'Cosmonaut',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/deb4c7a8510b7e303522.webp', 
    label: 'Dino',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/a98a60a15cbd81f691de.webp', 
    label: 'Dog',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fee0452b9300856d718e.webp', 
    label: 'Football',
    category: 'object'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/c06fdaa38e6c02ca365c.webp', 
    label: 'Fox',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/33bca4e6a3c408683127.webp', 
    label: 'Ghost',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/ee1c88b1efccb86ccbfc.webp', 
    label: 'Goose',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/f51e3559cb03a1ef9bf2.webp', 
    label: 'Hare',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/6bba13fab0f50d638d39.webp', 
    label: 'GingerbreadBoy',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/2976b8c96507853a40ae.webp', 
    label: 'Moai',
    category: 'object'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/185e9da5bb2e68722b6b.webp', 
    label: 'Parrot',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/d33b16ca7cd113d5a60a.webp', 
    label: 'Robot',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/36b1d44b445b96ecacb0.webp', 
    label: 'Rover',
    category: 'object'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/5c79c459b78c5af5809d.webp', 
    label: 'Turtle',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/e3d62fb45a9255ffacbc.webp', 
    label: 'Unicorn',
    category: 'character'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/704ef1c300c8fbffe829.webp', 
    label: 'Yac',
    category: 'animal'
  },
  { 
    url: 'https://id.yastatic.net/s3/yandex-id-static/yandex-id/_/_next/static/assets/fcacc0117be1cd34023f.webp', 
    label: 'Whale',
    category: 'animal'
  },
];

/**
 * Получить случайный аватар из списка
 */
export const getRandomAvatar = (): PredefinedAvatar => {
  const randomIndex = Math.floor(Math.random() * PREDEFINED_AVATARS.length);
  return PREDEFINED_AVATARS[randomIndex];
};

/**
 * Получить аватар по URL
 */
export const getAvatarByUrl = (url: string): PredefinedAvatar | undefined => {
  return PREDEFINED_AVATARS.find(avatar => avatar.url === url);
};

/**
 * Получить аватары по категории
 */
export const getAvatarsByCategory = (category: PredefinedAvatar['category']): PredefinedAvatar[] => {
  return PREDEFINED_AVATARS.filter(avatar => avatar.category === category);
};

/**
 * Получить случайный цвет фона
 */
export const getRandomBackgroundColor = () => {
  const randomIndex = Math.floor(Math.random() * AVATAR_BACKGROUND_COLORS.length);
  return AVATAR_BACKGROUND_COLORS[randomIndex];
};

