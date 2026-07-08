import type { Locale } from '@/i18n/config'

type NavLink = {
  label: string
  href: string
}

type Product = {
  name: string
  description: string
  price: string
  image: string
  tag?: string
  bgColor: string
  blobShape: string
}

type Room = {
  name: string
  players: string
  price: string
  features: string
  image: string
}

type MenuCategory = {
  title: string
  icon: 'coffee' | 'soda' | 'cake' | 'popcorn' | 'citrus' | 'gamepad'
  items: Array<{
    name: string
    description: string
    price: string
  }>
}

type PackageItem = {
  name: string
  price: string
  icon: 'zap' | 'swords' | 'crown' | 'gift'
  highlight: boolean
  benefits: string[]
}

type AboutFeature = {
  title: string
  description: string
  icon: 'coffee' | 'gamepad' | 'heart'
}

type GalleryPhoto = {
  src: string
  alt: string
  className: string
}

export type SiteContent = {
  metadata: {
    title: string
    description: string
  }
  header: {
    brandName: string
    navLinks: NavLink[]
    bookingCta: string
    languageSwitchLabel: string
    openMenuLabel: string
    closeMenuLabel: string
    mainNavigationLabel: string
    mobileNavigationLabel: string
  }
  hero: {
    title: string
    highlightedWord: string
    description: string
    primaryCta: string
    secondaryCta: string
    imageAlt: string
  }
  bestSellers: {
    eyebrow: string
    title: string
    addLabel: string
    previousLabel: string
    nextLabel: string
    products: Product[]
  }
  rooms: {
    title: string
    buttonLabel: string
    previousLabel: string
    nextLabel: string
    rooms: Room[]
  }
  booking: {
    badge: string
    title: string
    description: string
    steps: string[]
    successTitle: string
    successDescription: string
    successReset: string
    roomLabel: string
    dateLabel: string
    timeLabel: string
    durationLabel: string
    playersLabel: string
    extrasLabel: string
    nameLabel: string
    phoneLabel: string
    namePlaceholder: string
    phonePlaceholder: string
    submitLabel: string
    roomTypes: string[]
    durations: string[]
    extras: string[]
  }
  menu: {
    badge: string
    title: string
    description: string
    categories: MenuCategory[]
  }
  packages: {
    badge: string
    title: string
    description: string
    buttonLabel: string
    items: PackageItem[]
  }
  about: {
    badge: string
    title: string
    description: string
    imageAlt: string
    features: AboutFeature[]
  }
  gallery: {
    badge: string
    title: string
    description: string
    photos: GalleryPhoto[]
  }
  contact: {
    badge: string
    title: string
    addressTitle: string
    addressLines: string[]
    hoursTitle: string
    hoursLines: string[]
    phoneTitle: string
    phoneNumber: string
    whatsappCta: string
    followCta: string
    instagramLabel: string
    mapTitle: string
    mapDescription: string
  }
  footer: {
    description: string
    quickLinksTitle: string
    quickLinks: NavLink[]
    openingHoursTitle: string
    hoursLines: string[]
    addressLine: string
    copyrightLabel: string
  }
}

