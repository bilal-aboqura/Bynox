export type MenuCategoryId =
  | 'all'
  | 'burgers'
  | 'pizza'
  | 'snacks'
  | 'coffee'
  | 'cold-drinks'
  | 'desserts'

export type MenuProduct = {
  id: string
  category: Exclude<MenuCategoryId, 'all'>
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  image: string
  popular?: boolean
}

export const menuCategories: Array<{
  id: MenuCategoryId
  labelAr: string
  labelEn: string
}> = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'burgers', labelAr: 'برجر', labelEn: 'Burgers' },
  { id: 'pizza', labelAr: 'بيتزا', labelEn: 'Pizza' },
  { id: 'snacks', labelAr: 'مقبلات', labelEn: 'Snacks' },
  { id: 'coffee', labelAr: 'قهوة', labelEn: 'Coffee' },
  { id: 'cold-drinks', labelAr: 'مشروبات باردة', labelEn: 'Cold drinks' },
  { id: 'desserts', labelAr: 'حلويات', labelEn: 'Desserts' },
]

export const menuCatalog = ([
  {
    id: 'classic-cheeseburger',
    category: 'burgers',
    nameAr: 'برجر كلاسيك',
    nameEn: 'Classic Cheeseburger',
    descriptionAr: 'لحم مشوي، شيدر، خس، مخلل وصوص Minu',
    descriptionEn: 'Grilled beef, cheddar, lettuce, pickles and Minu sauce',
    price: 105,
    image: '/images/menu/classic-cheeseburger.webp',
    popular: true,
  },
  {
    id: 'double-smash-burger',
    category: 'burgers',
    nameAr: 'دبل سماش',
    nameEn: 'Double Smash Burger',
    descriptionAr: 'قطعتان لحم، شيدر، بصل مكرمل وصوص مدخن',
    descriptionEn: 'Double beef, cheddar, caramelized onion and smoky sauce',
    price: 145,
    image: '/images/menu/classic-cheeseburger.webp',
  },
  {
    id: 'crispy-chicken-burger',
    category: 'burgers',
    nameAr: 'راب دجاج كرسبي',
    nameEn: 'Crispy Chicken Wrap',
    descriptionAr: 'دجاج مقرمش، خس، طماطم ومايونيز حار',
    descriptionEn: 'Crispy chicken, lettuce, tomato and spicy mayo',
    price: 115,
    image: '/images/menu/chicken-burger.webp',
  },
  {
    id: 'pepperoni-pizza',
    category: 'pizza',
    nameAr: 'بيتزا بيبروني',
    nameEn: 'Pepperoni Pizza',
    descriptionAr: 'موزاريلا، صوص طماطم وبيبروني مقرمش',
    descriptionEn: 'Mozzarella, tomato sauce and crisp pepperoni',
    price: 125,
    image: '/images/menu/pepperoni-pizza.webp',
    popular: true,
  },
  {
    id: 'margherita-pizza',
    category: 'pizza',
    nameAr: 'بيتزا مارجريتا',
    nameEn: 'Margherita Pizza',
    descriptionAr: 'موزاريلا طازجة، صوص طماطم وريحان',
    descriptionEn: 'Fresh mozzarella, tomato sauce and basil',
    price: 110,
    image: '/images/menu/pepperoni-pizza.webp',
  },
  {
    id: 'french-fries',
    category: 'snacks',
    nameAr: 'بطاطس مقرمشة',
    nameEn: 'Crispy Fries',
    descriptionAr: 'بطاطس ذهبية بتتبيلة Minu الخاصة',
    descriptionEn: 'Golden fries with Minu signature seasoning',
    price: 45,
    image: '/images/menu/french-fries.webp',
  },
  {
    id: 'mozzarella-sticks',
    category: 'snacks',
    nameAr: 'أصابع موزاريلا',
    nameEn: 'Mozzarella Sticks',
    descriptionAr: 'موزاريلا مقرمشة مع صوص مارينارا',
    descriptionEn: 'Crispy mozzarella with marinara sauce',
    price: 65,
    image: '/images/menu/mozzarella-sticks.webp',
  },
  {
    id: 'iced-caramel-latte',
    category: 'coffee',
    nameAr: 'لاتيه كراميل مثلج',
    nameEn: 'Iced Caramel Latte',
    descriptionAr: 'إسبريسو، حليب وكراميل على الثلج',
    descriptionEn: 'Espresso, milk and caramel over ice',
    price: 70,
    image: '/images/menu/iced-caramel-latte.webp',
    popular: true,
  },
  {
    id: 'spanish-latte',
    category: 'coffee',
    nameAr: 'سبانيش لاتيه',
    nameEn: 'Spanish Latte',
    descriptionAr: 'إسبريسو مزدوج وحليب محلى كريمي',
    descriptionEn: 'Double espresso with creamy sweet milk',
    price: 75,
    image: '/images/product-spanish-latte.png',
  },
  {
    id: 'iced-matcha',
    category: 'coffee',
    nameAr: 'ماتشا مثلجة',
    nameEn: 'Iced Matcha',
    descriptionAr: 'ماتشا ناعمة مع حليب بارد',
    descriptionEn: 'Smooth matcha with chilled milk',
    price: 80,
    image: '/images/product-iced-matcha.png',
  },
  {
    id: 'minu-mojito',
    category: 'cold-drinks',
    nameAr: 'موهيتو Minu',
    nameEn: 'Minu Mojito',
    descriptionAr: 'ليمون، نعناع وصودا منعشة',
    descriptionEn: 'Lime, mint and refreshing soda',
    price: 55,
    image: '/images/menu/mojito.webp',
  },
  {
    id: 'iced-latte',
    category: 'cold-drinks',
    nameAr: 'لاتيه مثلج',
    nameEn: 'Iced Latte',
    descriptionAr: 'إسبريسو كلاسيك وحليب بارد',
    descriptionEn: 'Classic espresso with chilled milk',
    price: 65,
    image: '/images/product-iced-latte.png',
  },
  {
    id: 'chocolate-cake',
    category: 'desserts',
    nameAr: 'كيك شوكولاتة',
    nameEn: 'Chocolate Cake',
    descriptionAr: 'طبقات شوكولاتة غنية وصوص جاناش',
    descriptionEn: 'Rich chocolate layers with ganache',
    price: 85,
    image: '/images/menu/chocolate-cake.webp',
    popular: true,
  },
  {
    id: 'honey-cake',
    category: 'desserts',
    nameAr: 'هاني كيك',
    nameEn: 'Honey Cake',
    descriptionAr: 'طبقات عسل طرية بكريمة خفيفة',
    descriptionEn: 'Soft honey layers with light cream',
    price: 90,
    image: '/images/product-honey-cake.png',
  },
  {
    id: 'fudge-brownie',
    category: 'desserts',
    nameAr: 'براوني فادج',
    nameEn: 'Fudge Brownie',
    descriptionAr: 'براوني شوكولاتة كثيفة تقدم دافئة',
    descriptionEn: 'Dense chocolate brownie served warm',
    price: 75,
    image: '/images/product-brownie.png',
  },
] satisfies MenuProduct[]).filter(
  (product) =>
    product.id !== 'double-smash-burger' &&
    product.id !== 'margherita-pizza',
)