export const siteContent: Record<Locale, SiteContent> = {
  en: {
    metadata: {
      title: 'Benox | Cafe & PlayStation Gaming Lounge',
      description:
        'Enjoy specialty drinks, sweet desserts, and private PlayStation rooms made for unforgettable hangouts at Benox.',
    },
    header: {
      brandName: 'Benox',
      navLinks: [
        { label: 'Home', href: '#home' },
        { label: 'Best Sellers', href: '#best-sellers' },
        { label: 'Rooms', href: '#rooms' },
        { label: 'Booking', href: '#booking' },
        { label: 'Menu', href: '#menu' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ],
      bookingCta: 'Book a Room',
      languageSwitchLabel: 'العربية',
      openMenuLabel: 'Open menu',
      closeMenuLabel: 'Close menu',
      mainNavigationLabel: 'Main navigation',
      mobileNavigationLabel: 'Mobile navigation',
    },
    hero: {
      title: 'Coffee, Play,',
      highlightedWord: 'Repeat.',
      description:
        'Enjoy specialty drinks, sweet desserts, and private PlayStation rooms made for unforgettable hangouts.',
      primaryCta: 'Book Your Gaming Room',
      secondaryCta: 'View Menu',
      imageAlt:
        'Four friends smiling and holding Benox iced coffees inside the cafe',
    },
    bestSellers: {
      eyebrow: 'Best Sellers',
      title: 'Fan favorites & sweet treats',
      addLabel: 'Add +',
      previousLabel: 'Scroll to previous items',
      nextLabel: 'Scroll to next items',
      products: [
        {
          name: 'Honey Cake',
          description: 'Benox signature layered honey cake',
          price: 'EGP 140',
          image: '/images/product-honey-cake.png',
          tag: 'Fan favorite',
          bgColor: 'bg-[#a8e0cd]',
          blobShape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
        },
        {
          name: 'Iced Matcha',
          description: 'Smooth matcha with a creamy chilled finish',
          price: 'EGP 110',
          image: '/images/product-iced-matcha.png',
          bgColor: 'bg-[#fbc9ab]',
          blobShape: 'rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%]',
        },
        {
          name: 'Chocolate Brownie',
          description: 'Rich fudgy brownie for late-night sessions',
          price: 'EGP 110',
          image: '/images/product-brownie.png',
          bgColor: 'bg-[#f4e79b]',
          blobShape: 'rounded-[50%_50%_60%_40%_/_40%_40%_60%_60%]',
        },
        {
          name: 'Fresh Mojito',
          description: 'Minty citrus refreshment with a sparkling twist',
          price: 'EGP 85',
          image: '/images/product-mojito.png',
          bgColor: 'bg-[#aed8f6]',
          blobShape: 'rounded-[30%_70%_50%_50%_/_50%_50%_70%_30%]',
        },
        {
          name: 'Iced Latte',
          description: 'Double espresso over cold milk and crunchy ice',
          price: 'EGP 100',
          image: '/images/product-iced-latte.png',
          bgColor: 'bg-[#d8c4f2]',
          blobShape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
        },
        {
          name: 'Spanish Latte',
          description: 'Sweet condensed milk meets bold espresso',
          price: 'EGP 120',
          image: '/images/product-spanish-latte.png',
          bgColor: 'bg-[#f6c2d1]',
          blobShape: 'rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%]',
        },
      ],
    },
    rooms: {
      title: 'Pick your gaming zone',
      buttonLabel: 'Book this room',
      previousLabel: 'Scroll to previous rooms',
      nextLabel: 'Scroll to next rooms',
      rooms: [
        {
          name: 'Duo Room',
          players: '2 players',
          price: 'EGP 120/hr',
          features: 'PS5 • 4K TV',
          image: '/images/room-duo.png',
        },
        {
          name: 'Solo Room',
          players: '1 player',
          price: 'EGP 60/hr',
          features: 'PS5 • 4K TV',
          image: '/images/room-solo.png',
        },
        {
          name: 'Squad Room',
          players: '4 players',
          price: 'EGP 200/hr',
          features: 'PS5 • 4K TV',
          image: '/images/room-squad.png',
        },
        {
          name: 'VIP Lounge',
          players: '6 players',
          price: 'EGP 350/hr',
          features: 'PS5 • 4K TV',
          image: '/images/room-vip.png',
        },
      ],
    },
    booking: {
      badge: 'Booking',
      title: 'Ready to play?',
      description:
        "Pick your room and reserve in under a minute. We'll have the controllers charged and the coffee ready.",
      steps: [
        'Choose your room and preferred time',
        'Add drinks or desserts to your session',
        'Show up, settle in, and press start',
      ],
      successTitle: 'Booking received!',
      successDescription:
        "We'll confirm your reservation by phone shortly. Get ready, your session is on.",
      successReset: 'Make another booking',
      roomLabel: 'Room type',
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      playersLabel: 'Players',
      extrasLabel: 'Add drinks or desserts',
      nameLabel: 'Name',
      phoneLabel: 'Phone number',
      namePlaceholder: 'Your name',
      phonePlaceholder: '+20 100 000 0000',
      submitLabel: 'Confirm Booking',
      roomTypes: [
        'Solo Gaming Room',
        'Duo Room',
        'Squad Room',
        'VIP PlayStation Lounge',
      ],
      durations: ['1 hour', '2 hours', '3 hours', '4+ hours'],
      extras: [
        'No extras',
        'Drinks only',
        'Desserts only',
        'Drinks + desserts',
      ],
    },
    menu: {
      badge: 'The Menu',
      title: 'Fuel for every session',
      description:
        'From slow-brewed coffee to game-night snacks, everything is prepared fresh at Benox.',
      categories: [
        {
          title: 'Hot Coffee',
          icon: 'coffee',
          items: [
            { name: 'Espresso', description: 'Bold double shot', price: 'EGP 60' },
            { name: 'Cappuccino', description: 'Silky microfoam classic', price: 'EGP 90' },
            { name: 'Spanish Latte', description: 'Sweet and creamy', price: 'EGP 120' },
            { name: 'Flat White', description: 'Strong and smooth', price: 'EGP 95' },
          ],
        },
        {
          title: 'Iced Coffee',
          icon: 'soda',
          items: [
            { name: 'Iced Latte', description: 'Espresso over cold milk', price: 'EGP 100' },
            { name: 'Iced Spanish', description: 'Condensed milk chill', price: 'EGP 130' },
            { name: 'Iced Mocha', description: 'Chocolate meets espresso', price: 'EGP 120' },
            { name: 'Cold Brew', description: '18-hour slow steep', price: 'EGP 110' },
          ],
        },
        {
          title: 'Desserts',
          icon: 'cake',
          items: [
            { name: 'Honey Cake', description: 'Signature layered slice', price: 'EGP 140' },
            { name: 'Chocolate Brownie', description: 'Warm and fudgy', price: 'EGP 110' },
            { name: 'Cheesecake', description: 'Baked, rich, creamy', price: 'EGP 130' },
            { name: 'Cookies (3 pcs)', description: 'Fresh from the oven', price: 'EGP 80' },
          ],
        },
        {
          title: 'Snacks',
          icon: 'popcorn',
          items: [
            { name: 'Loaded Fries', description: 'Cheese and herbs', price: 'EGP 110' },
            { name: 'Mini Sliders', description: 'Two juicy bites', price: 'EGP 160' },
            { name: 'Nachos', description: 'Cheese dip included', price: 'EGP 120' },
            { name: 'Popcorn Bucket', description: 'Butter or caramel', price: 'EGP 60' },
          ],
        },
        {
          title: 'Refreshers',
          icon: 'citrus',
          items: [
            { name: 'Fresh Mojito', description: 'Mint, lime, sparkle', price: 'EGP 85' },
            { name: 'Iced Matcha', description: 'Smooth green energy', price: 'EGP 110' },
            { name: 'Berry Fizz', description: 'Mixed berries and soda', price: 'EGP 90' },
            { name: 'Fresh Lemonade', description: 'Squeezed to order', price: 'EGP 75' },
          ],
        },
        {
          title: 'Gaming Packages',
          icon: 'gamepad',
          items: [
            { name: 'Quick Match', description: '1 hour + a drink', price: 'EGP 150' },
            { name: 'Squad Night', description: '3 hours + snacks for 4', price: 'EGP 700' },
            { name: 'VIP Night', description: 'Lounge + full service', price: 'EGP 1200' },
            { name: 'Birthday Pack', description: 'Room, cake, and drinks', price: 'EGP 1800' },
          ],
        },
      ],
    },
    packages: {
      badge: 'Gaming Packages',
      title: 'More play for your money',
      description:
        'Bundle your session with drinks and snacks to save more. Perfect for squads, celebrations, and marathon nights.',
      buttonLabel: 'Book this package',
      items: [
        {
          name: '1 Hour Quick Match',
          price: 'EGP 150',
          icon: 'zap',
          highlight: false,
          benefits: [
            '1 hour in any standard room',
            'One drink included',
            'PS5 + 4K screen',
          ],
        },
        {
          name: '3 Hours Squad Night',
          price: 'EGP 700',
          icon: 'swords',
          highlight: true,
          benefits: [
            '3 hours in the Squad Room',
            'Snack platter for 4',
            'Four drinks included',
            'Free session photo',
          ],
        },
        {
          name: 'VIP Night Package',
          price: 'EGP 1200',
          icon: 'crown',
          highlight: false,
          benefits: [
            '3 hours in the VIP Lounge',
            'Full table service',
            'Dessert of your choice',
            'Priority rebooking',
          ],
        },
        {
          name: 'Birthday / Friends',
          price: 'EGP 1800',
          icon: 'gift',
          highlight: false,
          benefits: [
            '4 hours in any room',
            'Honey cake for the table',
            'Drinks for everyone',
            'Party decorations included',
          ],
        },
      ],
    },
    about: {
      badge: 'About Benox',
      title: 'Where good coffee meets great games',
      description:
        "Benox brings together good coffee, delicious desserts, and PlayStation gaming rooms in one joyful place made for friends, challenges, and cozy hangouts. Whether you're here for the honey cake or the high scores, there's always a seat and a controller waiting for you.",
      imageAlt:
        'The bright, cozy Benox cafe interior with warm cream walls and orange chairs',
      features: [
        {
          title: 'Specialty coffee',
          description: 'Beans roasted locally and brewed with care.',
          icon: 'coffee',
        },
        {
          title: 'PS5 in every room',
          description: 'Latest consoles, latest titles, and 4K screens.',
          icon: 'gamepad',
        },
        {
          title: 'Made for hangouts',
          description: 'Cozy rooms designed for friends and fun.',
          icon: 'heart',
        },
      ],
    },
    gallery: {
      badge: 'The Vibe',
      title: 'A peek inside Benox',
      description:
        'Warm lights, good company, great coffee, and just the right amount of friendly competition.',
      photos: [
        {
          src: '/images/hero-composition.jpeg',
          alt: 'Friends laughing while playing PlayStation together on a cozy sofa',
          className: 'row-span-2',
        },
        {
          src: '/images/gallery-drinks.png',
          alt: 'Colorful cafe drinks arranged on a warm cream table',
          className: '',
        },
        {
          src: '/images/room-vip.png',
          alt: 'The premium VIP PlayStation lounge with plush seating',
          className: '',
        },
        {
          src: '/images/gallery-desserts.png',
          alt: 'A spread of honey cake, brownies, and cookies on a wooden table',
          className: '',
        },
        {
          src: '/images/gallery-cafe-interior.png',
          alt: 'The bright Benox cafe interior with plants and warm lighting',
          className: 'col-span-2 md:col-span-1',
        },
        {
          src: '/images/room-squad.png',
          alt: 'The squad gaming room with a large sofa and big screen',
          className: '',
        },
      ],
    },
    contact: {
      badge: 'Visit Us',
      title: 'Come say hi',
      addressTitle: 'Address',
      addressLines: ['123 Play Street, Coffee District', 'Your City, 00000'],
      hoursTitle: 'Opening hours',
      hoursLines: ['Sun - Thu: 10:00 AM - 12:00 AM', 'Fri - Sat: 10:00 AM - 2:00 AM'],
      phoneTitle: 'Phone / WhatsApp',
      phoneNumber: '+20 100 123 4567',
      whatsappCta: 'Book on WhatsApp',
      followCta: 'Follow us',
      instagramLabel: 'Instagram',
      mapTitle: 'Find us on the map',
      mapDescription:
        'Right in the heart of the Coffee District with easy parking and even easier vibes. Interactive map coming soon.',
    },
    footer: {
      description:
        'Good coffee, sweet desserts, and private PlayStation rooms in one joyful place made for friends, challenges, and cozy hangouts.',
      quickLinksTitle: 'Quick links',
      quickLinks: [
        { label: 'Rooms', href: '#rooms' },
        { label: 'Menu', href: '#menu' },
        { label: 'Best Sellers', href: '#best-sellers' },
        { label: 'Booking', href: '#booking' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ],
      openingHoursTitle: 'Opening hours',
      hoursLines: ['Sun - Thu: 10:00 AM - 12:00 AM', 'Fri - Sat: 10:00 AM - 2:00 AM'],
      addressLine: '123 Play Street, Coffee District',
      copyrightLabel: 'Benox Cafe & Gaming Lounge. All rights reserved.',
    },
  },
  ar: {
    metadata: {
      title: 'Benox | كافيه وصالة بلايستيشن',
      description:
        'استمتع بالمشروبات المميزة والحلويات وغرف البلايستيشن الخاصة لجلسات لا تُنسى في Benox.',
    },
    header: {
      brandName: 'Benox',
      navLinks: [
        { label: 'الرئيسية', href: '#home' },
        { label: 'الأكثر طلبًا', href: '#best-sellers' },
        { label: 'الغرف', href: '#rooms' },
        { label: 'الحجز', href: '#booking' },
        { label: 'المنيو', href: '#menu' },
        { label: 'من نحن', href: '#about' },
        { label: 'التواصل', href: '#contact' },
      ],
      bookingCta: 'احجز غرفة',
      languageSwitchLabel: 'English',
      openMenuLabel: 'افتح القائمة',
      closeMenuLabel: 'أغلق القائمة',
      mainNavigationLabel: 'التنقل الرئيسي',
      mobileNavigationLabel: 'تنقل الهاتف',
    },
    hero: {
      title: 'قهوة، لعب،',
      highlightedWord: 'وكرّرها.',
      description:
        'مشروبات مميزة، حلويات شهية، وغرف بلايستيشن خاصة مصممة لجلسات الأصحاب التي لا تُنسى.',
      primaryCta: 'احجز غرفة اللعب',
      secondaryCta: 'شاهد المنيو',
      imageAlt: 'أربعة أصدقاء يبتسمون ويحملون مشروبات Benox المثلجة داخل الكافيه',
    },
    bestSellers: {
      eyebrow: 'الأكثر طلبًا',
      title: 'المفضلات عند الكل والحلويات المحبوبة',
      addLabel: 'أضف +',
      previousLabel: 'مرر إلى العناصر السابقة',
      nextLabel: 'مرر إلى العناصر التالية',
      products: [
        {
          name: 'هاني كيك',
          description: 'كيكة العسل الشهيرة بطبقاتها المميزة من Benox',
          price: '140 جنيه',
          image: '/images/product-honey-cake.png',
          tag: 'الأكثر شعبية',
          bgColor: 'bg-[#a8e0cd]',
          blobShape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
        },
        {
          name: 'آيسد ماتشا',
          description: 'ماتشا ناعمة بلمسة كريمية باردة',
          price: '110 جنيه',
          image: '/images/product-iced-matcha.png',
          bgColor: 'bg-[#fbc9ab]',
          blobShape: 'rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%]',
        },
        {
          name: 'براوني شوكولاتة',
          description: 'براوني غني يناسب جلسات اللعب الطويلة',
          price: '110 جنيه',
          image: '/images/product-brownie.png',
          bgColor: 'bg-[#f4e79b]',
          blobShape: 'rounded-[50%_50%_60%_40%_/_40%_40%_60%_60%]',
        },
        {
          name: 'موهيتو فريش',
          description: 'انتعاش النعناع والليمون مع لمسة فوارة',
          price: '85 جنيه',
          image: '/images/product-mojito.png',
          bgColor: 'bg-[#aed8f6]',
          blobShape: 'rounded-[30%_70%_50%_50%_/_50%_50%_70%_30%]',
        },
        {
          name: 'آيسد لاتيه',
          description: 'إسبريسو مزدوج مع حليب بارد وثلج مقرمش',
          price: '100 جنيه',
          image: '/images/product-iced-latte.png',
          bgColor: 'bg-[#d8c4f2]',
          blobShape: 'rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%]',
        },
        {
          name: 'سبانيش لاتيه',
          description: 'حليب مكثف حلو مع إسبريسو قوي',
          price: '120 جنيه',
          image: '/images/product-spanish-latte.png',
          bgColor: 'bg-[#f6c2d1]',
          blobShape: 'rounded-[60%_40%_30%_70%_/_50%_60%_40%_50%]',
        },
      ],
    },
    rooms: {
      title: 'اختَر مساحة اللعب المناسبة لك',
      buttonLabel: 'احجز هذه الغرفة',
      previousLabel: 'مرر إلى الغرف السابقة',
      nextLabel: 'مرر إلى الغرف التالية',
      rooms: [
        {
          name: 'غرفة الثنائي',
          players: 'لاعبان',
          price: '120 جنيه/الساعة',
          features: 'PS5 • شاشة 4K',
          image: '/images/room-duo.png',
        },
        {
          name: 'الغرفة الفردية',
          players: 'لاعب واحد',
          price: '60 جنيه/الساعة',
          features: 'PS5 • شاشة 4K',
          image: '/images/room-solo.png',
        },
        {
          name: 'غرفة الفريق',
          players: '4 لاعبين',
          price: '200 جنيه/الساعة',
          features: 'PS5 • شاشة 4K',
          image: '/images/room-squad.png',
        },
        {
          name: 'صالة VIP',
          players: '6 لاعبين',
          price: '350 جنيه/الساعة',
          features: 'PS5 • شاشة 4K',
          image: '/images/room-vip.png',
        },
      ],
    },
    booking: {
      badge: 'الحجز',
      title: 'جاهز تبدأ اللعب؟',
      description:
        'اختر غرفتك واحجز في أقل من دقيقة. سنجهز لك الكنترولرات مشحونة والقهوة جاهزة.',
      steps: [
        'اختر الغرفة والوقت المناسب لك',
        'أضف مشروبات أو حلويات إلى الجلسة',
        'احضر، استمتع، وابدأ اللعب',
      ],
      successTitle: 'تم استلام الحجز!',
      successDescription:
        'سنؤكد الحجز معك هاتفيًا خلال وقت قصير. جهز نفسك، جلستك صارت محجوزة.',
      successReset: 'اعمل حجزًا آخر',
      roomLabel: 'نوع الغرفة',
      dateLabel: 'التاريخ',
      timeLabel: 'الوقت',
      durationLabel: 'المدة',
      playersLabel: 'عدد اللاعبين',
      extrasLabel: 'أضف مشروبات أو حلويات',
      nameLabel: 'الاسم',
      phoneLabel: 'رقم الهاتف',
      namePlaceholder: 'اكتب اسمك',
      phonePlaceholder: '+20 100 000 0000',
      submitLabel: 'تأكيد الحجز',
      roomTypes: [
        'غرفة لعب فردية',
        'غرفة الثنائي',
        'غرفة الفريق',
        'صالة VIP للبلايستيشن',
      ],
      durations: ['ساعة واحدة', 'ساعتان', '3 ساعات', '4 ساعات أو أكثر'],
      extras: [
        'بدون إضافات',
        'مشروبات فقط',
        'حلويات فقط',
        'مشروبات + حلويات',
      ],
    },
    menu: {
      badge: 'المنيو',
      title: 'كل ما تحتاجه لكل جولة',
      description:
        'من القهوة المحضرة على هدوء إلى سناكس جلسات اللعب، كل شيء يُحضَّر طازجًا في Benox.',
      categories: [
        {
          title: 'قهوة ساخنة',
          icon: 'coffee',
          items: [
            { name: 'إسبريسو', description: 'شوت مزدوج قوي', price: '60 جنيه' },
            { name: 'كابتشينو', description: 'رغوة ناعمة وكلاسيكية', price: '90 جنيه' },
            { name: 'سبانيش لاتيه', description: 'حلو وكريمي', price: '120 جنيه' },
            { name: 'فلات وايت', description: 'قوي وناعم', price: '95 جنيه' },
          ],
        },
        {
          title: 'قهوة مثلجة',
          icon: 'soda',
          items: [
            { name: 'آيسد لاتيه', description: 'إسبريسو فوق حليب بارد', price: '100 جنيه' },
            { name: 'آيسد سبانيش', description: 'برودة الحليب المكثف', price: '130 جنيه' },
            { name: 'آيسد موكا', description: 'شوكولاتة مع إسبريسو', price: '120 جنيه' },
            { name: 'كولد برو', description: 'نقع بطيء لمدة 18 ساعة', price: '110 جنيه' },
          ],
        },
        {
          title: 'حلويات',
          icon: 'cake',
          items: [
            { name: 'هاني كيك', description: 'قطعة الطبقات المميزة', price: '140 جنيه' },
            { name: 'براوني شوكولاتة', description: 'غني وطري', price: '110 جنيه' },
            { name: 'تشيز كيك', description: 'مخبوزة وكريمية', price: '130 جنيه' },
            { name: 'كوكيز (3 قطع)', description: 'طازجة من الفرن', price: '80 جنيه' },
          ],
        },
        {
          title: 'سناكس',
          icon: 'popcorn',
          items: [
            { name: 'بطاطس لودد', description: 'جبنة وأعشاب', price: '110 جنيه' },
            { name: 'ميني سلايدر', description: 'قطعتان شهية', price: '160 جنيه' },
            { name: 'ناتشوز', description: 'مع صوص جبنة', price: '120 جنيه' },
            { name: 'بوب كورن', description: 'زبدة أو كراميل', price: '60 جنيه' },
          ],
        },
        {
          title: 'مشروبات منعشة',
          icon: 'citrus',
          items: [
            { name: 'موهيتو فريش', description: 'نعناع وليمون ولمعة فوارة', price: '85 جنيه' },
            { name: 'آيسد ماتشا', description: 'طاقة خضراء ناعمة', price: '110 جنيه' },
            { name: 'بيري فيز', description: 'توت مشكل وصودا', price: '90 جنيه' },
            { name: 'ليمونادة فريش', description: 'تُحضَّر عند الطلب', price: '75 جنيه' },
          ],
        },
        {
          title: 'باقات اللعب',
          icon: 'gamepad',
          items: [
            { name: 'كويك ماتش', description: 'ساعة لعب + مشروب', price: '150 جنيه' },
            { name: 'ليلة سكواد', description: '3 ساعات + سناكس لـ 4', price: '700 جنيه' },
            { name: 'ليلة VIP', description: 'صالة + خدمة كاملة', price: '1200 جنيه' },
            { name: 'باك عيد ميلاد', description: 'غرفة وكيك ومشروبات', price: '1800 جنيه' },
          ],
        },
      ],
    },
    packages: {
      badge: 'باقات اللعب',
      title: 'لعب أكثر بقيمة أفضل',
      description:
        'اجمع جلستك مع مشروبات وسناكس لتوفر أكثر. مثالية للفرق والاحتفالات والسهرات الطويلة.',
      buttonLabel: 'احجز هذه الباقة',
      items: [
        {
          name: 'كويك ماتش - ساعة',
          price: '150 جنيه',
          icon: 'zap',
          highlight: false,
          benefits: [
            'ساعة في أي غرفة عادية',
            'مشروب واحد شامل',
            'PS5 + شاشة 4K',
          ],
        },
        {
          name: 'ليلة سكواد - 3 ساعات',
          price: '700 جنيه',
          icon: 'swords',
          highlight: true,
          benefits: [
            '3 ساعات في غرفة الفريق',
            'طبق سناكس لـ 4 أشخاص',
            '4 مشروبات شاملة',
            'صورة مجانية للجلسة',
          ],
        },
        {
          name: 'باقة ليلة VIP',
          price: '1200 جنيه',
          icon: 'crown',
          highlight: false,
          benefits: [
            '3 ساعات في صالة VIP',
            'خدمة طاولة كاملة',
            'حلوى من اختيارك',
            'أولوية في إعادة الحجز',
          ],
        },
        {
          name: 'عيد ميلاد / أصحاب',
          price: '1800 جنيه',
          icon: 'gift',
          highlight: false,
          benefits: [
            '4 ساعات في أي غرفة',
            'هاني كيك للطاولة',
            'مشروبات للجميع',
            'ديكورات حفلة شاملة',
          ],
        },
      ],
    },
    about: {
      badge: 'عن Benox',
      title: 'المكان الذي يجمع القهوة الجيدة بالألعاب الممتعة',
      description:
        'Benox يجمع القهوة الممتازة والحلويات اللذيذة وغرف البلايستيشن في مكان واحد مبهج للأصحاب والتحديات واللمة الحلوة. سواء جئت من أجل الهاني كيك أو من أجل أعلى السكورات، ستجد دائمًا مكانًا وكنترولر ينتظرانك.',
      imageAlt: 'ديكور Benox المضيء والمريح بجدران كريمية وكراسي برتقالية',
      features: [
        {
          title: 'قهوة متخصصة',
          description: 'حبوب محمصة محليًا وتحضير باهتمام.',
          icon: 'coffee',
        },
        {
          title: 'PS5 في كل غرفة',
          description: 'أحدث الأجهزة والعناوين مع شاشات 4K.',
          icon: 'gamepad',
        },
        {
          title: 'مصمم للّمة',
          description: 'غرف مريحة مصممة للأصحاب والمرح.',
          icon: 'heart',
        },
      ],
    },
    gallery: {
      badge: 'الأجواء',
      title: 'نظرة سريعة داخل Benox',
      description:
        'إضاءة دافئة، صحبة حلوة، قهوة ممتازة، وقدر مناسب جدًا من المنافسة الودية.',
      photos: [
        {
          src: '/images/hero-composition.jpeg',
          alt: 'أصدقاء يضحكون أثناء لعب البلايستيشن معًا على أريكة مريحة',
          className: 'row-span-2',
        },
        {
          src: '/images/gallery-drinks.png',
          alt: 'مشروبات كافيه ملونة مرتبة على طاولة بلون كريمي',
          className: '',
        },
        {
          src: '/images/room-vip.png',
          alt: 'صالة البلايستيشن VIP مع جلسات فاخرة',
          className: '',
        },
        {
          src: '/images/gallery-desserts.png',
          alt: 'تشكيلة هاني كيك وبراونيز وكوكيز على طاولة خشبية',
          className: '',
        },
        {
          src: '/images/gallery-cafe-interior.png',
          alt: 'ديكور Benox الداخلي المضيء مع نباتات وإضاءة دافئة',
          className: 'col-span-2 md:col-span-1',
        },
        {
          src: '/images/room-squad.png',
          alt: 'غرفة لعب جماعية مع أريكة كبيرة وشاشة ضخمة',
          className: '',
        },
      ],
    },
    contact: {
      badge: 'زورنا',
      title: 'تعال وقل لنا أهلًا',
      addressTitle: 'العنوان',
      addressLines: ['123 شارع اللعب، حي القهوة', 'مدينتك، 00000'],
      hoursTitle: 'مواعيد العمل',
      hoursLines: ['الأحد - الخميس: 10:00 ص - 12:00 ص', 'الجمعة - السبت: 10:00 ص - 2:00 ص'],
      phoneTitle: 'الهاتف / واتساب',
      phoneNumber: '+20 100 123 4567',
      whatsappCta: 'احجز عبر واتساب',
      followCta: 'تابعنا',
      instagramLabel: 'إنستجرام',
      mapTitle: 'اعثر علينا على الخريطة',
      mapDescription:
        'في قلب حي القهوة مع موقف سهل وأجواء أسهل. الخريطة التفاعلية قريبًا.',
    },
    footer: {
      description:
        'قهوة رائعة، حلويات شهية، وغرف بلايستيشن خاصة في مكان واحد مبهج للأصحاب والتحديات واللمة الجميلة.',
      quickLinksTitle: 'روابط سريعة',
      quickLinks: [
        { label: 'الغرف', href: '#rooms' },
        { label: 'المنيو', href: '#menu' },
        { label: 'الأكثر طلبًا', href: '#best-sellers' },
        { label: 'الحجز', href: '#booking' },
        { label: 'من نحن', href: '#about' },
        { label: 'التواصل', href: '#contact' },
      ],
      openingHoursTitle: 'مواعيد العمل',
      hoursLines: ['الأحد - الخميس: 10:00 ص - 12:00 ص', 'الجمعة - السبت: 10:00 ص - 2:00 ص'],
      addressLine: '123 شارع اللعب، حي القهوة',
      copyrightLabel: 'مقهى وصالة ألعاب Benox. جميع الحقوق محفوظة.',
    },
  },
}

export function getSiteContent(locale: Locale) {
  return siteContent[locale]
}