export type MenuProductDetails = {
  ingredientsAr: string[]
  ingredientsEn: string[]
  calories: number
  prepMinutes: number
  servingAr: string
  servingEn: string
}

const productDetails: Record<string, MenuProductDetails> = {
  'classic-cheeseburger': {
    ingredientsAr: ['لحم بقري', 'جبنة شيدر', 'خس', 'طماطم', 'مخلل', 'صوص Minu'],
    ingredientsEn: ['Beef', 'Cheddar', 'Lettuce', 'Tomato', 'Pickles', 'Minu sauce'],
    calories: 720,
    prepMinutes: 14,
    servingAr: 'يُقدم مع بطاطس صغيرة',
    servingEn: 'Served with a small side of fries',
  },
  'crispy-chicken-burger': {
    ingredientsAr: ['دجاج كرسبي', 'خبز تورتيلا', 'خس', 'طماطم', 'مخلل', 'مايونيز حار'],
    ingredientsEn: ['Crispy chicken', 'Tortilla', 'Lettuce', 'Tomato', 'Pickles', 'Spicy mayo'],
    calories: 610,
    prepMinutes: 12,
    servingAr: 'راب كامل مقطوع نصفين',
    servingEn: 'One full wrap, cut in half',
  },
  'pepperoni-pizza': {
    ingredientsAr: ['عجينة طازجة', 'صوص طماطم', 'موزاريلا', 'بيبروني', 'ريحان'],
    ingredientsEn: ['Fresh dough', 'Tomato sauce', 'Mozzarella', 'Pepperoni', 'Basil'],
    calories: 890,
    prepMinutes: 18,
    servingAr: 'حجم متوسط، 6 قطع',
    servingEn: 'Medium size, 6 slices',
  },
  'french-fries': {
    ingredientsAr: ['بطاطس', 'تتبيلة Minu', 'ملح بحري'],
    ingredientsEn: ['Potatoes', 'Minu seasoning', 'Sea salt'],
    calories: 390,
    prepMinutes: 8,
    servingAr: 'طبق فردي',
    servingEn: 'Single serving',
  },
  'mozzarella-sticks': {
    ingredientsAr: ['جبنة موزاريلا', 'طبقة مقرمشة', 'صوص مارينارا'],
    ingredientsEn: ['Mozzarella', 'Crispy coating', 'Marinara sauce'],
    calories: 470,
    prepMinutes: 10,
    servingAr: '6 قطع مع الصوص',
    servingEn: '6 pieces with sauce',
  },
  'iced-caramel-latte': {
    ingredientsAr: ['إسبريسو', 'حليب', 'كراميل', 'ثلج'],
    ingredientsEn: ['Espresso', 'Milk', 'Caramel', 'Ice'],
    calories: 240,
    prepMinutes: 5,
    servingAr: 'كوب 16 أونصة',
    servingEn: '16 oz cup',
  },
  'spanish-latte': {
    ingredientsAr: ['إسبريسو مزدوج', 'حليب', 'حليب مكثف'],
    ingredientsEn: ['Double espresso', 'Milk', 'Condensed milk'],
    calories: 260,
    prepMinutes: 5,
    servingAr: 'كوب 16 أونصة',
    servingEn: '16 oz cup',
  },
  'iced-matcha': {
    ingredientsAr: ['ماتشا', 'حليب', 'سكر خفيف', 'ثلج'],
    ingredientsEn: ['Matcha', 'Milk', 'Light sugar', 'Ice'],
    calories: 190,
    prepMinutes: 5,
    servingAr: 'كوب 16 أونصة',
    servingEn: '16 oz cup',
  },
  'minu-mojito': {
    ingredientsAr: ['ليمون', 'نعناع', 'صودا', 'سكر خفيف', 'ثلج'],
    ingredientsEn: ['Lime', 'Mint', 'Soda', 'Light sugar', 'Ice'],
    calories: 130,
    prepMinutes: 6,
    servingAr: 'كوب 16 أونصة',
    servingEn: '16 oz cup',
  },
  'iced-latte': {
    ingredientsAr: ['إسبريسو', 'حليب', 'ثلج'],
    ingredientsEn: ['Espresso', 'Milk', 'Ice'],
    calories: 150,
    prepMinutes: 4,
    servingAr: 'كوب 16 أونصة',
    servingEn: '16 oz cup',
  },
  'chocolate-cake': {
    ingredientsAr: ['كيك شوكولاتة', 'جاناش', 'كريمة شوكولاتة'],
    ingredientsEn: ['Chocolate sponge', 'Ganache', 'Chocolate cream'],
    calories: 560,
    prepMinutes: 4,
    servingAr: 'قطعة فردية',
    servingEn: 'Single slice',
  },
  'honey-cake': {
    ingredientsAr: ['طبقات عسل', 'كريمة خفيفة', 'فتات كيك'],
    ingredientsEn: ['Honey layers', 'Light cream', 'Cake crumbs'],
    calories: 480,
    prepMinutes: 4,
    servingAr: 'قطعة فردية',
    servingEn: 'Single slice',
  },
  'fudge-brownie': {
    ingredientsAr: ['شوكولاتة داكنة', 'كاكاو', 'زبدة', 'صوص شوكولاتة'],
    ingredientsEn: ['Dark chocolate', 'Cocoa', 'Butter', 'Chocolate sauce'],
    calories: 510,
    prepMinutes: 6,
    servingAr: 'قطعة دافئة',
    servingEn: 'One warm piece',
  },
}

export const addMenuItemFunctionDeclaration = {
  name: 'add_menu_item_to_cart',
  description:
    'Add a real MinuHub menu item to the visible shopping cart after the guest asks for it. Call once per distinct item and include the requested quantity.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      itemId: {
        type: 'string',
        enum: menuCatalog.map((item) => item.id),
        description: 'Exact catalog item id.',
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 12,
        description: 'Quantity to add.',
      },
    },
    required: ['itemId', 'quantity'],
  },
} as const

export const showMenuItemFunctionDeclaration = {
  name: 'show_menu_item_details',
  description:
    'Open the visible product details panel for a real MinuHub menu item when the guest asks to see, open, inspect, or learn more about it. Do not use this tool when they are only asking a general question.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      itemId: {
        type: 'string',
        enum: menuCatalog.map((item) => item.id),
        description: 'Exact catalog item id to reveal on screen.',
      },
    },
    required: ['itemId'],
  },
} as const

export const openMenuCartFunctionDeclaration = {
  name: 'open_menu_cart',
  description:
    'Open the visible MinuHub shopping cart when the guest asks to see, open, review, or check their cart or basket.',
  parametersJsonSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {},
  },
} as const

export function getMenuProduct(id: string) {
  return menuCatalog.find((item) => item.id === id)
}

export function getMenuProductDetails(id: string) {
  return productDetails[id]
}

export function getMenuCatalogForAssistant() {
  return menuCatalog.map(({ id, nameAr, nameEn, descriptionAr, price }) => ({
    id,
    nameAr,
    nameEn,
    descriptionAr,
    price,
  }))
}
